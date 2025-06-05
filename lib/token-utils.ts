// lib/token-utils.ts

// Cache for the tiktoken encoder
let tiktokenEncoder: any = null;
let tiktokenLoading = false;
let tiktokenLoadPromise: Promise<any> | null = null;

/**
 * Load the tiktoken library and initialize the encoder
 * This is done dynamically to avoid issues with SSR/build time
 */
async function loadTiktoken() {
  if (tiktokenEncoder) return tiktokenEncoder;
  if (tiktokenLoadPromise) return tiktokenLoadPromise;

  tiktokenLoading = true;
  tiktokenLoadPromise = new Promise(async (resolve) => {
    try {
      // Dynamically import tiktoken only on the client side
      if (typeof window !== 'undefined') {
        const tiktoken = await import('tiktoken');
        tiktokenEncoder = tiktoken.get_encoding('o200k_base'); // Used by GPT-3.5 and GPT-4
        resolve(tiktokenEncoder);
      } else {
        // Fallback for server-side rendering
        resolve(null);
      }
    } catch (error) {
      console.error('Failed to load tiktoken:', error);
      resolve(null);
    } finally {
      tiktokenLoading = false;
    }
  });

  return tiktokenLoadPromise;
}

/**
 * Fallback token counter when tiktoken is not available
 */
function countTokensFallback(text: string): number {
  if (!text) return 0;
  
  // Simple approximation based on GPT tokenization patterns
  // Average English word is ~4-5 characters per token
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Count the number of tokens in a text string using tiktoken
 * Falls back to a simple approximation if tiktoken is not available
 * 
 * @param text The text to count tokens for
 * @returns The number of tokens in the text
 */
export async function countTokensAsync(text: string): Promise<number> {
  if (!text) return 0;
  
  try {
    const encoder = await loadTiktoken();
    if (encoder) {
      const tokens = encoder.encode(text);
      return tokens.length;
    }
  } catch (error) {
    console.error('Error counting tokens with tiktoken:', error);
  }
  
  // Fallback to approximation if tiktoken fails or is not loaded
  return countTokensFallback(text);
}

/**
 * Synchronous token counter that uses a fallback method
 * This is used before the async tiktoken counter is ready
 */
export function countTokens(text: string): number {
  return countTokensFallback(text);
}
