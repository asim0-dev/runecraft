import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

const rarityWeights: Record<string, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
};

const COOLDOWN_MS = 5000;

function rollRarity(): string {
  const total = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    if (rand < weight) return rarity;
    rand -= weight;
  }
  return 'common';
}

export default async function huntHandler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const userId = userData.user.id;

  const { data: lastAction, error: cooldownError } = await supabase
    .from('actions_log')
    .select('created_at')
    .eq('user_id', userId)
    .eq('action', 'hunt')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cooldownError && cooldownError.code !== 'PGRST116') {
    console.error('Cooldown check error:', cooldownError);
    return res.status(500).json({ error: 'Failed to check cooldown' });
  }

  if (lastAction) {
    const lastTime = new Date(lastAction.created_at).getTime();
    if (Date.now() - lastTime < COOLDOWN_MS) {
      return res.status(429).json({ error: 'Cooldown active' });
    }
  }

  const lootQty = Math.floor(Math.random() * 3) + 1;
  const loot: any[] = [];
  const lootItemsForDB: any[] = [];

  const { data: allItems, error: itemsError } = await supabase.from('items').select('*');
  if (itemsError || !allItems) {
    console.error('Items fetch error:', itemsError);
    return res.status(500).json({ error: 'No items found' });
  }

  const itemsByRarity: Record<string, any[]> = {};
  allItems.forEach(item => {
    if (!itemsByRarity[item.rarity]) itemsByRarity[item.rarity] = [];
    itemsByRarity[item.rarity].push(item);
  });

  for (let i = 0; i < lootQty; i++) {
    const rarity = rollRarity();
    const pool = itemsByRarity[rarity];
    if (pool && pool.length > 0) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      loot.push(item);
      lootItemsForDB.push({ item_id: item.id, qty: 1 });
    }
  }

  try {
    for (const item of lootItemsForDB) {
      await supabase.rpc('increment_inventory', {
        p_user_id: userId,
        p_item_id: item.item_id,
        p_qty: item.qty,
      });
    }

    await supabase.from('actions_log').insert({
      user_id: userId,
      action: 'hunt',
    });
  } catch (dbError) {
    console.error('Database transaction error:', dbError);
    return res.status(500).json({ error: 'Failed to update database' });
  }

  res.status(200).json({ success: true, loot });
}
