// /pages/api/market/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data: listings, error } = await supabase
    .from("market_listings")
    .select(`
      id,
      seller_id,
      item_id,
      quantity,
      price,
      status,
      created_at,
      items (
        name,
        rarity,
        emoji
      ),
      profiles!market_listings_seller_id_fkey (
        username
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch market listings" });
  }

  return res.status(200).json(listings);
}