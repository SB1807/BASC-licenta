import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MakeCoffee() {
  const [status, setStatus] = useState("Idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const startRoutine = async () => {
    setStatus("Starting...");
    try {
      const res = await fetch("http://localhost:8000/make_coffee", {
        method: "POST",
      });
      const data = await res.json();
      setStatus(data.message || "Finished");
    } catch (err) {
      console.error(err);
      setStatus("Error");
    }
  };

  const handleStop = async () => {
    try {
      const res = await fetch("http://localhost:8000/stop", {
        method: "POST",
      });
      const data = await res.json();
      setStatus(data.status || "Stopped");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-tr from-yellow-50 to-white px-4">
      {/* Dropdown Menu */}
      <div className="relative p-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow hover:bg-amber-700"
        >
          ☰ Menu
        </button>
        {menuOpen && (
          <div className="absolute mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
            <button
              onClick={() => navigate("/")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/login")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
            >
              Register
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-16">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-xl text-center space-y-8">
          <h1 className="text-4xl font-extrabold text-amber-700 tracking-tight">
            ☕ Robotic Coffee Arm
          </h1>
          <button
            onClick={startRoutine}
            className="px-8 py-3 bg-amber-600 text-white text-lg font-semibold rounded-full shadow hover:bg-amber-700 transition"
          >
            Start Coffee Routine
          </button>
          <p className="text-lg text-gray-700">
            Status: <span className="font-medium text-gray-900">{status}</span>
          </p>

          {/* STOP Button */}
          <div className="flex flex-col items-center mt-4">
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-2xl shadow-md"
            >
              STOP Arm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}