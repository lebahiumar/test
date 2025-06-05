// env/server.ts
// This file safely exposes environment variables for server-side code

/**
 * Server-side environment variables
 * These are only accessible in server components and API routes
 */
export const serverEnv = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  // Add any other server-side environment variables here
};
