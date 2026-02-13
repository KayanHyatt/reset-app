import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../theme/theme";
import { Card, H1, H2, Muted, Chip, PrimaryButton } from "../components/ui";
import DismissKeyboard from "../components/DismissKeyboard";
import {
  createCommunityPost,
  fetchCommunityPosts,
  type CommunityPost,
  type Room,
} from "../lib/community";

const ROOMS: { label: string; value: Room | "all" }[] = [
  { label: "All", value: "all" },
  { label: "General", value: "general" },
  { label: "Support", value: "support" },
  { label: "Advice", value: "advice" },
];

const TAGS = ["positive", "seeking_help", "curious", "reflection"] as const;

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CommunityScreen() {
  const [room, setRoom] = useState<Room | "all">("all");
  const [tag, setTag] = useState<(typeof TAGS)[number] | "all">("all");

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const [showNewPost, setShowNewPost] = useState(false);

  // New post state
  const [newRoom, setNewRoom] = useState<Room>("general");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newBody, setNewBody] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchCommunityPosts({ room, tag, limit: 60 });
      setPosts(data);
    } catch (e: any) {
      Alert.alert("Community error", e?.message ?? "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room, tag])
  );

  const toggleTag = (t: string) => {
    setNewTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const canPost = useMemo(() => newBody.trim().length >= 3, [newBody]);

  const submitPost = async () => {
    Keyboard.dismiss();

    if (!canPost) {
      Alert.alert("Write a little more", "Please add at least a few words.");
      return;
    }

    try {
      await createCommunityPost({
        room: newRoom,
        tags: newTags,
        body: newBody,
      });

      setShowNewPost(false);
      setNewBody("");
      setNewTags([]);
      setNewRoom("general");
      await load();
    } catch (e: any) {
      Alert.alert("Couldn’t post", e?.message ?? "Try again.");
    }
  };

  return (
    <DismissKeyboard>
      <View style={styles.screen}>
        <View style={styles.header}>
          <H1>Community</H1>
          <Muted>Anonymous-style support with real accounts.</Muted>
        </View>

        {/* Room tabs */}
        <View style={styles.rowWrap}>
          {ROOMS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              selected={room === r.value}
              onPress={() => setRoom(r.value)}
            />
          ))}
        </View>

        {/* Tag filters */}
        <View style={styles.rowWrap}>
          <Chip label="All" selected={tag === "all"} onPress={() => setTag("all")} />
          {TAGS.map((t) => (
            <Chip
              key={t}
              label={t.replace("_", " ")}
              selected={tag === t}
              onPress={() => setTag(t)}
            />
          ))}
        </View>

        <View style={styles.listHeaderRow}>
          <H2>Posts</H2>
          <Text style={styles.mutedSmall}>
            {loading ? "Loading..." : `${posts.length}`}
          </Text>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          refreshing={loading}
          onRefresh={load}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ gap: 12, paddingBottom: 90 }}
          renderItem={({ item }) => {
            const name =
              item.profiles?.display_name ||
              item.profiles?.username ||
              "Anonymous";

            return (
              <Card>
                <View style={styles.postTopRow}>
                  <View style={styles.postMeta}>
                    <Text style={styles.postRoom}>{item.room.toUpperCase()}</Text>
                    <Text style={styles.postAuthor}>{name}</Text>
                    <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
                  </View>
                </View>

                {!!item.tags?.length && (
                  <View style={styles.tagRow}>
                    {item.tags.slice(0, 4).map((t) => (
                      <View key={t} style={styles.tagPill}>
                        <Text style={styles.tagText}>{t.replace("_", " ")}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.postBody}>{item.body}</Text>
              </Card>
            );
          }}
          ListEmptyComponent={
            <Card>
              <Muted>No posts yet. Be the first to share something 💛</Muted>
            </Card>
          }
        />

        {/* FAB */}
        <Pressable style={styles.fab} onPress={() => setShowNewPost(true)}>
          <Text style={styles.fabText}>＋</Text>
        </Pressable>

        {/* New Post Modal */}
        <Modal visible={showNewPost} animationType="slide" transparent>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    {/* Backdrop: tap to dismiss keyboard */}
    <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss}>
      {/* Card: stop taps from closing/dismissing unexpectedly */}
      <Pressable style={styles.modalCard} onPress={() => {}}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.modalTitle}>New Post</Text>

          {/* Done button: always dismiss keyboard */}
          <Pressable onPress={Keyboard.dismiss} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ color: theme.colors.blue, fontWeight: "900" }}>Done</Text>
          </Pressable>
        </View>

        <Muted>Choose a room, add tags, write your post.</Muted>

        {/* ... your existing room chips + tag chips ... */}

        <Text style={styles.modalLabel}>Post</Text>
        <TextInput
  value={newBody}
  onChangeText={setNewBody}
  placeholder="Write something supportive, curious, or honest..."
  placeholderTextColor={theme.colors.muted}
  style={styles.input}
  multiline
  blurOnSubmit={true}
  returnKeyType="done"
  onSubmitEditing={Keyboard.dismiss}
/>


        <View style={styles.modalBtnRow}>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              Keyboard.dismiss();
              setShowNewPost(false);
              setNewBody("");
              setNewTags([]);
              setNewRoom("general");
            }}
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={canPost ? "Post" : "Post (write more)"}
              onPress={submitPost}
            />
          </View>
        </View>
      </Pressable>
    </Pressable>
  </KeyboardAvoidingView>
</Modal>

      </View>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    gap: theme.spacing.md,
  },
  header: { gap: 6 },

  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  mutedSmall: { color: theme.colors.muted, fontWeight: "800" },

  postTopRow: { flexDirection: "row", justifyContent: "space-between" },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  postRoom: { fontWeight: "900", color: theme.colors.blue, fontSize: 12 },
  postAuthor: { fontWeight: "900", color: theme.colors.text },
  postTime: { color: theme.colors.muted, fontSize: 12 },

  postBody: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagPill: {
    backgroundColor: theme.colors.softBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  tagText: { fontWeight: "800", fontSize: 12, color: theme.colors.text },

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: theme.colors.text },
  modalLabel: { fontWeight: "900", color: theme.colors.text, marginTop: 6 },

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

  modalBtnRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.softBg,
  },
  secondaryText: { fontWeight: "900", color: theme.colors.text },
});
