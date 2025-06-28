import React, { useState } from "react";
import axios from "axios";

export default function NewUser({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/register", {
        email,
        password,
      });
      setToken(res.data.access_token);0
      setSuccess(true);
      setError("");
    } catch (err) {
      setSuccess(false);
      setError(err.response?.data?.detail || "Unexpected error");
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-tr from-green-50 to-white px-4">
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
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-600">Creaza un cont</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-4">Cont creat.</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parola</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}