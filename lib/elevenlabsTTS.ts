import { Audio } from "expo-av";

interface QueueItem {
  text: string;
  status: "idle" | "fetching" | "ready" | "playing" | "error";
  sound?: Audio.Sound;
  fetchPromise?: Promise<void>;
}

let currentQueue: QueueItem[] = [];
let currentPlayIndex = -1;
let activePlaybackId: string | null = null;
let isPlayingElevenLabs = false;

// Voice ID for ElevenLabs
const VOICE_ID = "pjcYQlDFKMbcOUp6F5GD";

// ElevenLabs API Key (uses env variable or falls back to a placeholder)
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "sk_f14b09069913505b649bae0893f7134aa1ab7160a178411c";

export interface SpeakOptions {
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

/**
 * Stop any active text-to-speech playbacks and clean up all preloaded items.
 */
export const stop = async (): Promise<void> => {
  activePlaybackId = null; // Invalidate current playback ID to cancel active fetches
  try {
    for (const item of currentQueue) {
      if (item.sound) {
        await item.sound.stopAsync().catch(() => {});
        await item.sound.unloadAsync().catch(() => {});
      }
    }
  } catch (e) {
    console.error("Error stopping ElevenLabs sound queue:", e);
  } finally {
    currentQueue = [];
    currentPlayIndex = -1;
    isPlayingElevenLabs = false;
  }
};

/**
 * Fetches and prepares a single queue item.
 */
const fetchQueueItem = async (index: number, playbackId: string): Promise<void> => {
  if (index >= currentQueue.length || index < 0) return;
  const item = currentQueue[index];
  if (item.status !== "idle") {
    return item.fetchPromise;
  }

  item.status = "fetching";
  item.fetchPromise = (async () => {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
            "accept": "audio/mpeg",
          },
          body: JSON.stringify({
            text: item.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (activePlaybackId !== playbackId) return;

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS returned status ${response.status} for sentence ${index}`);
      }

      const blob = await response.blob();
      if (activePlaybackId !== playbackId) return;

      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      if (activePlaybackId !== playbackId) return;

      const dataUri = `data:audio/mp3;base64,${base64Audio}`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: false }
      );

      if (activePlaybackId !== playbackId) {
        await sound.unloadAsync().catch(() => {});
        return;
      }

      item.sound = sound;
      item.status = "ready";
    } catch (error) {
      console.error(`Error fetching ElevenLabs segment ${index}:`, error);
      item.status = "error";
    }
  })();

  return item.fetchPromise;
};

/**
 * Plays segments in the queue sequentially.
 */
const playQueue = async (startIndex: number, playbackId: string, options?: SpeakOptions): Promise<void> => {
  if (activePlaybackId !== playbackId) return;
  if (startIndex >= currentQueue.length) {
    options?.onDone?.();
    isPlayingElevenLabs = false;
    return;
  }

  currentPlayIndex = startIndex;
  const item = currentQueue[startIndex];

  try {
    // 1. Ensure current item is fetched/ready.
    if (item.status !== "ready" && item.status !== "error") {
      await fetchQueueItem(startIndex, playbackId);
    }

    if (activePlaybackId !== playbackId) return;

    if (item.status === "error" || !item.sound) {
      console.warn(`Skipping segment ${startIndex} due to fetch error.`);
      // Proceed to the next segment
      playQueue(startIndex + 1, playbackId, options);
      return;
    }

    // 2. Proactively pre-fetch the NEXT item so it's loaded in background
    if (startIndex + 1 < currentQueue.length) {
      fetchQueueItem(startIndex + 1, playbackId).catch(() => {});
    }

    // 3. Play the current sound segment
    item.status = "playing";

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    item.sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        // Unload sound immediately to free memory
        item.sound?.unloadAsync().catch(() => {});
        item.sound = undefined;

        if (activePlaybackId === playbackId) {
          // Play the next segment
          playQueue(startIndex + 1, playbackId, options);
        }
      }
    });

    await item.sound.playAsync();

    // Trigger onStart callback when the first segment starts playing
    if (startIndex === 0) {
      options?.onStart?.();
    }
  } catch (error) {
    console.error(`Error in playQueue at index ${startIndex}:`, error);
    options?.onError?.(error);
    // Attempt recovery by playing the next segment
    playQueue(startIndex + 1, playbackId, options);
  }
};

/**
 * Speaks text using ElevenLabs by splitting into sentences and prefetching.
 */
export const speak = async (text: string, options?: SpeakOptions): Promise<void> => {
  const playbackId = Math.random().toString();
  activePlaybackId = playbackId;

  try {
    // Stop all active playbacks first
    await stop();
    activePlaybackId = playbackId; // Restore active playback ID

    // Split the text into sentences by punctuation, ensuring we skip empty strings
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.replace(/[.!?]/g, "").trim().length > 0);

    if (sentences.length === 0) {
      options?.onDone?.();
      return;
    }

    // Initialize the queue
    currentQueue = sentences.map((sentence) => ({
      text: sentence,
      status: "idle",
    }));

    isPlayingElevenLabs = true;

    // Start prefetching the first two segments in parallel immediately
    fetchQueueItem(0, playbackId).catch(() => {});
    if (sentences.length > 1) {
      fetchQueueItem(1, playbackId).catch(() => {});
    }

    // Begin queue playback
    await playQueue(0, playbackId, options);
  } catch (error) {
    console.error("ElevenLabs speak orchestrator failed:", error);
    isPlayingElevenLabs = false;
    options?.onError?.(error);
  }
};
