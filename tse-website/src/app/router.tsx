import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/auth/guards";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

function Fallback() {
  return <div className="mx-auto max-w-6xl px-6 py-28 text-center text-muted-foreground">Loading…</div>;
}

/** Wrap a lazily-imported page in Suspense so route chunks don't collapse the page. */
const page = (load: () => Promise<{ default: ComponentType }>) => {
  const C = lazy(load);
  return (
    <Suspense fallback={<Fallback />}>
      <C />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/services", element: page(() => import("@/pages/Services")) },
          { path: "/case-studies", element: page(() => import("@/pages/CaseStudies")) },
          { path: "/case-studies/:slug", element: page(() => import("@/pages/CaseStudyDetail")) },
          { path: "/about", element: page(() => import("@/pages/About")) },
          { path: "/contact", element: page(() => import("@/pages/Contact")) },
        ],
      },
      {
        element: <AppLayout />,
        children: [
          { path: "/events", element: page(() => import("@/pages/events/EventList")) },
          { path: "/events/:slug", element: page(() => import("@/pages/events/EventDetail")) },
          { path: "/auth/sign-in", element: page(() => import("@/pages/auth/SignIn")) },
          { path: "/auth/callback", element: page(() => import("@/pages/auth/AuthCallback")) },
          {
            element: <RequireAuth />,
            children: [
              { path: "/events/:slug/checkout", element: page(() => import("@/pages/events/Checkout")) },
              { path: "/account", element: page(() => import("@/pages/account/AccountDashboard")) },
              { path: "/account/tickets/:ticketId", element: page(() => import("@/pages/account/TicketView")) },
            ],
          },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
