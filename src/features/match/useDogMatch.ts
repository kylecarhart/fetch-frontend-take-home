import { client } from "@/clients/client";
import { Dog } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Hook for matching dogs functionality.
 * @returns The selected dogs, the matched dog, and functions to select and clear dogs.
 */
export function useDogMatch() {
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([]);
  const [matchedDog, setMatchedDog] = useState<Dog>();

  // Match mutation to match with the selected dogs
  const matchMutation = useMutation({
    mutationFn: () => client.matchDogs(selectedDogs.map((d) => d.id)),
    onSuccess: async (match) => {
      // Get the dog that was matched and set
      const dogs = await client.getDogs([match.match]);
      setMatchedDog(dogs[0]);
    },
  });

  /**
   * Adds/removes dogs from the selected dogs list.
   * @param dog
   */
  function selectDog(dog: Dog) {
    setSelectedDogs((prev) => {
      if (prev.some((d) => d.id === dog.id)) {
        return prev.filter((d) => d.id !== dog.id);
      }
      return [...prev, dog];
    });
  }

  /**
   * Clears the selected dogs list.
   */
  function clearSelectedDogs() {
    setSelectedDogs([]);
  }

  /**
   * Clears the matched dog.
   */
  function clearMatchedDog() {
    setMatchedDog(undefined);
  }

  /**
   * Matches the user with the selected dogs.
   */
  function match() {
    matchMutation.mutate();
  }

  return {
    selectedDogs,
    selectDog,
    matchedDog,
    clearMatchedDog,
    clearSelectedDogs,
    match,
  };
}
