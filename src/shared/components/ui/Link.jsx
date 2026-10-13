import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '@/shared/utils';

/**
 * Lien unique, API Next.js : `<Link href="...">`.
 *
 * L'import de react-router est renommé `RouterLink` au moment où il est
 * importé, jamais ailleurs : c'est ce qui libère le nom `Link` pour ce
 * composant, et évite d'avoir deux « Link » différents dans un même fichier -
 * l'un qui prend `to`, l'autre `href`.
 *
 * ## Deux rendus, une seule API
 *
 * - **Interne** (route de l'application, sans `target`) : rendu par
 *   `RouterLink`, navigation sans rechargement, historique du navigateur
 *   alimenté normalement.
 * - **Interne mais `target="_blank"`** : rendu par un `<a>`. `RouterLink`
 *   intercepte le clic et appelle `preventDefault()`, ce qui **annule
 *   l'ouverture** : un `Link target="_blank"` construit sur lui naviguerait dans
 *   l'onglet au lieu d'en créer un. On accepte le rechargement de page, qui est
 *   le prix d'un onglet supplémentaire.
 * - **Externe** (autre domaine, `mailto:`, `tel:`) : toujours un `<a>`.
 *
 * ## Quand un nouvel onglet
 *
 * Un nouvel onglet coûte cher : il multiplie les onglets, décale le bouton
 * « retour » et perd l'historique de la tâche. On ne l'emploie que dans **trois**
 * cas :
 *
 * 1. **La destination est une prévisualisation** - « Voir ma fiche publique »,
 *    le lien de l'admin vers une fiche. On quitte son tableau de bord pour voir
 *    ce que voit un visiteur, on compare, on revient corriger.
 * 2. **La destination quitte l'application** : autre domaine, application
 *    externe (WhatsApp).
 * 3. **La ressource est générée** : export, PDF.
 *
 * Jamais pour la navigation interne - sections, fil d'Ariane, onglets, et même
 * les pages « externes » comme les mentions légales. Ce sont des déplacements
 * dans l'application, pas des départs. C'est ce qui garde le bouton « retour »
 * utile : il annule la dernière étape d'une démarche.
 *
 * `rel="noopener noreferrer"` est systématique : sans lui, la page cible peut
 * piloter l'onglet d'origine via `window.opener`.
 */
export const Link = forwardRef(function Link(
  { href, target, replace, className, children, ...rest },
  ref,
) {
  const isExternal =
    target === '_blank' ||
    /^(https?:|mailto:|tel:)/i.test(href ?? '') ||
    // Une ancre ou une query sans chemin ne peut pas passer par le routeur.
    (href != null && !String(href).startsWith('/'));

  if (isExternal)
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel="noopener noreferrer"
        className={cn(className)}
        {...rest}
      >
        {children}
      </a>
    );

  return (
    <RouterLink ref={ref} to={href} replace={replace} className={cn(className)} {...rest}>
      {children}
    </RouterLink>
  );
});