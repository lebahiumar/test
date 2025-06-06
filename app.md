# App Analysis and Mobile App Prompt

## Website Analysis

This project is a modern, feature-rich chat application frontend built with Next.js and React. It offers advanced AI chat capabilities, customization, chat history, speech-to-text, text-to-speech, and a clean, responsive UI optimized for both desktop and mobile browsers, with a focus on accessibility and user experience.

### Key Features
- **AI Chat**: Chat with multiple AI models (OpenAI, Anthropic, etc.)
- **Customizable Experience**: System prompts, attachments, TTS, STT, and more
- **Chat History**: Save, load, and delete past conversations
- **API Key Management**: Securely manage keys for different providers
- **Text-to-Speech (TTS) & Speech-to-Text (STT)**: Use browser or ElevenLabs voices
- **Modern UI**: Responsive, accessible, and themeable (light/dark)
- **Account Dashboard**: View usage, plan, and statistics
- **Customization Hub**: Toggle features, select TTS provider, manage search groups
- **Export/Import**: Export chat history to JSON

### UI/UX
- Clean, modern, and minimal design
- Responsive layout for desktop and mobile
- Accessible dialogs and forms
- Tabbed navigation for settings and customization
- Visual feedback for actions (toasts, skeleton loaders, etc.)

---

## Backend & How Chat Works

### Backend Overview
- The backend is a set of RESTful APIs that connect the frontend to various AI model providers (such as OpenAI, Anthropic, etc.).
- It handles user authentication (via API keys), model selection, message streaming, and account management.
- The backend may be a Node.js/Express server or a serverless function, but it is abstracted from the frontend via API endpoints.

### Chat Flow
1. **API Key Management**: Users enter and save their API keys for supported providers (A4F, Tavily, ElevenLabs, etc.) in the app. These are stored securely in local storage and sent with each request.
2. **Sending a Message**:
   - The user types a message and selects a model (e.g., OpenAI GPT-4).
   - The frontend sends the message, selected model, system prompt, and any attachments to the backend API endpoint.
   - The backend authenticates the request using the provided API key and forwards the message to the selected AI provider's API.
3. **Streaming Responses**:
   - The backend receives the AI's response (often as a stream for real-time updates) and relays it to the frontend.
   - The frontend displays the assistant's response as it arrives, supporting streaming tokens for a live typing effect.
4. **Chat History**:
   - Each conversation is saved locally in the browser (localStorage) with metadata (model, system prompt, attachments, etc.).
   - Users can view, load, delete, or export past chats.
5. **Text-to-Speech (TTS) & Speech-to-Text (STT)**:
   - TTS: The frontend uses the browser's SpeechSynthesis API or ElevenLabs API to read out assistant responses.
   - STT: The frontend uses the browser's SpeechRecognition API to convert user speech to text for input.
6. **Account Dashboard**:
   - The frontend fetches account info (plan, usage, etc.) from the backend using the API key.
   - Usage statistics and plan details are displayed in the dashboard.

### How It Works (Technical)
- **Frontend**: React/Next.js app manages UI, state, and API calls.
- **Backend**: Receives chat requests, validates API keys, forwards to AI provider, streams responses back.
- **AI Providers**: OpenAI, Anthropic, etc. process the message and return a response.
- **Security**: API keys are never exposed to other users; all requests are authenticated.
- **Customization**: Users can toggle features, select voices, and adjust settings in real time.

---

## Prompt for App Creator AI (to generate a mobile app)

**Prompt:**

Create a mobile app that replicates the full functionality and user experience of the following web application:

---

- A modern AI chat app with a clean, minimal, and responsive UI.
- Users can chat with multiple AI models (OpenAI, Anthropic, etc.), select models, and customize system prompts.
- Support for file attachments (images, etc.) and vision-capable models.
- Text-to-Speech (TTS) and Speech-to-Text (STT) features, with the ability to choose between browser voices and ElevenLabs voices, and adjust TTS speed.
- Chat history: users can view, load, delete, and export past conversations.
- API key management for multiple providers (A4F, Tavily, ElevenLabs), with secure input and removal.
- Account dashboard: show user info, plan, usage statistics, and model usage details.
- Customization hub: toggle features (chat history, TTS, STT, system prompt, attachment button), enable/disable search groups, and configure TTS provider and voice.
- Accessible dialogs and forms, with toasts and visual feedback for user actions.
- Theme support: light and dark mode toggle.
- Optimized for both phones and tablets.
- All navigation, settings, and chat features should be as close as possible to the web version, but adapted for a native mobile experience (bottom navigation, swipe gestures, etc. if appropriate).

---

**Design:**
- Use a modern, minimal, and clean design language.
- Prioritize accessibility and smooth user experience.
- Responsive layouts for all screen sizes.

**Note:**
- The app should support all features and flows present in the web version, including advanced settings, chat history, and integrations that are already available.
- If a feature is web-only (e.g., browser-specific TTS voices), provide a mobile-appropriate alternative or a clear message to the user.

---

This prompt is ready to be used in an app creator AI to generate a mobile app that matches the web app as closely as possible, excluding any features not yet available on the website.
