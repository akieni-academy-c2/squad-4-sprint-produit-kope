import { useState } from "react";
import { createReview, updateReview } from "../services/reviews.service.js";
import { Button } from "@/shared/components/ui/Button.jsx";
import { FormField } from "@/shared/components/ui/FormField.jsx";
import { Textarea } from "@/shared/components/ui/Textarea.jsx";
import { StarInput } from "@/shared/components/ui/StarRating.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import { Card } from "@/shared/components/ui/Card.jsx";

const MAX = 300;

export function ReviewForm({ professionalId, review = null, onSuccess }) {
  const { toast } = useNotification();
  const isEdit = Boolean(review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const commentTooLong = comment.length > MAX;
  const canSubmit = rating >= 1 && rating <= 5 && !commentTooLong;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        rating: Number(rating),
        comment: comment.trim() || null,
      };
      if (isEdit) await updateReview(review.id, payload);
      else await createReview(professionalId, payload);

      toast({
        message: isEdit
          ? "Avis mis à jour."
          : "Merci, votre avis a été publié.",
        type: "success",
      });
      setRating(isEdit ? review.rating : 0);
      setComment(isEdit ? (review.comment ?? "") : "");
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.errors?.rating ||
        err?.errors?.comment ||
        err?.message ||
        "Impossible d'enregistrer votre avis.";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-7">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">
            Note *
          </label>
          <p className="flex">
            <StarInput
              value={rating}
              onChange={setRating}
              size="lg"
              count={5}
            />
          </p>
        </div>
        <FormField
          id="rv-comment"
          label="Votre commentaire"
          help={`Facultatif · 0 à ${MAX} caractères`}
          counter={
            <span
              className={
                comment.length > MAX ? "text-danger-500 font-semibold" : ""
              }
            >
              {comment.length}/{MAX}
            </span>
          }
          as="textarea"
        >
          <Textarea
            id="rv-comment"
            rows={3}
            placeholder="Parlez de votre expérience avec ce professionnel..."
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, MAX + 10))}
          />
        </FormField>

        {error && (
          <div
            role="alert"
            className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            loading={submitting}
            disabled={!canSubmit}
            size="lg"
          >
            {isEdit ? "Enregistrer les modifications" : "Publier mon avis"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
