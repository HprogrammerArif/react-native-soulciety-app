import { api } from "@/lib/axios";

export const updateMoodApi = (mood: string) => {
  if (__DEV__) console.log("Mood api", mood);
  return api.post("/api/mood/", { mood });
};
