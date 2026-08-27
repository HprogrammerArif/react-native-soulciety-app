import { api } from "@/lib/axios";

export type AssessmentQuestionType = "choice" | "scale" | "text" | string;

export type ChoiceAssessmentQuestion = {
  id: string;
  type: "choice";
  question: string;
  options: string[];
};

export type ScaleAssessmentQuestion = {
  id: string;
  type: "scale";
  question: string;
  min: number;
  max: number;
};

export type TextAssessmentQuestion = {
  id: string;
  type: "text";
  question: string;
  placeholder?: string;
};

export type AssessmentQuestion =
  | ChoiceAssessmentQuestion
  | ScaleAssessmentQuestion
  | TextAssessmentQuestion
  | {
      id: string;
      type: AssessmentQuestionType;
      question: string;
      [key: string]: unknown;
    };

export type AssessmentQuestionsResponse = {
  questions: AssessmentQuestion[];
};

export type SubmitAssessmentPayload = Record<string, string | number>;

export type SubmitAssessmentResponse = {
  message: string;
  assessment_id?: number;
  status?: "pending" | "generating" | "ready" | "failed" | string;
};

export type AssessmentStatusResponse = {
  status: "pending" | "generating" | "ready" | "failed" | string;
  day_1_unlocked?: boolean;
  journey_started_at?: string;
};

export type HealingProfileData = {
  healing_arc_summary?: string;
  core_wound?: string;
  primary_theme?: string;
  archetype?: string;
};

export type AssessmentProfileResponse = {
  healing_profile: HealingProfileData;
  status: "pending" | "generating" | "ready" | "failed" | string;
  journey_started_at?: string;
  journey_completed_at?: string | null;
};

export type TodayStateResponse = {
  state: string;
  message?: string;
  [key: string]: unknown;
};

export type HealingTheme = {
  day_number: number;
  theme_title: string;
  theme_intention: string;
  theme_category: string;
  healing_focus: string[];
  state: "locked" | "available" | "completed" | "missed" | string;
  unlock_date: string;
  completed_at?: string | null;
};

export type TodayDetailResponse = {
  day_number?: number;
  state: string;
  content_status?: "pending" | "generating" | "ready" | "failed" | string;
  unlock_date?: string;
  completed_at?: string | null;
  theme?: {
    theme_title?: string;
    theme_intention?: string;
    theme_category?: string;
    healing_focus?: string[];
  };
  content?: {
    guided_reflection?: string;
    affirmation?: string;
    mental_workout?: string;
    mini_challenge?: string;
    journal_prompt?: string;
    breathing_exercise?: {
      name?: string;
      description?: string;
      inhale_seconds?: number;
      hold_in_seconds?: number;
      exhale_seconds?: number;
      hold_out_seconds?: number;
      rounds?: number;
    };
    physical_workout?: {
      title?: string;
      instructions?: string;
      duration_seconds?: number;
    };
  } | null;
  message?: string;
};

export type CreateJournalEntryPayload = {
  content: string;
  mode: string;
  tag: string;
};

export type CreateJournalEntryResponse = {
  id: number;
  content: string;
  mode: string;
  tag: string;
  ai_insight?: string;
  created_at?: string;
};

export type HealingPlanResponse = {
  healing_arc_summary?: string;
  themes: HealingTheme[];
};

export type HealingProgressResponse = {
  total_days_completed: number;
  current_streak: number;
  longest_streak: number;
  milestones_reached: number[];
  grace_period_active: boolean;
  grace_expires_at: string | null;
  journey_complete: boolean;
  journey_started_at?: string;
  journey_completed_at?: string | null;
};

export type SaveAffirmationResponse = {
  message: string;
};

export type SavedAffirmation = {
  id: number;
  text: string;
  day_number: number;
  created_at: string;
};

export type ShareDayType = "affirmation" | "journal";

export type ShareToCommunityResponse = {
  message: string;
};

export type SaveReflectionResponse = {
  id: number;
  healing_day: number;
  mentalreflectiontext: string;
  created_at: string;
};

export type CompleteDayPayload = {
  mood?: "happy" | "fear" | "sad" | "angry" | "sick";
  journal_entry_id?: number;
};

export type CompleteDayResponse = {
  message: string;
  current_streak?: number;
  total_days_completed?: number;
  already_completed?: boolean;
  milestone_reached?: {
    day: number;
    message: string;
  } | null;
};

export const getAssessmentQuestions = async (): Promise<
  AssessmentQuestion[]
> => {
  const { data } = await api.get<AssessmentQuestionsResponse>(
    "/api/healing/assessment/questions/",
  );

  return data?.questions ?? [];
};

export const submitAssessment = async (
  payload: SubmitAssessmentPayload,
  timezone?: string,
): Promise<SubmitAssessmentResponse> => {
  const { data } = await api.post<SubmitAssessmentResponse>(
    "/api/healing/assessment/",
    payload,
    {
      headers: timezone
        ? {
            "X-User-Timezone": timezone,
          }
        : undefined,
    },
  );

  return data;
};

export const getAssessmentStatus =
  async (): Promise<AssessmentStatusResponse> => {
    const { data } = await api.get<AssessmentStatusResponse>(
      "/api/healing/assessment/status/",
    );

    return data;
  };

export const getAssessmentProfile =
  async (): Promise<AssessmentProfileResponse> => {
    const { data } = await api.get<AssessmentProfileResponse>(
      "/api/healing/assessment/profile/",
    );

    return data;
  };

export const getTodayState = async (): Promise<TodayStateResponse> => {
  const { data } = await api.get<TodayStateResponse>("/api/healing/today/");

  return data;
};

export const getToday = async (): Promise<TodayDetailResponse> => {
  const { data } = await api.get<TodayDetailResponse>("/api/healing/today/");

  return data;
};

export const getHealingPlan = async (): Promise<HealingPlanResponse> => {
  const { data } = await api.get<HealingPlanResponse>("/api/healing/plan/");

  return data;
};

export const getHealingProgress =
  async (): Promise<HealingProgressResponse> => {
    const { data } = await api.get<HealingProgressResponse>(
      "/api/healing/progress/",
    );

    return data;
  };

export const saveDayAffirmation = async (
  dayNumber: number,
): Promise<SaveAffirmationResponse> => {
  const { data } = await api.post<SaveAffirmationResponse>(
    `/api/healing/days/${dayNumber}/save-affirmation/`,
    {},
  );

  return data;
};

export const shareDayToCommunity = async (
  dayNumber: number,
  type: ShareDayType,
): Promise<ShareToCommunityResponse> => {
  const { data } = await api.post<ShareToCommunityResponse>(
    `/api/healing/days/${dayNumber}/share/`,
    { type },
  );

  return data;
};

export const saveDayReflection = async (
  dayNumber: number,
  mentalreflectiontext: string,
): Promise<SaveReflectionResponse> => {
  const { data } = await api.post<SaveReflectionResponse>(
    `/api/healing/days/${dayNumber}/reflection/`,
    { mentalreflectiontext },
  );

  return data;
};

export const completeDay = async (
  dayNumber: number,
  payload: CompleteDayPayload = {},
): Promise<CompleteDayResponse> => {
  const { data } = await api.post<CompleteDayResponse>(
    `/api/healing/days/${dayNumber}/complete/`,
    payload,
  );

  return data;
};

export const createJournalEntry = async (
  payload: CreateJournalEntryPayload,
): Promise<CreateJournalEntryResponse> => {
  const { data } = await api.post<CreateJournalEntryResponse>(
    "/api/journal/entries/",
    payload,
  );

  return data;
};

export const getSavedAffirmations = async (): Promise<SavedAffirmation[]> => {
  const { data } = await api.get<SavedAffirmation[]>("/api/healing/affirmations/");
  return data;
};

export const deleteSavedAffirmation = async (id: number): Promise<void> => {
  await api.delete(`/api/healing/affirmations/${id}/`);
};
