-- Up Migration

-- Le statut d'un contact n'était jamais consommé : la lecture de la liste le
-- basculait en 'seen' avant le premier rendu, donc aucun écran ne pouvait
-- l'afficher — au moment de l'afficher, tout était déjà consommé. La transition
-- passe désormais par un geste de l'utilisateur (appeler, écrire, ou marquer
-- explicitement), et le badge n'affiche plus que ce qui reste réellement à
-- traiter.
--
-- Ce qu'il reste à traiter au moment du déploiement : tout l'historique.
-- `status` vaut 'new' par défaut et n'a jamais été modifié, donc chaque demande
-- reçue jusque-là est encore dans cet état. Sans correction ci-dessous, le
-- premier lancement afficherait un badge « Nouveau » sur la totalité de
-- l'historique de chaque utilisateur.
--
-- Ces demandes sont traitées comme vues : elles précèdent l'existence du badge,
-- et personne ne va les parcourir. Seules les demandes arrivées après cette
-- migration seront signalées, ce qui correspond à ce que l'écran annonce.

UPDATE contacts SET status = 'seen' WHERE status = 'new';

-- Down Migration

-- Aucune donnée à rétablir : la valeur par défaut de la colonne reste 'new' et
-- le schéma ne change pas. En cas de retour, les demandes reçues depuis le
-- déploiement restent à 'seen' — comportement correct de toute façon, et sans
-- effet sur les lignes antérieures qui le sont déjà.