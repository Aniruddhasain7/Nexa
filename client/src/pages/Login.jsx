import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Input from "../components/Input";


const Login = () =>{
  const [state, setState] = useState("login");
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const {axios,setToken}= useAppContext()

  const handleSubmit = async(e) => {
    e.preventDefault()
    const url= state === "login" ? '/api/user/login' : '/api/user/register'

    try {
      const {data}=await axios.post(url, {name, email, password})
      if(data.success) {
        setToken(data.token)
        localStorage.setItem('token', data.token)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
  
    
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px]
      text-gray-300 rounded-2xl shadow-2xl border border-white/10
      bg-white/5 backdrop-blur-xl"
    >
      <p className="text-2xl font-medium m-auto">
        <span className="bg-gradient-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent">User</span>{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>

      {state === "register" && (
        <Input
          label="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Name"
          type="text"
          required
        />
      )}

      <Input
        label="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder="Email address"
        type="email"
        required
      />

      <Input
        label="Password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        placeholder="Password"
        type="password"
        required
      />

      {state === "register" ? (
        <p className="text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => setState("login")}
            className="bg-gradient-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent cursor-pointer underline"
          >
            Login
          </span>
        </p>
      ) : (
        <p className="text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => setState("register")}
            className="bg-gradient-to-r from-[#00E5FF] to-[#0096FF] bg-clip-text text-transparent cursor-pointer underline"
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
    </form>

    
);

}
export default Login;