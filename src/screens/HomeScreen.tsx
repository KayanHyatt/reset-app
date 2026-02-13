import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import DismissKeyboard from "../components/DismissKeyboard";
import { Screen, Card, H1, H2, Muted, PrimaryButton } from "../components/ui";
import { theme } from "../theme/theme";
import { getTodayLog, upsertTodayLog } from "../lib/logging";
import type { TabsParamList } from "../../App";
import { supabase } from "../lib/supabase";


const MOODS = [
  { v: 1, emoji: "😣" },
  { v: 2, emoji: "😕" },
  { v: 3, emoji: "😐" },
  { v: 4, emoji: "🙂" },
  { v: 5, emoji: "😄" },
];

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList>>();

  const [mood, setMood] = useState<number | null>(null);
  const [thought, setThought] = useState("");
  const [water, setWater] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const t = getTodayLog();
      setMood(t?.mood ?? null);
      setWater(t?.water_ml ?? 0);
      return () => {};
    }, [])
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const addWater = (ml: number) => {
    const next = water + ml;
    setWater(next);
    upsertTodayLog({ water_ml: next });
  };

  return (
    <DismissKeyboard>
    <Screen>
      <View style={styles.topRow}>
        <View>
          <Muted>{greeting}</Muted>
          <H1>Hi 👋</H1>
        </View>

        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: "#EFF6FF" }]}>
            <Text style={[styles.badgeText, { color: theme.colors.blue }]}>Pro Member</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#ECFDF5" }]}>
            <Text style={[styles.badgeText, { color: theme.colors.green }]}>
              {mood ? `Mood ${mood}/5` : "No mood yet"}
            </Text>
          </View>
        </View>
      </View>

      <Card>
        <View style={styles.cardHeaderRow}>
          <H2>Log your mood</H2>
          <Pressable onPress={() => navigation.navigate("Log")}>
            <Text style={styles.link}>Open Log</Text>
          </Pressable>
        </View>

        <Muted>Tap an emoji to log how you feel.</Muted>

        <View style={styles.moodRow}>
          {MOODS.map((x) => {
            const selected = mood === x.v;
            return (
              <Pressable
                key={x.v}
                style={[styles.moodBtn, selected && styles.moodBtnSelected]}
                onPress={() => {
                  setMood(x.v);
                  upsertTodayLog({ mood: x.v });
                }}
              >
                <Text style={styles.moodEmoji}>{x.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <H2>Thought dump</H2>
        <Muted>Capture a quick note. We’ll add voice + AI later.</Muted>

        <TextInput
          value={thought}
          onChangeText={setThought}
          placeholder="What’s on your mind?"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          multiline
          returnKeyType="done"
          blurOnSubmit
        />

        <PrimaryButton
          label="Go to Journal"
          onPress={() => navigation.navigate("Journal")}
        />
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={{ color: theme.colors.red, fontWeight: "800" }}>Log out</Text>
        </Pressable>

      </Card>

      <Card>
        <H2>Water</H2>
        <Muted>Quick taps — keeps daily logging simple.</Muted>

        <View style={styles.waterRow}>
          <Pressable style={styles.waterBtn} onPress={() => addWater(250)}>
            <Text style={styles.waterText}>+250ml</Text>
          </Pressable>
          <Pressable style={styles.waterBtn} onPress={() => addWater(500)}>
            <Text style={styles.waterText}>+500ml</Text>
          </Pressable>

          <View style={styles.waterTotal}>
            <Text style={styles.waterTotalText}>{water}ml today</Text>
          </View>
        </View>
      </Card>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate("Log")}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </Screen>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  badges: { gap: 8, alignItems: "flex-end" },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radius.pill },
  badgeText: { fontWeight: "800", fontSize: 12 },

  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { color: theme.colors.blue, fontWeight: "800" },

  moodRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  moodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: theme.colors.softBg,
  },
  moodBtnSelected: { borderColor: theme.colors.blue, backgroundColor: "#EFF6FF" },
  moodEmoji: { fontSize: 18 },

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

  waterRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  waterBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.softBg,
  },
  waterText: { fontWeight: "800", color: theme.colors.text },
  waterTotal: { marginLeft: "auto" },
  waterTotalText: { fontWeight: "800", color: theme.colors.blue },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.blue,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: -2 },
});
