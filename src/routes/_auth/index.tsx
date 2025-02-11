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
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dog, SearchDogsParams } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
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
    // from: 0,
    // zipCodes: [],
    // size: 25,
    sort: "breed:asc",
  });
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([]);

  // Mutations
  const matchMutation = useMutation({
    mutationFn: () => client.matchDogs(selectedDogs.map((d) => d.id)),
    onSuccess: () => {
      // Invalidate and refetch
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

  const { data: searchDogsResponse } = useQuery({
    queryKey: ["searchDogs", dogSearchParams],
    queryFn: () => {
      return client.searchDogs({
        ...(dogSearchParams.breeds && { breeds: dogSearchParams.breeds }),
        ...(dogSearchParams.ageMin && { ageMin: dogSearchParams.ageMin }),
        ...(dogSearchParams.ageMax && { ageMax: dogSearchParams.ageMax }),
        // ...(dogSearchParams.zipCodes && { zipCodes: dogSearchParams.zipCodes }),
        // ...(dogSearchParams.size && { size: dogSearchParams.size }),
        // ...(dogSearchParams.from && { from: dogSearchParams.from }),
        ...(dogSearchParams.sort && { sort: dogSearchParams.sort }),
      });
    },
  });

  const dogs = useQuery({
    queryKey: ["dogs", searchDogsResponse?.resultIds],
    queryFn: () => client.getDogs(searchDogsResponse?.resultIds ?? []),
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
          {dogs?.data?.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              onSelect={handleSelectDog}
              isSelected={selectedDogs.some((d) => d.id === dog.id)}
            />
          ))}
        </div>
        {selectedDogs.length > 0 && (
          <div className="sticky bottom-0 border-t bg-white py-2 text-center">
            <Button className="" variant="ghost" onClick={handleMatch}>
              Match with {selectedDogs.length} dogs!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

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
          <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200" />
          <div className="h-8 w-full animate-pulse rounded-md bg-gray-200" />
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
