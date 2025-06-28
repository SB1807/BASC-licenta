// Program.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function Program() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/ingredients").then((res) => {
      setIngredients(res.data);
    });
    fetchSchedules();
  }, []);

  const fetchSchedules = () => {
    axios.get("http://localhost:8000/schedules").then((res) => {
      setSchedules(res.data);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIngredient || !date || !time) {
      setMessage("All fields are required");
      return;
    }

    // Combine date and time into ISO string in UTC
    const localDatetime = `${date}T${time}:00`;
    const scheduled_time = new Date(localDatetime).toISOString(); // <-- NEW LINE
    console.log("Scheduled datetime:", localDatetime); // <-- DEBUG LINE
    console.log("ISO string:", scheduled_time); // <-- DEBUG LINE

    try {
      await axios.post("http://localhost:8000/schedule-servo-datetime", {
        ingredient_id: parseInt(selectedIngredient),
        scheduled_time,
      });
      setMessage("Schedule created successfully!");
      fetchSchedules();
    } catch (err) {
      setMessage("Failed to schedule: " + err.response?.data?.detail);
    }
  };

  return (
    <div className="flex gap-8 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/3">
        <h2 className="text-xl font-semibold text-black">Schedule Servo Movement</h2>

        <select
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">Select Ingredient</option>
          {ingredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded text-black border-gray-700"
          step="60" // <-- NEW LINE: Ensures time is in full minutes
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Schedule
        </button>

        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>

      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4 text-black">Scheduled Movements</h2>
        <ul className="space-y-2">
          {schedules.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded shadow-sm bg-white flex justify-between items-center,text black"
            >
              <div>
                <p className="font-medium text-black">Ingredient: {s.ingredient}</p>
                <p className="text-sm text-gray-800">Time: {s.time}</p>
              </div>
              <p className={`text-sm font-semibold ${s.executed ? "text-green-600" : "text-orange-500"}`}>
                {s.executed ? "Executed" : "Pending"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}