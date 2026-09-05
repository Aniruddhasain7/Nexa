import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import { FaFilePdf, FaUser } from "react-icons/fa";

const MediaAttachment = ({ mediaUrl, mediaType, isLocal }) => {
  if (!mediaUrl) return null;

  if (mediaType === "image") {
    return (
      <img
        src={mediaUrl}
        alt="attachment"
        className={`max-w-xs rounded-xl mt-1 border border-primary/20 shadow
          ${isLocal ? "opacity-70" : "opacity-100"} transition-opacity`}
      />
    );
  }

  if (mediaType === "pdf") {
    return (
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 mt-1 px-3.5 py-2.5 rounded-xl
          bg-red-500/10 dark:bg-red-950/30 border border-red-500/30
          text-xs text-red-500 hover:bg-red-500/20 transition-all w-fit shadow-xs
          ${isLocal ? "opacity-70" : "opacity-100"}`}
      >
        <FaFilePdf className="text-base text-red-500 shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-red-500">PDF Document</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 underline underline-offset-2">
            Click to view document
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl
        bg-primary/10 dark:bg-[#27272a]/70 border border-primary/20 dark:border-white/10
        text-xs text-primary dark:text-cyan-300 hover:opacity-80 transition-opacity w-fit"
    >
      <span>📎</span>
      <span className="underline underline-offset-2">View attached file</span>
    </a>
  );
};

const Message = ({ message }) => {
  const { user } = useAppContext();
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  const isLocal = message._isLocal;

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <div className="flex flex-col gap-1 p-3 px-4 bg-sky-50/90 border border-sky-200/80 dark:border-0 dark:bg-[#1f2430] dark:backdrop-blur-md shadow-xs dark:shadow-md dark:shadow-black/30 rounded-2xl max-w-2xl">
            <MediaAttachment
              mediaUrl={message.mediaUrl}
              mediaType={message.mediaType}
              isLocal={isLocal}
            />

            {message.content && (
              <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap wrap-break-word first-letter:uppercase">
                {message.content}
              </p>
            )}

            <span className="text-xs text-sky-700/60 dark:text-slate-400 mt-0.5">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          {user ? (
            <div className="w-8 h-8 min-w-8 rounded-full bg-linear-to-r from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white text-xs font-semibold">
              {user.name.charAt(0)}
            </div>
          ) : (
            <div className="w-8 h-8 min-w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <FaUser size={13} />
            </div>
          )}
        </div>
      ) : (
        <div
          className="inline-flex flex-col gap-2 p-3 px-4 max-w-2xl bg-gray-100/90 border border-gray-200/90
          dark:border-0 dark:bg-[#121214]/95 dark:backdrop-blur-md shadow-xs dark:shadow-md dark:shadow-black/50 rounded-2xl my-4"
        >
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-xl"
            />
          ) : (
            <div className="text-sm text-gray-900 dark:text-zinc-200 reset-tw leading-relaxed">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;
