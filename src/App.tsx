import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

function App() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Track the user session state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) setMessage(error.message);
    else setMessage("Check your email for the confirmation link!");
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage(error.message);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">
            CCDI Attendance Monitoring System
          </h1>

          {user ? (
            <div className="text-center space-y-4">
              <p className="text-emerald-600 font-medium">
                Logged in successfully!
              </p>
              <p className="text-sm text-slate-600 break-all">{user.email}</p>
              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              {message && (
                <p className="text-sm text-amber-600 text-center font-medium">
                  {message}
                </p>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  Sign In
                </button>
                <button
                  type="submit"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
