import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { Screen, Card, H1, H2, Muted, PrimaryButton } from "../components/ui";
import { theme } from "../theme/theme";
import { addEntry, listEntries, JournalEntry } from "../lib/journal";
import DismissKeyboard from "../components/DismissKeyboard";


export default function JournalScreen() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const refresh = () => setEntries(listEntries(50));

  useEffect(() => {
    refresh();
  }, []);

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addEntry(trimmed);
    setText("");
    refresh();
  };

  return (
    <DismissKeyboard>
    <Screen>
      <H1>Journal</H1>
      <Muted>Private by default (stored locally). Voice + AI reflection placeholder is ready.</Muted>

      <Card>
        <H2>New entry</H2>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write what's on your mind..."
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          multiline
          returnKeyType="done"
          blurOnSubmit
        />

        <View style={styles.row}>
          <Pressable style={styles.secondaryBtn} onPress={() => alert("Voice journaling later ✅")}>
            <Text style={styles.secondaryText}>🎙 Voice (later)</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => alert("AI reflection later ✅")}>
            <Text style={styles.secondaryText}>✨ AI reflection (later)</Text>
          </Pressable>
        </View>

        <PrimaryButton label="Save entry" onPress={save} />
      </Card>

      <H2>Recent</H2>
      <FlatList
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Muted>{new Date(item.created_at).toLocaleString()}</Muted>
            <Text style={styles.entryText}>{item.text}</Text>
          </Card>
        )}
      />
    </Screen>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    minHeight: 110,
    textAlignVertical: "top",
    backgroundColor: theme.colors.softBg,
    color: theme.colors.text,
  },
  row: { flexDirection: "row", gap: 10 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: theme.colors.softBg,
  },
  secondaryText: { fontWeight: "900", color: theme.colors.text, fontSize: 12 },
  entryText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
});
