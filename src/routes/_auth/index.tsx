import { client } from "@/clients/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Dog, SearchDogsParams } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  BoneIcon,
  Check,
  ChevronsUpDown,
  DogIcon,
  HeartIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { Fragment, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

  // Match mutation
  const matchMutation = useMutation({
    mutationFn: () => client.matchDogs(selectedDogs.map((d) => d.id)),
    onSuccess: async (match) => {
      // Get the dog that was matched and set
      const dogs = await client.getDogs([match.match]);
      setDogMatch(dogs[0]);
    },
  });

  const handleLogout = () => {
    auth.logout().then(() => {
      router.invalidate().finally(() => {
        navigate({ to: "/" });
      });
    });
  };

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

  function onSubmit(data: SearchDogsParams) {
    setDogSearchParams(data);
  }

  function handleMatch() {
    matchMutation.mutate();
  }

  return (
    <div className="grid h-screen grid-cols-[350px,1fr]">
      {/* Sidebar */}
      <div className="flex flex-col space-y-6 border-r p-8">
        <div className="flex items-center gap-2">
          <DogIcon className="size-6" />
          <h1 className="text-2xl font-bold">Shelter Match</h1>
        </div>

        <div className="flex-1">
          <Suspense fallback={<SearchFormSkeleton />}>
            <SearchForm onSubmit={onSubmit} />
          </Suspense>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="self-start">
          <ArrowLeft className="size-4" /> Logout
        </Button>
      </div>
      {/* Main */}
      <div className="overflow-y-scroll">
        <div className="grid grid-cols-3 gap-6 p-8 xl:grid-cols-5">
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
          </>
        </div>
        <Button onClick={() => fetchNextPage()}>Fetch Next Page</Button>
        {selectedDogs.length > 0 && (
          <div className="sticky bottom-0 border-t bg-white py-2 text-center">
            <Button className="" variant="ghost" onClick={handleMatch}>
              Match with {selectedDogs.length} dogs!
            </Button>
          </div>
        )}
      </div>
      {dogMatch && (
        <MatchDialog
          className="sm:max-w-[25vw]"
          onOpenChange={() => setDogMatch(undefined)}
          open={!!dogMatch}
          dog={dogMatch}
        />
      )}
    </div>
  );
}

// interface DogCardGridProps {
//   searchDogsResponse: SearchDogsResponse | undefined;
// }

// function DogCardGrid({ searchDogsResponse }: DogCardGridProps) {
//   const dogs = useSuspenseQuery({
//     queryKey: ["dogs", searchDogsResponse?.resultIds],
//     queryFn: () => client.getDogs(searchDogsResponse?.resultIds ?? []),
//   });

//   return (
//     <>
//       {dogs?.data?.map((dog) => (
//         <DogCard
//           key={dog.id}
//           dog={dog}
//           onSelect={() => {}}
//           isSelected={false}
//         />
//       ))}
//     </>
//   );
// }

interface DogCardProps {
  dog: Dog;
  onSelect: (dog: Dog) => void;
  isSelected: boolean;
}

// TODO: What would be cool is if you could just click on the image of the dog and it would
// do a little animation of a heart appearing
// TODO: Object cover looks really good here for most dogs, but some dogs are cut off...
// TODO: Could maybe do subgrid for the button alignment instead of flex
function DogCard({ dog, onSelect, isSelected }: DogCardProps) {
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

function DogCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between gap-1">
      <Skeleton className="aspect-square w-full rounded-md" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

interface SearchFormProps {
  className?: string;
  onSubmit: (data: z.infer<typeof SearchDogsSchema>) => void;
}

const SearchDogsSchema = z.object({
  breeds: z.array(z.string()).optional(),
  ageMin: z.coerce.number().optional(),
  ageMax: z.coerce.number().optional(),
  // zipCodes: z.array(z.string()).optional(),
  // size: z.number().optional(),
  // from: z.string().optional(),
  // sort: z.string().optional(),
}) satisfies z.ZodType<SearchDogsParams>;

function SearchForm({ className, onSubmit }: SearchFormProps) {
  const { data: breeds } = useSuspenseQuery({
    queryKey: ["breeds"],
    queryFn: client.getBreeds,
  });

  const form = useForm<z.infer<typeof SearchDogsSchema>>({
    resolver: zodResolver(SearchDogsSchema),
    defaultValues: {
      breeds: [],
      ageMin: 0,
      ageMax: 15,
      // zipCodes: [],
      // size: 25,
      // from: "0",
      // sort: "asc",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
      >
        <div className="space-y-4">
          {/* Breed */}
          <FormField
            control={form.control}
            name="breeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breeds</FormLabel>
                <Combobox
                  values={field.value}
                  onChange={field.onChange}
                  breeds={breeds}
                />
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
          {/* Age Range */}
          {/* TODO: It would probably be a better user experience if we had a couple of preset age ranges */}
          {/* ie: Puppy (0-1), Young Adult (2-4), Adult (5-8), Senior (9-15) */}
          <div>
            <Label>Age Range</Label>
            <div className="mt-2 flex gap-2">
              <FormField
                control={form.control}
                name="ageMin"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="0" />
                )}
              />
              <FormField
                control={form.control}
                name="ageMax"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="15" />
                )}
              />
            </div>
          </div>
          {/* Zip Codes */}
          {/* <FormField
            control={form.control}
            name="zipCodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Codes</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter zip codes" />
                </FormControl>
              </FormItem>
            )}
          /> */}
          {/* Size */}
          {/* <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Results Per Page</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="10" />
                </FormControl>
              </FormItem>
            )}
          /> */}
          {/* Sort */}
          {/* <FormField
            control={form.control}
            name="sort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} 
          /> */}
        </div>

        {/* Submit */}
        <Button className="w-full">
          <BoneIcon className="size-4" /> Fetch!
        </Button>
      </form>
    </Form>
  );
}

function SearchFormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Fragment key={index}>
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-full" />
        </Fragment>
      ))}
    </div>
  );
}

interface ComboboxProps {
  breeds: string[];
  values: string[] | undefined;
  onChange: (value: string[]) => void;
}

function Combobox({ values, onChange, breeds }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-min w-full justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {values && values.length > 0
              ? values.map((value) => (
                  // TODO: We need to figure out how to go to another tab index when removing a dom element
                  <Badge
                    key={value}
                    tabIndex={0}
                    className="inline-flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(values.filter((b) => b !== value));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        onChange(values.filter((b) => b !== value));
                      }
                    }}
                  >
                    <XIcon className="size-4" />
                    {value}
                  </Badge>
                ))
              : "Select breed..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search breeds..." />
          <CommandList>
            <CommandEmpty>No breeds found.</CommandEmpty>
            <CommandGroup>
              {breeds &&
                breeds.map((breed) => (
                  <CommandItem
                    key={breed}
                    value={breed}
                    onSelect={(currentValue) => {
                      onChange(
                        values?.includes(currentValue)
                          ? values.filter((value) => value !== currentValue)
                          : [...values!, currentValue],
                      );
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        values?.includes(breed) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {breed}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface MatchDialogProps {
  dog: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

function MatchDialog({ dog, open, onOpenChange, className }: MatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("", className)}>
        <DialogHeader>
          <DialogTitle>You matched with {dog.name}!</DialogTitle>
          <DialogDescription>
            {dog.name} is a {dog.breed} and is {dog.age} years old.
          </DialogDescription>
        </DialogHeader>
        <img
          src={dog.img}
          alt={dog.name}
          className="aspect-square w-full rounded-md bg-top object-cover"
        />
      </DialogContent>
    </Dialog>
  );
}
