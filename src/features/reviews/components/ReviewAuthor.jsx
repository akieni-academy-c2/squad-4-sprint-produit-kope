import { UserAvatar } from "@/shared/components/ui/UserAvatar.jsx";
import { fullNameInitials } from "@/shared/utils";

export function ReviewAuthor({ review, className = "h-8 w-8" }) {
  const first = review.client?.firstName;
  const last = review.client?.lastName;
  const name =
    review.client?.displayName || fullNameInitials(first, last) || "Membre";
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar
        user={{
          firstName: first,
          lastName: last,
          displayName: review.client?.displayName,
          avatarUrl: review.client?.avatarUrl,
        }}
        name={name}
        className={className}
        fallbackClassName="bg-mint-100 text-primary-700 ring-1 ring-mint-200"
      />
      <p className="text-sm font-bold leading-5 text-gray-900">{name}</p>
    </div>
  );
}
