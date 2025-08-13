import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isNewUser: boolean;
  setIsNewUser: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("⛔️ Profile check error:", error);
        return false;
      }
      return profile && profile.full_name;
    } catch (error) {
      console.error("❌ Profile check exception:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Session fetch error:", error);
          if (mounted) setLoading(false);
          return;
        }
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const hasProfile = await checkUserProfile(session.user.id);
          setIsNewUser(!hasProfile); // If no profile, user is new
        } else {
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("❌ Initial session error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN" && session?.user) {
          const hasProfile = await checkUserProfile(session.user.id);
          setIsNewUser(!hasProfile);
        } else if (event === "SIGNED_OUT") {
          setIsNewUser(false);
        }
        if (mounted) setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        },
      });

      if (error) {
        console.error("❌ Sign up error:", error);
        toast.error(error.message);
      }
      return { error, data };
    } catch (error) {
      console.error("❌ Sign up exception:", error);
      toast.error("An error occurred during sign up");
      return { error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) {
        console.error("❌ Sign in error:", error);
        toast.error(error.message);
      }
      return { error, data };
    } catch (error) {
      console.error("❌ Sign in exception:", error);
      toast.error("An error occurred during sign in");
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsNewUser(false);
      toast.success("Signed out successfully");
      window.location.href = '/welcome';
    } catch (error) {
      console.error("❌ Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  const value: AuthContextType = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    isNewUser,
    setIsNewUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, useAuth };
