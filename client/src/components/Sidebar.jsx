import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import logo_full from "../assets/logo_full.png";
import logo_full_dark from "../assets/logo_full_dark.png";
import moment from "moment";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiTrash2,
  FiImage,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChat,
    theme,
    user,
    navigate,
    createNewChat,
    axios,
    setChats,
    fetchUserChats,
    token,
    setIsSettingsOpen,
    setActiveSettingsTab,
  } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeChatActionsId, setActiveChatActionsId] = useState(null);

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm("Are you sure you want to delete this chat?");
      if (!confirm) return;

      const { data } = await axios.post(
        "/api/chat/delete",
        { chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        toast.success(data.message || "Chat deleted");
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
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-linear-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${
        !isMenuOpen && "max-md:-translate-x-full"
      }`}
    >
      <img
        src={theme === "dark" ? logo_full : logo_full_dark}
        alt="Nexa Logo"
        className="w-full max-w-48"
      />
      <button
        onClick={createNewChat}
        className="flex justify-center items-center w-full py-2 mt-8 text-white bg-linear-to-r from-[#00E5FF] to-[#0096FF] text-sm font-medium rounded-md cursor-pointer shadow-md hover:opacity-95 transition-opacity"
      >
        <span className="mr-2 text-xl font-bold">+</span>New Chat
      </button>

      <div className="flex items-center gap-2 p-2.5 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <FiSearch className="text-gray-400 text-base shrink-0" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversation"
          className="text-xs placeholder:text-gray-400 outline-none w-full bg-transparent text-gray-900 dark:text-white"
        />
      </div>

      {chats.length > 0 && (
        <p className="mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Recent Chats
        </p>
      )}

      <div className="flex-1 overflow-y-scroll mt-2 text-sm space-y-2.5">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div
              onClick={() => {
                if (window.innerWidth < 768) {
                  if (activeChatActionsId !== chat._id) {
                    setActiveChatActionsId(chat._id);
                  } else {
                    navigate("/");
                    setSelectedChat(chat);
                    setIsMenuOpen(false);
                    setActiveChatActionsId(null);
                  }
                } else {
                  navigate("/");
                  setSelectedChat(chat);
                }
              }}
              key={chat._id}
              className="p-2.5 px-3.5 dark:bg-[#31407c]/10 border border-gray-300 dark:border-[#60899f]/15 rounded-md cursor-pointer flex justify-between items-center group hover:border-[#00E5FF]/40 transition-colors"
            >
              <div className="min-w-0 flex-1 mr-2">
                <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-[#B1A6C0] mt-0.5">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <button
                type="button"
                className={`p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0 rounded-md hover:bg-red-500/10 ${
                  activeChatActionsId === chat._id
                    ? "block"
                    : "hidden md:group-hover:block"
                }`}
                title="Delete chat"
                onClick={(e) => deleteChat(e, chat._id)}
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
      </div>

      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-3 p-2.5 mt-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
      >
        <FiImage size={17} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
        <div className="flex flex-col text-xs font-medium text-gray-800 dark:text-gray-200">
          <p>Community Images</p>
        </div>
      </div>

      <div
        onClick={() => {
          setIsSettingsOpen(true);
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-3 p-2.5 mt-2 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
      >
        <FiSettings
          size={17}
          className="text-cyan-600 dark:text-cyan-400 group-hover:rotate-45 transition-transform duration-300 shrink-0"
        />
        <div className="flex flex-col text-xs font-medium text-gray-800 dark:text-gray-200">
          <p>Settings</p>
        </div>
      </div>

      <div
        onClick={() => {
          if (user) {
            setActiveSettingsTab("account");
            setIsSettingsOpen(true);
            setIsMenuOpen(false);
          }
        }}
        className="flex items-center gap-3 p-2.5 mt-2 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
        title="Open Profile Settings"
      >
        {user ? (
          <div className="w-8 h-8 min-w-8 rounded-full bg-linear-to-r from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8 min-w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <FaUser size={13} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold dark:text-gray-100 truncate">
            {user ? user.name : "Login your account"}
          </p>
          {user && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsMenuOpen(false)}
        className="absolute top-3 right-3 p-1 rounded-lg md:hidden text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Close menu"
      >
        <FiX size={20} />
      </button>
    </div>
  );
};

export default Sidebar;
