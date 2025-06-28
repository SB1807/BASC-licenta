import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './Components/Home'; 
import Login from './Components/login'; 
import NewUser from './Components/NewUser';
import MakeCoffee from './Components/MakeCoffee';

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<NewUser setToken={setToken} />} />
        <Route path="/MakeCoffee" element={<MakeCoffee  />} />
      </Routes>
    </BrowserRouter>
  );
}
