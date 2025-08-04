export const getBaseURL = (isDebug?: boolean) => {
  // Auto-detect development environment if isDebug is not explicitly provided
  const isDevelopment =
    isDebug ??
    (process.env.NODE_ENV === "development" ||
      process.env.REACT_APP_ENV === "development");

  if (isDevelopment) {
    console.log("Development mode detected - using http://localhost:2020");
    return "http://localhost:2020";
  }
  console.log("Production mode detected - using https://2anki.net");
  return "https://2anki.net";
};
