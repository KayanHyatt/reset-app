export type CheckIn = {
  mood: number; // 1-5
  stress: number; // 1-5
  sleepHours?: number;
};

export type Suggestion = {
  kind: "mindfulness" | "education" | "habit";
  title: string;
  reason: string;
};

export function generateSuggestions(c: CheckIn): Suggestion[] {
  const sleepLow = (c.sleepHours ?? 0) > 0 && (c.sleepHours ?? 0) < 6.5;
  const stressHigh = c.stress >= 4;
  const moodLow = c.mood <= 2;

  const s: Suggestion[] = [];

  if (stressHigh) {
    s.push({
      kind: "mindfulness",
      title: "2-minute Downshift Breath",
      reason: "Your stress looks high today. A short breathing reset can help your body settle.",
    });
  }

  if (sleepLow) {
    s.push({
      kind: "habit",
      title: "20-minute wind-down (no phone)",
      reason: "Short sleep often improves with a small screen-free buffer before bed.",
    });
    s.push({
      kind: "education",
      title: "Why sleep affects stress hormones",
      reason: "A quick explainer that connects sleep and stress regulation.",
    });
  }

  if (moodLow) {
    s.push({
      kind: "education",
      title: "Low mood: a gentle reset",
      reason: "When mood is low, start small and kind to your nervous system.",
    });
  }

  return s.slice(0, 3);
}
