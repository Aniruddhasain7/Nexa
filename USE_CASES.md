# Nexa AI Assistant - Use Case Diagram

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

## Description of Actors & Systems
* **User**: An authenticated user of the application navigating their personal chats and creations.
* **Guest User**: An unauthenticated user whose primary capability is signing up or logging in.
* **Gemini AI**: Google's LLM responsible for intelligent chat replies and generating images based on textual prompts.
* **ImageKit CDN**: The external media host responsible for storing AI-generated assets and serving them efficiently on the community feed.
* **MongoDB**: The primary database storing user profiles, hashed passwords, chat histories, and community image metadata.
