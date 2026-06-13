export const API_ORIGIN =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"
    : "http://localhost:3001";