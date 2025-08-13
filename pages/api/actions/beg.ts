// pages/api/actions/beg.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COOLDOWN_MS = 5000;

export default async function begHandler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Auth check
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const userId = userData.user.id;

  // 2. Cooldown check for 'beg' action
  const { data: lastAction, error: cooldownError } = await supabase
    .from('actions_log')
    .select('created_at')
    .eq('user_id', userId)
    .eq('action', 'beg')
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

  // 3. Generate coin loot
  const coinsAdded = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

  // 4. DB transaction:
  // - Increment coins in the profiles table.
  // - Log the action.
  try {
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ coins: supabase.raw('coins + ??', [coinsAdded]) })
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Coin update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    await supabase.from('actions_log').insert({
      user_id: userId,
      action: 'beg',
    });
  } catch (dbError) {
    console.error('Database transaction error:', dbError);
    return res.status(500).json({ error: 'Failed to update database' });
  }

  // 5. Return result
  res.status(200).json({ success: true, coinsAdded });
}