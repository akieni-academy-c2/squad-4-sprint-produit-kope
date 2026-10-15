# Documentation data science

Trois documents décrivent la base KOP. Ils répondent à trois questions
différentes, et aucun ne contient tout.

| Document | Question à laquelle il répond |
| :--- | :--- |
| [schema.md](data-science/schema.md) | Quelles tables, colonnes, types et index existent ? |
| [schema-diagram.md](data-science/schema-diagram.md) | Comment les tables se relient-elles, et quelles règles gouvernent les suppressions ? |
| [dictionnaire.md](data-science/dictionnaire.md) | Que signifient les règles métier, et **où** sont-elles appliquées ? |

## À qui s'adresse ce dossier

Trois lectures selon ce que vous venez faire :

- **Vous branchez un indicateur.** Lisez [dictionnaire.md](data-science/dictionnaire.md)
  d'abord, en particulier « Règle de publication » et « Avis ». Ensuite seulement
  vous ouvrez une requête. La section « Limites pour l'analyse » de
  [schema-diagram.md](data-science/schema-diagram.md) vous dira ce qu'il est
  impossible de calculer.
- **Vous branchez une table du code.** [schema.md](data-science/schema.md) donne
  les colonnes, les types et les index. Rien n'y n'est interprété.
- **Vous préparez une analyse ou un modèle.** Lisez la mise en garde en tête du
  [dictionnaire.md](data-science/dictionnaire.md) avant tout le reste : les
  volumes actuels sont ceux d'un environnement de développement.

## Glossaire

Un terme, une définition. Chaque entrée signale les mots voisins qui désignent
autre chose : c'est là que se logent la plupart des erreurs d'interprétation.

**Publié** — profil visible dans l'annuaire public. Ce n'est pas une colonne :
c'est ce que renvoie la vue `published_professionals`, qui exclut les profils
incomplets, masqués et sanctionnés. À ne pas confondre avec « actif », synonyme
courant : un compte actif peut être non publié.

**Profil incomplet** — profil qui ne satisfait pas l'ensemble des conditions de
publication. Il existe en base et n'apparaît nulle part.

**Masqué** — `professionals.is_hidden`, retrait volontaire par un administrateur.
Distinct de **bloqué** et **suspendu**, qui sont des sanctions automatiques et non
un choix.

**Bloqué / suspendu** — sanctions automatiques au-delà de 3 puis 5 signalements
recevables, seuils règle par `AUTO_BLOCK_REPORTS_THRESHOLD` et
`AUTO_SUSPEND_REPORTS_THRESHOLD`. Colonnes `blocked_at` et `suspended_at`. Un
compte sanctionné **reste dans les tables** : il n'est jamais supprimé.

**Artisan** — compte dont le rôle est `professional` **et** qui possède une ligne
dans `professionals`. Un compte avec le rôle mais sans profil n'est pas un artisan
pour l'annuaire.

**Signalement** — deux tables distinctes : `account_reports` vise un compte,
`review_reports` vise un avis. Les confondre fausse tout comptage.

**Grain** — ce que représente une ligne d'une table. Sans lui, un `count(*)` n'a
pas de sens interprétable : ces lignes sont des comptes, des photos ou des
signalements selon la table, jamais des « éléments ».

## Cycle de mise à jour

Les trois documents décrivent un **instantané**. Ils ne se régénèrent pas :
le script `schema:doc` qui produisait `schema.md` a été supprimé.

Toute évolution du schéma passe par une migration SQL versionnée dans
`server/db/migrations`, puis se reporte **à la main** dans `schema.md`. Une
migration non reflétée dans ces documents est une documentation fausse.

**La vue `published_professionals` demande une attention particulière.** Elle est
redéfinie par quatre migrations successives, et seule la dernière compte. Une
migration qui la redefine doit donc mettre à jour le SQL cité dans
[schema-diagram.md](data-science/schema-diagram.md), pas seulement `schema.md` :
c'est la partie de la documentation la plus facile à laisser obsolète en silence,
parce qu'une definition périmée reste syntaxiquement valide et continues de
s'appliquer sans erreur visible.

Après une migration, vérifiez : les volumes du tableau de `schema.md`, le
décompte des migrations que mentionne le dictionnaire, et si la vue a été
redéfinie, le SQL de `schema-diagram.md`.