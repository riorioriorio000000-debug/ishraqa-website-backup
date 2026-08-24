export function usesPlatformAuth(mode = import.meta.env.VITE_AUTH_MODE): boolean {
  return mode !== "external";
}
