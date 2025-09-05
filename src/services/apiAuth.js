import { supabase } from '../supabase';

export async function signInWithGithub() {
  await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function getCurrentSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}