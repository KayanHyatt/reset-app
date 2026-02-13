import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { Screen, Card, H1, H2, Muted, Chip, PrimaryButton } from "../components/ui";
import { theme } from "../theme/theme";
import { getTodayLog, upsertTodayLog } from "../lib/logging";
import DismissKeyboard from "../components/DismissKeyboard";

const TIMES = ["5 min", "10 min", "15 min", "20+ min"] as const;

export default function LogScreen() {
  const today = getTodayLog();

  const [stress, setStress] = useState<number>(today?.stress_level ?? 5);
  const [stressors, setStressors] = useState(today?.main_stressors ?? "");
  const [coping, setCoping] = useState(today?.coping_methods ?? "");
  const [dailyTime, setDailyTime] = useState<string>(today?.daily_time ?? "10 min");
  const [notes, setNotes] = useState(today?.notes ?? "");
  const [water, setWater] = useState<number>(today?.water_ml ?? 0);
  const [mood, setMood] = useState<number | null>(today?.mood ?? null);

  const setStressSafe = (v: number) => {
    const next = Math.max(1, Math.min(10, v));
    setStress(next);
    upsertTodayLog({ stress_level: next });
  };

  const addWater = (ml: number) => {
    const next = water + ml;
    setWater(next);
    upsertTodayLog({ water_ml: next });
  };

  const saveAll = () => {
    upsertTodayLog({
      mood: mood ?? null,
      stress_level: stress,
      main_stressors: stressors.trim() || null,
      coping_methods: coping.trim() || null,
      daily_time: dailyTime,
      notes: notes.trim() || null,
      water_ml: water,
    });
    alert("Saved ✅");
  };

  return (
    <DismissKeyboard>
    <Screen>
      <H1>Logging</H1>
      <Muted>Quick daily survey — aim for 5–10 minutes.</Muted>

      <ScrollView 
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: 24 }}>
        <Card>
          <H2>Current stress level</H2>
          <Muted>1 = very calm, 10 = extremely stressed</Muted>

          <View style={styles.stepRow}>
            <Pressable style={styles.stepBtn} onPress={() => setStressSafe(stress - 1)}>
              <Text style={styles.stepText}>-</Text>
            </Pressable>

            <View style={styles.stepValue}>
              <Text style={styles.stepValueText}>{stress}</Text>
            </View>

            <Pressable style={styles.stepBtn} onPress={() => setStressSafe(stress + 1)}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </Card>

        <Card>
          <H2>How are you feeling?</H2>
          <Muted>Tap to set today’s mood.</Muted>

          <View style={styles.moodRow}>
            {[1, 2, 3, 4, 5].map((v) => (
              <Pressable
                key={v}
                style={[styles.moodBtn, mood === v && styles.moodBtnSelected]}
                onPress={() => {
                  setMood(v);
                  upsertTodayLog({ mood: v });
                }}
              >
                <Text style={styles.moodText}>{v}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <H2>Main stressors</H2>
          <Muted>Short notes or keywords.</Muted>
          <TextInput
            value={stressors}
            onChangeText={(t) => {
              setStressors(t);
              upsertTodayLog({ main_stressors: t });
            }}
            placeholder="e.g., work, relationships, sleep..."
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            multiline
            returnKeyType="done"
            blurOnSubmit
          />
        </Card>

        <Card>
          <H2>Coping methods</H2>
          <Muted>What helps you right now?</Muted>
          <TextInput
            value={coping}
            onChangeText={(t) => {
              setCoping(t);
              upsertTodayLog({ coping_methods: t });
            }}
            placeholder="e.g., walk, breathing, talking to a friend..."
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            multiline
            returnKeyType="done"
            blurOnSubmit
          />
        </Card>

        <Card>
          <H2>Daily time</H2>
          <Muted>How long can you dedicate today?</Muted>
          <View style={styles.chipRow}>
            {TIMES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={dailyTime === t}
                onPress={() => {
                  setDailyTime(t);
                  upsertTodayLog({ daily_time: t });
                }}
              />
            ))}
          </View>
        </Card>

        <Card>
          <H2>Water</H2>
          <Muted>Quick taps — no fuss.</Muted>

          <View style={styles.waterRow}>
            <Pressable style={styles.waterBtn} onPress={() => addWater(250)}>
              <Text style={styles.waterText}>+250ml</Text>
            </Pressable>
            <Pressable style={styles.waterBtn} onPress={() => addWater(500)}>
              <Text style={styles.waterText}>+500ml</Text>
            </Pressable>
            <Text style={styles.waterTotal}>{water}ml</Text>
          </View>
        </Card>

        <Card>
          <H2>Daily check-in</H2>
          <Muted>Optional — what’s on your mind?</Muted>
          <TextInput
            value={notes}
            onChangeText={(t) => {
              setNotes(t);
              upsertTodayLog({ notes: t });
            }}
            placeholder="Write a sentence or two..."
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            multiline
            returnKeyType="done"
            blurOnSubmit
          />
          <PrimaryButton label="Save" onPress={saveAll} />
        </Card>

        <Card>
          <H2>Auto-import (coming soon)</H2>
          <Muted>
            Apple Health sleep + Strava workouts will auto-fill sections here in a later phase.
          </Muted>
        </Card>
      </ScrollView>
    </Screen>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.softBg,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 20, fontWeight: "900", color: theme.colors.text },
  stepValue: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepValueText: { fontSize: 18, fontWeight: "900", color: theme.colors.blue },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
    backgroundColor: theme.colors.softBg,
    color: theme.colors.text,
  },

  moodRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  moodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: theme.colors.softBg,
  },
  moodBtnSelected: { borderColor: theme.colors.blue, backgroundColor: "#EFF6FF" },
  moodText: { fontWeight: "900", color: theme.colors.text },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  waterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  waterBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.softBg,
  },
  waterText: { fontWeight: "900", color: theme.colors.text },
  waterTotal: { marginLeft: "auto", fontWeight: "900", color: theme.colors.blue },
});
