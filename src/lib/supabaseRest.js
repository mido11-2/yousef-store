import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_KEY
);

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function isLoggedIn() {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

export async function getGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return data;
}

export async function uploadGameImage(file) {
  if (!file) throw new Error("اختار صورة أولاً.");

  if (!file.type.startsWith("image/")) {
    throw new Error("الملف لازم يكون صورة.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("حجم الصورة يجب ألا يتجاوز 5MB.");
  }

  const ext =
    (file.name.split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";

  const filePath = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("game-images")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("game-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function upsertGame(game) {
  const { data, error } = await supabase
    .from("games")
    .upsert(game, {
      onConflict: "id",
    })
    .select();

  if (error) throw new Error(error.message);

  return data;
}

// تحديث اللعبة فقط بدون INSERT
export async function updateGame(id, changes) {
  const { data, error } = await supabase
    .from("games")
    .update(changes)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteGame(id) {
  const { error } = await supabase
    .from("games")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  return true;
}

export async function importGames(games) {
  const { data, error } = await supabase
    .from("games")
    .upsert(games, {
      onConflict: "id",
    });

  if (error) throw new Error(error.message);

  return data;
}