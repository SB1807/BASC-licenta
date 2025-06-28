// Auto.jsx
import { useState } from "react";

export default function Auto() {
  const [coords, setCoords] = useState({ x: 10, y: 0, z: 5, grip: 30 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCoords((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSend = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/get_angles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coords),
      });

      if (!response.ok) {
        const err = await response.json();
        alert("Eroare: " + err.detail);
        return;
      }

      const data = await response.json();
      console.log("Trimis cu succes:", data);
    } catch (error) {
      console.error("Eroare la trimitere coordonate:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-bold text-center">Control Automat (Cinematică inversă)</h2>
      {Object.entries(coords).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-medium capitalize">{key}</label>
          <input
            type="range"
            min={key === "grip" ? 0 : -20}
            max={key === "grip" ? 90 : 20}
            name={key}
            value={value}
            onChange={handleChange}
            className="w-full"
          />
          <div className="text-sm">{value}</div>
        </div>
      ))}
      <button
        onClick={handleSend}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Trimite Coordonate
      </button>
    </div>
  );
}