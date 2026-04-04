export const getBaseURL = () => {
  return import.meta.env.VITE_API_URL ?? "https://2anki.net";
};
