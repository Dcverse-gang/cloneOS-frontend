import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuthStore } from "../store/auth.store";
import { useLogin, useProfile } from "../services/auth.service";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import BackgroundVideo from "../components/BackgroundVideo";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: doLogin, isPending } = useLogin();
  const { setAuth, setLoading, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await doLogin(formData);
      setAuth(result.data.token, result.data.user);
      toast({
        title: "Success",
        description: result.message || "Login successful!",
      });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      toast({
        title: "Login Failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundVideo className="flex items-center justify-center p-4" contentClass="max-w-md">
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="DCVerse"
          className="mx-auto h-16 w-auto mb-4"
        />

        <p
          className="text-gray-400 mt-2"
          style={{
            textTransform: "uppercase",
            fontSize: "0.875rem",
          }}
        >
          Welcome back to your creative journey
        </p>
      </div>
      {/* Login Form */}
      <Card className="bg-[#1a1a1a] border-white">
        <CardHeader>
          <CardTitle
            className="text-white text-center text-2xl"
            style={{
              fontFamily: "Space Mono, monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-white"
                style={{
                  fontFamily: "Space Mono, monospace",
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  color: "#ff6b00",
                }}
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-[#0f0f0f] border-[#333333] text-white placeholder:text-gray-400 focus:border-[#ff6b00] focus:shadow-[0_0_20px_#ffa50033]"
                  style={{ fontFamily: "Roboto Mono, monospace" }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-white"
                style={{
                  fontFamily: "Space Mono, monospace",
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  color: "#ff6b00",
                }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-[#0f0f0f] border-[#333333] text-white placeholder:text-gray-400 focus:border-[#ff6b00] focus:shadow-[0_0_20px_#ffa50033]"
                  style={{ fontFamily: "Roboto Mono, monospace" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="text-red-500 text-sm mt-2"
                style={{ fontFamily: "Roboto Mono, monospace" }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#ff6b00] hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#ff6b9d] text-black font-bold transition-all duration-300"
              style={{
                fontFamily: "Space Mono, monospace",
                textTransform: "uppercase",
                boxShadow: "0 0 30px #ffa50033",
              }}
              disabled={isLoading || isPending}
            >
              {isLoading || isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p
              className="text-gray-400"
              style={{ fontFamily: "Roboto Mono, monospace" }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#ff6b00] hover:text-[#ffa726] font-medium transition-colors"
                style={{
                  textTransform: "uppercase",
                }}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Back Info */}
      <Card className="mt-6 bg-[#0f0f0f] border-[#333333]">
        <CardContent className="pt-6">
          <p
            className="text-gray-400 text-sm text-center"
            style={{ lineHeight: "1.5" }}
          >
            Welcome back to DCVerse! Continue your creative journey with AI-powered tools. 
            Access your dashboard to explore advanced features and manage your projects.
          </p>
        </CardContent>
      </Card>
    </BackgroundVideo>
  );
};

export default Login;
