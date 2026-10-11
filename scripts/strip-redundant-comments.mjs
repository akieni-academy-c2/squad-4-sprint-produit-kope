/**
 * Passe de nettoyage des commentaires (usage ponctuel, à relancer après audit).
 *
 *   node scripts/strip-redundant-comments.mjs [--dry]
 *
 * Ne supprime que des docblocks d'une seule ligne dont le texte est listé ici,
 * c'est-à-dire ceux qui paraphrasent la déclaration qui suit :
 *
 *   /** Carte d'un professionnel dans la liste d'administration. *\/
 *   export function AdminProfessionalCard() {
 *
 * Un nom de fonction explicite n'a pas besoin d'être répété en français
 * au-dessus. Ce qui reste est conservé volontairement : les contraintes non
 * évidentes (bcrypt à 72 octets, smallint à 32767, usurpation de mimetype,
 * fixation de session...) ne sont pas déductibles à la seule lecture du code.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DRY = process.argv.includes('--dry');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TARGETS = ['src', 'server'];

/** Textes exacts considérés comme redondants. */
const REDUNDANT = new Set([
  // Qui / quoi : le nom de la fonction le dit déjà.
  "Carte d'un professionnel dans la liste d'administration.",
  "Pied d'une carte : nombre de professionnels liés et date de création.",
  "Carte d'une photo publiée, avec les actions modifier / supprimer.",
  "Formulaire d'ajout / modification d'une réalisation.",
  "Formulaire de modification du profil professionnel.",
  "Formulaire de création d'un compte administrateur, et son bouton d'ouverture.",
  "Confirmation d'action : bloc identique dans les 5 tableaux admin.",
  "En-tête du formulaire : avatar, nom, métier et progression du téléversement.",
  "Vue lecture seule du profil, affichée quand le formulaire est fermé.",
  "Carte de section du formulaire / de la lecture seule.",
  "Onglet « Vue d'ensemble » : chiffres clés de l'espace professionnel.",
  "Onglet « Mes photos » : grille des réalisations, formulaire et suppression.",
  "Onglet « Mes avis » du dashboard client : l'historique des avis laissés.",
  "Colonne de gauche (desktop) : identité, à propos, ligne compacte et signalement.",
  "Colonne de gauche de l'espace pro : identité, statut, navigation, lien public.",
  "Colonne de gauche du dashboard client (desktop).",
  "Liste paginée d'avis (utilisée dans la modale « Avis »).",
  "Formulaire de signalement d'un profil, ouvert depuis la fiche publique.",
  "Résumé de la note moyenne et incitation à laisser un avis.",
  "En-tête d'un avis : photo de l'auteur et prénom + initiale.",
  "En-tête compact d'un avis : auteur à gauche, note et date à droite.",
  "Filtres d'affinage affichés dans la colonne de droite de la recherche.",
  "Appel à l'action « Devenir prestataire », affiché dans la colonne de gauche.",
  "Onglet « Mon profil » du dashboard client : identité, téléphone et avatar.",
  "États de chargement et d'erreur communs aux deux espaces personnel/pro.",
  "Galerie des réalisations : fil d'Ariane, cartes cliquables et bouton « Voir plus ».",
  "En-tête et présentation « à propos » visibles uniquement sur mobile.",
  "Les trois confirmations de la file de signalements (traitement, blocage, suspension).",
  "Un signalement individuel : motif, statut, auteur, message et actions.",
  "Emplacement vide : incrémente la grille jusqu'à ce qu'elle soit pleine.",
  "Photo de profil : une seule image, ratio identique sur toutes les cards.",
  "Ligne « libellé / valeur » de la lecture seule.",
  "Saisie en ligne, validée à la touche Entrée, annulée à la touche Échap.",
  "Numéro de position sur une carte.",
  'Avatar utilisateur',
  'Coordonnées du service client.',
  'Mes contacts',
  'Prise de contact',

  // Comment : le nom et le corps le montrent déjà.
  "Attribue une teinte stable à un groupe, selon son nom.",
  "Regroupe les éléments par groupe ; un groupe sans élément donne une liste vide.",
  "Variante du badge d'état selon le statut du profil.",
  "Nom affichable d'un compte, avec repli sur son identifiant.",
  'Nettoie les valeurs avant envoi.',
  "Identifiant et nom affichables d'un professionnel (fiche ou compte utilisateur).",
  "Contrôles du formulaire de création d'administrateur.",
  'Déplace un item dans un groupe, à la position donnée.',
  'Déplace un groupe à la position donnée.',
  'Met à jour le brouillon ; `immediate` applique aussi (sélecteurs).',
  "Remonte la fenêtre en haut de la page lors d'un changement de page de liste.",
  'Page courante + changeur qui remonte en haut de la page.',
  'Normalise la réponse API en valeurs de formulaire (chaînes, tableau de zones).',
  "Nom complet affiché dans l'en-tête, avec repli sur le nom du compte.",
  'Chaque règle annotée de son résultat pour un affichage direct.',
  'Raccourci pour les contrôleurs qui viennent de passer par `requireAuth`.',
  "Résout le store une fois pour le process, en tolérant l'absence de la table.",
  'Vrai si la tentative est autorisée, en base si possible, en mémoire sinon.',
  'Autorise les rôles indiqués, et refuse aussi les comptes bloqués ou suspendus.',
  'Bloque ou débloque un compte utilisateur.',
  'Crée un compte administrateur.',
  "Traduit une violation d'unicité en message exploitable.",
  'Convertit un compte client existant en compte professionnel',
  'Modification du titre',
  'Profil du propriétaire',
  'Fiche publique',
  'Liste de zones',
  'Numéro de téléphone ',
  'Lien WhatsApp',
  'Tous les avis laissés par un client',
  'Seuils déclenchés par le nombre de signalements reçus.',
  'Supprime les compteurs dont la fenêtre est dépassée.',
  "Vrai si la table existe : permet de retomber sur la mémoire sans planter.",
  "Maintient l'option active visible dans une liste défilante.",
  "Accepte aussi bien une chaîne qu'un objet { value, label }.",
  'Générateur pseudo-aléatoire déterministe (mulberry32).',
  "Chiffres nationaux seuls (9 maximum), indicatif retiré.",
  'Affichage par blocs : 06 889 88 88.',
]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(js|jsx)$/.test(entry.name)) yield full;
  }
}

let removed = 0;
let touched = 0;

for (const target of TARGETS) {
  for await (const file of walk(join(ROOT, target))) {
    const before = await readFile(file, 'utf8');
    const lines = before.split('\n');

    const kept = lines.filter((line) => {
      const m = line.trim().match(/^\/\*\*\s*(.*?)\s*\*\/$/);
      if (!m || !REDUNDANT.has(m[1])) return true;
      removed += 1;
      return false;
    });

    if (kept.length === lines.length) continue;
    touched += 1;
    if (!DRY) await writeFile(file, kept.join('\n'), 'utf8');
    else console.log(`  ${relative(ROOT, file)}`);
  }
}

console.log(
  `${DRY ? '[dry-run] ' : ''}${removed} commentaires supprimés dans ${touched} fichiers`,
);