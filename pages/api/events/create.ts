// pages/api/events/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  // Ensure the user is signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Admin check — replaced with your actual UID
  const ADMIN_UIDS = ["558ab90b-6e5c-4376-a6d5-043683ed8fe5"];
  if (!ADMIN_UIDS.includes(user.id)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { name, description, bonus_type, bonus_value, start_time, end_time } = req.body;

  if (!name || !description || !bonus_type || !bonus_value || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Insert into events table
  const { error } = await supabase.from("events").insert({
    name,
    description,
    bonus_type,
    bonus_value: Number(bonus_value),
    start_time,
    end_time,
  });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create event" });
  }

  return res.status(200).json({ success: true });
}