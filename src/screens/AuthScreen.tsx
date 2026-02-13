import React, { useState } from "react";
import {
  Alert,
  TextInput,
  StyleSheet,
  View,
  Text,
  Pressable,
  Keyboard,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Screen, Card, H1, Muted, PrimaryButton } from "../components/ui";
import { theme } from "../theme/theme";
import { ensureMyProfile, getMyProfile } from "../lib/profiles";

type Mode = "signup" | "login" | "confirm";

function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}
function normalizeUsername(v: string) {
  return v.trim().toLowerCase();
}
function validateUsername(u: string) {
  if (u.length < 3) return "Username must be at least 3 characters.";
  if (u.length > 24) return "Username must be 24 characters or less.";
  if (!/^[a-z0-9_]+$/.test(u)) return "Username can only use a-z, 0-9, and underscore.";
  return null;
}
function emailPrefix(email: string) {
  const part = email.split("@")[0] ?? "user";
  return normalizeUsername(part.replace(/[^a-z0-9_]/g, "_").slice(0, 24));
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Username = display name (single field)
  const [username, setUsername] = useState("");

  // Confirmation code from email (can be 6–10 digits; you said you see 8)
  const [confirmCode, setConfirmCode] = useState("");

  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    Keyboard.dismiss();

    const e = normalizeEmail(email);
    const p = password.trim();
    const u = normalizeUsername(username);

    if (!e.includes("@")) return Alert.alert("Enter a valid email");
    if (p.length < 8) return Alert.alert("Password must be at least 8 characters");

    const uErr = validateUsername(u);
    if (uErr) return Alert.alert("Username problem", uErr);

    setLoading(true);

    // Create account. If confirm-email is ON, user must confirm before they can log in.
    const { error } = await supabase.auth.signUp({
      email: e,
      password: p,
      options: {
        data: { display_name: u }, // username stored in user metadata
      },
    });

    setLoading(false);

    if (error) return Alert.alert("Sign up failed", error.message);

    Alert.alert(
      "Check your email",
      "Enter the confirmation code we sent to your email to activate your account."
    );
    setMode("confirm");
  };

  const confirmEmail = async () => {
    Keyboard.dismiss();

    const e = normalizeEmail(email);
    const token = confirmCode.trim();

    if (!e.includes("@")) return Alert.alert("Enter a valid email");
    if (token.length < 6) return Alert.alert("Enter the code from your email");

    setLoading(true);

    // IMPORTANT: for confirming a new signup use type: "signup"
    const { data, error } = await supabase.auth.verifyOtp({
      email: e,
      token,
      type: "signup",
    });

    setLoading(false);

    if (error) return Alert.alert("Confirmation failed", error.message);

    // If verification created a session, you’re now logged in.
    // Create profile best-effort (only if missing).
    try {
      const existing = await getMyProfile();
      if (!existing) {
        const candidate = username.trim()
          ? normalizeUsername(username)
          : emailPrefix(e);
        const uErr = validateUsername(candidate);
        if (!uErr) await ensureMyProfile(candidate);
      }
    } catch {
      // don’t block the user if profile fails
    }

    // Done — App.tsx should now switch into the main tabs (session exists)
  };

  const signIn = async () => {
    Keyboard.dismiss();

    const e = normalizeEmail(email);
    const p = password.trim();

    if (!e.includes("@")) return Alert.alert("Enter a valid email");
    if (!p) return Alert.alert("Enter your password");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
    setLoading(false);

    if (error) {
      // If they forgot to confirm, guide them
      if (error.message.toLowerCase().includes("confirm")) {
        Alert.alert("Email not confirmed", "Please confirm your email first.");
        setMode("confirm");
        return;
      }
      return Alert.alert("Login failed", error.message);
    }

    // Ensure profile exists best-effort
    try {
      const existing = await getMyProfile();
      if (!existing) {
        const candidate = username.trim()
          ? normalizeUsername(username)
          : emailPrefix(e);
        const uErr = validateUsername(candidate);
        if (!uErr) await ensureMyProfile(candidate);
      }
    } catch {
      // ignore
    }
  };

  return (
    <Screen>
      <H1>
        {mode === "signup"
          ? "Create account"
          : mode === "login"
          ? "Log in"
          : "Confirm email"}
      </H1>
      <Muted>
        {mode === "confirm"
          ? "Enter the code from your email to activate your account."
          : mode === "signup"
          ? "Create an account to save your data and post."
          : "Welcome back."}
      </Muted>

      <Card>
        <Muted>Email</Muted>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {mode !== "confirm" && (
          <>
            <Muted>Password</Muted>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.colors.muted}
              secureTextEntry
              style={styles.input}
            />
          </>
        )}

        <View style={{ gap: 10 }}>
          <Muted>Username {mode === "login" ? "(optional)" : ""}</Muted>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. reset_girl"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {mode === "confirm" && (
          <View style={{ gap: 10 }}>
            <Muted>Confirmation code</Muted>
            <TextInput
              value={confirmCode}
              onChangeText={setConfirmCode}
              placeholder="Enter the code (often 6–10 digits)"
              placeholderTextColor={theme.colors.muted}
              keyboardType="number-pad"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        )}

        <PrimaryButton
          label={
            loading
              ? "Please wait..."
              : mode === "signup"
              ? "Sign up"
              : mode === "login"
              ? "Log in"
              : "Confirm"
          }
          onPress={mode === "signup" ? signUp : mode === "login" ? signIn : confirmEmail}
        />

        <View style={styles.linksRow}>
          <Pressable onPress={() => setMode("signup")}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
          <Pressable onPress={() => setMode("login")}>
            <Text style={styles.link}>Log in</Text>
          </Pressable>
          <Pressable onPress={() => setMode("confirm")}>
            <Text style={styles.link}>Confirm email</Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: theme.colors.softBg,
    color: theme.colors.text,
  },
  linksRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: { color: theme.colors.blue, fontWeight: "800" },
});
