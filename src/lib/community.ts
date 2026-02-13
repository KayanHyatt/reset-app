import { supabase } from "./supabase";

export type Room = "general" | "support" | "advice";

export type CommunityPost = {
  id: string;
  author_user_id: string;
  room: Room;
  tags: string[];
  body: string;
  created_at: string;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
  } | null;
};

export async function fetchCommunityPosts(args?: {
  room?: Room | "all";
  tag?: string | "all";
  limit?: number;
}) {
  const room = args?.room ?? "all";
  const tag = args?.tag ?? "all";
  const limit = args?.limit ?? 50;

  // Embedded select: works because community_posts.author_user_id references profiles.user_id
  let q = supabase
    .from("community_posts")
    .select("id, author_user_id, room, tags, body, created_at, profiles(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (room !== "all") q = q.eq("room", room);

  // Filter by tag (Postgres array contains)
  if (tag !== "all") q = q.contains("tags", [tag]);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  return (data ?? []) as CommunityPost[];
}

export async function createCommunityPost(input: {
  room: Room;
  tags: string[];
  body: string;
}) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!userData.user) throw new Error("Not signed in.");

  const body = input.body.trim();
  if (!body) throw new Error("Post is empty.");

  const payload = {
    author_user_id: userData.user.id,
    room: input.room,
    tags: input.tags,
    body,
  };

  const { error } = await supabase.from("community_posts").insert(payload);
  if (error) throw new Error(error.message);
}
