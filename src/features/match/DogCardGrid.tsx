import { client } from "@/clients/client";
import { DogCard, DogCardSkeleton } from "@/features/match/DogCard";
import { Dog, DogsSearchParams } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const DEFAULT_PAGE_SIZE = 25;

interface Props {
  dogSearchParams: DogsSearchParams;
  selectedDogs: Dog[];
  onSelectDog: (dog: Dog) => void;
}

/**
 * A grid of dog cards, paginated with infinite scrolling.
 * @param dogSearchParams - The search parameters for the dogs.
 * @param selectedDogs - The dogs that have been selected.
 * @param selectDog - The function to select a dog.
 * @returns A grid of dog cards, paginated with infinite scrolling.
 */
export function DogCardGrid({
  dogSearchParams,
  selectedDogs,
  onSelectDog,
}: Props) {
  /**
   * Fetches dogs matching the search params, with infinite scrolling.
   */
  const {
    data: dogs,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["searchDogs", dogSearchParams],
    queryFn: async ({ pageParam }) => {
      const from = pageParam * (dogSearchParams.size ?? DEFAULT_PAGE_SIZE);

      // Search for dogs matching the params
      const dogsSearch = await client.searchDogs({
        ...(dogSearchParams.breeds && { breeds: dogSearchParams.breeds }),
        ...(dogSearchParams.ageMin && { ageMin: dogSearchParams.ageMin }),
        ...(dogSearchParams.ageMax && { ageMax: dogSearchParams.ageMax }),
        ...(dogSearchParams.size && { size: dogSearchParams.size }),
        ...(from && { from }),
        ...(dogSearchParams.sort && { sort: dogSearchParams.sort }),
        // ...(dogSearchParams.zipCodes && { zipCodes: dogSearchParams.zipCodes }),
      });

      // Get more info about the dogs returned from the search
      const dogs = await client.getDogs([...(dogsSearch?.resultIds ?? [])]);

      return { dogs, dogsSearch };
    },
    initialPageParam: 0,
    getNextPageParam: ({ dogs, dogsSearch }) => {
      const params = new URLSearchParams(dogsSearch.next);
      const from = params.get("from");
      const pageSize = dogSearchParams.size ?? DEFAULT_PAGE_SIZE;

      // If we got back less dogs than the page size, theres no next page
      if (dogs.length < pageSize) {
        return undefined;
      }

      // Return the next page number
      return from ? parseInt(from) / pageSize : undefined;
    },
  });

  // Detect when skeleton is in view, and fetch more dogs (infinite scroll)
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  // Fetch more dogs when the skeleton is in view
  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-12 p-8 xl:grid-cols-5 2xl:grid-cols-6">
      {/* Render a card for each dog, paginated with infinite scroll */}
      {dogs?.pages.map((page) => {
        return page.dogs.map((dog) => (
          <DogCard
            key={dog.id}
            dog={dog}
            onSelect={onSelectDog}
            isSelected={selectedDogs.some((d) => d.id === dog.id)}
          />
        ));
      })}

      {/* Only show the skeleton if there are more pages */}
      {hasNextPage && <DogCardSkeleton ref={ref} />}

      {/* Show a message if there are absolutely no dogs from the search */}
      {dogs?.pages[0].dogs.length === 0 && (
        <div className="col-span-full">
          <p className="text-center text-sm text-gray-500">
            No dogs found... Try broadening your search.
          </p>
        </div>
      )}
    </div>
  );
}
