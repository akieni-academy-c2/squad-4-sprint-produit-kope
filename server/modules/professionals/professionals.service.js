import { withTransaction } from "../../db/pool.js";
import { ApiError } from "../../utils/ApiError.js";
import * as repository from "./professionals.repository.js";
import * as photosService from "../photos/photos.service.js";
import * as reviewsRepository from "../reviews/reviews.repository.js";

const MISSING_ITEMS = [
  {
    code: "displayName",
    label: "Renseignez le nom affiché",
    isMissing: (p) => !p.displayName?.trim(),
  },
  {
    code: "trade",
    label: "Choisissez un métier",
    isMissing: (p) => !p.tradeId || !p.tradeName?.trim(),
  },
  {
    code: "zones",
    label: "Choisissez au moins une zone d'intervention",
    isMissing: (p) => p.zones.length === 0,
  },
  {
    code: "phone",
    label: "Renseignez un numéro de téléphone",
    isMissing: (p) => !p.phone?.trim(),
  },
  {
    code: "description",
    label: "Ajoutez une description (30 caractères minimum)",
    isMissing: (p) => [...(p.description ?? "").trim()].length < 30,
  },
  {
    code: "photos",
    label: "Ajoutez au moins une photo de réalisation",
    isMissing: (p) => p.photoCount === 0,
  },
];

export async function getOwnProfile(userId) {
  const profile = await repository.findOwnProfile(userId);
  if (!profile) throw ApiError.notFound("Profil introuvable");

  const photos = await photosService.listPhotos(userId);
  const { isPublished, isHidden, ...rest } = profile;

  let status = "incomplete";
  if (isHidden) status = "hidden";
  else if (isPublished) status = "published";

  const missing =
    status === "incomplete"
      ? MISSING_ITEMS.filter((item) => item.isMissing(profile)).map(
          ({ code, label }) => ({ code, label }),
        )
      : [];

  return { ...rest, photos, status, missing };
}

const DUPLICATE_DISPLAY_NAME =
  "Ce nom affiché est déjà pris, choisissez-en un autre";

export async function updateOwnProfile(
  userId,
  { displayName, tradeId, description, yearsExperience, whatsapp, zoneIds },
) {
  if (!(await repository.tradeExists(tradeId)))
    throw ApiError.badRequest("Choisissez un métier valide", {
      tradeId: "Choisissez un métier",
    });

  try {
    await withTransaction(async (tx) => {
      await repository.updateProfile(
        userId,
        {
          displayName,
          tradeId,
          description,
          yearsExperience,
          ...(whatsapp !== undefined ? { whatsapp } : {}),
        },
        tx,
      );
      await repository.replaceZones(userId, zoneIds, tx);
    });
  } catch (err) {
    if (err.code === "23505")
      throw ApiError.conflict(DUPLICATE_DISPLAY_NAME, {
        displayName: DUPLICATE_DISPLAY_NAME,
      });
    throw err;
  }
  return getOwnProfile(userId);
}

export function setAvailability(userId, isAvailable) {
  return repository.setAvailability(userId, isAvailable);
}

export async function getPublishedDetail(id) {
  const profile = await repository.findPublishedDetail(id);
  if (!profile) throw ApiError.notFound("Profil introuvable");

  const [photos, rating] = await Promise.all([
    photosService.listPhotos(profile.id),
    reviewsRepository.getSummary(profile.id).then((r) => ({
      average: Number(r?.average ?? 0),
      count: Number(r?.count ?? 0),
    })),
  ]);

  const trade = { id: profile.tradeId, name: profile.trade };
  const { tradeId, ...rest } = profile;
  return { profile: { ...rest, trade }, photos, rating };
}
