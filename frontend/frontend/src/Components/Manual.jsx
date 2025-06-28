import { useState } from "react";

export default function Manual() {
  const [angles, setAngles] = useState({
    base: 90,
    shoulder: 90,
    elbow: 90,
    gripper: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAngles((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const sendAngles = async () => {
    try {
      await fetch("http://127.0.0.1:8000/manual-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(angles),
      });
    } catch (error) {
      console.error("Eroare trimitere unghiuri:", error);
    }
  };
  

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-bold text-center">Control Manual</h2>
      {Object.entries(angles).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-medium capitalize">{key}</label>
          <input
            type="range"
            min={key === "gripper" ? 0 : 0}
            max={key === "gripper" ? 90 : 180}
            name={key}
            value={value}
            onChange={handleChange}
            onMouseUp={sendAngles}
            
            className="w-full"
          />
          <div className="text-sm">{value}°</div>
        </div>
      ))}
    </div>
  );
}