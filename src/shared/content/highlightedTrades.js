import { Wrench, Zap, Palette } from 'lucide-react';
import { HOME_IMAGES } from '@/shared/content/homeImages.js';

export const HIGHLIGHTED_TRADES = [
  {
    id: 'plomberie',
    tradeId: 1,
    image: HOME_IMAGES.what1.src,
    srcSet: HOME_IMAGES.what1.srcSet,
    sizes: HOME_IMAGES.what1.sizes,
    name: 'Plomberie',
    sub: 'Fuites & installations',
    icon: Wrench,
  },
  {
    id: 'electricite',
    tradeId: 2,
    image: HOME_IMAGES.what2.src,
    srcSet: HOME_IMAGES.what2.srcSet,
    sizes: HOME_IMAGES.what2.sizes,
    name: 'Électricité',
    sub: 'Dépannage & équipements',
    icon: Zap,
  },
  {
    id: 'maconnerie',
    tradeId: 3,
    image: HOME_IMAGES.what3.src,
    srcSet: HOME_IMAGES.what3.srcSet,
    sizes: HOME_IMAGES.what3.sizes,
    name: 'Maçonnerie',
    sub: 'Gros œuvre & finitions',
    icon: Palette,
  },
];