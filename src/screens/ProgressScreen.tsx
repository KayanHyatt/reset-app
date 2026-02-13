import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { listCheckIns, type CheckInEntry } from "../lib/checkin";

type Range = 7 | 14;

export default function ProgressScreen() {
  const [range, setRange] = useState<Range>(7);
  const [items, setItems] = useState<CheckInEntry[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      setItems(listCheckIns(range));
      return () => {};
    }, [range])
  );

  const stats = useMemo(() => {
    if (!items.length) return null;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const moodAvg = avg(items.map((x) => x.mood));
    const stressAvg = avg(items.map((x) => x.stress));
    const sleepAvg = avg(items.map((x) => x.sleep_hours));

    return { moodAvg, stressAvg, sleepAvg };
  }, [items]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Progress</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.pill, range === 7 && styles.pillActive]}
          onPress={() => setRange(7)}
        >
          <Text style={styles.pillText}>7 days</Text>
        </Pressable>

        <Pressable
          style={[styles.pill, range === 14 && styles.pillActive]}
          onPress={() => setRange(14)}
        >
          <Text style={styles.pillText}>14 days</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Averages</Text>
        {!stats ? (
          <Text style={styles.muted}>No check-ins yet. Add one to see progress.</Text>
        ) : (
          <>
            <Text>Mood: {stats.moodAvg.toFixed(1)} / 5</Text>
            <Text>Stress: {stats.stressAvg.toFixed(1)} / 5</Text>
            <Text>Sleep: {stats.sleepAvg.toFixed(1)} hrs</Text>
          </>
        )}
      </View>

      <Text style={styles.h2}>Recent check-ins</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()}</Text>
            <Text>Mood: {item.mood} • Stress: {item.stress} • Sleep: {item.sleep_hours}h</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60, gap: 12 },
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { fontSize: 18, fontWeight: "700" },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  muted: { opacity: 0.7 },
  meta: { fontSize: 12, opacity: 0.7 },

  row: { flexDirection: "row", gap: 10 },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillActive: { borderWidth: 2 },
  pillText: { fontWeight: "700" },
});
