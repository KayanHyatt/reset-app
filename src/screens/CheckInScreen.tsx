import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { saveCheckIn } from "../lib/checkin";


export default function CheckInScreen() {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleepHours, setSleepHours] = useState<number>(7);

 const save = () => {
    saveCheckIn(mood, stress, sleepHours);
    alert("Saved ✅");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Check-in</Text>

      <View style={styles.card}>
        <Row label={`Mood: ${mood}`}>
          <StepButtons
            onMinus={() => setMood((v) => Math.max(1, v - 1))}
            onPlus={() => setMood((v) => Math.min(5, v + 1))}
          />
        </Row>

        <Row label={`Stress: ${stress}`}>
          <StepButtons
            onMinus={() => setStress((v) => Math.max(1, v - 1))}
            onPlus={() => setStress((v) => Math.min(5, v + 1))}
          />
        </Row>

        <Row label={`Sleep hours: ${sleepHours.toFixed(1)}`}>
          <StepButtons
            onMinus={() => setSleepHours((v) => Math.max(0, v - 0.5))}
            onPlus={() => setSleepHours((v) => v + 0.5)}
          />
        </Row>

        <Pressable style={styles.primaryBtn} onPress={save}>
          <Text style={styles.primaryText}>Save check-in</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
      {children}
    </View>
  );
}

function StepButtons({ onMinus, onPlus }: { onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={styles.rowBtns}>
      <Pressable style={styles.btn} onPress={onMinus}>
        <Text>-</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={onPlus}>
        <Text>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60, gap: 12 },
  h1: { fontSize: 28, fontWeight: "700" },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowBtns: { flexDirection: "row", gap: 8 },
  btn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  primaryBtn: { borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  primaryText: { fontWeight: "700" },
});
