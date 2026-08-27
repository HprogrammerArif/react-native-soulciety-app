import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface JournalEntry {
  id: string;
  content: string;
  mode: string;
  tag: string;
  ai_insight: string;
  created_at: string;
}

export const useJournal = () => {
  const queryClient = useQueryClient();

  // Fetch Entries
  const {
    data: entries = [],
    isLoading,
    refetch,
  } = useQuery<JournalEntry[]>({
    queryKey: ["journals"],
    queryFn: async () => {
      const res = await api.get("/api/journal/entries/");
      return res.data;
    },
  });

  // Create Entry Mutation
  const createMutation = useMutation({
    mutationFn: async (newEntry: {
      content: string;
      mode: string;
      tag: string;
    }) => {
      const res = await api.post("/api/journal/entries/", newEntry);
      return res.data;
    },
    onSuccess: () => {
      // This line triggers an instant refresh of the list
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });

  return {
    entries,
    isLoading,
    isCreating: createMutation.isPending,
    createEntry: createMutation.mutateAsync,
    refetch,
  };
};
