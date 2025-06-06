import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A4F Playground",
    short_name: "A4F Chat", 
    description: "A4F Playground: A minimalistic client with powerful features for exploring AI capabilities.",
    start_url: "/",
    display: "standalone",
    categories: ["developer tools", "ai", "playground", "utility"],
    theme_color: "#5F2EEA", 
    background_color: "#0A0A0A", 
    icons: [
      {
        src: "/favicon-16x16.png", 
        sizes: "16x16",
        type: "image/png"
      },
      {
        src: "/icon.png",          
        sizes: "192x192",
        type: "image/png",
      },
      // If you decide to add a 512x512 or other sizes later, ensure you have the files in public/
      // {
      //   src: "/a4f-icon-512.png", 
      //   sizes: "512x512",
      //   type: "image/png",
      //   purpose: "any maskable"
      // }
    ],
    screenshots: [
      {
        src: "/home-preview.jpg", 
        type: "image/jpeg",      
        sizes: "1200x630",       
        form_factor: "wide"      
      }
    ],
  }
}