import { useState } from 'react';
import { getClientReviews } from '../services/reviews.service.js';

/**
 * Charge à la demande l'historique d'avis d'un client sur tous les
 * professionnels (bouton « Voir tous les avis de ce client »).
 * L'état est isolé ici pour que ce comportement ne reste pas dispersé
 * dans les composants qui l'affichent.
 */
export function useClientReviewsExpansion() {
  const [expanded, setExpanded] = useState(null);
  const [data, setData] = useState({});

  const loadClientReviews = (clientId) =>
    getClientReviews(clientId)
      .then((result) => setData((map) => ({ ...map, [clientId]: result?.items || [] })))
      .catch(() => setData((map) => ({ ...map, [clientId]: [] })));

  const toggle = (clientId) => {
    if (expanded === clientId) {
      setExpanded(null);
      return;
    }
    setExpanded(clientId);
    if (!data[clientId]) loadClientReviews(clientId);
  };

  return { expanded, items: expanded == null ? [] : data[expanded] ?? [], toggle };
}