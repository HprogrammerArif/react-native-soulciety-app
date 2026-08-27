import SessionScreen_1 from "@/components/modules/Home/Session/Session_1";
import SessionScreen_2 from "@/components/modules/Home/Session/Session_2";
import SessionScreen_3 from "@/components/modules/Home/Session/Session_3";
import SessionScreen_4 from "@/components/modules/Home/Session/Session_4";
import SessionScreen_6 from "@/components/modules/Home/Session/Session_6";
import SessionScreen_7 from "@/components/modules/Home/Session/Session_7";
import SessionScreen_8 from "@/components/modules/Home/Session/Session_8";
import SessionQuestion from "@/components/modules/Home/Session/Session_Question";
import SessionSummary from "@/components/modules/Home/Session/Session_Summary";
import SessionIntroScreen from "@/components/modules/Home/Session/SessionIntro";
import { useSession } from "@/hooks/useSession";
import { CompleteDayResponse } from "@/services/session.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import SessionScreen_5 from "../../components/modules/Home/Session/Session_5";

type sessionsStates =
  | "checking"
  | "questions"
  | "summary"
  | "mainScreen"
  | "session1"
  | "session2"
  | "session3"
  | "session4"
  | "session5"
  | "session6"
  | "session7"
  | "session8"
  | "session9";

const SESSION_PROGRESS_KEY = "healing-session-progress";

const isTrackedSessionStep = (state: sessionsStates) =>
  state === "session1" ||
  state === "session2" ||
  state === "session3" ||
  state === "session4" ||
  state === "session5" ||
  state === "session6" ||
  state === "session7";

export default function SessionPage() {
  const { journeyState, today } = useSession();

  const [sessionState, setSessionState] = useState<sessionsStates>("checking");
  const [completionResult, setCompletionResult] =
    useState<CompleteDayResponse | null>(null);

  useEffect(() => {
    if (
      sessionState !== "checking" ||
      journeyState.isLoading ||
      today.isLoading
    ) {
      return;
    }

    const resolveInitialState = async () => {
      const journeyStateValue = journeyState.data?.state;
      const shouldShowQuestions =
        journeyStateValue === "no_plan" ||
        journeyStateValue === "failed" ||
        journeyStateValue === undefined;

      if (shouldShowQuestions) {
        setSessionState("questions");
        return;
      }

      if (
        journeyStateValue === "completed" ||
        journeyStateValue === "journey_complete"
      ) {
        await AsyncStorage.removeItem(SESSION_PROGRESS_KEY);
        setSessionState("mainScreen");
        return;
      }

      const rawProgress = await AsyncStorage.getItem(SESSION_PROGRESS_KEY);
      if (!rawProgress) {
        setSessionState("mainScreen");
        return;
      }

      try {
        const parsed = JSON.parse(rawProgress) as {
          dayNumber?: number;
          state?: sessionsStates;
        };

        const currentDayNumber = today.data?.day_number;
        if (
          currentDayNumber &&
          parsed.dayNumber === currentDayNumber &&
          parsed.state &&
          isTrackedSessionStep(parsed.state)
        ) {
          setSessionState(parsed.state);
          return;
        }
      } catch {
        // Ignore malformed persisted state and fall back to main screen.
      }

      await AsyncStorage.removeItem(SESSION_PROGRESS_KEY);
      setSessionState("mainScreen");
    };

    void resolveInitialState();
  }, [
    journeyState.data?.state,
    journeyState.isLoading,
    sessionState,
    today.data?.day_number,
    today.isLoading,
  ]);

  useEffect(() => {
    const persistSessionProgress = async () => {
      if (!isTrackedSessionStep(sessionState)) {
        return;
      }

      const currentDayNumber = today.data?.day_number;
      if (!currentDayNumber) {
        return;
      }

      await AsyncStorage.setItem(
        SESSION_PROGRESS_KEY,
        JSON.stringify({
          dayNumber: currentDayNumber,
          state: sessionState,
        }),
      );
    };

    void persistSessionProgress();
  }, [sessionState, today.data?.day_number]);

  const clearSessionProgress = async () => {
    await AsyncStorage.removeItem(SESSION_PROGRESS_KEY);
  };

  if (sessionState === "checking") {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F7F8]">
        <ActivityIndicator size="large" color="#F6CF00" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {sessionState === "questions" ? (
        <SessionQuestion
          onComplete={() => setSessionState("summary")}
        />
      ) : null}

      {sessionState === "summary" ? (
        <SessionSummary
          profile={null}
          onBack={() => setSessionState("questions")}
          onContinue={() => setSessionState("mainScreen")}
        />
      ) : null}

      {sessionState === "mainScreen" ? (
        <SessionIntroScreen onStartSession={() => setSessionState("session1")} />
      ) : null}
      {sessionState === "session1" ? (
        <SessionScreen_1
          onBack={() => setSessionState("mainScreen")}
          onContinue={() => setSessionState("session2")}
        />
      ) : null}
      {sessionState === "session2" ? (
        <SessionScreen_2
          onBack={() => setSessionState("session1")}
          onContinue={() => setSessionState("session3")}
        />
      ) : null}
      {sessionState === "session3" ? (
        <SessionScreen_3
          onBack={() => setSessionState("session2")}
          onContinue={() => setSessionState("session4")}
        />
      ) : null}
      {sessionState === "session4" ? (
        <SessionScreen_4
          onBack={() => setSessionState("session3")}
          onContinue={() => setSessionState("session5")}
        />
      ) : null}

      {sessionState === "session5" ? (
        <SessionScreen_5
          onBack={() => setSessionState("session4")}
          onContinue={() => setSessionState("session6")}
        />
      ) : null}

      {sessionState === "session6" ? (
        <SessionScreen_6
          onBack={() => setSessionState("session5")}
          onContinue={() => setSessionState("session7")}
        />
      ) : null}

      {sessionState === "session7" ? (
        <SessionScreen_7
          onBack={() => setSessionState("session6")}
          onComplete={(result) => {
            setCompletionResult(result);
            setSessionState("session8");
          }}
        />
      ) : null}

      {sessionState === "session8" ? (
        <SessionScreen_8
          completionResult={completionResult}
          onReturnHome={async () => {
            await clearSessionProgress();
            setSessionState("mainScreen");
          }}
          onViewJourneyMap={async () => {
            await clearSessionProgress();
            setSessionState("mainScreen");
          }}
        />
      ) : null}
    </View>
  );
}