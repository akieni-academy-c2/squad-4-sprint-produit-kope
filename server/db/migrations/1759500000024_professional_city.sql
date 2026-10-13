-- Ville d'exercice du professionnel.
--
-- Elle vient du catalogue `cities`, que l'administrateur configure depuis
-- l'espace admin - aucune ville n'est saisie en dur. Nullable : les profils
-- créés avant cette colonne n'ont pas de ville, et les rendre obligatoires
-- les mettrait hors conformité au premier enregistrement.
--
-- Le lien n'est pas déductible des zones : une zone appartient à une ville,
-- mais un professionnel peut exercer sur des zones de plusieurs villes. La
-- colonne porte donc sa propre valeur.
ALTER TABLE professionals
  ADD COLUMN city_id smallint REFERENCES cities(id) ON DELETE SET NULL;

-- La recherche filtre déjà sur la ville via les zones ; cet index sert les
-- jointures de la fiche et les tris par ville, qui passent par `professionals`
-- directement et non par `professional_zones`.
CREATE INDEX professionals_city_id_idx ON professionals (city_id);