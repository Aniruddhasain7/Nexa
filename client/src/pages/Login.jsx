import React, { useState } from "react";

const Login = () => {
  const [state, setState] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (state === "login") {
      console.log("Login Data:", formData);
    } else {
      console.log("Signup Data:", formData);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-96 text-center bg-white/5 border border-white/10 rounded-2xl px-8 py-6 backdrop-blur-xl"
      >
        {/* Title */}
        <h1 className="text-white text-3xl font-medium mt-4">
          {state === "login" ? "Login" : "Sign up"}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm mt-2">
          {state === "login"
            ? "Please login in to continue"
            : "Create a new account"}
        </p>

        {/* Name (Signup only) */}
        {state !== "login" && (
          <div className="flex items-center mt-6 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-blue-500 h-12 rounded-full pl-6 gap-2 transition">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full bg-transparent text-white placeholder-white/60 outline-none"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Email */}
        <div className="flex items-center w-full mt-4 bg-white/5 ring-2 ring-white/10 focus-within:ring-blue-500 h-12 rounded-full pl-6 gap-2 transition">
          <input
            type="email"
            name="email"
            placeholder="Email id"
            className="w-full bg-transparent text-white placeholder-white/60 outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-blue-500 h-12 rounded-full pl-6 gap-2 transition">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-white/60 outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {state === "login" && (
          <div className="mt-4 text-left">
            <button
              type="button"
              className="text-sm text-blue-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 w-full h-11 rounded-full text-white bg-blue-600 hover:bg-blue-500 transition"
        >
          {state === "login" ? "Login" : "Sign up"}
        </button>

        {/* Toggle */}
        <p
          onClick={() =>
            setState((prev) => (prev === "login" ? "signup" : "login"))
          }
          className="text-gray-400 text-sm mt-4 cursor-pointer"
        >
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <span className="text-blue-400 hover:underline ml-1">
            click here
          </span>
        </p>
      </form>

      
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-tr from-blue-800/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute right-12 bottom-10 w-[300px] h-[150px] bg-gradient-to-bl from-blue-700/30 to-transparent rounded-full blur-2xl" />
      </div>
    </>
  );
};

export default Login;