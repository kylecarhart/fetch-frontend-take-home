import { LoginForm } from "@/features/auth/LoginForm";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { z } from "zod";

const fallback = "/" as const;

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: RouteComponent,
});

/**
 * Login page. Users are redirected here if they are not authenticated.
 */
function RouteComponent() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();

  async function handleLogin() {
    await router.invalidate();
    navigate({ to: search.redirect || fallback });
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <LoginForm
        className="w-full max-w-xs sm:mb-[15vh]"
        onSuccess={handleLogin}
      />
    </div>
  );
}
