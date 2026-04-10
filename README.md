# 🚀 Nexa — Intelligent AI Assistant

<p align="center">
  <img src="./assets/ss1.png" alt="Nexa - Home Page" width="100%" style="border-radius: 12px;" />
</p>

Nexa is a **full-stack AI-powered chatbot application** that lets users chat with an AI, generate stunning images from prompts, and explore a community feed of AI-generated creations.

Built with the **MERN Stack + Gemini AI + ImageKit**, Nexa delivers a modern, ChatGPT-like experience with a sleek UI and powerful backend.

---

## 📸 Screenshots

<p align="center">
  <img src="./assets/ss2.png" alt="Nexa - Login Page" width="400" />
  <img src="./assets/ss1.png" alt="Nexa - Home Page" width="400" />
  <img src="./assets/ss3.png" alt="Nexa - Chat Page" width="400" />
</p>

---

## 🌟 Features

### 💬 AI Chat

- Real-time chatbot powered by **Gemini AI**
- Context-aware, multi-turn conversations
- Chat history saved per user account

### 🖼️ Image Generation

- Generate AI images using natural language prompts
- Publish images to the community with one click
- Images stored and served via **ImageKit CDN**

### 🌍 Community Feed

- Browse publicly shared AI-generated images
- Explore and get inspired by other users' creations

### 🔐 Authentication

- Secure **JWT-based** login & signup
- Password hashing with **bcrypt**
- Protected routes on both frontend and backend

### 🎙️ Voice Input

- Speak your prompts with a single click using the microphone button
- Pulsing animated UI indicator while active
- Automatically sends the recorded message when you finish speaking
- Powered by the **Web Speech API** (SpeechRecognition)
- Graceful fallback with error toast for unsupported browsers

### 🎨 UI/UX

- Modern dark-themed design
- Fully responsive layout
- Smooth chat experience with markdown rendering & syntax highlighting

---

## Use Case Diagram

Here is a comprehensive Use Case Diagram for the Nexa Application, detailing the interactions between the User, the system's core features, and its external integrations (Gemini AI & ImageKit).

```mermaid
flowchart LR
    %% Actors
    User([🧍 User])
    Guest([👤 Guest User])
    Gemini[[🧠 Gemini AI]]
    ImageKit[[🖼️ ImageKit CDN]]
    DB[(🍃 MongoDB)]

    %% System Boundary
    subgraph Nexa Application
        %% Auth
        UC_Auth(Login / Signup)

        %% Chat & Voice
        UC_Chat(Chat via Text)
        UC_Voice(Chat via Voice Input)
        UC_History(View Chat History)

        %% Image Generation & Community
        UC_GenImage(Generate AI Image)
        UC_PubImage(Publish to Community)
        UC_Feed(Browse Community Feed)
    end

    %% Guest Interactions
    Guest -->|Registers/Logs in| UC_Auth

    %% User Interactions
    User -->|Sends Message| UC_Chat
    User -->|Speaks Prompt| UC_Voice
    User -->|Loads Previous Sessions| UC_History
    User -->|Prompts for Image| UC_GenImage
    User -->|Shares Creation| UC_PubImage
    User -->|Explores Creations| UC_Feed

    %% Authentication Flow
    UC_Auth -->|Authenticates| User
    UC_Auth -.->|Validates/Creates User| DB

    %% Internal Dependencies
    UC_Chat -.->|Uses| Gemini
    UC_Voice -.->|Uses| Gemini
    UC_GenImage -.->|Uses| Gemini

    UC_GenImage -.->|Uploads & Serves| ImageKit
    UC_PubImage -.->|Uploads & Serves| ImageKit
    UC_Feed -.->|Serves Images| ImageKit

    UC_Chat -.->|Saves to| DB
    UC_History -.->|Reads from| DB
    UC_PubImage -.->|Saves post to| DB
    UC_Feed -.->|Reads posts from| DB

    %% Styling
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000;
    classDef external fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000;
    classDef usecase fill:#ffffff,stroke:#4caf50,stroke-width:2px,color:#000;
    classDef db fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000;

    class User,Guest actor;
    class Gemini,ImageKit external;
    class DB db;
    class UC_Auth,UC_Chat,UC_Voice,UC_History,UC_GenImage,UC_PubImage,UC_Feed usecase;
```

### Description of Actors & Systems

- **User**: An authenticated user of the application navigating their personal chats and creations.
- **Guest User**: An unauthenticated user whose primary capability is signing up or logging in.
- **Gemini AI**: Google's LLM responsible for intelligent chat replies and generating images based on textual prompts.
- **ImageKit CDN**: The external media host responsible for storing AI-generated assets and serving them efficiently on the community feed.
- **MongoDB**: The primary database storing user profiles, hashed passwords, chat histories, and community image metadata.

---

## 🛠️ Tech Stack

| Layer             | Technology                             |
| ----------------- | -------------------------------------- |
| **Frontend**      | React 19 (Vite), Tailwind CSS v4       |
| **Routing**       | React Router DOM v7                    |
| **HTTP Client**   | Axios                                  |
| **Markdown**      | react-markdown, PrismJS                |
| **Notifications** | React Hot Toast                        |
| **Backend**       | Node.js, Express.js v5                 |
| **Database**      | MongoDB (Mongoose)                     |
| **Auth**          | JWT, bcryptjs                          |
| **AI**            | Gemini API (via OpenAI-compatible SDK) |
| **Media/CDN**     | ImageKit                               |

---

## 📁 Project Structure

```
Nexa/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── configs/             # DB & ImageKit config
│   ├── controllers/         # Route logic
│   ├── middlewares/         # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── server.js            # Entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (Atlas or local)
- **Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)
- **ImageKit account** — [Sign up here](https://imagekit.io/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Aniruddhasain7/Nexa.git
cd Nexa
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
JWT_SECRET=your_jwt_secret_key

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>

GEMINI_API_KEY=your_gemini_api_key

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

Start the backend server:

```bash

npm run server


npm start
```

The backend runs on **http://localhost:3000** by default.

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file inside the `client/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend runs on **http://localhost:5173** by default.

---

## 🌐 Deployment

Both `client/` and `server/` include a `vercel.json` for easy deployment on **Vercel**.

- Deploy the `server/` as a **Vercel Serverless Function**
- Deploy the `client/` as a **Vercel Static Site**
- Set all environment variables in the Vercel dashboard

---

## 🔮 Future Improvements

- 🔥 Real-time streaming AI responses
- 🧠 Better AI memory using RAG (Retrieval-Augmented Generation)
- 📱 Enhanced mobile optimization
- 📤 Share individual chats and images
