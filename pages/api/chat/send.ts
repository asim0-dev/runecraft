import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Message content is required" });
  }

  if (content.length > 300) {
    return res.status(400).json({ error: "Message too long (max 300 characters)" });
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: session.user.id,
      content: content.trim(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }

  return res.status(200).json({ message: data });
}