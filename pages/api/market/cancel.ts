// /pages/api/market/cancel.ts
import { NextApiRequest, NextApiResponse } from "next";
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

  const { listing_id } = req.body;

  if (!listing_id) {
    return res.status(400).json({ error: "Missing listing_id" });
  }

  const { data: listing, error: listingErr } = await supabase
    .from("market_listings")
    .select("id, seller_id, item_id, quantity, status")
    .eq("id", listing_id)
    .single();

  if (listingErr || !listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (listing.seller_id !== user.id) {
    return res.status(403).json({ error: "You can only cancel your own listings" });
  }

  if (listing.status !== "active") {
    return res.status(400).json({ error: "Listing is not active" });
  }

  const { error: txError } = await supabase.rpc("cancel_listing_transaction", {
    p_seller_id: listing.seller_id,
    p_listing_id: listing.id,
    p_item_id: listing.item_id,
    p_quantity: listing.quantity,
  });

  if (txError) {
    console.error(txError);
    return res.status(500).json({ error: "Failed to cancel listing" });
  }

  return res.status(200).json({ success: true, message: "Listing cancelled and items returned" });
}