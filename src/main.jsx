import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/shared/context/AuthContext.jsx';
import { NotificationProvider } from '@/shared/context/NotificationContext.jsx';
import { AppRoutes } from '@/routes/AppRoutes.jsx';
import { AuthModalProvider } from '@/shared/context/AuthModalContext.jsx';
import { MotionRoot } from '@/shared/motion/MotionRoot.jsx';
import { registerServiceWorker } from '@/shared/lib/serviceWorker.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
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

registerServiceWorker();
