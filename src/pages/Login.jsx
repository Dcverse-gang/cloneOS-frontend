import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuthStore } from "../store/auth.store";
import { useLogin } from "../services/auth.service";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Film, Palette } from "lucide-react";

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
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-branding hidden md:flex">
        <div className="auth-branding-content">
          <h1>Create stunning AI-powered videos</h1>
          <p>
            Transform your ideas into professional video content with our
            AI-driven creative platform.
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
            <span>Customizable actors and visual styles</span>
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

          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Sign in to your account to continue
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
                  placeholder="Enter your password"
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

            {error && (
              <div className="text-red-400 text-sm mb-4 px-1">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors rounded-lg"
              disabled={isLoading || isPending}
            >
              {isLoading || isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="auth-footer-link">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </div>

          <div className="auth-info-card">
            <p>
              Welcome back to DCVerse. Continue your creative journey with
              AI-powered tools and manage your projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
