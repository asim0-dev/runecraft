// pages/api/admin/force-end-event.ts
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

  const { eventId } = req.body;
  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  const { error } = await supabase
    .from("events")
    .update({ end_time: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to end event" });
  }

  return res.status(200).json({ success: true, message: "Event ended successfully" });
}