import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import logo_full from "../assets/logo_full.png";
import logo_full_dark from "../assets/logo_full_dark.png";
import moment from 'moment'
import toast from "react-hot-toast";
import { FiSearch, FiTrash2, FiImage, FiSun, FiMoon, FiLogOut, FiX } from "react-icons/fi";
import { FaUser } from "react-icons/fa";


const Sidebar = ({isMenuOpen, setIsMenuOpen}) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat,
    axios, setChats, fetchUserChats, setToken, token } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeChatActionsId, setActiveChatActionsId] = useState(null);
  const [showLogoutMobile, setShowLogoutMobile] = useState(false);

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Logged out successfully')
  }

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm('Are you sure you want to delete this chat?');
      if (!confirm) return;

      const { data } = await axios.post(
        '/api/chat/delete',
        { chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        toast.success(data.message || 'Chat deleted');
        await fetchUserChats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-linear-to-b from-[#242124]/30 to-[#000000]/30 border-r
    border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${!isMenuOpen &&
    'max-md:-translate-x-full'}`}
    >
      <img
        src={theme === "dark" ? logo_full : logo_full_dark}
        alt=""
        className="w-full max-w-48"
      />
      <button onClick={createNewChat} 
        className="flex justify-center items-center w-full py-2 mt-10
      text-white bg-linear-to-r from-[#00E5FF] to-[#0096FF] text-sm rounded-md
      cursor-pointer"
      >
        <span className="mr-2 text-xl">+</span>New Chat
      </button>
      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-400
      dark:border-white/20 rounded-md"
      >
        <FiSearch className="text-gray-400 text-base shrink-0" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversation"
          className="text-xs placeholder:text-gray-400 outline-none w-full bg-transparent"
        />
      </div>
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {
        chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div onClick={()=> {
              if (window.innerWidth < 768) {
                if (activeChatActionsId !== chat._id) {
                  setActiveChatActionsId(chat._id);
                } else {
                  navigate('/');
                  setSelectedChat(chat);
                  setIsMenuOpen(false);
                  setActiveChatActionsId(null);
                }
              } else {
                navigate('/');
                setSelectedChat(chat);
              }
            }} 
            key={chat._id} className="p-2 px-4 dark:bg-[#31407c]/10 border
            border-gray-300 dark:border-[#60899f]/15 rounded-md cursor-pointer flex justify-between group">
              <div>
                <p className="truncate w-full">
                  {chat.messages.length > 0 ? chat.messages[0].content.
                  slice(0,32) : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}</p>
              </div>
              <button
                type="button"
                className={`p-1 text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0 ${
                  activeChatActionsId === chat._id ? 'block' : 'hidden md:group-hover:block'
                }`}
                title="Delete chat"
                onClick={(e) => deleteChat(e, chat._id)}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
      </div>

      <div onClick={()=> {navigate('/community'); setIsMenuOpen(false)}} 
      className="flex items-center gap-2 p-3 mt-4 border border-gray-300
      dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
          <FiImage size={18} className="text-gray-700 dark:text-white shrink-0" />
          <div className="flex flex-col text-sm">
            <p>Community Images</p>
          </div>
      </div>    
      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300
      dark:border-white/15 rounded-md ">
          <div className="flex items-center gap-2 text-sm">
            {theme === "dark" ? (
              <FiMoon size={17} className="text-blue-300 shrink-0" />
            ) : (
              <FiSun size={17} className="text-amber-500 shrink-0" />
            )}
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex cursor-pointer">
            <input onChange={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}
             type="checkbox" className="sr-only peer" checked={theme === 'dark'} />
             <div className="w-9 h-5 bg-gray-400 rounded-full
             peer-checked:bg-linear-to-r peer-checked:from-[#00E5FF] peer-checked:to-[#0096FF] transition-all">
             </div>
             <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full
             transition-transform peer-checked:translate-x-4"></span>
          </label>
      </div>  
        <div onClick={() => setShowLogoutMobile(prev => !prev)} className="flex items-center gap-3 p-3 mt-4 border border-gray-300
      dark:border-white/15 rounded-md cursor-pointer group">
          {user ? (
            <div className="w-8 h-8 min-w-8 rounded-full bg-linear-to-r from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white text-sm font-semibold">
              {user.name.charAt(0)}
            </div>
          ) : (
            <div className="w-7 h-7 min-w-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <FaUser size={13} />
            </div>
          )}
          <p className="flex-1 text-sm dark:text-gray-100 truncate">{user ? user.name :
           'Login your account' }</p>
           {user && (
             <button
               type="button"
               title="Logout"
               onClick={(e) => { e.stopPropagation(); logout(); }}
               className={`p-1 text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0 ${
                 showLogoutMobile ? 'block' : 'hidden md:group-hover:block'
               }`}
             >
               <FiLogOut size={18} />
             </button>
           )}
      </div>    
      <button
        onClick={()=> setIsMenuOpen(false)}
        className="absolute top-3 right-3 p-1 rounded-lg md:hidden text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Close menu"
      >
        <FiX size={20} />
      </button>
    </div>
  );
};

export default Sidebar;

