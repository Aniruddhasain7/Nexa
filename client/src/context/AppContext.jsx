import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("account");
  const [autoScroll, setAutoScroll] = useState(
    localStorage.getItem("nexa_auto_scroll") !== "false"
  );
  const [sendWithEnter, setSendWithEnter] = useState(
    localStorage.getItem("nexa_send_with_enter") !== "false"
  );

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setChats([]);
    setSelectedChat(null);
    setIsSettingsOpen(false);
    toast.success("Logged out successfully");
  };

  const updateUserName = async (newName) => {
    try {
      if (!token) return { success: false, message: "Not authenticated" };
      if (!newName || !newName.trim()) {
        toast.error("Name cannot be empty");
        return { success: false };
      }
      const { data } = await axios.post(
        "/api/user/update-profile",
        { name: newName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setUser(data.user);
        setChats((prev) =>
          prev.map((c) => ({ ...c, userName: data.user.name }))
        );
        toast.success(data.message || "Profile updated successfully");
        return { success: true, user: data.user };
      } else {
        toast.error(data.message || "Failed to update profile");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error updating name";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const clearAllUserChats = async () => {
    try {
      if (!token) return { success: false };
      const { data } = await axios.post(
        "/api/chat/clear-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setChats([]);
        setSelectedChat(null);
        toast.success(data.message || "All chats cleared");
        await createNewChat();
        return { success: true };
      } else {
        toast.error(data.message || "Failed to clear chats");
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message || "Error clearing chats");
      return { success: false };
    }
  };

  const fetchUser = async (userToken) => {
    const activeToken = userToken || token || localStorage.getItem("token");
    if (!activeToken) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/user/data",
        {},
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        },
      );
      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if (!token) return toast("Login to create a new Chat");
      navigate("/");
      const { data } = await axios.get("/api/chat/create", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success) {
        return toast.error(data.message);
      }
      await fetchUserChats(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserChats = async (autoCreate = true) => {
    try {
      if (!token) return;
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setChats(data.chats);

        if (data.chats.length === 0) {
          if (autoCreate) {
            await createNewChat();
          }
        } else {
          setSelectedChat((prev) => {
            if (!prev) return data.chats[0];
            const current = data.chats.find((c) => c._id === prev._id);
            return current || data.chats[0];
          });
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("nexa_auto_scroll", String(autoScroll));
  }, [autoScroll]);

  useEffect(() => {
    localStorage.setItem("nexa_send_with_enter", String(sendWithEnter));
  }, [sendWithEnter]);

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    // Proactively wake up backend server on initial app load
    axios.get("/").catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    setLoadingUser,
    isAuthenticating,
    setIsAuthenticating,
    fetchUserChats,
    token,
    setToken,
    axios,
    logout,
    updateUserName,
    clearAllUserChats,
    isSettingsOpen,
    setIsSettingsOpen,
    activeSettingsTab,
    setActiveSettingsTab,
    autoScroll,
    setAutoScroll,
    sendWithEnter,
    setSendWithEnter,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

