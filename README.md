# Scira Frontend Demo

This is a modern chat application frontend built with Next.js and React, featuring advanced customization, chat history, speech-to-text, text-to-speech, and MCP (Model Context Protocol) integrations for services like GitHub, Google Drive, and Google Calendar.

## Features

- **Chat with AI models** (OpenAI, Anthropic, etc.)
- **Customizable chat experience** (system prompts, attachments, TTS, STT, etc.)
- **Chat history** with save/load/delete
- **API key management** for multiple providers
- **Text-to-Speech (TTS)** and **Speech-to-Text (STT)**
- **MCP Integrations** (GitHub, Google Drive, Google Calendar, and more coming soon)
- **Modern, responsive UI**

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```sh
npm install
```

### Running the App

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` — Main Next.js app pages and hooks
- `components/` — UI and feature components
- `hooks/` — Custom React hooks
- `lib/` — Utility functions
- `public/` — Static assets (icons, images)
- `styles/` — CSS files
- `types/` — TypeScript type definitions

## Integrations (MCP)

- **GitHub**: Connect your GitHub account to access repositories and issues in chat.
- **Google Drive**: Browse and share files from your Drive.
- **Google Calendar**: View and manage calendar events.

> Integrations are in progress. UI is available; backend/OAuth setup required for full functionality.

## Accessibility
- Dialogs and forms are accessible and screen-reader friendly.

## Contributing
Pull requests and issues are welcome!

## License
MIT
