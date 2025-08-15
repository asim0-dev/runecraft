import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerClient({ req, res });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const userId = userData.user.id;

  // FIX: Fetch the user's profile and check if it exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('last_beg')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Failed to fetch profile for cooldown check:', profileError);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }

  const now = new Date();
  let lastBeg = new Date(0); // Default to a past date
  
  if (profile) {
    lastBeg = new Date(profile.last_beg);
  }

  const cooldown = 30000; // 30 seconds
  
  if (now.getTime() - lastBeg.getTime() < cooldown) {
    return res.status(429).json({ error: 'Cooldown active' });
  }

  const coinsAdded = Math.floor(Math.random() * 41) + 10;
  
  // FIX: Update the user's coins and last_beg timestamp
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      coins: supabase.rpc('increment_coins', { uid: userId, amt: coinsAdded }), 
      last_beg: now.toISOString() 
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Failed to update database:', updateError);
    return res.status(500).json({ error: 'Failed to update database' });
  }

  return res.status(200).json({ success: true, coinsAdded });
}
