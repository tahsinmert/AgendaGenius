// Minimal Node-style process.env declaration for TypeScript
// This is used in both client and build-time code where Vite injects env vars.
declare const process: {
  env: {
    API_KEY?: string;
    [key: string]: string | undefined;
  };
};


