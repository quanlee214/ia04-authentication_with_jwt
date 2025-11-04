import React from "react";
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
import { useAuth } from "@/context/AuthContext";
import * as Lucide from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .trim()
    .min(1, "Password is required")
    .max(100, "Password must be less than 100 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { toast } = useToast();
  // Removed unused isLoading state

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Tự động focus vào email khi mở form
  React.useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation<any, any, LoginFormData>({
    mutationFn: async (formData: LoginFormData) => {
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log("Đang gọi API đăng nhập với:", formData);
      const res = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: await res.text() };
        }
        throw new Error(errorData.message || "Login failed");
      }
      const result = await res.json();
      console.log("Kết quả đăng nhập:", result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful!",
        description: `Welcome, ${data.email || "user"}`,
        duration: 1000,
        className: "bg-green-100 border-green-500 text-green-900 shadow-lg"
      });
      // Lưu accessToken vào memory (context), refreshToken vào localStorage
      if (data.accessToken && data.refreshToken && data.email) {
        setAccessToken(data.accessToken);
        window.__accessToken = data.accessToken; // accessToken chỉ lưu trong memory
        localStorage.setItem("refreshToken", data.refreshToken); // refreshToken lưu persistent
        localStorage.setItem("email", data.email);
        console.log("[Login] window.__accessToken:", window.__accessToken);
        // Invalidate user query để Dashboard tự động refetch
        queryClient.invalidateQueries({ queryKey: ["user"] });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid response from server.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      let message = "Login failed";
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

  const onSubmit = (data: LoginFormData) => {
  console.log("Form submit:", data);
  mutation.mutate(data);
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <form
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Sign In</h2>
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
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            {...register("password")}
            className={`w-full px-4 py-2 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          {errors.password && (
            <span id="password-error" className="text-red-500 text-sm mt-1 block" role="alert">
              {errors.password.message}
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
              Signing In...
            </>
          ) : (
            <>
              <Lucide.LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
        </div>
        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-red-500 text-center block" role="alert">
              {(() => {
                try {
                  const err = JSON.parse(mutation.error?.message);
                  return err.message || "Login failed";
                } catch {
                  return mutation.error?.message || "Login failed";
                }
              })()}
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;