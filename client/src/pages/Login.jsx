import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const Input = ({
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  type,
  className = "",
  labelClassName = "",
  inputClassName = "",
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`text-[13px] text-gray-400 block mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <div
        className={`input-box flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#00E5FF] transition-all ${inputClassName}`}
      >
        {Icon && <Icon className="text-gray-500" size={14} />}
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-white placeholder-gray-500"
          value={value}
          onChange={onChange}
          required={required}
        />

        {type === "password" &&
          (showPassword ? (
            <FaRegEye
              size={20}
              className="text-[#00E5FF] cursor-pointer"
              onClick={toggleShowPassword}
            />
          ) : (
            <FaRegEyeSlash
              size={20}
              className="text-gray-400 cursor-pointer hover:text-[#00E5FF] transition-colors"
              onClick={toggleShowPassword}
            />
          ))}
      </div>
    </div>
  );
};

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { axios, setToken, fetchUser, isAuthenticating, setIsAuthenticating } = useAppContext();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    if (isAuthenticating) return;
    try {
      setIsAuthenticating(true);
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      const { displayName: name, email, uid: googleId } = user;

      const { data } = await axios.post("/api/user/google", {
        name,
        email,
        googleId,
      });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        await fetchUser(data.token);
        toast.success("Logged in with Google successfully!");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") return;
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticating) return;
    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    try {
      setIsAuthenticating(true);
      const { data } = await axios.post(url, { name, email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        await fetchUser(data.token);
        toast.success(state === "login" ? "Logged in successfully!" : "Account created successfully!");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticating) {
    return <Loading />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-88 sm:w-98
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
          onChange={(e) => {
            const val = e.target.value;
            setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : "");
          }}
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
            onClick={() => !isAuthenticating && setState("login")}
            className="bg-linear-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent cursor-pointer underline"
          >
            Login
          </span>
        </p>
      ) : (
        <p className="text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => !isAuthenticating && setState("register")}
            className="bg-linear-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent cursor-pointer underline"
          >
            SignUp
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={isAuthenticating}
        className="bg-linear-to-r from-[#00E5FF] to-[#0096FF] hover:opacity-90 transition-all
        text-white w-full py-2 rounded-full cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
        disabled={isAuthenticating}
        onClick={handleGoogleAuth}
        className="w-full py-2 rounded-full border border-white/10 bg-white/5 
        hover:bg-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] group"
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
