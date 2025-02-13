import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Dog } from "@/types";
import { HeartIcon } from "lucide-react";

interface DogCardProps {
  dog: Dog;
  onSelect: (dog: Dog) => void;
  isSelected: boolean;
}

/**
 * A card for a dog that displays the dog's image, name, breed, age, and zip
 * code.
 *
 * TODO: Add click animation on dog image that shows heart appearing
 * TODO: Investigate object-cover cutting off some dog images
 * TODO: Consider using subgrid instead of flex for button alignment
 */
export function DogCard({ dog, onSelect, isSelected }: DogCardProps) {
  return (
    <div key={dog.id} className="flex h-full flex-col">
      <img
        src={dog.img}
        alt={dog.name}
        className="aspect-square w-full rounded-md bg-top object-cover"
      />
      <div>
        <span className="text-lg font-bold">{dog.name} </span>
        <span className="text-sm">({dog.breed})</span>
      </div>

      <ul className="flex-1">
        <li>Age: {dog.age}</li>
        <li>Zip: {dog.zip_code}</li>
      </ul>

      <Button
        className="mt-4 w-full self-end font-semibold"
        variant={isSelected ? "default" : "outline"}
        onClick={() => onSelect(dog)}
      >
        <HeartIcon className="size-4 text-rose-500" />
        {isSelected ? <span>Selected!</span> : <span>Pick me!</span>}
      </Button>
    </div>
  );
}

interface DogCardSkeletonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  className?: string;
}
export function DogCardSkeleton({ className, ...props }: DogCardSkeletonProps) {
  return (
    <div
      className={cn("flex h-full flex-col justify-between gap-1", className)}
      {...props}
    >
      <Skeleton className="aspect-square w-full rounded-md" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
