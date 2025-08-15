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
  const userEmail = userData.user.email;

  // FIX: Fetch the user's profile and check if it exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('last_beg')
    .eq('id', userId)
    .single();

  // If no profile is found, create one for the new user.
  if (!profile) {
    await supabase.from('profiles').insert({ id: userId, username: userEmail, created_at: new Date().toISOString() });
    return res.status(200).json({ success: true, coinsAdded: 0 });
  }

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
  
  // FIX: Correctly pass parameters to the rpc function
  const { error: updateError } = await supabase.rpc('increment_coins', { uid: userId, amt: coinsAdded });

  if (updateError) {
    console.error('Failed to update database:', updateError);
    return res.status(500).json({ error: 'Failed to update database' });
  }

  return res.status(200).json({ success: true, coinsAdded });
}
