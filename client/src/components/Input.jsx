import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"

const Input = ({ value, onChange, placeholder, label, type, className = "", labelClassName = "", inputClassName = "", required = false }) => {
  const [showPassword, setShowPassword] = useState(false)

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`text-[13px] text-gray-400 block mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}

      <div className={`input-box flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#00E5FF] transition-all ${inputClassName}`}>
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className='w-full bg-transparent outline-none text-white placeholder-gray-500'
          value={value}
          onChange={onChange}
          required={required}
        />

        {type === "password" && (
          showPassword ? (
            <FaRegEye
              size={20}
              className="text-[#00E5FF] cursor-pointer"
              onClick={toggleShowPassword}
            />
          ) : (
            <FaRegEyeSlash
              size={20}
              className='text-gray-400 cursor-pointer hover:text-[#00E5FF] transition-colors'
              onClick={toggleShowPassword}
            />
          )
        )}
      </div>
    </div>
  )
}

export default Input
