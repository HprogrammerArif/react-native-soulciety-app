import { api } from "@/lib/axios";

export const updateMoodApi = (mood: string) => {
  console.log("Mood api", mood);
  return api.post("/api/mood/", { mood });
};
