import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Dog } from "@/types";

interface MatchDialogProps {
  dog: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Popup that appears when you are matched with a dog.
 */
export function MatchDialog({
  dog,
  open,
  onOpenChange,
  className,
}: MatchDialogProps) {
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
