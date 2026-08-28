import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaTimes,
  FaRedo,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { IoCameraReverseOutline } from "react-icons/io5";
import { RiCameraLensLine } from "react-icons/ri";
import { LuFlipHorizontal } from "react-icons/lu";

const Camera = ({ isOpen, onClose, onCapture, theme = "dark" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const [facingMode, setFacingMode] = useState("user");
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isMirrored, setIsMirrored] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [useTimer, setUseTimer] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setIsLoading(true);
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported on this browser or connection.");
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : {
              facingMode: facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(videoInputs);
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      let errorMsg = "Unable to access camera. Please allow camera permissions.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera permission was denied. Please allow camera access in your browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No camera hardware detected on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "Camera is currently in use by another application.";
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  }, [facingMode, selectedDeviceId, stopStream]);

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen, capturedPhoto, startCamera, stopStream]);

  useEffect(() => {
    setIsMirrored(facingMode === "user");
  }, [facingMode]);

  const toggleFacingMode = () => {
    setSelectedDeviceId("");
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCaptureInstant = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (isMirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const fileName = `camera_photo_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        setCapturedPhoto(previewUrl);
        setCapturedFile(file);
        stopStream();
      },
      "image/jpeg",
      0.95
    );
  };

  const handleCapture = () => {
    if (isCountingDown) return;

    if (useTimer) {
      setIsCountingDown(true);
      setCountdown(3);
      let count = 3;

      countdownTimerRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countdownTimerRef.current);
          setIsCountingDown(false);
          handleCaptureInstant();
        }
      }, 1000);
    } else {
      handleCaptureInstant();
    }
  };

  const handleRetake = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setCapturedPhoto(null);
    setCapturedFile(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedFile && capturedPhoto) {
      onCapture(capturedFile, capturedPhoto);
      handleClose(false);
    }
  };

  const handleClose = (revoke = true) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsCountingDown(false);
    stopStream();
    if (revoke && capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setCapturedPhoto(null);
    setCapturedFile(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={() => handleClose(true)}
      />

      <div
        className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col z-10 transition-all ${
          isDark
            ? "bg-[#18181b] border-white/15 text-white shadow-black/80"
            : "bg-white border-primary/20 text-gray-800 shadow-xl"
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? "border-white/10" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-linear-to-tr from-[#00E5FF]/20 to-[#0096FF]/20 text-[#00E5FF]">
              <RiCameraLensLine size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-wide leading-tight">
                {capturedPhoto ? "Photo Preview" : "Live Camera"}
              </h3>
              <p className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                {capturedPhoto
                  ? "Confirm or retake your photo"
                  : "Snap a live photo to analyze with Nexa AI"}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleClose(true)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
            }`}
            title="Close camera"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="relative bg-black aspect-4/3 sm:aspect-16/10 w-full overflow-hidden flex items-center justify-center">
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Live captured snapshot"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover transition-transform ${
                  isMirrored ? "scale-x-[-1]" : ""
                }`}
              />

              {!error && !isLoading && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
                    <div className="w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
                  </div>

                  <div className="self-center w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/80 shadow-[0_0_8px_#00E5FF]" />
                  </div>

                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
                    <div className="w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
                  </div>
                </div>
              )}

              {isCountingDown && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30">
                  <span className="text-7xl font-bold text-white drop-shadow-2xl animate-ping duration-1000">
                    {countdown}
                  </span>
                </div>
              )}

              {isLoading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121214] text-white gap-3 z-20">
                  <div className="w-10 h-10 border-3 border-white/20 border-t-[#00E5FF] rounded-full animate-spin" />
                  <p className="text-sm text-zinc-300 font-medium tracking-wide">
                    Initializing camera...
                  </p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121214] text-white p-6 text-center z-20">
                  <div className="p-3 rounded-full bg-red-500/20 text-red-400 mb-3">
                    <FaExclamationTriangle size={32} />
                  </div>
                  <h4 className="text-base font-semibold mb-1">Camera Unavailable</h4>
                  <p className="text-xs text-zinc-400 max-w-md mb-5 leading-relaxed">
                    {error}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer text-white flex items-center gap-2"
                  >
                    <FaRedo size={12} />
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className={`px-6 py-4 flex items-center justify-between border-t ${
            isDark ? "border-white/10 bg-[#141416]" : "border-gray-100 bg-gray-50/80"
          }`}
        >
          {capturedPhoto ? (
            <div className="w-full flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRetake}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? "bg-white/10 hover:bg-white/15 text-zinc-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <FaRedo size={12} />
                Retake
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-linear-to-r from-[#00E5FF] to-[#0096FF] hover:opacity-95 active:scale-95 shadow-md shadow-[#0096FF]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FaCheck size={12} />
                Use Photo
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseTimer(!useTimer)}
                  disabled={!!error || isLoading}
                  className={`p-2.5 rounded-full transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                    useTimer
                      ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40"
                      : isDark
                        ? "text-zinc-400 hover:text-white hover:bg-white/10"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  title={useTimer ? "Timer: 3s (Active)" : "Enable 3s Timer"}
                >
                  <FaClock size={15} />
                  {useTimer && <span className="text-[11px] font-bold">3s</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMirrored(!isMirrored)}
                  disabled={!!error || isLoading}
                  className={`p-2.5 rounded-full transition-all cursor-pointer text-xs ${
                    isMirrored
                      ? "bg-white/15 text-white"
                      : isDark
                        ? "text-zinc-400 hover:text-white hover:bg-white/10"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  title={isMirrored ? "Mirroring ON" : "Mirroring OFF"}
                >
                  <LuFlipHorizontal size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleCapture}
                disabled={!!error || isLoading || isCountingDown}
                className="relative group p-1 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95"
                title="Take photo"
              >
                <div className="w-16 h-16 rounded-full border-2 border-[#00E5FF]/70 flex items-center justify-center p-1 group-hover:border-[#00E5FF] group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all">
                  <div className="w-full h-full rounded-full bg-linear-to-tr from-[#00E5FF] to-[#0096FF] group-hover:scale-95 transition-transform flex items-center justify-center shadow-md shadow-[#0096FF]/30">
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                {videoDevices.length > 1 ? (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className={`text-xs px-2 py-1.5 rounded-xl border outline-none cursor-pointer ${
                      isDark
                        ? "bg-zinc-800 border-white/10 text-zinc-300"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <option value="">Default Camera</option>
                    {videoDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    disabled={!!error || isLoading}
                    className={`p-2.5 rounded-full transition-all cursor-pointer ${
                      isDark
                        ? "text-zinc-400 hover:text-white hover:bg-white/10"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                    title="Flip camera"
                  >
                    <IoCameraReverseOutline size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
