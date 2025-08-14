// pages/api/admin/create-listing.ts
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

  const { sellerId, itemId, quantity, price } = req.body;
  if (!sellerId || !itemId || quantity <= 0 || price <= 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const { error } = await supabase.rpc("admin_create_listing_transaction", {
    p_seller_id: sellerId,
    p_item_id: itemId,
    p_quantity: quantity,
    p_price: price,
  });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create listing" });
  }

  return res.status(200).json({ success: true, message: "Admin listing created successfully" });
}