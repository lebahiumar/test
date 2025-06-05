/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for development
  transpilePackages: ["geist"], // Keep if using Geist font
  output: 'standalone', // Good for Docker deployments, optional otherwise
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.a4f.co', // Domain for API-served logos
      },
      // Add any other domains if logos come from multiple sources
    ],
  },
  // WebAssembly support for tiktoken
  webpack(config) {
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  // Remove headers, redirects, and other configurations
  // specific to the backend or removed features.
};

export default nextConfig;