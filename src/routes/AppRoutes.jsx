import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RootLayout } from "@/shared/components/layout/RootLayout.jsx";
import { HomeRoute } from "./HomeRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";
import { ROLES, ROUTES } from "@/shared/lib/constants.js";
import { Skeleton } from "@/shared/components/ui/Skeleton.jsx";

const HomePlaceholder = lazy(() =>
  import("@/pages/HomePlaceholder.jsx").then((m) => ({
    default: m.HomePlaceholder,
  })),
);
const HomePage = lazy(() =>
  import("@/pages/HomePage.jsx").then((m) => ({ default: m.HomePage })),
);
const HowItWorksPage = lazy(() =>
  import("@/pages/HowItWorksPage.jsx").then((m) => ({
    default: m.HowItWorksPage,
  })),
);
const TermsPage = lazy(() =>
  import("@/pages/TermsPage.jsx").then((m) => ({ default: m.TermsPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage.jsx").then((m) => ({ default: m.NotFoundPage })),
);
const ForbiddenPage = lazy(() =>
  import("@/pages/ForbiddenPage.jsx").then((m) => ({
    default: m.ForbiddenPage,
  })),
);
const AuthModalRedirect = lazy(() =>
  import("@/features/auth/pages/AuthModalRedirect.jsx").then((m) => ({
    default: m.AuthModalRedirect,
  })),
);
const SearchPage = lazy(() =>
  import("@/features/search/pages/SearchPage.jsx").then((m) => ({
    default: m.SearchPage,
  })),
);
const ProfessionalPublicPage = lazy(() =>
  import("@/features/professionals/pages/ProfessionalPublicPage.jsx").then(
    (m) => ({ default: m.ProfessionalPublicPage }),
  ),
);
const ClientDashboardPage = lazy(() =>
  import("@/pages/dashboard/ClientDashboardPage.jsx").then((m) => ({
    default: m.ClientDashboardPage,
  })),
);
const ProProfilePage = lazy(() =>
  import("@/features/professionals/pages/ProProfilePage.jsx").then((m) => ({
    default: m.ProProfilePage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/pages/AdminDashboardPage.jsx").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const RouteErrorPage = lazy(() =>
  import("@/pages/RouteErrorPage.jsx").then((m) => ({
    default: m.RouteErrorPage,
  })),
);

function PageSkeleton() {
  return (
    <div className="container-kop space-y-4 py-8 lg:py-16" aria-busy="true">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/**
 * La page d'accueil ne lit rien en base : ses sections sont statiques. Lui
 * afficher le squelette générique - trois barres grises là où le hero occupe
 * toute la largeur - déformait la mise en page. Elle attend donc un placeholder
 * calqué sur son hero, seul à ne pas correspondre à l'écran réel.
 * @param {import("react").ReactElement} element page à charger
 * @param {import("react").ReactNode} [fallback] attente affichée pendant le
 *   chargement du morceau
 * @returns {import("react").ReactElement} la page sous suspense
 */
function page(element, fallback = <PageSkeleton />) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
}

function protectedPage(role, Component) {
  return (
    <RoleRoute role={role}>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </RoleRoute>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: (
      <Suspense fallback={<PageSkeleton />}>
        <RouteErrorPage />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <HomeRoute>{page(<HomePage />, <HomePlaceholder />)}</HomeRoute>
        ),
      },
      { path: ROUTES.HOW_IT_WORKS, element: page(<HowItWorksPage />) },
      { path: ROUTES.SEARCH, element: page(<SearchPage />) },
      { path: ROUTES.TERMS, element: page(<TermsPage />) },
      { path: "/professionals/:id", element: page(<ProfessionalPublicPage />) },
      { path: ROUTES.LOGIN, element: page(<AuthModalRedirect mode="login" />) },
      {
        path: ROUTES.REGISTER_CLIENT,
        element: page(<AuthModalRedirect mode="register-client" />),
      },
      {
        path: ROUTES.REGISTER_PRO,
        element: page(<AuthModalRedirect mode="register-pro" />),
      },
      {
        path: `${ROUTES.DASHBOARD_CLIENT}/:section?`,
        element: protectedPage(ROLES.CLIENT, ClientDashboardPage),
      },
      {
        path: `${ROUTES.DASHBOARD_PRO}/:section?`,
        element: protectedPage(ROLES.PRO, ProProfilePage),
      },
      {
        path: `${ROUTES.ADMIN}/:section?`,
        element: protectedPage(ROLES.ADMIN, AdminDashboardPage),
      },
      { path: "/forbidden", element: page(<ForbiddenPage />) },
      { path: "*", element: page(<NotFoundPage />) },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
