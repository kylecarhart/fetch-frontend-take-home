import { useAuth } from "@/auth";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DogIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  className?: string;
  onSuccess?: (user: User) => void;
}

const LoginFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
type LoginFormSchemaType = z.infer<typeof LoginFormSchema>;

export function LoginForm({ className, onSuccess }: Props) {
  const auth = useAuth();

  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  async function onSubmit(data: LoginFormSchemaType) {
    const { name, email } = data;
    try {
      await auth.login({ name, email });
      onSuccess?.({ name, email });
    } catch (e) {
      console.error(e);
      form.setError("root", {
        message: "Failed to login. Please try again later.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(className)}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex items-center justify-center rounded-md">
                <DogIcon className="size-8" />
              </div>
              <span className="sr-only">Shelter Match</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Shelter Match!</h1>
            <div className="text-sm">
              Don't have an account?{" "}
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <a
                    href="#"
                    className="cursor-not-allowed underline underline-offset-4"
                  >
                    Sign up
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign up is currently disabled</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {/* Form */}
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="doe.john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
