// import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as Lucide from "lucide-react";

const signUpSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string()
    .trim()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  // Removed unused isLoading/isSuccess state

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const mutation = useMutation<any, any, SignUpFormData>({
    mutationFn: async (formData: SignUpFormData) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await fetch(`${apiUrl}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Account created. Redirecting to home...",
        duration: 1000,
        className: "bg-green-100 border-green-500 text-green-900 shadow-lg"
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error: any) => {
      let message = "Registration failed";
      try {
        const err = JSON.parse(error.message);
        message = err.message || message;
      } catch {
        if (typeof error.message === "string") message = error.message;
      }
      toast({
        title: message,
        duration: 1000,
        className: "bg-red-100 border-red-500 text-red-900 shadow-lg"
      });
    }
  });

  const onSubmit = (data: SignUpFormData) => {
    mutation.mutate(data);
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <form
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Sign Up</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={`w-full px-4 py-2 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          {errors.email && (
            <span id="email-error" className="text-red-500 text-sm mt-1 block" role="alert">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            {...register("password")}
            className={`w-full px-4 py-2 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          {errors.password && (
            <span id="password-error" className="text-red-500 text-sm mt-1 block" role="alert">
              {errors.password.message}
            </span>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            {...register("confirmPassword")}
            className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirmPassword-error"
          />
          {errors.confirmPassword && (
            <span id="confirmPassword-error" className="text-red-500 text-sm mt-1 block" role="alert">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:opacity-60 flex items-center justify-center"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Lucide.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <Lucide.UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </>
          )}
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </div>
        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-red-500 text-center block" role="alert">
              {(() => {
                try {
                  const err = JSON.parse(mutation.error?.message);
                  return err.message || "Registration failed";
                } catch {
                  return mutation.error?.message || "Registration failed";
                }
              })()}
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignUp;