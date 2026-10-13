
import { Wrench, Zap, Palette } from 'lucide-react';
import what1 from '@/shared/assets/what1.png';
import what2 from '@/shared/assets/what2.png';
import what3 from '@/shared/assets/what3.png';

export const HIGHLIGHTED_TRADES = [
  {
    id: 'plomberie',
    tradeId: 1,
    image: what1,
    name: 'Plomberie',
    sub: 'Fuites & installations',
    icon: Wrench,
  },
  {
    id: 'electricite',
    tradeId: 2,
    image: what2,
    name: 'Électricité',
    sub: 'Dépannage & équipements',
    icon: Zap,
  },
  {
    id: 'maconnerie',
    tradeId: 3,
    image: what3,
    name: 'Maçonnerie',
    sub: 'Gros œuvre & finitions',
    icon: Palette,
  },
];