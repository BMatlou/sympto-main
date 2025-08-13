import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PasswordStrengthValidator from "@/components/PasswordStrengthValidator";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields and validation when switching modes
  const handleModeSwitch = () => {
    setIsSignUp((prev) => !prev);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsPasswordValid(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!isPasswordValid) {
          toast.error("Please ensure your password meets all requirements");
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }
        const { error } = await signUp(email.trim(), password);
        if (!error) {
          navigate("/new-user-onboarding");
          return;
        } else {
          toast.error(error.message || "Sign up failed");
          return;
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (!error) {
          navigate("/");
          return;
        } else {
          toast.error(error.message || "Sign in failed");
          return;
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ecac8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-[#2ecac8] to-[#338886] text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <p className="text-[#2ecac8]/90">
              {isSignUp ? "Join HealthTracker today" : "Sign in to continue"}
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your email"
                  autoComplete="email"
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
                  className="mt-1"
                  placeholder="Enter your password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                {isSignUp && (
                  <PasswordStrengthValidator
                    password={password}
                    onValidChange={setIsPasswordValid}
                  />
                )}
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#2ecac8] hover:bg-[#338886] text-white"
                disabled={
                  isSubmitting ||
                  (isSignUp && (!isPasswordValid || password !== confirmPassword))
                }
              >
                {isSubmitting ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-[#2ecac8] hover:text-[#338886] text-sm font-medium"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/welcome")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to welcome
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
