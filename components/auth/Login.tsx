"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import API_CONFIG from "@/lib/api-config";

interface User {
  _id: string;
  username: string;
}

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
  onSwitchToSignup: () => void;
}

export default function Login({
  onLoginSuccess,
  onSwitchToSignup,
}: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/users/login`,
        {
          username,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("expense_tracker_token", token);
      localStorage.setItem("expense_tracker_user", JSON.stringify(user));
      onLoginSuccess(token, user);
    } catch (error) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error || "Login failed. Please try again."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          💰 Expense Tracker
        </h1>
        <p className="text-gray-600">Sign in to manage your expenses</p>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
