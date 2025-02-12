import { client } from "@/clients/client";
import { Button } from "@/components/ui/button";
import { DogCard, DogCardSkeleton } from "@/features/match/DogCard";
import {
  DogSearchForm,
  SearchFormSkeleton,
} from "@/features/match/DogSearchForm";
import { MatchDialog } from "@/features/match/MatchDialog";
import { cn } from "@/lib/utils";
import { Dog, SearchDogsParams } from "@/types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowLeftIcon, DogIcon, MenuIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../../auth";

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

function RouteComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const auth = useAuth();
  const [dogSearchParams, setDogSearchParams] = useState<SearchDogsParams>({
    breeds: [],
    ageMin: 0,
    ageMax: 15,
    // zipCodes: [],
    from: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: "breed:asc",
  });
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([]);
  const [dogMatch, setDogMatch] = useState<Dog>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Match mutation to match with the selected dogs
  const matchMutation = useMutation({
    mutationFn: () => client.matchDogs(selectedDogs.map((d) => d.id)),
    onSuccess: async (match) => {
      // Get the dog that was matched and set
      const dogs = await client.getDogs([match.match]);
      setDogMatch(dogs[0]);
    },
  });

  // Logout and redirect
  function handleLogout() {
    auth.logout().then(() => {
      router.invalidate().finally(() => {
        navigate({ to: "/" });
      });
    });
  }

  /**
   * Adds/removes dogs from the selected dogs list.
   * @param dog
   */
  function handleSelectDog(dog: Dog) {
    setSelectedDogs((prev) => {
      if (prev.some((d) => d.id === dog.id)) {
        return prev.filter((d) => d.id !== dog.id);
      }
      return [...prev, dog];
    });
  }

  /**
   * Fetches dogs matching the search params, with infinite scrolling.
   */
  const { data: dogs, fetchNextPage } = useInfiniteQuery({
    queryKey: ["searchDogs", dogSearchParams],
    queryFn: async ({ pageParam }) => {
      const from = pageParam * (dogSearchParams.size ?? DEFAULT_PAGE_SIZE);

      // Search for dogs matching the params
      const searchDogsResponse = await client.searchDogs({
        ...(dogSearchParams.breeds && { breeds: dogSearchParams.breeds }),
        ...(dogSearchParams.ageMin && { ageMin: dogSearchParams.ageMin }),
        ...(dogSearchParams.ageMax && { ageMax: dogSearchParams.ageMax }),
        ...(dogSearchParams.size && { size: dogSearchParams.size }),
        ...(from && { from }),
        ...(dogSearchParams.sort && { sort: dogSearchParams.sort }),
        // ...(dogSearchParams.zipCodes && { zipCodes: dogSearchParams.zipCodes }),
      });

      // Get more info about the dogs returned from the search
      const dogs = await client.getDogs([
        ...(searchDogsResponse?.resultIds ?? []),
      ]);

      return { dogs, next: searchDogsResponse?.next };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const params = new URLSearchParams(lastPage.next);
      const from = params.get("from");
      return from
        ? parseInt(from) / (dogSearchParams.size ?? DEFAULT_PAGE_SIZE)
        : null;
    },
  });

  // Detect when skeleton is in view, and fetch more dogs (infinite scroll)
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 250,
  });

  // Fetch more dogs when the skeleton is in view
  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  // Submit the search form
  function onSubmit(data: SearchDogsParams) {
    setDogSearchParams(data);
    setIsSidebarOpen(false);
    // TODO: Add search params to the url
  }

  // Match with the selected dogs
  function handleMatch() {
    matchMutation.mutate();
  }

  // Clear the selected dogs
  function handleClear() {
    setSelectedDogs([]);
  }

  return (
    <div className="grid h-screen md:grid-cols-[350px,1fr]">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "fixed left-4 top-4 z-10 rounded-full border border-gray-200 bg-white p-2 shadow-md md:hidden",
          isSidebarOpen && "hidden",
        )}
      >
        <MenuIcon className="size-6" />
      </button>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed bottom-0 top-0 z-10 flex -translate-x-full flex-col space-y-6 border-r bg-white p-8 transition-transform duration-300 sm:max-w-[350px] md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
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

        <div className="flex-1">
          <Suspense fallback={<SearchFormSkeleton />}>
            <DogSearchForm onSubmit={onSubmit} />
          </Suspense>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="self-start">
          <ArrowLeft className="size-4" /> Logout
        </Button>
      </div>
      {/* Main */}
      <div className="overflow-y-scroll">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 p-8 xl:grid-cols-5 2xl:grid-cols-6">
          <>
            {dogs?.pages.map((page) => {
              return page.dogs.map((dog) => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  onSelect={handleSelectDog}
                  isSelected={selectedDogs.some((d) => d.id === dog.id)}
                />
              ));
            })}
            <DogCardSkeleton ref={ref} />
          </>
        </div>
        {selectedDogs.length > 0 && (
          <div className="sticky bottom-0 space-x-2 border-t bg-white py-4 text-center">
            <Button className="" variant="default" onClick={handleMatch}>
              Match with {selectedDogs.length} dogs!
            </Button>
            <Button className="" variant="ghost" onClick={handleClear}>
              Clear dogs
            </Button>
          </div>
        )}
      </div>
      {dogMatch && (
        <MatchDialog
          className="sm:max-w-[400px]"
          onOpenChange={() => setDogMatch(undefined)}
          open={!!dogMatch}
          dog={dogMatch}
        />
      )}
    </div>
  );
}
