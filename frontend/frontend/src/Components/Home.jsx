import { useNavigate } from "react-router-dom";
import { ArrowRightCircle } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

     return (
    <div className="bg-gradient-to-br from-white to-gray-100">
      {/* Section 1 - Welcome */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-16 overflow-hidden">
        <img
          src="C:\Users\batra\Desktop\Robot Arm"
          alt="Welcome Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
        />
        <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md px-16 py-14 rounded-3xl shadow-2xl flex flex-col items-center gap-10 max-w-md w-full">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Welcome</h1>
          <div className="flex flex-col gap-6 w-full">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-blue-700 transition"
            >
              Log in
            </button>
            <button
              className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 text-lg font-medium rounded-full hover:bg-blue-50 transition"
              onClick={() => navigate('/register')}
            >
              Nu ai cont?
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 - About */}
      <section className="relative min-h-screen min-w-screen flex flex-col justify-center items-center px-8 py-16 text-center overflow-hidden">
        <img
          src="/images/about-bg.jpg"
          alt="About Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">About the Project</h2>
          <p className="text-lg text-gray-700">This project is designed to combine robotics, web development, and user interactivity in one intuitive interface. Scroll down to explore more!</p>
        </div>
      </section>

      {/* Section 3 - Features */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-8 py-16 text-center overflow-hidden bg-white">
        <img
          src="/images/features-bg.jpg"
          alt="Features Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10 z-0"
        />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What You Can Do</h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li>✅ Control a robotic arm remotely</li>
            <li>✅ Schedule automated movements</li>
            <li>✅ Monitor distance sensors in real time</li>
            <li>✅ Register and log in for personalized access</li>
          </ul>
        </div>
      </section>

      {/* Section 4 - Footer */}
      <footer className="p-6 border-t border-gray-300 text-center">
        <p className="text-sm text-gray-500">&copy; 2025 Robotic Control App</p>
      </footer>
    </div>
  );
}
