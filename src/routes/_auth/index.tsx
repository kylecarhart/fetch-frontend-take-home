import { Button } from "@/components/ui/button";
import { DogCardGrid } from "@/features/match/DogCardGrid";
import { DogSearchSidebar } from "@/features/match/DogSearchSidebar";
import { MatchDialog } from "@/features/match/MatchDialog";
import { useDogMatch } from "@/features/match/useDogMatch";
import { cn } from "@/lib/utils";
import { DogsSearchParams } from "@/types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 25;

export const Route = createFileRoute("/_auth/")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

/**
 * Dog matching page, gated by authentication.
 */
function RouteComponent() {
  const [dogSearchParams, setDogSearchParams] = useState<DogsSearchParams>({
    breeds: [],
    ageMin: 0,
    ageMax: 15,
    from: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: "breed:asc",
    // zipCodes: [],
  });

  const {
    selectDog,
    selectedDogs,
    clearSelectedDogs,
    match,
    matchedDog,
    clearMatchedDog,
  } = useDogMatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Submit the search form
  function onSubmit(data: DogsSearchParams) {
    setDogSearchParams(data);
    setIsSidebarOpen(false);
    // TODO: Add search params to the url
  }

  return (
    <div className="grid h-screen md:grid-cols-[350px,1fr]">
      {/* Sidebar hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "fixed left-4 top-4 z-10 rounded-full border border-gray-200 bg-white p-2 shadow-md md:hidden",
          isSidebarOpen && "hidden",
        )}
      >
        <MenuIcon className="size-6" />
      </button>
      {/* Search sidebar */}
      <DogSearchSidebar
        className={cn(
          "fixed bottom-0 top-0 z-10 -translate-x-full transition-transform duration-300 sm:max-w-[350px] md:relative md:translate-x-0",
          isSidebarOpen && "translate-x-0",
        )}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onSearchSubmit={onSubmit}
      />
      {/* Main */}
      <div className="overflow-y-scroll">
        {/* Dog card grid */}
        <DogCardGrid
          dogSearchParams={dogSearchParams}
          selectedDogs={selectedDogs}
          onSelectDog={selectDog}
        />
        {/* Match and clear buttons */}
        {selectedDogs.length > 0 && (
          <div className="sticky bottom-0 space-x-2 border-t bg-white py-4 text-center">
            <Button variant="default" onClick={match}>
              Match with {selectedDogs.length} dogs!
            </Button>
            <Button variant="ghost" onClick={clearSelectedDogs}>
              Clear dogs
            </Button>
          </div>
        )}
      </div>
      {/* Popup for the matched dog */}
      {matchedDog && (
        <MatchDialog
          className="sm:max-w-[400px]"
          onOpenChange={() => clearMatchedDog()}
          open={!!matchedDog}
          dog={matchedDog}
        />
      )}
    </div>
  );
}
