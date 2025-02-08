import { LoginForm } from "@/forms/LoginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
