/** @format */
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/auth-provider";
import logo from "../../../attached_assets/logo.svg";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      await login(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome to LBC admin panel.",
      });
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Failed to login. Please check your credentials.",
      );
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true);
  //   setLoginError(null);

  //   try {
  //     await loginWithGoogle();
  //     toast({
  //       title: "Login successful",
  //       description: "Welcome to Hungry Puppets admin panel.",
  //     });
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     setLoginError(
  //       error instanceof Error
  //         ? error.message
  //         : "Failed to login with Google. Please try again.",
  //     );
  //     toast({
  //       variant: "destructive",
  //       title: "Google login failed",
  //       description:
  //         "There was a problem logging in with Google. Please try again.",
  //     });
  //   } finally {
  //     setIsGoogleLoading(false);
  //   }
  // };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Lbc Logo"
              className="h-20 w-20"
            />
          </div>
          <CardTitle className="text-2xl font-bold">LBC</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Log in to your LBC admin account
          </p>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert
              variant="destructive"
              className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-2 text-xs text-gray-500">
              or continue with email
            </span>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@epilatie.com"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In with Email
                  </>
                )}
              </Button>
            </form>
          </Form>
          <div className="text-gray-400 text-sm ">
            Super admin demo : super@gmail.com / super1234
          </div>
          <div className="text-gray-400 text-sm ">
            Admin (agent) demo : ana@gmail.com / ana1234
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
