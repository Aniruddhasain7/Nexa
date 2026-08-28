import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import logo from "../assets/logo.png";
import {
  FiX,
  FiUser,
  FiMoon,
  FiSun,
  FiDatabase,
  FiInfo,
  FiLogOut,
  FiCheck,
  FiDownload,
  FiTrash2,
  FiCommand,
  FiShield,
  FiEdit3,
} from "react-icons/fi";
import moment from "moment";
import toast from "react-hot-toast";

const Settings = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    activeSettingsTab,
    setActiveSettingsTab,
    user,
    theme,
    setTheme,
    logout,
    updateUserName,
    clearAllUserChats,
    chats,
    autoScroll,
    setAutoScroll,
    sendWithEnter,
    setSendWithEnter,
  } = useAppContext();

  const [nameInput, setNameInput] = useState(user?.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingChats, setIsClearingChats] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, setIsSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      return toast.error("Name cannot be empty");
    }
    if (nameInput.trim() === user?.name) {
      return toast("No changes made to name");
    }
    setIsUpdatingName(true);
    await updateUserName(nameInput.trim());
    setIsUpdatingName(false);
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          user: { name: user?.name, email: user?.email },
          chatsCount: chats.length,
          chats: chats,
        },
        null,
        2,
      );
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexa-chats-backup-${moment().format("YYYY-MM-DD-HHmm")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Chat history exported successfully!");
    } catch (err) {
      toast.error("Failed to export chats: " + err.message);
    }
  };

  const handleClearAll = async () => {
    setIsClearingChats(true);
    await clearAllUserChats();
    setIsClearingChats(false);
    setShowClearConfirm(false);
  };

  const totalMessagesCount = chats.reduce(
    (acc, chat) => acc + (chat.messages ? chat.messages.length : 0),
    0,
  );
  const totalImagesCount = chats.reduce(
    (acc, chat) =>
      acc + (chat.messages ? chat.messages.filter((m) => m.isImage).length : 0),
    0,
  );

  const tabs = [
    { id: "account", label: "Account & Profile", icon: FiUser },
    { id: "appearance", label: "Appearance & Theme", icon: FiMoon },
    { id: "data", label: "Data & Privacy", icon: FiDatabase },
    { id: "about", label: "Shortcuts & Info", icon: FiInfo },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row rounded-2xl bg-white dark:bg-[#18161b] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close Settings"
        >
          <FiX size={20} />
        </button>

        <div className="w-full md:w-64 p-5 bg-gray-50/80 dark:bg-[#121115]/80 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col shrink-0">
          <div className="flex items-center gap-2.5 pb-4 mb-3 border-b border-gray-200 dark:border-white/10">
            <img
              src={logo}
              alt="Nexa Logo"
              className="w-7 h-7 object-contain rounded-lg"
            />
            <div>
              <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                Settings
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Preferences & Profile
              </p>
            </div>
          </div>

          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSettingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-linear-to-r from-[#00E5FF]/15 to-[#0096FF]/15 text-[#0084FF] dark:text-[#00E5FF] font-semibold border border-[#0096FF]/30 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive
                        ? "text-[#0084FF] dark:text-[#00E5FF]"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {user && (
            <div className="mt-auto hidden md:flex items-center gap-2.5 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)] md:max-h-[85vh]">
          {activeSettingsTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account & Profile
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your personal details and account credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-cyan-500/20">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#18161b] rounded-full"
                    title="Online"
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || "No email available"}
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <FiShield size={11} /> Nexa Standard Member
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveName}
                className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FiEdit3 size={13} className="text-cyan-500" />
                    Display Name
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {nameInput.length}/50
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={50}
                    value={nameInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNameInput(
                        val ? val.charAt(0).toUpperCase() + val.slice(1) : ""
                      );
                    }}
                    placeholder="Enter your full name"
                    className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-white dark:bg-black/30 border border-gray-300 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={
                      isUpdatingName ||
                      !nameInput.trim() ||
                      nameInput.trim() === user?.name
                    }
                    className="px-4 py-2 text-xs font-medium text-white bg-linear-to-r from-[#00E5FF] to-[#0096FF] rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isUpdatingName ? (
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <FiCheck size={14} />
                    )}
                    Save
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  This name is displayed across conversations, message headers,
                  and published community images.
                </p>
              </form>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 space-y-2.5">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Account Details
                </h4>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 dark:border-white/5 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Email Address
                  </span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {user?.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 dark:border-white/5 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    User ID
                  </span>
                  <span className="font-mono text-[11px] text-gray-800 dark:text-gray-300">
                    {user?._id || user?.id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Account Status
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Active & Verified
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 dark:text-red-400">
                      Sign Out
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Safely log out of your Nexa account on this device.
                    </p>
                  </div>
                  {!showLogoutConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap self-start sm:self-auto"
                    >
                      <FiLogOut size={13} />
                      Log Out
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={logout}
                        className="px-3.5 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-1 sm:flex-initial text-center"
                      >
                        Confirm Log Out
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(false)}
                        className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance & Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customize the interface look and color theme of Nexa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === "dark"
                      ? "border-cyan-500 bg-cyan-500/10 shadow-md ring-2 ring-cyan-500/20"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/2"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gray-900 text-blue-400 border border-white/10">
                          <FiMoon size={18} />
                        </div>
                        <span className="font-semibold text-sm">Dark Mode</span>
                      </div>
                      {theme === "dark" && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                          <FiCheck size={12} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sleek cosmic dark gradient background with vibrant glowing
                      accents.
                    </p>
                  </div>
                  <div className="mt-4 p-2.5 rounded-lg bg-[#1a171d] border border-white/10 space-y-1.5">
                    <div className="h-2 w-16 bg-cyan-400/80 rounded" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-24 bg-white/20 rounded" />
                  </div>
                </div>

                <div
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === "light"
                      ? "border-cyan-500 bg-cyan-500/10 shadow-md ring-2 ring-cyan-500/20"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/2"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">
                          <FiSun size={18} />
                        </div>
                        <span className="font-semibold text-sm">
                          Light Mode
                        </span>
                      </div>
                      {theme === "light" && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                          <FiCheck size={12} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Clean, high-contrast light theme optimized for day-time
                      clarity.
                    </p>
                  </div>
                  <div className="mt-4 p-2.5 rounded-lg bg-white border border-gray-200 space-y-1.5">
                    <div className="h-2 w-16 bg-blue-500 rounded" />
                    <div className="h-2 w-full bg-gray-200 rounded" />
                    <div className="h-2 w-24 bg-gray-300 rounded" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 space-y-4">
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Chat Interaction Behavior
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Auto-Scroll on New Responses
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Automatically scroll conversation to bottom as AI replies.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-linear-to-r peer-checked:from-[#00E5FF] peer-checked:to-[#0096FF]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-white/5">
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Press Enter to Send
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Press Shift + Enter to add a new line without sending.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWithEnter}
                      onChange={(e) => setSendWithEnter(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-linear-to-r peer-checked:from-[#00E5FF] peer-checked:to-[#0096FF]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === "data" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Data & Privacy
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your conversation archives, data exports, and history
                  deletion.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 text-center">
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {chats.length}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Saved Chats
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalMessagesCount}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Total Messages
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalImagesCount}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Images Generated
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Export Chat History
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Download a full JSON archive of your chats and messages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap self-start sm:self-auto"
                >
                  <FiDownload size={14} className="text-cyan-500" />
                  Export JSON
                </button>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <FiTrash2 size={13} />
                      Clear All Conversations
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Permanently delete all your chat sessions and conversation
                      history.
                    </p>
                  </div>
                  {!showClearConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto"
                    >
                      Clear All
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        disabled={isClearingChats}
                        onClick={handleClearAll}
                        className="px-3.5 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap flex-1 sm:flex-initial text-center"
                      >
                        {isClearingChats ? "Clearing..." : "Yes, Delete All"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === "about" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shortcuts & Info
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keyboard shortcuts and application architecture details.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 space-y-2.5">
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <FiCommand size={13} className="text-cyan-500" />
                  Keyboard Shortcuts
                </h4>
                <div className="space-y-1.5">
                  {[
                    { label: "Send Prompt", shortcut: "Enter" },
                    {
                      label: "Add New Line in Input",
                      shortcut: "Shift + Enter",
                    },
                    { label: "Close Modal / Dialogs", shortcut: "Escape" },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1.5 border-b last:border-b-0 border-gray-200/60 dark:border-white/5 text-xs"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {s.label}
                      </span>
                      <kbd className="px-2 py-0.5 rounded bg-gray-200 dark:bg-white/10 font-mono text-[11px] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-white/15 shadow-2xs">
                        {s.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={logo}
                    alt="Nexa Logo"
                    className="w-10 h-10 object-contain rounded-xl"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Nexa AI Assistant
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Version 2.4.0
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nexa is your multimodal AI assistant designed for fast text
                  intelligence, image generation, PDF understanding, and code
                  assistance.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    All Systems Operational • Powered by Gemini & ImageKit
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
