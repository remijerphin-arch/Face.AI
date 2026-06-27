export const getApiUrl = (): string => {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  const hostname = window.location.hostname;

  // Detect if we are running in GitHub Codespaces
  if (hostname.includes("github.dev")) {
    // Replace port 3000 with 8000 in the forwarded URL
    const apiHostname = hostname.replace("3000", "8000");
    return `https://${apiHostname}`;
  }

  // Localhost fallback
  return "http://localhost:8000";
};
