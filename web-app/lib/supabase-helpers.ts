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

export async function saveCalculation(
  sessionName: string,
  inputParams: any,
  results: any
): Promise<SavedCalculation | null> {
  try {
    const { data, error } = await supabase
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
  try {
    const { data, error } = await supabase
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
  try {
    const { error } = await supabase.from('roi_calculations').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return false;
  }
}

