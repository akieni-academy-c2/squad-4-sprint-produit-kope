import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import {
  DEMO_AVATAR_MARKER,
  MOCK_PROS,
  getDemoAvatarUrl,
  getDemoUser,
  setDemoAvatarFile,
  setDemoUser,
} from '@/shared/mocks/appMock.js';
import { ROUTES, ROLES } from '@/shared/lib/constants.js';

export function registerClient(payload) {
  return callApi(
    () => api.postJson('/auth/register/client', payload).then((r) => r?.user),
    async () => {
      const user = {
        id: Date.now() % 100000,
        role: 'client',
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function registerProfessional(payload) {
  return callApi(
    () => api.postJson('/auth/register/professional', payload).then((r) => r?.user),
    async () => {
      const user = {
        id: Date.now() % 100000,
        role: 'professional',
        phone: payload.phone,
        displayName: payload.displayName,
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function login(payload) {
  return callApi(
    () => api.postJson('/auth/login', payload).then((r) => r?.user),
    async () => {
      const user = {
        id: Date.now() % 100000,
        role: 'client',
        phone: payload.phone,
        firstName: 'Démo',
        lastName: 'Utilisateur',
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function logout() {
  return callApi(
    async () => {
      // Le serveur détruit la session côté serveur et efface le cookie httpOnly.
      try {
        await api.postJson('/auth/logout', {});
      } finally {
        setDemoUser(null);
      }
      return {};
    },
    async () => { setDemoUser(null);
      return {};
    },
  );
}

export function getCurrentUser() {
  const demoUser = getDemoUser();
  if (demoUser) return Promise.resolve(demoUser);

  return callApi(
    () => api.get('/auth/me').then((r) => r?.user),
    async () => getDemoUser(),
  );
}

/**
 * Profils de démonstration, par rôle.
 *
 * Les écrans client, professionnel et administrateur ne lisent pas les mêmes
 * données : sans ces comptes, les tester demande trois inscriptions et trois
 * formulaires remplis à chaque fois.
 *
 * Seul point d'entrée vers les mocks pour un composant : la règle d'architecture
 * réserve `shared/mocks` aux services de feature.
 */
export function demoRoles() {
  return [
    {
      role: ROLES.ADMIN,
      label: 'Administrateur',
      user: { id: 901, role: ROLES.ADMIN, firstName: 'Admin', lastName: 'Démo' },
      href: ROUTES.ADMIN,
    },
    {
      role: ROLES.PRO,
      label: 'Professionnel',
      // Même identifiant que le premier mock : la fiche publique consultable
      // correspond au professionnel connecté.
      user: {
        id: MOCK_PROS[0]?.id ?? 1,
        role: ROLES.PRO,
        displayName: MOCK_PROS[0]?.displayName ?? 'Professionnel Démo',
        phone: MOCK_PROS[0]?.phone ?? '+242061000001',
        firstName: MOCK_PROS[0]?.firstName ?? '',
        lastName: MOCK_PROS[0]?.lastName ?? '',
        // Vide à dessein : le formulaire doit montrer un champ à remplir,
        // pas une adresse qui laisserait croire qu'elle est en lecture seule.
        email: '',
      },
      href: ROUTES.DASHBOARD_PRO,
    },
    {
      role: ROLES.CLIENT,
      label: 'Client',
      user: {
        id: 902,
        role: ROLES.CLIENT,
        firstName: 'Client',
        lastName: 'Démo',
        phone: '+242065000002',
        // Champ laissé vide à dessein : la démo doit montrer le formulaire
        // d'e-mail dans l'état « non renseigné », où l'utilisateur voit qu'il
        // peut le remplir. Une adresse pré-remplie le ferait croire en lecture.
        email: '',
        createdAt: new Date(Date.now() - 84 * 86400000).toISOString(),
      },
      href: ROUTES.DASHBOARD_CLIENT,
    },
  ];
}

/** Connecte un profil de démonstration sans passer par le formulaire. */
export function loginAsDemo(user) {
  setDemoUser(user);
  return user;
}

/** Referme la session de démonstration et rend la main à la vraie API. */
export function leaveDemo() {
  setDemoUser(null);
}

export function becomeProfessional(payload) {
  return callApi(
    () => api.postJson('/auth/become-professional', payload).then((r) => r?.user),
    async () => {
      const user = {
        ...(getDemoUser() || { id: Date.now() % 100000 }),
        role: 'professional',
        displayName: payload.displayName,
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function updateAccount(payload) {
  return callApi(
    () => api.putJson('/auth/me', payload).then((r) => r?.user),
    async () => {
      const demo = getDemoUser();
      if (demo) setDemoUser({ ...demo, ...payload });
      return demo ? { ...demo, ...payload } : null;
    },
  );
}

export function changePassword(payload) {
  return callApi(
    () => api.putJson('/auth/password', payload),
    async () => ({}),
  );
}

export function uploadAvatar(file, onProgress) {
  const fd = new FormData();
  fd.append('avatar', file);
  return callApi(
    () =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/auth/avatar');
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress)
            onProgress(Math.round((e.loaded / e.total) * 100));

        };
        xhr.onload = () => {
          try {
            const payload = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300)
              resolve(payload?.avatarUrl ?? null);
             else
              reject(new Error(payload?.message || `Erreur ${xhr.status}`));

          } catch {
            reject(new Error('Réponse invalide'));
          }
        };
        xhr.onerror = () => reject(new TypeError('Échec réseau'));
        xhr.send(fd);
      }),
    async () => {
      if (file) {
        if (onProgress) onProgress(100);
        // Le fichier est gardé en mémoire et l'URL reconstruite à la lecture :
        // une URL `blob:` écrite dans `localStorage` redevient morte au
        // rechargement et l'avatar tombe en `ERR_FILE_NOT_FOUND`.
        setDemoAvatarFile(file);
        const demo = getDemoUser();
        if (demo) setDemoUser({ ...demo, avatarUrl: DEMO_AVATAR_MARKER });
        return getDemoAvatarUrl();
      }
      return null;
    },
  );
}