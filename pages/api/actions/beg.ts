import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("last_beg")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(profileError);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }

  const now = new Date();
  const lastBeg = new Date(profile.last_beg);
  const cooldown = 30000; // 30 seconds
  
  if (now.getTime() - lastBeg.getTime() < cooldown) {
    return res.status(429).json({ error: "Still on cooldown" });
  }

  const coinsAdded = Math.floor(Math.random() * 41) + 10;
  
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ 
      coins: supabase.rpc("increment_coins", { uid: user.id, amt: coinsAdded }), 
      last_beg: now.toISOString() 
    })
    .eq("id", user.id);

  if (updateError) {
    console.error(updateError);
    return res.status(500).json({ error: "Failed to update profile" });
  }

  return res.status(200).json({ success: true, coinsAdded });
}