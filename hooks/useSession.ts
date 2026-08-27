import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  completeDay,
  CompleteDayPayload,
  CompleteDayResponse,
  createJournalEntry,
  CreateJournalEntryPayload,
  CreateJournalEntryResponse,
  getAssessmentQuestions,
  getHealingPlan,
  getHealingProgress,
  getToday,
  getTodayState,
  getSavedAffirmations,
  deleteSavedAffirmation,
  saveDayAffirmation,
  saveDayReflection,
  shareDayToCommunity,
  ShareDayType,
  submitAssessment,
  SubmitAssessmentPayload,
  SubmitAssessmentResponse,
} from "@/services/session.api";

const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

export const useSession = () => {
  const queryClient = useQueryClient();

  const assessmentQuestionsQuery = useQuery({
    queryKey: ["assessment-questions"],
    queryFn: getAssessmentQuestions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const journeyStateQuery = useQuery({
    queryKey: ["healing-today-state"],
    queryFn: getTodayState,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (
      payload: SubmitAssessmentPayload,
    ): Promise<SubmitAssessmentResponse> => {
      return submitAssessment(payload, getUserTimezone());
    },
  });

  const todayQuery = useQuery({
    queryKey: ["healing-today"],
    queryFn: getToday,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const planQuery = useQuery({
    queryKey: ["healing-plan"],
    queryFn: getHealingPlan,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const progressQuery = useQuery({
    queryKey: ["healing-progress"],
    queryFn: getHealingProgress,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const saveAffirmationMutation = useMutation({
    mutationFn: (dayNumber: number) => saveDayAffirmation(dayNumber),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved-affirmations"] });
    },
  });

  const savedAffirmationsQuery = useQuery({
    queryKey: ["saved-affirmations"],
    queryFn: getSavedAffirmations,
    staleTime: 60 * 1000,
  });

  const deleteAffirmationMutation = useMutation({
    mutationFn: (id: number) => deleteSavedAffirmation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved-affirmations"] });
    },
  });

  const shareToCommunityMutation = useMutation({
    mutationFn: ({
      dayNumber,
      type,
    }: {
      dayNumber: number;
      type: ShareDayType;
    }) => shareDayToCommunity(dayNumber, type),
  });

  const saveReflectionMutation = useMutation({
    mutationFn: ({
      dayNumber,
      mentalreflectiontext,
    }: {
      dayNumber: number;
      mentalreflectiontext: string;
    }) => saveDayReflection(dayNumber, mentalreflectiontext),
  });

  const completeDayMutation = useMutation({
    mutationFn: ({
      dayNumber,
      payload,
    }: {
      dayNumber: number;
      payload?: CompleteDayPayload;
    }): Promise<CompleteDayResponse> => completeDay(dayNumber, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["healing-today"] }),
        queryClient.invalidateQueries({ queryKey: ["healing-plan"] }),
        queryClient.invalidateQueries({ queryKey: ["healing-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["healing-today-state"] }),
      ]);
    },
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: (
      payload: CreateJournalEntryPayload,
    ): Promise<CreateJournalEntryResponse> => createJournalEntry(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });

  return {
    assessmentQuestions: assessmentQuestionsQuery,
    journeyState: journeyStateQuery,
    today: todayQuery,
    plan: planQuery,
    progress: progressQuery,
    submitAssessment: submitAssessmentMutation.mutateAsync,
    submitAssessmentState: submitAssessmentMutation,
    saveAffirmation: saveAffirmationMutation.mutateAsync,
    saveAffirmationState: saveAffirmationMutation,
    shareToCommunity: shareToCommunityMutation.mutateAsync,
    shareToCommunityState: shareToCommunityMutation,
    saveReflection: saveReflectionMutation.mutateAsync,
    saveReflectionState: saveReflectionMutation,
    completeDay: completeDayMutation.mutateAsync,
    completeDayState: completeDayMutation,
    createJournalEntry: createJournalEntryMutation.mutateAsync,
    createJournalEntryState: createJournalEntryMutation,
    savedAffirmations: savedAffirmationsQuery,
    deleteAffirmation: deleteAffirmationMutation.mutateAsync,
    deleteAffirmationState: deleteAffirmationMutation,
  };
};
