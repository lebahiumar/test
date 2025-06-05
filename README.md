
# 🚀 A4F Web Playground - Next-Gen AI Interaction Platform

Welcome to the A4F Web Playground, a versatile and feature-rich AI interaction platform designed for exploring diverse AI capabilities. Built with a modern tech stack, it offers a seamless and customizable experience for chat, search, code assistance, image generation, and more.

---

## ✨ Features

-  multimodal **AI Chat**: Engage in rich conversations with various AI models.
- 🎨 **Image Generation**: Create images from textual prompts using supported models.
- 🎤 **Speech-to-Text**: Dictate your prompts using the integrated microphone button.
- 🔊 **Text-to-Speech**: Listen to assistant responses with browser-based or ElevenLabs voices.
- 📎 **File Attachments**: Attach images to your prompts when using vision-capable models.
- 🛠️ **Prompt Editing**: Modify your sent prompts and regenerate responses.
- 🧠 **Multiple AI Groups**:
    -   **Chat**: General conversational AI.
    -   **Coder**: AI-powered coding assistance (write, debug, explain code with Python execution).
    -   **Web Search**: AI-enhanced web searches (requires Tavily API key).
    -   **Buddy**: Personal memory and note-taking assistant.
    -   **Academic Search**: Find scholarly articles.
    -   **YouTube Search**: Transform YouTube results into tutorial guides.
- 📝 **System Prompt**: Define custom system-level instructions for the AI.
- ⚙️ **Model Selection**: Choose from a variety of available AI models based on your plan.
- 📊 **Account Dashboard**: View detailed account information, usage statistics, and plan details.
- 🔑 **API Key Management**: Securely manage API keys for A4F, Tavily, and ElevenLabs.
- 🎨 **Customization Hub**:
    -   Toggle core features like chat history, TTS, STT, system prompt, and attachment buttons.
    -   Enable/disable specific AI interaction groups.
    -   Configure TTS providers (Browser/ElevenLabs) and speed.
- 📜 **Chat History**:
    -   View, load, and delete past conversations.
    -   Export individual chats to JSON.
    -   Clear all chat history.
- 💡 **Thinking Steps**: See the AI's thought process (when provided by the model).
- 🚀 **Speed Insights**: View token counts and inference times for assistant messages.
- 📱 **Responsive UI**: Optimized for both desktop and mobile devices.
- 🌓 **Theme Toggle**: Switch between light and dark modes.
- 🛡️ **Type Safety**: Built with TypeScript for robust and maintainable code.
- 📦 **PWA Ready**: Includes a manifest for Progressive Web App capabilities.

---

## 🛠️ Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **UI Library**: React
-   **Styling**: Tailwind CSS
-   **UI Components**: ShadCN UI
-   **State Management**: React Hooks & Context API
-   **Animations**: Framer Motion
-   **AI Backend**: A4F API (and others via user-provided keys)

---

## 🏁 Getting Started

### ⚙️ Prerequisites

-   [Node.js](https://nodejs.org/) (v18+ recommended)
-   npm or yarn

### 📦 Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd a4f-web-playground
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Configure environment variables (optional, for default API keys):
    Create a `.env.local` file in the root directory. You can set a default ElevenLabs API key if desired:
    ```env
    ELEVENLABS_API_KEY=your_elevenlabs_api_key_if_any
    ```
    *Note: Main API keys (A4F, Tavily) are managed through the UI settings for user convenience.*

4.  Launch the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Access the playground at [http://localhost:3000](http://localhost:3000).

### 🏗️ Building for Production

```bash
npm run build
npm start
```

---

## 🧑‍💻 Usage Guide

1.  **API Key Setup**:
    *   On first launch, or via the **Settings** (cog icon) > **API Keys** tab, enter your A4F API key. This is required for most functionalities.
    *   Optionally, add your Tavily API key for Web Search and your ElevenLabs API key for premium TTS voices.
2.  **Select an AI Group**: Use the group selector (e.g., Chat, Coder, Web) at the bottom of the input form to choose the desired AI interaction mode.
3.  **Choose a Model**: Select an AI model from the dropdown next to the group selector. Models are filtered by your current plan (Free/Pro).
4.  **Chatting**:
    *   Type your prompt in the main input area.
    *   Optionally, use the microphone button for speech-to-text.
    *   Optionally, set a System Prompt using the dedicated button.
    *   Attach images (if the model supports vision and attachments are enabled).
    *   Click "Send" or press Enter.
5.  **Interaction**:
    *   Use buttons under assistant messages to copy, like/dislike, or listen (TTS).
    *   Use the pencil icon under your messages to edit prompts.
    *   View thinking steps or speed insights if available.
6.  **Chat History**: Access via the history icon in the navbar to load, delete, or export past chats.
7.  **Customization**: Click the Settings (cog) icon, then the "Customize" tab to:
    *   Enable/disable UI features (history, TTS button, STT button, system prompt button, attachment button).
    *   Manage which AI Groups are visible in the selector.
    *   Configure Text-to-Speech provider and speed.

---

## 🗂️ Project Structure Overview

```
app/
├── (page-components)/    # Components specific to the main page layout
├── (page-hooks)/         # Custom hooks for page logic (chat, API, scroll)
│   └── chat-logic/       # Sub-hooks for chat stream, API, core state
├── (page-config)/        # Configuration files (e.g., fallback models)
├── actions.ts            # Next.js Server Actions (e.g., TTS, group configs)
├── globals.css           # Global styles and Tailwind theme
├── layout.tsx            # Root layout
├── page.tsx              # Main page component
└── providers.tsx         # Global context providers (e.g., ThemeProvider)
components/
├── ui/                   # Reusable ShadCN UI components & custom form elements
├── api-keys/             # Components for API key management dialogs
├── core/                 # Core reusable UI elements (TextMorph, etc.)
└── (specific components) # AccountDialog, Messages, MarkdownRenderer, etc.
hooks/                    # General reusable custom hooks (useLocalStorage, useApiKey, etc.)
lib/                      # Utility functions, type definitions
public/                   # Static assets (images, icons)
```

---

## 🔌 API Integrations

-   **A4F API**: Core backend for AI model access, account management. Requires an A4F API key.
-   **Tavily API**: Powers the "Web Search" group. Requires a user-provided Tavily API key.
-   **ElevenLabs API**: Used for premium Text-to-Speech voices if configured. Requires a user-provided ElevenLabs API key.

---

## 🎨 Customization

The playground offers extensive customization through the **Settings > Customize** tab:

-   **Feature Toggles**: Enable/disable Chat History, Text-to-Speech button, System Prompt button, Attachment button, and Speech-to-Text button.
-   **Group Visibility**: Choose which AI interaction groups (Web, Coder, Chat, etc.) appear in the selector.
-   **Text-to-Speech**: Select between browser-based TTS or ElevenLabs (if API key provided), and adjust playback speed.

---

## 📝 Development Notes

-   The application uses Next.js Server Actions for operations like generating speech and fetching group configurations.
-   State is primarily managed using React Hooks and Context, with `useLocalStorage` for persistence of user preferences and API keys.
-   The `useChatLogic` hook is central to the main page's functionality, orchestrating API calls, state updates, and user interactions.
-   ShadCN UI components are used extensively, with custom styling applied via Tailwind CSS and `globals.css`.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details (if one is present).

---

## 🙏 Credits

-   Built by the A4F team.
-   Leverages the power of Next.js, React, ShadCN UI, and Tailwind CSS.
-   Thanks to the creators of `lucide-react` and other open-source libraries used.

---

> _Happy Hacking!_ 🎉
