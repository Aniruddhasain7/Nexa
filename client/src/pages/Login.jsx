import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Input from "../components/Input";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { axios, setToken } = useAppContext();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      const { displayName: name, email, uid: googleId } = user;

      const { data } = await axios.post("/api/user/google", {
        name,
        email,
        googleId,
      });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success("Logged in with Google successfully!");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") return;
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    try {
      const { data } = await axios.post(url, { name, email, password });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-88 sm:w-[392px]
      text-gray-300 rounded-2xl shadow-2xl border border-white/10
      bg-white/5 backdrop-blur-xl"
    >
      <p className="text-2xl font-medium m-auto">
        <span className="bg-linear-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent">
          User
        </span>{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>

      {state === "register" && (
        <Input
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Name"
          type="text"
          icon={FaUser}
          required
        />
      )}

      <Input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder="Email address"
        type="email"
        icon={FaEnvelope}
        required
      />

      <Input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        placeholder="Password"
        type="password"
        icon={FaLock}
        required
      />

      {state === "register" ? (
        <p className="text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => setState("login")}
            className="bg-linear-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent cursor-pointer underline"
          >
            Login
          </span>
        </p>
      ) : (
        <p className="text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => setState("register")}
            className="bg-linear-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent cursor-pointer underline"
          >
            SignUp
          </span>
        </p>
      )}

      <button
        type="submit"
        className="bg-gradient-to-r from-[#00E5FF] to-[#0096FF] hover:opacity-90 transition-all
        text-white w-full py-2 rounded-full cursor-pointer"
      >
        {state === "register" ? "Create Account" : "Login"}
      </button>

      <div className="flex items-center w-full gap-3 my-2">
        <div className="flex-1 h-px bg-white/10"></div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
          or
        </p>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        className="w-full py-2 rounded-full border border-white/10 bg-white/5 
        hover:bg-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer
        active:scale-[0.98] group"
      >
        <img
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png"
          alt="Google"
          className="w-4 h-4 group-hover:scale-110 transition-transform"
        />
        <span className="text-sm font-medium text-gray-200">
          {state === "register" ? "Sign up with Google" : "Sign in with Google"}
        </span>
      </button>
    </form>
  );
};
export default Login;
