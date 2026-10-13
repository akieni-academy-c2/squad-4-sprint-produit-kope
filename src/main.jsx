import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/shared/context/AuthContext.jsx';
import { NotificationProvider } from '@/shared/context/NotificationContext.jsx';
import { AppRoutes } from '@/routes/AppRoutes.jsx';
import { AuthModalProvider } from '@/shared/context/AuthModalContext.jsx';
import { MotionRoot } from '@/shared/motion/MotionRoot.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Le plus haut possible : c'est ici que se règle `prefers-reduced-motion`
        et la courbe par défaut. Un mouvement écrit sans `transition` doit
        pouvoir compter sur une configuration correcte. */}
    <MotionRoot>
      <AuthProvider>
        <NotificationProvider>
          <AuthModalProvider>
            <AppRoutes />
          </AuthModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </MotionRoot>
  </StrictMode>,
);
