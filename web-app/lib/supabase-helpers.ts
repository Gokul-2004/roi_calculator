import { supabase } from './supabase';

export interface SavedCalculation {
  id: string;
  user_id: string;
  session_name: string;
  input_parameters: any;
  calculated_results: any;
  created_at: string;
  updated_at: string;
}

function ensureSupabaseAvailable(action: string) {
  if (!supabase) {
    console.warn(
      `[Supabase Helpers] Supabase client unavailable while attempting to ${action}. ` +
        'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.'
    );
    return false;
  }
  return true;
}

export async function saveCalculation(
  sessionName: string,
  inputParams: any,
  results: any
): Promise<SavedCalculation | null> {
  if (!ensureSupabaseAvailable('save calculation')) {
    return null;
  }
  try {
    const { data, error } = await supabase!
      .from('roi_calculations')
      .insert({
        user_id: 'anonymous',
        session_name: sessionName,
        input_parameters: inputParams,
        calculated_results: results,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving calculation:', error);
    return null;
  }
}

export async function loadCalculations(): Promise<SavedCalculation[]> {
  if (!ensureSupabaseAvailable('load calculations')) {
    return [];
  }
  try {
    const { data, error } = await supabase!
      .from('roi_calculations')
      .select('*')
      .eq('user_id', 'anonymous')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading calculations:', error);
    return [];
  }
}

export async function deleteCalculation(id: string): Promise<boolean> {
  if (!ensureSupabaseAvailable('delete calculation')) {
    return false;
  }
  try {
    const { error } = await supabase!.from('roi_calculations').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return false;
  }
}

