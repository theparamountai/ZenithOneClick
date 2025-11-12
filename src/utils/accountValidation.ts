import { supabase } from "@/integrations/supabase/client";

export const checkUserHasAccount = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error("Error checking user accounts:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Error in checkUserHasAccount:", error);
    return false;
  }
};

export const getUserAccounts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return [];
  }
};
