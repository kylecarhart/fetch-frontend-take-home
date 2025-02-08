import { LoginForm } from "@/forms/LoginForm";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <LoginForm
        className="w-full max-w-xs"
        onSuccess={() => navigate({ to: "/" })}
      />
    </div>
  );
}
