// Type definitions for SpeechRecognition in browser environments
// This allows TypeScript to recognize SpeechRecognition in type checks and builds

type SpeechRecognition = any;
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
