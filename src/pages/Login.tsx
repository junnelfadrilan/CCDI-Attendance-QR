import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Track user session
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        navigate("/scanner", { replace: true });
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the confirmation link!");
    }

    setLoading(false);
  };

  // Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setUser(data.user);

      // Navigate after successful login
      navigate("/dashboard", { replace: true });
    }

    setLoading(false);
  };

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // The site URL where the user will be redirected to complete the reset.
      // For local Vite development, this is typically localhost:5173
      redirectTo: "http://localhost:5173/update-password",
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for the password reset link!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">
          CCDI Attendance Monitoring System sadsa
        </h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Message */}
          {message && (
            <p className="text-sm text-amber-600 text-center font-medium">
              {message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-indigo-600 
                         hover:bg-indigo-700 text-white font-medium 
                         rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-slate-800 
                         hover:bg-slate-900 text-white font-medium 
                         rounded-lg transition disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div>
          <h2>Forgot Password</h2>
          <form onSubmit={handleResetRequest}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
