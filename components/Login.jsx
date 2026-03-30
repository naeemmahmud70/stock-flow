"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, User, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/store/user";
import { useRouter } from "next/navigation";
import { LoginUser } from "@/lib/auth/login";
import { getLoggedInUser } from "@/lib/utils";

export const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser, setLoading, setError, isLoading, error } =
    useAuthStore();

  useEffect(() => {
    const loggedIn = getLoggedInUser();
    if (loggedIn?.email) {
      setUser(loggedIn);
      router.push("/dashboard");
    }
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const loginData = {
      email: email,
      password: password,
    };

    setLoading(true);
    setError(null);

    try {
      const data = await LoginUser(loginData);
      if (data.status == 200) {
        console.log("login res", data);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        setUser(data.user, data.token);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  const onSwitchToSignup = () => {
    setError("");
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-black font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-black">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="demo@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Type your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-red-500">{error && error}</p>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                <span className="flex gap-1">
                  {" "}
                  <User className="mr-2 h-4 w-4" /> Login
                </span>
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
