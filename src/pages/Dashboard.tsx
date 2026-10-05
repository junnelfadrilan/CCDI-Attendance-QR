import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      return;
    }
    // Go back to login page
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center bg-slate-50 ">
        {" "}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          {" "}
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            {" "}
            CCDI Attendance Monitoring System{" "}
          </h1>{" "}
          <p className="text-emerald-600 font-medium mb-6">
            {" "}
            Logged in successfully!{" "}
          </p>{" "}
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition"
          >
            {" "}
            Sign Out{" "}
          </button>{" "}
        </div>{" "}
      </div>
    </>
  );
}

export default Dashboard;
