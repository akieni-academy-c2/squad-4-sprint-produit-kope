import { formatYearsExperience } from './profileForm.js';
import { ProfileRow, ProfileSection } from './ProfileSection.jsx';

export function ProfileDetails({ profile, user }) {
  const zoneNames = (profile?.zones || []).map((z) => z.name).filter(Boolean).join(', ');

  return (
    <>
      <ProfileSection title="Informations personnelles">
        <dl className="divide-y divide-gray-100">
          <ProfileRow label="Prénom" value={user?.firstName} />
          <ProfileRow label="Nom" value={user?.lastName} />
          <ProfileRow label="Nom affiché" value={profile?.displayName} />
        </dl>
      </ProfileSection>

      <ProfileSection title="Contact" description="Vos coordonnées sont visibles des clients qui vous contactent.">
        <dl className="divide-y divide-gray-100">
          <ProfileRow label="Téléphone" value={user?.phone} />
          <ProfileRow label="E-mail" value={user?.email} />
          <ProfileRow label="WhatsApp" value={profile?.whatsapp} />
        </dl>
      </ProfileSection>

      <ProfileSection title="Description">
        {profile?.description ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
        ) : (
          <p className="text-sm text-gray-400">Aucune description pour le moment.</p>
        )}
      </ProfileSection>

      <ProfileSection title="Informations professionnelles">
        <dl className="divide-y divide-gray-100">
          <ProfileRow label="Métier" value={profile?.tradeName} />
          <ProfileRow label="Zones" value={zoneNames} />
          <ProfileRow label="Expérience" value={formatYearsExperience(profile?.yearsExperience)} />
        </dl>
      </ProfileSection>
    </>
  );
}