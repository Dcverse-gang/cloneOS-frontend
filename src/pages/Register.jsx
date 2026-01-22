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
import { useRegister, useProfile } from "../services/auth.service";
import { Eye, EyeOff } from "lucide-react";
import BackgroundVideo from "../components/BackgroundVideo";

const Register = () => {
  const navigate = useNavigate();
  const { mutateAsync: doRegister, isPending } = useRegister();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await doRegister(formData);
      toast({
        title: "Success",
        description: "Registration successful!",
      });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
      toast({
        title: "Registration Failed",
        description: err?.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
    }
  };

  return (
    <BackgroundVideo
      className="flex items-center justify-center p-4"
      contentClass="max-w-md"
    >
      {/* Logo Section */}
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="DCVerse"
          className="mx-auto h-16 w-auto mb-4"
        />

        <p
          className="text-gray-400 mt-2"
          style={{ textTransform: "uppercase", fontSize: "0.875rem" }}
        >
          Join the creative revolution
        </p>
      </div>

      {/* Register Form */}
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
            Create Account
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
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#0f0f0f] border-[#333333] text-white placeholder:text-gray-400 focus:border-[#ff6b00] focus:shadow-[0_0_20px_#ffa50033]"
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
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10 bg-[#0f0f0f] border-[#333333] text-white placeholder:text-gray-400 focus:border-[#ff6b00] focus:shadow-[0_0_20px_#ffa50033]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-white"
                style={{
                  fontFamily: "Space Mono, monospace",
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  color: "#ff6b00",
                }}
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pr-10 bg-[#0f0f0f] border-[#333333] text-white placeholder:text-gray-400 focus:border-[#ff6b00] focus:shadow-[0_0_20px_#ffa50033]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
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
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">Create Account</div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#ff6b00] font-medium"
                style={{ textTransform: "uppercase" }}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="mt-6 bg-[#0f0f0f] border-[#333333]">
        <CardContent className="pt-6">
          <p
            className="text-gray-400 text-sm text-center"
            style={{ lineHeight: "1.5" }}
          >
            By creating an account, you agree to our Terms of Service and
            Privacy Policy. New accounts start with 100 credits to explore our
            platform.
          </p>
        </CardContent>
      </Card>
    </BackgroundVideo>
  );
};

export default Register;
