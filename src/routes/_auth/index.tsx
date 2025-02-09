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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SearchDogsParams } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  BoneIcon,
  Check,
  ChevronsUpDown,
  DogIcon,
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
    // zipCodes: [],
    // size: 25,
    // from: 0,
    // sort: "asc",
  });

  const handleLogout = () => {
    auth.logout().then(() => {
      router.invalidate().finally(() => {
        navigate({ to: "/" });
      });
    });
  };

  const { data: searchDogsResponse } = useQuery({
    queryKey: ["searchDogs", dogSearchParams],
    queryFn: () => {
      console.log(dogSearchParams);
      return client.searchDogs({
        ...(dogSearchParams.breeds && { breeds: dogSearchParams.breeds }),
        ...(dogSearchParams.ageMin && { ageMin: dogSearchParams.ageMin }),
        ...(dogSearchParams.ageMax && { ageMax: dogSearchParams.ageMax }),
        // ...(dogSearchParams.zipCodes && { zipCodes: dogSearchParams.zipCodes }),
        // ...(dogSearchParams.size && { size: dogSearchParams.size }),
        // ...(dogSearchParams.from && { from: dogSearchParams.from }),
        // ...(dogSearchParams.sort && { sort: dogSearchParams.sort }),
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

  return (
    <div className="grid h-screen grid-cols-[350px,1fr] gap-4">
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
      <div className="grid grid-cols-3 gap-12 overflow-y-scroll p-8 xl:grid-cols-7">
        {dogs?.data?.map((dog) => (
          <div
            key={dog.id}
            style={{
              backgroundImage: `url(${dog.img})`,
            }}
            className="aspect-square bg-cover bg-center"
          >
            <div className="relative">
              {/* <Heart className="absolute top-0 size-6 text-red-500" /> */}
            </div>
            <h2>{dog.name}</h2>
            <div>
              <p>{dog.age}</p>
              <p>{dog.breed}</p>
              <p>{dog.zip_code}</p>
            </div>
          </div>
        ))}
      </div>
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
          <div>
            <FormLabel>Age Range</FormLabel>
            <div className="flex gap-2">
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
          <BoneIcon className="size-4" /> Go!
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
                    tabIndex={0}
                    className="inline-flex items-center gap-1"
                    key={value}
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
