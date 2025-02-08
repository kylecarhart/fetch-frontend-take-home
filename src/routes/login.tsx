import { LoginForm } from "@/forms/LoginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <LoginForm className="w-full max-w-xs" />
    </div>
  );
}
