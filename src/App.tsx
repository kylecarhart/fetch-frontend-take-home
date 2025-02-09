import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useAuth } from "./auth";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree, context: { auth: undefined! } });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

interface Props {}

export default function App({}: Props) {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}
