// /pages/api/market/list.ts
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

  const { item_id, quantity, price } = req.body;

  if (!item_id || quantity <= 0 || price <= 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const { data: inventory, error: invErr } = await supabase
    .from("inventories")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("item_id", item_id)
    .single();

  if (invErr || !inventory || inventory.quantity < quantity) {
    return res.status(400).json({ error: "Not enough items to list" });
  }

  const { error: txError } = await supabase.rpc("list_item_transaction", {
    p_user_id: user.id,
    p_item_id: item_id,
    p_quantity: quantity,
    p_price: price,
  });

  if (txError) {
    console.error(txError);
    return res.status(500).json({ error: "Failed to list item" });
  }

  return res.status(200).json({ success: true, message: "Item listed successfully" });
}