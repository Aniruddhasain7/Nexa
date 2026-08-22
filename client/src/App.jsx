import React from "react";
import Sidebar from "./components/Sidebar";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Community from "./pages/Community";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import './assets/prism.css'
import Loading from "./pages/Loading";
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";
import { Toaster } from 'react-hot-toast'
import SettingsModal from "./components/SettingsModal";

const App = () => {
  const { user, loadingUser } = useAppContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  if (pathname === '/loading' || loadingUser) return <Loading />;
  return (
    <>
      <Toaster />
      <SettingsModal />
      {user && !isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="absolute top-3 left-3 p-1.5 rounded-lg md:hidden text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10 cursor-pointer"
          aria-label="Open menu"
        >
          <FiMenu size={26} />
        </button>
      )}

      {user ? (
        <div className="dark:bg-linear-to-b from-[#242124] to-[#000000] dark:text-white ">
          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path="/" element={<ChatBox />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-linear-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen">
          <Login />
        </div>
      )}
    </>
  );
};

export default App;

