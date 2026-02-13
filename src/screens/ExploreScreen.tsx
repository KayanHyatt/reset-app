import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { Card, H1, H2, Muted } from "../components/ui";
import { theme } from "../theme/theme";

type ExploreItem = {
  id: string;
  title: string;
  subtitle: string;
  url: string;
};

type Section = {
  key: "podcasts" | "talks" | "music" | "journals";
  title: string;
  description: string;
  accent: string;
  items: ExploreItem[];
};

const SECTIONS: Section[] = [
  {
    key: "podcasts",
    title: "Podcasts",
    description: "Short listens for mood, stress, and wellbeing.",
    accent: theme.colors.blue,
    items: [
      {
        id: "p1",
        title: "The Happiness Lab",
        subtitle: "Psychology-based happiness insights",
        url: "https://www.pushkin.fm/podcasts/the-happiness-lab-with-dr-laurie-santos",
      },
      {
        id: "p2",
        title: "Ten Percent Happier",
        subtitle: "Meditation + practical mental fitness",
        url: "https://www.tenpercent.com/podcast",
      },
      {
        id: "p3",
        title: "On Purpose",
        subtitle: "Mindset, purpose, and growth",
        url: "https://www.iheart.com/podcast/1119-on-purpose-with-jay-shetty-30589432/",
      },
      {
        id: "p4",
        title: "The Calm Collective",
        subtitle: "Calm tools for anxious minds",
        url: "https://www.thecalmcollective.com/podcast",
      },
      {
        id: "p5",
        title: "The Mindful Kind",
        subtitle: "Simple mindfulness for everyday life",
        url: "https://www.rachaelkable.com/podcast",
      },
    ],
  },
  {
    key: "talks",
    title: "Motivational Talks",
    description: "TED-style talks to reset perspective and confidence.",
    accent: theme.colors.green,
    items: [
      {
        id: "t1",
        title: "Brené Brown: The power of vulnerability",
        subtitle: "Courage, shame, connection",
        url: "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
      },
      {
        id: "t2",
        title: "Kelly McGonigal: How to make stress your friend",
        subtitle: "Reframe stress response",
        url: "https://www.ted.com/talks/kelly_mcgonigal_how_to_make_stress_your_friend",
      },
      {
        id: "t3",
        title: "Amy Cuddy: Your body language may shape who you are",
        subtitle: "Confidence and presence",
        url: "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are",
      },
      {
        id: "t4",
        title: "Matt Cutts: Try something new for 30 days",
        subtitle: "Small change, big momentum",
        url: "https://www.ted.com/talks/matt_cutts_try_something_new_for_30_days",
      },
      {
        id: "t5",
        title: "Guy Winch: Why we all need to practice emotional first aid",
        subtitle: "Emotional resilience",
        url: "https://www.ted.com/talks/guy_winch_why_we_all_need_to_practice_emotional_first_aid",
      },
    ],
  },
  {
    key: "music",
    title: "Music",
    description: "Playlists to focus, calm down, or boost mood.",
    accent: theme.colors.yellow,
    items: [
      {
        id: "m1",
        title: "Peaceful Piano",
        subtitle: "Soft focus + calm",
        url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
      },
      {
        id: "m2",
        title: "Deep Focus",
        subtitle: "Study / work concentration",
        url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
      },
      {
        id: "m3",
        title: "Lo-Fi Beats",
        subtitle: "Chill beats to unwind",
        url: "https://open.spotify.com/playlist/37i9dQZF1DXdxcBWuJkbcy",
      },
      {
        id: "m4",
        title: "Calm Vibes",
        subtitle: "Gentle mood reset",
        url: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
      },
      {
        id: "m5",
        title: "Mood Booster",
        subtitle: "Upbeat energy lift",
        url: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",
      },
    ],
  },
  {
    key: "journals",
    title: "Journals",
    description: "Guided journals and prompts to build habits.",
    accent: theme.colors.red,
    items: [
      {
        id: "j1",
        title: "The Five Minute Journal",
        subtitle: "Gratitude + daily reflection",
        url: "https://www.intelligentchange.com/products/the-five-minute-journal",
      },
      {
        id: "j2",
        title: "Mind Journal",
        subtitle: "Confidence and self-growth prompts",
        url: "https://themindjournal.com/",
      },
      {
        id: "j3",
        title: "Self-Love Journal Prompts",
        subtitle: "Prompt ideas to start writing",
        url: "https://positivepsychology.com/self-love-journal-prompts/",
      },
      {
        id: "j4",
        title: "CBT Thought Record Template",
        subtitle: "A structured way to reframe thoughts",
        url: "https://www.psychologytools.com/resource/thought-record/",
      },
      {
        id: "j5",
        title: "Morning Pages (The Artist’s Way)",
        subtitle: "Free-writing practice for clarity",
        url: "https://juliacameronlive.com/basic-tools/morning-pages/",
      },
    ],
  },
];

async function openLink(url: string) {
  const ok = await Linking.canOpenURL(url);
  if (!ok) {
    Alert.alert("Can’t open link", "Your device couldn’t open this link.");
    return;
  }
  Linking.openURL(url);
}

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <H1>Explore</H1>
      <Muted>Pick something that fits your vibe today.</Muted>

      {SECTIONS.map((section) => (
        <View key={section.key} style={{ gap: 10 }}>
          <View style={styles.sectionHeader}>
            <H2>{section.title}</H2>
            <View style={[styles.dot, { backgroundColor: section.accent }]} />
          </View>
          <Muted>{section.description}</Muted>

          <FlatList
            data={section.items}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 8 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => openLink(item.url)}>
                <View style={[styles.tile, { borderColor: section.accent }]}>
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.tileSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>

                  <View style={styles.openRow}>
                    <Text style={[styles.openText, { color: section.accent }]}>Open</Text>
                    <Text style={[styles.openArrow, { color: section.accent }]}>↗</Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      ))}

      <Card>
        <H2>Coming soon</H2>
        <Muted>Playlists you can save, offline listening, and sponsor link tracking.</Muted>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: 24,
    gap: theme.spacing.md,
  },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },

  tile: {
    width: 220,
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    gap: 8,
  },
  tileTitle: { fontWeight: "900", fontSize: 16, color: theme.colors.text },
  tileSubtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 18 },

  openRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  openText: { fontWeight: "900" },
  openArrow: { fontWeight: "900" },
});
