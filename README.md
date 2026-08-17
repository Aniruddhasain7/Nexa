# 🚀 Nexa — Intelligent AI Assistant

<p align="center">
  <img src="./assets/ss1.png" alt="Nexa" width="100%" style="border-radius: 12px;" />
</p>

Nexa is a **full-stack AI-powered chatbot application** that enables seamless interaction with advanced AI models. Chat via text or voice, perform multimodal analysis on images, PDF documents, text files, and videos, generate stunning images from natural language prompts, and share your creations with a global community.

Built with the **MERN Stack** (React 19, Express.js 5, Node.js, MongoDB), **Gemini 3.5 Flash**, **ImageKit CDN**, and **Tailwind CSS v4**, Nexa delivers instant, natural conversations with a premium dark-themed UI.

---

## 🌟 Features

### 💬 AI Chat

- Real-time chatbot powered by **Gemini AI** (`gemini-3.5-flash`) via OpenAI-compatible SDK
- Context-aware, multi-turn conversations
- Persistent chat session history saved per user account

### 🖼️ AI Image Generation & Community Feed

- Generate AI images using ImageKit's dynamic AI Image Generation API
- Publish creations to the community feed with a single click
- High-performance media storage & delivery via **ImageKit CDN**

### 🔐 Multi-Method Authentication

- Secure **JWT-based** email/password authentication
- **Google Sign-In** integration via Firebase OAuth
- Password hashing with **bcryptjs**

### 🎙️ Voice Input

- Hands-free speech-to-text prompt input using microphone integration
- Pulsing visual indicator active during speech capture
- Powered natively by the **Web Speech API** (`SpeechRecognition`)

### 📤 Multimodal Media & File Analysis

- 📷 **Image Analysis**: Upload images (`.jpeg`, `.png`, `.gif`, `.webp`, `.svg`) for visual AI context & processing via **Gemini Vision**.
- 📄 **PDF Document Analysis**: Upload **PDF (`.pdf`)** files for serverless-safe text extraction using **`unpdf`**, multi-page parsing, and AI summarization/Q&A.
- 📝 **Plain Text Documents**: Upload `.txt` files with automated context injection into AI prompts.
- 🎥 **Video File Support**: Upload videos (`.mp4`, `.webm`, `.ogg`) viewable directly in chat with media URL awareness.
- ⚡ **20 MB File Limit**: Enforced server-side in-memory upload limit via Multer middleware.

### 🎨 Modern UI / UX

- Sleek modern dark theme with responsive layout for desktop and mobile devices
- Dynamic markdown output rendering with syntax highlighting via **PrismJS**
- **Text / Image mode switcher** — seamlessly toggles between chat and image generation modes directly from the input bar

---

## 🏗️ System Architecture & Data Flow

Nexa follows a **3-Tier Full-Stack Microservices Architecture** separating client-side rendering, server-side API orchestration, and external AI/cloud storage infrastructure.

```mermaid
flowchart TD
    %% ── Tier 1: Client Layer ──────────────────────────────
    subgraph Tier1 ["🎨 Client Layer (Frontend - React 19 + Vite)"]
        direction TB
        UI["User Interface (Tailwind CSS v4)"]
        ChatUI["💬 Chat & Voice Interface"]
        ImageUI["🖼️ Image Generation & Feed"]
        AuthUI["🔐 Auth Form & Google OAuth"]
        AxiosClient["📡 Axios HTTP Client / API Service"]
        FirebaseSDK["🔥 Firebase Auth SDK"]
    end

    %% ── Tier 2: Server Layer ──────────────────────────────
    subgraph Tier2 ["⚙️ Application Layer (Backend API - Express.js 5 / Node.js / Vercel Serverless)"]
        direction TB
        Server["🚀 Express Server (server.js / api/index.js)"]
        AuthMW["🔒 Auth Middleware (JWT Verification)"]
        MulterMW["📁 Multer Middleware (Media & PDF Upload)"]

        subgraph Controllers ["Controllers & Route Handlers"]
            UserCtrl["userController.js\n(Auth & Community Feed)"]
            ChatCtrl["chatController.js\n(Chat Sessions Management)"]
            MsgCtrl["messageController.js\n(Text, Image Gen, Vision & PDF Parsing)"]
        end
    end

    %% ── Tier 3: Data & Cloud Layer ────────────────────────
    subgraph Tier3 ["🍃 Data & External Services Layer"]
        direction TB
        MongoDB[("🍃 MongoDB Database\n(Users & Chat History)")]
        GeminiAI["🧠 Gemini AI API\n(gemini-3.5-flash Model)"]
        ImageKit["🖼️ ImageKit CDN & AI Gen\n(Media Uploads & AI Image Prompting)"]
        FirebaseAuth["🔥 Firebase OAuth Service"]
        PdfParser["📄 unpdf Engine\n(Serverless PDF Text Extraction)"]
    end

    %% ── Connections: Client -> Server ──────────────────────
    AuthUI -->|"Google Login"| FirebaseSDK
    FirebaseSDK -->|"Return Identity Token"| AuthUI
    AuthUI -->|"POST /api/user/google"| AxiosClient

    ChatUI -->|"POST /api/message/text"| AxiosClient
    ChatUI -->|"POST /api/message/upload-media"| AxiosClient
    ImageUI -->|"POST /api/message/image"| AxiosClient
    ImageUI -->|"POST /api/user/published-images"| AxiosClient

    AxiosClient -->|"HTTP Requests + Bearer JWT"| Server

    %% ── Connections: Server Internal Processing ──────────
    Server --> AuthMW
    AuthMW --> Controllers
    MulterMW --> MsgCtrl
    MsgCtrl -->|"Extract PDF Text"| PdfParser

    %% ── Connections: Server -> Data & Services ───────────
    UserCtrl -->|"Validate / Issue JWT & Query Feed"| MongoDB
    UserCtrl -.->|"Verify Token"| FirebaseAuth

    ChatCtrl -->|"CRUD Chat Documents"| MongoDB

    MsgCtrl -->|"1. Process LLM / Vision / PDF Context"| GeminiAI
    MsgCtrl -->|"2. Fetch/Upload Media & Generate AI Images"| ImageKit
    MsgCtrl -->|"3. Save Message History & Media URLs"| MongoDB

    %% ── Styles ──────────────────────────────────────────
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef server fill:#0f172a,stroke:#a855f7,stroke-width:2px,color:#fff
    classDef external fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff

    class UI,ChatUI,ImageUI,AuthUI,AxiosClient,FirebaseSDK client
    class Server,AuthMW,MulterMW,UserCtrl,ChatCtrl,MsgCtrl server
    class MongoDB,GeminiAI,ImageKit,FirebaseAuth,PdfParser external
```

### 🎭 Component Responsibilities

| Tier                   | Component                           | Description & Responsibilities                                                                                                                                                  |
| :--------------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Client Layer**       | **React 19 Frontend**               | SPA built with Vite & Tailwind CSS v4. Handles user sessions, Web Speech voice recognition, markdown rendering with syntax highlighting, and media uploads.                     |
|                        | **Firebase Client SDK**             | Manages Google OAuth popups and extracts ID tokens for backend authentication.                                                                                                  |
| **Application Layer**  | **Express API Gateway**             | Central Node.js server handling route dispatching (`/api/user`, `/api/chat`, `/api/message`), CORS, and environment configuration. Compatible with Vercel serverless functions. |
|                        | **Auth Middleware (`auth.js`)**     | Validates Bearer JWT tokens on protected routes and attaches the authenticated user instance to `req.user`.                                                                     |
|                        | **Multer Middleware (`upload.js`)** | Intercepts multipart file uploads in memory (images, PDFs, text, videos) up to 20MB.                                                                                            |
|                        | **Message Controller**              | Orchestrates text LLM completions with Gemini AI, generates AI art via ImageKit, processes vision payloads, and parses PDF documents using `unpdf`.                             |
| **Data & Cloud Layer** | **MongoDB (Mongoose)**              | Stores user profile data, hashed credentials, structured chat sessions, and message logs.                                                                                       |
|                        | **Gemini AI API**                   | Generates response completions and analyzes visual/document context using the `gemini-3.5-flash` model.                                                                         |
|                        | **ImageKit CDN**                    | Executes dynamic AI image generation prompts, stores uploaded media assets, and delivers optimized CDN media.                                                                   |
|                        | **`unpdf` Engine**                  | Serverless-safe text extraction and metadata extraction from uploaded PDF buffers without native OS dependencies.                                                               |

---

### 🔄 Detailed Technical Data Flows

#### 1. 💬 AI Text Chat Flow

1. **User** submits a prompt in the React Chat Interface.
2. **Axios Client** sends a `POST /api/message/text` request containing `chatId` and `prompt` along with the JWT `Authorization` header.
3. **Auth Middleware** verifies the JWT and attaches `req.user`.
4. **Message Controller** sends the user prompt to Gemini AI (`gemini-3.5-flash`) via the OpenAI SDK wrapper.
5. **Express Backend** saves user and assistant message objects into the MongoDB `Chat` document and returns the AI reply.

#### 2. 🖼️ AI Image Generation Flow

1. **User** switches to Image Generation mode and inputs a descriptive prompt.
2. **Axios Client** posts to `/api/message/image`.
3. **Backend** constructs a dynamic ImageKit prompt URL (`ik-genimg-prompt-[prompt]`).
4. **Backend Server** fetches the generated image buffer, converts it to base64, and uploads it to ImageKit CDN under the `nexa/` folder.
5. **ImageKit** returns a CDN-hosted URL, which the backend saves to MongoDB and returns to the client.

#### 3. 📤 Multimodal Media & PDF Document Analysis Flow

1. **User** uploads an image, PDF document, text file, or video alongside an optional prompt.
2. **Multer Middleware** parses the multipart file into `req.file.buffer`.
3. **Backend Server** uploads the file to ImageKit (`nexa/uploads`) to secure a permanent CDN media URL.
4. **Context Processing**:
   - **Images**: Formats a vision payload array containing image URL and prompt.
   - **PDFs**: Parses `file.buffer` using `unpdf`, extracts document text and page count, and injects up to 15,000 characters of text into the Gemini prompt.
   - **Text Files**: Reads UTF-8 contents directly from `file.buffer` and appends up to 10,000 characters to the prompt.
   - **Videos & Others**: Injects media URL context into the Gemini prompt.
5. **Gemini AI** processes the multimodal request and returns a detailed completion, stored in MongoDB and returned to the client interface.

---

## 🔌 API Reference

### 👤 User & Auth Routes (`/api/user`)

| Method | Endpoint                     | Auth     | Description                                            |
| :----- | :--------------------------- | :------- | :----------------------------------------------------- |
| `POST` | `/api/user/register`         | Public   | Register a new user with name, email, and password     |
| `POST` | `/api/user/login`            | Public   | Authenticate user and return JWT token                 |
| `POST` | `/api/user/google`           | Public   | Authenticate or sign up user via Firebase Google OAuth |
| `POST` | `/api/user/data`             | Required | Retrieve current authenticated user details            |
| `POST` | `/api/user/published-images` | Public   | Fetch all community-published AI generated images      |

### 💬 Chat Routes (`/api/chat`)

| Method | Endpoint           | Auth     | Description                                       |
| :----- | :----------------- | :------- | :------------------------------------------------ |
| `GET`  | `/api/chat/create` | Required | Create a new chat session for the logged-in user  |
| `GET`  | `/api/chat/get`    | Required | Retrieve all chat sessions for the logged-in user |
| `POST` | `/api/chat/delete` | Required | Delete a specific chat session by `chatId`        |

### ✉️ Message Routes (`/api/message`)

| Method | Endpoint                    | Auth     | Description                                                    |
| :----- | :-------------------------- | :------- | :------------------------------------------------------------- |
| `POST` | `/api/message/text`         | Required | Send a text prompt to Gemini AI                                |
| `POST` | `/api/message/image`        | Required | Generate an AI image via ImageKit dynamic prompt               |
| `POST` | `/api/message/upload-media` | Required | Upload and analyze an image, PDF document, text file, or video |

---

## 🛠️ Tech Stack

### 🎨 Frontend

| Category             | Technology                   |
| :------------------- | :--------------------------- |
| **Framework**        | React 19 (Vite)              |
| **Styling**          | Tailwind CSS v4              |
| **Routing**          | React Router DOM v7          |
| **HTTP Client**      | Axios                        |
| **Auth Client**      | Firebase (Google OAuth)      |
| **UI Components**    | React Hot Toast, React Icons |
| **Markdown Parsing** | `react-markdown`, `prismjs`  |
| **Date Formatting**  | Moment.js                    |

### ⚙️ Backend

| Category                | Technology                                   |
| :---------------------- | :------------------------------------------- |
| **Runtime Environment** | Node.js (ES Modules)                         |
| **Framework**           | Express.js v5                                |
| **Database**            | MongoDB (Mongoose v9)                        |
| **Authentication**      | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **File Handling**       | Multer                                       |
| **PDF Parsing**         | `unpdf` (Serverless-Safe WASM parser)        |
| **AI Integration**      | OpenAI Node SDK (pointing to Gemini API)     |
| **HTTP Client**         | Axios                                        |

### 🧠 External Integrations

| Service           | Purpose                                                                     |
| :---------------- | :-------------------------------------------------------------------------- |
| **Gemini AI API** | Multimodal LLM text completions & image vision context (`gemini-3.5-flash`) |
| **ImageKit CDN**  | Dynamic AI image prompt rendering & media file storage                      |
| **Firebase Auth** | Google OAuth authentication identity verification                           |

---

## 📁 Project Structure

```
Nexa/
├── assets/                  # Application screenshots & assets
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── assets/          # Static UI icons & images
│   │   ├── components/      # UI components (ChatBox, Sidebar, Message, Input, etc.)
│   │   ├── config/          # Firebase initialization
│   │   ├── context/         # React Context state management (AppContext.jsx)
│   │   ├── pages/           # Application pages (Chat, Community, Login, Loading)
│   │   ├── App.jsx          # Root component & routing
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── package.json
│   ├── vercel.json          # Vercel SPA client rewrite configuration
│   └── vite.config.js
│
├── server/                  # Node.js backend
│   ├── api/
│   │   └── index.js         # Vercel serverless function entry point
│   ├── configs/             # MongoDB, ImageKit & OpenAI SDK configs
│   ├── controllers/         # userController, chatController, messageController
│   ├── middlewares/         # auth.js (JWT verify), upload.js (Multer)
│   ├── models/              # User.js, Chat.js Mongoose schemas
│   ├── routes/              # userRoutes, chatRoutes, messageRoutes
│   ├── server.js            # Express application entry point
│   ├── vercel.json          # Vercel backend rewrite configuration
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started

Follow these instructions to set up and run Nexa locally on your environment.

### 📋 Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Git](https://git-scm.com/)

---

### 🔧 Installation & Environment Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Aniruddhasain7/Nexa.git
cd Nexa
```

#### 2. Backend Setup (`server/`)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server/` root directory:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```

#### 3. Frontend Setup (`client/`)

1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `client/` root directory:
   ```env
   VITE_SERVER_URL=http://localhost:3000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

---

### 🏃 Running the Application Locally

#### Start Backend Server

From the `server/` directory:

```bash
# Development mode with live reload (nodemon)
npm run server

# Production mode
npm start
```

#### Start Frontend Development Server

From the `client/` directory:

```bash
# Start Vite development server
npm run dev

# Build for production
npm run build

# Preview local production build
npm run preview
```

Once running:

- Backend API listener: `http://localhost:3000`
- Frontend UI interface: `http://localhost:5173`

---

## 🔮 Future Roadmap

- ⚡ **Real-time SSE Streaming** — Server-Sent Events for word-by-word streaming AI responses
- 🧠 **RAG System** — Vector database integration (Pinecone/Chroma) for long-term document memory & retrieval
- 💬 **Social Interactions** — Likes, comments, and tags on Community Feed art
- 🔗 **Public Chat Links** — Generate shareable web links for conversation transcripts
- 📱 **Mobile App** — Native Android & iOS application using React Native
