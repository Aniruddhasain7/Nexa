import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const Loading = () => {
  const [slowServerNotice, setSlowServerNotice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlowServerNotice(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#242124] to-[#000000] flex flex-col items-center justify-center min-h-screen w-screen text-white select-none">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full border border-white/10 border-t-[#00E5FF] animate-spin" />
          <img src={logo} alt="Nexa Logo" className="w-9 h-9 object-contain" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-sm tracking-[0.45em] text-white/90 font-light uppercase pl-1.5">
            Nexa
          </h1>

          <div className="w-20 h-[1.5px] bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent rounded-full animate-shimmer" />
          </div>

          {slowServerNotice && (
            <p className="text-xs text-gray-400 font-light tracking-wide mt-2">
              Connecting to server...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;
