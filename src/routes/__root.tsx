import { AuthContext } from "@/auth";
import { isDevelopment } from "@/lib/utils";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

interface Context {
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<Context>()({
  component: () => (
    <>
      <Outlet />
      {isDevelopment && <TanStackRouterDevtools />}
      {isDevelopment && <ReactQueryDevtools />}
    </>
  ),
});
