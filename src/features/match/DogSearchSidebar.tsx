import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  DogSearchForm,
  SearchDogsForm,
  SearchFormSkeleton,
} from "@/features/match/DogSearchForm";
import { cn } from "@/lib/utils";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowLeftIcon, DogIcon } from "lucide-react";
import { Suspense } from "react";

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  onSearchSubmit: (searchParams: SearchDogsForm) => void;
  className?: string;
  defaultValues: SearchDogsForm;
}

/**
 * Sidebar for the dog search page. Displays a search form and a logout button.
 */
export function DogSearchSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  onSearchSubmit,
  className,
  defaultValues,
}: Props) {
  const router = useRouter();
  const navigate = useNavigate();
  const auth = useAuth();

  // Logout and redirect
  function handleLogout() {
    auth.logout().then(() => {
      router.invalidate().finally(() => {
        navigate({ to: "/" });
      });
    });
  }

  return (
    <div
      className={cn("flex flex-col space-y-6 border-r bg-white p-8", className)}
    >
      {/* Sidebar Header */}
      <div className="flex items-center gap-2">
        <DogIcon className="size-6" />
        <h1 className="text-2xl font-bold">Shelter Match</h1>
        <button
          className="ml-auto block md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <ArrowLeftIcon className="size-6" />
        </button>
      </div>

      {/* Search form */}
      <div className="flex-1">
        <Suspense fallback={<SearchFormSkeleton />}>
          <DogSearchForm
            onSubmit={onSearchSubmit}
            defaultValues={defaultValues}
          />
        </Suspense>
      </div>

      {/* Logout button */}
      <Button variant="ghost" onClick={handleLogout} className="self-start">
        <ArrowLeft className="size-4" /> Logout
      </Button>
    </div>
  );
}
