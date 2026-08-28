import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import logo_full from "../assets/logo_full.png";
import logo_full_dark from "../assets/logo_full_dark.png";
import Message from "./Message";
import Camera from "./Camera";
import toast from "react-hot-toast";
import {
  FaMicrophone,
  FaPlus,
  FaCamera,
  FaTimes,
  FaChevronDown,
  FaFilePdf,
  FaSquare,
} from "react-icons/fa";
import { LuPaperclip } from "react-icons/lu";
import { IoSend } from "react-icons/io5";

const CHATBOX_PLACEHOLDERS = [
  "Ask me anything",
  "What is on your mind?",
  "How can Nexa assist you today?",
  "Let's create something amazing!",
  "What can I help you learn or build?",
];

const Chatbot = () => {
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { selectedChat, theme, user, axios, token, fetchUserChats, autoScroll, sendWithEnter } =
    useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [chatBoxPlaceholder, setChatBoxPlaceholder] =
    useState("Ask me anything");

  const getMediaCategory = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    )
      return "pdf";
    return "file";
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraCapture = (file, previewUrl) => {
    setMediaFile(file);
    setMediaType("image");
    setMediaPreview(previewUrl);
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
      const trimmedPrompt = prompt.trim();
      const formattedPrompt = trimmedPrompt
        ? trimmedPrompt.charAt(0).toUpperCase() + trimmedPrompt.slice(1)
        : "";
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
            formattedPrompt ||
            (previewType === "image"
              ? "Analyze this image"
              : previewType === "pdf"
                ? "Analyze this PDF document"
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
      if (formattedPrompt) form.append("prompt", formattedPrompt);

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
    const rawText = inputPrompt || prompt;
    if (!rawText.trim()) return;
    const textToSend =
      rawText.trim().charAt(0).toUpperCase() + rawText.trim().slice(1);

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
      const rawTranscript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      const transcript = rawTranscript
        ? rawTranscript.charAt(0).toUpperCase() + rawTranscript.slice(1)
        : "";
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
    if (selectedChat) {
      setMessages(selectedChat.messages);
      const randomChatBox =
        CHATBOX_PLACEHOLDERS[
          Math.floor(Math.random() * CHATBOX_PLACEHOLDERS.length)
        ];
      setChatBoxPlaceholder(randomChatBox);
    }
  }, [selectedChat]);
  useEffect(() => {
    if (containerRef.current && (autoScroll ?? true)) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  useEffect(
    () => () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    },
    [mediaPreview],
  );

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-20 max-md:mt-14 2xl:pr-10">
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? logo_full : logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-2xl sm:text-5xl text-center text-gray-400 dark:text-white">
              {chatBoxPlaceholder}
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
          bg-primary/20 dark:bg-[#18181b]/90 dark:backdrop-blur-md border border-primary/30 dark:border-white/10
          shadow-md dark:shadow-black/40 rounded-2xl px-4 py-3"
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
          {mediaType === "pdf" && (
            <div
              className="h-20 w-20 flex flex-col items-center justify-center rounded-xl
              bg-red-500/15 dark:bg-red-950/40 border border-red-500/30 text-red-500 shadow"
            >
              <FaFilePdf size={28} />
              <span className="text-[10px] font-semibold mt-1 text-red-500 tracking-wider">
                PDF
              </span>
            </div>
          )}
          {mediaType === "file" && (
            <div
              className="h-20 w-20 flex flex-col items-center justify-center rounded-xl
              bg-primary/20 dark:bg-[#27272a]/70 border border-primary/30 dark:border-white/10"
            >
              <span className="text-2xl">📄</span>
              <span className="text-[10px] mt-1 text-gray-500 dark:text-zinc-400 truncate w-16 text-center">
                {mediaFile.name.split(".").pop().toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium dark:text-zinc-200 truncate">
              {mediaFile.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-400 mt-0.5">
              {(mediaFile.size / 1024).toFixed(1)} KB &bull;{" "}
              {mediaType.toUpperCase()}
            </p>
          </div>

          <button
            onClick={clearMedia}
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 dark:bg-zinc-800
            hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-gray-500 dark:text-zinc-400 hover:text-red-500"
          >
            <FaTimes size={11} />
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#18181b]/90 dark:backdrop-blur-md border border-primary/30
        dark:border-white/10 shadow-xs dark:shadow-2xl dark:shadow-black/50 rounded-full w-full max-w-187.5 p-2 sm:p-2.5 pl-3.5 sm:pl-4.5 pr-2.5 sm:pr-3 mx-auto flex gap-2.5 sm:gap-3 items-end focus-within:border-primary/50 focus-within:dark:border-white/20 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          id="media-upload-input"
          className="hidden"
          accept="image/*,video/*,.txt,.pdf,application/pdf"
          onChange={handleFileSelect}
        />

        <div className="relative mb-0.5">
          <button
            type="button"
            onClick={() => setAttachMenuOpen(!attachMenuOpen)}
            className={`p-2 rounded-full cursor-pointer transition-all duration-300 ${
              mediaFile
                ? "text-white bg-linear-to-r from-[#00E5FF] to-[#0096FF]"
                : attachMenuOpen
                  ? "text-white bg-primary/30 dark:bg-white/15"
                  : "text-gray-500 dark:text-zinc-400 hover:text-primary dark:hover:text-white"
            }`}
            title="Attach file or take photo"
          >
            <FaPlus
              size={15}
              className={`transition-transform duration-300 ${
                attachMenuOpen ? "rotate-45" : ""
              }`}
            />
          </button>

          {attachMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setAttachMenuOpen(false)}
              ></div>
              <div
                className={`absolute bottom-full left-0 mb-3 w-56 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 border p-1.5 flex flex-col gap-1 ${
                  theme === "dark"
                    ? "bg-[#18181b]/95 backdrop-blur-xl border-white/10 shadow-black/80"
                    : "bg-white/95 backdrop-blur-xl border-primary/20 shadow-xl"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAttachMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                    theme === "dark"
                      ? "hover:bg-white/10 text-zinc-200 hover:text-white"
                      : "hover:bg-primary/10 text-gray-700 hover:text-primary"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      theme === "dark"
                        ? "bg-white/5 group-hover:bg-[#00E5FF]/20 text-[#00E5FF]"
                        : "bg-primary/10 group-hover:bg-primary/20 text-primary"
                    }`}
                  >
                    <LuPaperclip size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Upload File</span>
                    <span
                      className={`text-[10px] ${
                        theme === "dark" ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      Images, PDFs, documents
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttachMenuOpen(false);
                    setIsCameraOpen(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                    theme === "dark"
                      ? "hover:bg-white/10 text-zinc-200 hover:text-white"
                      : "hover:bg-primary/10 text-gray-700 hover:text-primary"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      theme === "dark"
                        ? "bg-white/5 group-hover:bg-[#0096FF]/20 text-[#0096FF]"
                        : "bg-primary/10 group-hover:bg-primary/20 text-primary"
                    }`}
                  >
                    <FaCamera size={15} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Take Photo</span>
                    <span
                      className={`text-[10px] ${
                        theme === "dark" ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      Use live camera
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => {
            const val = e.target.value;
            setPrompt(val ? val.charAt(0).toUpperCase() + val.slice(1) : "");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (sendWithEnter) {
                if (!e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() || mediaFile) {
                    onSubmit(e);
                  }
                }
              } else {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  if (prompt.trim() || mediaFile) {
                    onSubmit(e);
                  }
                }
              }
            }
          }}
          placeholder={mediaFile ? "Add a message" : "Ask anything..."}
          className="flex-1 w-full text-sm outline-none bg-transparent text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none max-h-40 py-1.5 leading-relaxed overflow-y-auto"
          required={!mediaFile}
        />

        {!mediaFile && (
          <div className="relative mb-0.5">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`text-sm pl-2 pr-1.5 py-1.5 outline-none bg-transparent cursor-pointer transition-colors flex items-center gap-1.5 ${
                theme === "dark"
                  ? "text-zinc-400 hover:text-white"
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
                      ? "bg-[#18181b]/95 backdrop-blur-md border-white/10"
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
                            ? "bg-white/10 text-white font-medium"
                            : "bg-primary/10 text-primary font-medium"
                          : theme === "dark"
                            ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
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
                            ? "bg-white/10 text-white font-medium"
                            : "bg-primary/10 text-primary font-medium"
                          : theme === "dark"
                            ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
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
          <button
            type="button"
            onClick={onStop}
            className="w-8 h-8 min-w-8 rounded-full bg-linear-to-r from-red-500 to-rose-600 flex items-center justify-center text-white cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-md animate-pulse mb-0.5"
            title="Stop generation"
          >
            <FaSquare size={11} />
          </button>
        ) : prompt.trim() || mediaFile ? (
          <button
            type="submit"
            className="w-8 h-8 min-w-8 rounded-full bg-linear-to-r from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-md mb-0.5"
            title="Send message"
          >
            <IoSend size={14} className="translate-x-px" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-all mb-0.5
            ${
              isRecording
                ? "text-white animate-pulse bg-linear-to-r from-[#00E5FF] to-[#0096FF]"
                : "text-gray-500 dark:text-zinc-400 hover:text-primary dark:hover:text-white"
            }`}
          >
            <FaMicrophone size={16} />
          </button>
        )}
      </form>

      <Camera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        theme={theme}
      />
    </div>
  );
};

export default Chatbot;
