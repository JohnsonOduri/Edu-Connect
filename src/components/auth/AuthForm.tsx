
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types";

type AuthMode = "login" | "signup";

export const AuthForm = () => {
  const navigate = useNavigate();
  const { login, signup, loading, isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as UserRole
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    console.log("Role changed to:", value);
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
        // The navigation will happen via the useEffect hook when isAuthenticated becomes true
      } else {
        if (!formData.name.trim()) {
          toast.error("Please enter your name");
          setIsSubmitting(false);
          return;
        }
        console.log("Submitting signup with role:", formData.role);
        await signup(formData.name, formData.email, formData.password, formData.role);
        // For signup, show a success message and switch to login mode
        setMode("login");
        toast.success("Account created! You can now log in.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Error is already handled in the AuthContext (with toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === "login" ? "signup" : "login"));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl border border-border bg-card shadow-subtle animate-fadeIn">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login" 
            ? "Enter your credentials to sign in" 
            : "Fill in your details to get started"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your full name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="h-10"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="h-10"
            minLength={6}
          />
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <Label>I am a:</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={handleRoleChange as (value: string) => void}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="cursor-pointer">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher" className="cursor-pointer">Teacher</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-10"
          disabled={isSubmitting || loading}
        >
          {(isSubmitting || loading) ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === "login" ? (
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
