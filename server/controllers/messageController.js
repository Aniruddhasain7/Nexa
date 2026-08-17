import axios from "axios";
import Chat from "../models/Chat.js";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const getMedType = (mime) => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || mime.endsWith("/pdf")) return "pdf";
  return "file";
};

export const textMessageController = async (req, res) => {
  let clientDisconnected = false;
  req.on("close", () => {
    clientDisconnected = true;
  });

  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (clientDisconnected) return;

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
    if (chat.name === "New Chat") {
      chat.name = prompt.slice(0, 30);
    }

    const reply = {
      role: "assistant",
      content: choices[0].message.content,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    return res.json({ success: true, reply });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
    if (chat.name === "New Chat") {
      chat.name = prompt.slice(0, 30);
    }

    const encodedPrompt = encodeURIComponent(prompt);

    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/nexa/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary",
    ).toString("base64")}`;

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "nexa",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);
    await chat.save();

    return res.json({ success: true, reply });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const uploadMediaController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;
    const file = req.file;

    if (!file) return res.json({ success: false, message: "No file uploaded" });

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.json({ success: false, message: "Chat not found" });

    const medType = getMedType(file.mimetype);
    const base64File = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: `${Date.now()}_${file.originalname}`,
      folder: "nexa/uploads",
    });

    const mediaUrl = uploadResponse.url;
    const userContent =
      prompt?.trim() ||
      (medType === "image"
        ? "Analyze this image"
        : medType === "pdf"
          ? "Analyze this PDF document"
          : "Describe this file");

    const userMessage = {
      role: "user",
      content: userContent,
      timestamp: Date.now(),
      isImage: false,
      mediaUrl,
      mediaType: medType,
    };
    chat.messages.push(userMessage);
    if (chat.name === "New Chat") chat.name = userContent.slice(0, 30);

    let aiMessages;
    if (medType === "image") {
      aiMessages = [
        {
          role: "user",
          content: [
            { type: "text", text: userContent },
            { type: "image_url", image_url: { url: mediaUrl } },
          ],
        },
      ];
    } else if (medType === "pdf") {
      let pdfText = "";
      let numPages = 1;
      try {
        const parsed = await pdfParse(file.buffer);
        pdfText = parsed.text ? parsed.text.trim() : "";
        numPages = parsed.numpages || 1;
      } catch (err) {
        console.error("PDF parse error:", err.message);
      }

      const pdfContext = pdfText
        ? `[Attached PDF Document: "${file.originalname}" (${numPages} page${numPages > 1 ? "s" : ""})]\n\nExtracted Text Content:\n${pdfText.slice(0, 15000)}`
        : `[Attached PDF Document: "${file.originalname}" (${numPages} page${numPages > 1 ? "s" : ""})]\n\nNote: No text could be automatically extracted from this PDF document (it may contain scanned image pages).`;

      aiMessages = [
        {
          role: "user",
          content: `${userContent}\n\n${pdfContext}`,
        },
      ];
    } else if (medType === "file" && file.mimetype === "text/plain") {
      const textContent = file.buffer.toString("utf-8");
      aiMessages = [
        {
          role: "user",
          content: `${userContent}\n\nFile contents:\n${textContent.slice(0, 10000)}`,
        },
      ];
    } else {
      aiMessages = [
        {
          role: "user",
          content: `${userContent}\n\nThe user has also attached a ${medType} file: ${mediaUrl}`,
        },
      ];
    }

    const { choices } = await openai.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: aiMessages,
    });

    const reply = {
      role: "assistant",
      content: choices[0].message.content,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    return res.json({ success: true, reply, mediaUrl, mediaType: medType });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
