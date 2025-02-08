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
import { zodResolver } from "@hookform/resolvers/zod";
import { DogIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {}

const LoginFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
type LoginFormSchemaType = z.infer<typeof LoginFormSchema>;

export function LoginForm({}: Props) {
  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = (data: LoginFormSchemaType) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
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
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
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
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
