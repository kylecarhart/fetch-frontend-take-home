import { client } from "@/clients/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BreedsComboBox } from "@/features/match/BreedsComboBox";
import { cn } from "@/lib/utils";
import { DogsSearchParams } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BoneIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Fragment } from "react/jsx-runtime";
import { z } from "zod";

const SearchDogsSchema = z
  .object({
    breeds: z.array(z.string()).optional(),
    ageMin: z.coerce.number().min(0).max(15).default(0),
    ageMax: z.coerce.number().min(0).max(15).default(15),
    sort: z.string().optional(),
    // zipCodes: z.array(z.string()).optional(),
    // size: z.number().optional(),
    // from: z.string().optional(),
  })
  .refine((data) => data.ageMin <= data.ageMax, {
    path: ["ageMin"],
    message: "Min age must be less than max age",
  });

interface DogSearchFormProps {
  className?: string;
  onSubmit: (data: DogsSearchParams) => void;
}

export function DogSearchForm({ className, onSubmit }: DogSearchFormProps) {
  const { data: breeds } = useSuspenseQuery({
    queryKey: ["breeds"],
    queryFn: client.getBreeds,
  });

  const form = useForm<DogsSearchParams>({
    resolver: zodResolver(SearchDogsSchema),
    defaultValues: {
      breeds: [],
      ageMin: 0,
      ageMax: 15,
      sort: "breed:asc",
      // zipCodes: [],
      // size: 25,
      // from: "0",
    },
  });

  // Reset the form when the form is submitted so the submit button is disabled
  React.useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset(form.getValues());
    }
  }, [form, form.formState.isSubmitSuccessful, form.getValues]);

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
                <BreedsComboBox
                  values={field.value}
                  onChange={field.onChange}
                  breeds={breeds}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Age Range */}
          {/* TODO: It would probably be a better user experience if we had a couple of preset age ranges */}
          {/* ie: Puppy (0-1), Young Adult (2-4), Adult (5-8), Senior (9-15) */}
          <div>
            <Label>Age Range</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="ageMin"
                render={({ field }) => (
                  <FormItem>
                    <Input {...field} type="number" placeholder="0" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageMax"
                render={({ field }) => (
                  <FormItem>
                    <Input {...field} type="number" placeholder="15" />
                    <FormMessage />
                  </FormItem>
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
          <FormField
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
                    <SelectItem value="breed:asc">Breed Ascending</SelectItem>
                    <SelectItem value="breed:desc">Breed Descending</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <Button className="w-full" disabled={!form.formState.isDirty}>
          <BoneIcon className="size-4" /> Fetch!
        </Button>
      </form>
    </Form>
  );
}

export function SearchFormSkeleton() {
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
