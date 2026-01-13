import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/lib/supabase';

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });
}
