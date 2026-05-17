import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";
import { FaMicrophone, FaPlus, FaTimes, FaChevronDown } from "react-icons/fa";

const Chatbot = () => {
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { selectedChat, theme, user, axios, token, fetchUserChats } =
    useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const getMediaCategory = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "file";
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      return toast.error("File too large. Max size is 20 MB.");
    }
    const cat = getMediaCategory(file);
    setMediaFile(file);
    setMediaType(cat);
    if (cat === "image" || cat === "video") {
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaPreview(null);
    }
  };

  const sendWithMedia = async () => {
    if (!user) return toast("Login to send a message");
    try {
      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");

      const previewUrl = mediaPreview;
      const previewType = mediaType;
      const fileName = mediaFile.name;
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content:
            prompt.trim() ||
            (previewType === "image"
              ? "Analyze this image"
              : `File: ${fileName}`),
          timestamp: Date.now(),
          isImage: false,
          mediaUrl: previewUrl,
          mediaType: previewType,
          _isLocal: true,
        },
      ]);

      const form = new FormData();
      form.append("file", mediaFile);
      form.append("chatId", selectedChat._id);
      if (prompt.trim()) form.append("prompt", prompt.trim());

      clearMedia();

      abortControllerRef.current = new AbortController();
      const { data } = await axios.post("/api/message/upload-media", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        signal: abortControllerRef.current.signal,
      });

      if (data.success) {
        setMessages((prev) => {
          const copy = [...prev];
          const lastUser = [...copy]
            .reverse()
            .find((m) => m.role === "user" && m._isLocal);
          if (lastUser) {
            lastUser.mediaUrl = data.mediaUrl;
            lastUser._isLocal = false;
          }
          return copy;
        });
        setMessages((prev) => [...prev, data.reply]);
        await fetchUserChats();
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      toast.error(error.message);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const sendMessage = async (inputPrompt) => {
    const textToSend = inputPrompt || prompt;
    if (!textToSend.trim()) return;

    try {
      if (!user) return toast("Login to send message");
      setLoading(true);
      const promptCopy = textToSend;
      setPrompt("");

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: textToSend,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      abortControllerRef.current = new AbortController();
      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt: textToSend,
          isPublished,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        },
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);
        await fetchUserChats();
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      toast.error(error.message);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (mediaFile) {
      await sendWithMedia();
    } else {
      await sendMessage();
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return toast.error(
        "Speech recognition is not supported in this browser.",
      );

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setPrompt(transcript);
      if (event.results[0].isFinal) {
        recognition.stop();
        sendMessage(transcript);
      }
    };
    recognition.onerror = (event) => {
      toast.error("Speech recognition error: " + event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    isRecording ? recognition.stop() : recognition.start();
  };

  const onStop = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  useEffect(() => {
    if (selectedChat) setMessages(selectedChat.messages);
  }, [selectedChat]);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(
    () => () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    },
    [mediaPreview],
  );

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {mediaFile && (
        <div
          className="relative flex items-center gap-3 mb-3 mx-auto w-full max-w-2xl
          bg-primary/10 dark:bg-[#3c5a79]/20 border border-primary/30 dark:border-[#60679f]/30
          rounded-2xl px-4 py-3"
        >
          {mediaType === "image" && mediaPreview && (
            <img
              src={mediaPreview}
              alt="preview"
              className="h-20 w-20 object-cover rounded-xl border border-primary/20 shadow"
            />
          )}
          {mediaType === "video" && mediaPreview && (
            <video
              src={mediaPreview}
              className="h-20 w-20 object-cover rounded-xl border border-primary/20 shadow"
            />
          )}
          {mediaType === "file" && (
            <div
              className="h-20 w-20 flex flex-col items-center justify-center rounded-xl
              bg-primary/20 dark:bg-[#3c5a79]/30 border border-primary/30"
            >
              <span className="text-2xl">📄</span>
              <span className="text-[10px] mt-1 text-gray-500 dark:text-gray-400 truncate w-16 text-center">
                {mediaFile.name.split(".").pop().toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium dark:text-gray-200 truncate">
              {mediaFile.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {(mediaFile.size / 1024).toFixed(1)} KB &bull; {mediaType}
            </p>
          </div>

          <button
            onClick={clearMedia}
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 dark:bg-gray-700
            hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-gray-500 hover:text-red-500"
          >
            <FaTimes size={11} />
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#3c5a79]/30 border border-primary
        dark:border-[#60679f]/30 rounded-full w-full max-w-[750px] p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          id="media-upload-input"
          className="hidden"
          accept="image/*,video/*,.txt"
          onChange={handleFileSelect}
        />

        <label
          htmlFor="media-upload-input"
          className={`p-2 rounded-full cursor-pointer transition-all
          ${
            mediaFile
              ? "text-white bg-gradient-to-r from-[#00E5FF] to-[#0096FF]"
              : "text-gray-500 hover:text-primary"
          }`}
          title="Attach file"
        >
          <FaPlus size={16} />
        </label>

        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder={mediaFile ? "Add a message" : "Ask anything"}
          className="flex-1 w-full text-sm outline-none bg-transparent"
          required={!mediaFile}
        />

        {!mediaFile && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`text-sm pl-3 pr-2 outline-none bg-transparent cursor-pointer transition-colors flex items-center gap-1.5 ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {mode === "text" ? "Text" : "Image"}
              <FaChevronDown
                size={8}
                className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div
                  className={`absolute bottom-full right-0 mb-3 w-32 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 border ${
                    theme === "dark"
                      ? "bg-black border-blue-500/30"
                      : "bg-white border-primary/20"
                  }`}
                >
                  <div className="p-1 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("text");
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        mode === "text"
                          ? theme === "dark"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-primary/10 text-primary"
                          : theme === "dark"
                            ? "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("image");
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        mode === "image"
                          ? theme === "dark"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-primary/10 text-primary"
                          : theme === "dark"
                            ? "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      Image
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {loading ? (
          <button type="button" onClick={onStop}>
            <img
              src={assets.stop_icon}
              className="w-8 cursor-pointer"
              alt="stop"
            />
          </button>
        ) : prompt.trim() || mediaFile ? (
          <button type="submit">
            <img
              src={assets.send_icon}
              className="w-8 cursor-pointer"
              alt="send"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-all
            ${
              isRecording
                ? "text-white animate-pulse bg-gradient-to-r from-[#00E5FF] to-[#0096FF]"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            <FaMicrophone size={16} />
          </button>
        )}
      </form>
    </div>
  );
};

export default Chatbot;
