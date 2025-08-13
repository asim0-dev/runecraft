import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, content, created_at, profiles!inner(username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }

  return res.status(200).json({ messages: data.reverse() });
}