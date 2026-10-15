import { Search, UserRound, MessageSquare } from "lucide-react";

export const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Cherchez près de chez vous",
    body: "Choisissez un métier et votre quartier. Les professionnels disponibles apparaissent en premier.",
    tone: "bg-kop-mint",
  },
  {
    n: "02",
    icon: UserRound,
    title: "Découvrez les profils",
    body: "Consultez les réalisations, l'expérience et les avis pour vous faire une idée.",
    tone: "bg-kop-cream",
  },
  {
    n: "03",
    icon: MessageSquare,
    title: "Échangez directement",
    body: "Accédez au téléphone et au WhatsApp du professionnel sur sa fiche publique pour discuter de votre projet.",
    tone: "bg-kop-rose",
  },
];

export const FAQ = [
  {
    q: "Faut-il un compte pour chercher ?",
    a: "Non. La recherche et les fiches publiques sont accessibles à tous. Un compte est nécessaire pour laisser un avis.",
  },
  {
    q: "Comment joindre un professionnel ?",
    a: "Son numéro de téléphone et son lien WhatsApp sont visibles directement sur sa fiche publique.",
  },
  {
    q: "Comment laisser un avis ?",
    a: "Connectez-vous en tant que client, ouvrez la fiche du professionnel et remplissez le formulaire « Donner mon avis ».",
  },
  {
    q: "À portée gère-t-il les interventions ?",
    a: "Non. KOP met en relation : vous discutez librement des tarifs, dates et conditions avec le professionnel.",
  },
];
