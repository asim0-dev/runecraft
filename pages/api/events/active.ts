// pages/api/events/active.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  
  // No user check needed, as this is public
  
  // Fetch the active event — one that hasn't expired yet
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gt("end_time", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // Ignore "no rows found" error (PGRST116)
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch active event" });
  }

  if (!data) {
    return res.status(200).json({ active: false });
  }

  return res.status(200).json({
    active: true,
    event: data,
  });
}