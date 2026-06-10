import React from "react";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import Chatbox from "./components/Chatbox";
import { useState } from "react";
import { assets } from "./assets/assets";
import "./assets/prism.css";
import Loading from "./pages/Loading";
import { useAppContext } from "./contexts/AppContext";
import Login from "./pages/Login";

const App = () => {
  const { user } = useAppContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname === "/loading") return <Loading />;
  return (
    <>
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          onClick={() => {
            setIsMenuOpen(true);
          }}
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert "
          alt=""
        />
      )}
      {user ? (
        <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path="/" element={<Chatbox />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div
          className="bg-gradient-to-b from-[#242124] to-[#000000] flex
        items-center justify-center h-screen w-screen"
        >
          <Login />
        </div>
      )}
    </>
  );
};

export default App;
