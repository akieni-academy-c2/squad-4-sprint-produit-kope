import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/shared/context/AuthContext.jsx';
import { NotificationProvider } from '@/shared/context/NotificationContext.jsx';
import { AppRoutes } from '@/routes/AppRoutes.jsx';
import { AuthModalProvider } from '@/shared/context/AuthModalContext.jsx';
import { MotionRoot } from '@/shared/motion/MotionRoot.jsx';
import { initMockMode } from '@/shared/lib/dataSource.js';
import './index.css';

initMockMode();

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
