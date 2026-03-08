import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useRegister } from "../services/auth.service";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Film, Palette } from "lucide-react";

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
      const data = err?.response?.data;
      const status = err?.response?.status;
      const message =
        data?.error ||
        data?.message ||
        (status === 400 ? "This email is already registered." : null) ||
        (status >= 500 ? "Something went wrong. Please try again later." : null) ||
        "Registration failed";
      setError(message);
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-branding hidden md:flex">
        <div className="auth-branding-content">
          <h1>Start creating with AI today</h1>
          <p>
            Join thousands of creators using DCVerse to produce professional
            video content powered by artificial intelligence.
          </p>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>AI-powered script and storyboard generation</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <Film className="w-4 h-4" />
            </div>
            <span>Professional video creation in minutes</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <Palette className="w-4 h-4" />
            </div>
            <span>100 free credits to get started</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-logo">
            <img src="/logo.png" alt="DCVerse" />
            <span>DCVerse</span>
          </div>

          <h2>Create your account</h2>
          <p className="auth-subtitle">
            Get started with your free account
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none z-10" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-lg"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none z-10" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-lg"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none z-10" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-lg"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors z-10"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm mb-4 px-1">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors rounded-lg"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="auth-footer-link">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>

          <div className="auth-info-card">
            <p>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy. New accounts receive 100 free credits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
