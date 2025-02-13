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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
import React from "react";

interface BreedsComboBoxProps {
  breeds: string[];
  values: string[] | undefined;
  onChange: (value: string[]) => void;
}

/**
 * A combo box for selecting breeds. Supports multiple selection and search.
 */
export function BreedsComboBox({
  values,
  onChange,
  breeds,
}: BreedsComboBoxProps) {
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
