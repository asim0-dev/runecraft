// pages/api/admin/adjust-coins.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const ALLOWED_ADMIN_IDS = ["558ab90b-6e5c-4376-a6d5-043683ed8fe5"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ALLOWED_ADMIN_IDS.includes(user.id)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { targetUserId, amount } = req.body;
  if (!targetUserId || typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { error } = await supabase.rpc("increment_coins", {
    uid: targetUserId,
    amt: amount,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}