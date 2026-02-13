import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  user_id: string;
  username: string;
  display_name: string; // we’ll store the same value here
  created_at: string;
};

function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

function validateUsername(username: string) {
  if (username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 24) return "Username must be 24 characters or less.";
  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Username can only use a-z, 0-9, and underscore.";
  }
  return null;
}

async function requireUser(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not signed in.");
  return data.user;
}

export async function getMyProfile(): Promise<Profile | null> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Profile) ?? null;
}

export async function isUsernameAvailable(usernameInput: string): Promise<boolean> {
  const username = normalizeUsername(usernameInput);
  const err = validateUsername(username);
  if (err) throw new Error(err);

  // If you want usernames to be globally unique:
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", username)
    .limit(1);

  if (error) throw new Error(error.message);
  return !data || data.length === 0;
}

/**
 * Creates a profile row for the logged-in user if it doesn't exist.
 * Stores the same value in username + display_name.
 *
 * NOTE: This requires the user to be logged in (session exists),
 * otherwise RLS will block the insert.
 */
export async function ensureMyProfile(usernameInput: string): Promise<Profile> {
  const user = await requireUser();

  const username = normalizeUsername(usernameInput);
  const err = validateUsername(username);
  if (err) throw new Error(err);

  // Check if profile exists
  const existing = await getMyProfile();
  if (existing) return existing;

  // Insert profile (username == display_name)
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      username,
      display_name: username,
    })
    .select("user_id, username, display_name, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

/**
 * Updates username (and display_name to match)
 */
export async function updateMyUsername(usernameInput: string): Promise<Profile> {
  const user = await requireUser();

  const username = normalizeUsername(usernameInput);
  const err = validateUsername(username);
  if (err) throw new Error(err);

  // Ensure profile exists first (so update doesn't fail)
  await ensureMyProfile(username);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: username,
    })
    .eq("user_id", user.id)
    .select("user_id, username, display_name, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}
