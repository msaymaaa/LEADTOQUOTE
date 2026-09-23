import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole, AccountStatus, TechnicianStatus } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    role?: 'customer' | 'technician'
  ) => Promise<{ error: AuthError | Error | null; user: User | null; needsEmailVerification?: boolean }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (data: { full_name?: string; phone?: string }) => Promise<{ error: Error | null; profile: UserProfile | null }>;
  updateUserRoleAndStatus: (
    targetUserId: string,
    updates: {
      role?: UserRole;
      account_status?: AccountStatus;
      technician_status?: TechnicianStatus | null;
    }
  ) => Promise<{ error: Error | null; data?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // Fetch or safely initialize profile in public.profiles
  const fetchProfile = async (currentUser: User): Promise<UserProfile | null> => {
    setIsProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile from Supabase:', error.message);
      }

      if (data) {
        const loadedProfile: UserProfile = {
          id: data.id,
          full_name: data.full_name || currentUser.user_metadata?.full_name || '',
          email: data.email || currentUser.email || '',
          phone: data.phone || currentUser.user_metadata?.phone || '',
          role: (data.role as UserRole) || 'customer',
          account_status: (data.account_status as AccountStatus) || 'active',
          technician_status: (data.technician_status as TechnicianStatus) ?? (data.role === 'technician' ? 'pending' : null),
          company: data.company,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(loadedProfile);
        return loadedProfile;
      }

      // Safe fallback: Default to customer, or technician if user registered as technician
      const metaRole = currentUser.user_metadata?.role;
      const safeRole: UserRole = metaRole === 'technician' ? 'technician' : 'customer';
      const fallbackProfile: UserProfile = {
        id: currentUser.id,
        full_name: (currentUser.user_metadata?.full_name as string) || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || '',
        phone: (currentUser.user_metadata?.phone as string) || '',
        role: safeRole,
        account_status: 'active',
        technician_status: safeRole === 'technician' ? 'pending' : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Attempt to upsert the profile
      const { data: upsertedData, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: fallbackProfile.id,
          full_name: fallbackProfile.full_name,
          email: fallbackProfile.email,
          role: fallbackProfile.role,
          phone: fallbackProfile.phone,
          account_status: fallbackProfile.account_status,
          technician_status: fallbackProfile.technician_status,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .maybeSingle();

      if (upsertError) {
        console.warn('Profile fallback upsert warning (trigger may handle it):', upsertError.message);
      }

      const resultProfile: UserProfile = upsertedData ? {
        id: upsertedData.id,
        full_name: upsertedData.full_name || fallbackProfile.full_name,
        email: upsertedData.email || fallbackProfile.email,
        phone: upsertedData.phone || fallbackProfile.phone,
        role: (upsertedData.role as UserRole) || fallbackProfile.role,
        account_status: (upsertedData.account_status as AccountStatus) || fallbackProfile.account_status,
        technician_status: (upsertedData.technician_status as TechnicianStatus) ?? fallbackProfile.technician_status,
        created_at: upsertedData.created_at,
        updated_at: upsertedData.updated_at
      } : fallbackProfile;

      setProfile(resultProfile);
      return resultProfile;
    } catch (err: any) {
      console.error('Unexpected error loading profile:', err);
      const tempProfile: UserProfile = {
        id: currentUser.id,
        full_name: (currentUser.user_metadata?.full_name as string) || 'User',
        email: currentUser.email || '',
        role: 'customer',
        account_status: 'active'
      };
      setProfile(tempProfile);
      return tempProfile;
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session retrieval
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching initial session:', error.message);
        }

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user);
          } else {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Listen for auth state changes via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign In with email & password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign Up with email, password, full_name, phone, and safe public role ('customer' or 'technician')
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string = '',
    role: 'customer' | 'technician' = 'customer'
  ) => {
    try {
      const trimmedEmail = email.trim();
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();

      // STRICT SECURITY RULE: Public signup can ONLY register as 'customer' or 'technician'
      const safeRole: 'customer' | 'technician' = role === 'technician' ? 'technician' : 'customer';

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            phone: trimmedPhone,
            role: safeRole
          }
        }
      });

      if (error) {
        return { error, user: null };
      }

      const createdUser = data.user;

      // 1. If Supabase returns a session directly (email confirmations disabled)
      if (createdUser && data.session) {
        setUser(createdUser);
        setSession(data.session);
        await fetchProfile(createdUser);
        return { error: null, user: createdUser, needsEmailVerification: false };
      }

      // 2. Automatically attempt instant sign in to bypass email confirmation gate
      const loginAttempt = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });

      if (loginAttempt.data?.session && loginAttempt.data?.user) {
        setUser(loginAttempt.data.user);
        setSession(loginAttempt.data.session);
        await fetchProfile(loginAttempt.data.user);
        return { error: null, user: loginAttempt.data.user, needsEmailVerification: false };
      }

      // 3. If Supabase backend project still has "Confirm email" enforced
      if (loginAttempt.error) {
        const isUnconfirmed = loginAttempt.error.message.toLowerCase().includes('email not confirmed');
        if (isUnconfirmed) {
          const customError = new Error(
            'Email confirmation is currently required by your Supabase project settings. To disable it for instant login: Go to Supabase Dashboard -> Authentication -> Providers -> Email -> Toggle OFF "Confirm email".'
          );
          return { error: customError, user: createdUser, needsEmailVerification: true };
        }
        return { error: loginAttempt.error, user: createdUser, needsEmailVerification: false };
      }

      return { error: null, user: createdUser, needsEmailVerification: false };
    } catch (err: any) {
      return { error: err, user: null };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: err };
    }
  };

  // Update own personal profile in public.profiles (Name & Phone only; cannot elevate role)
  const updateProfile = async ({
    full_name,
    phone
  }: {
    full_name?: string;
    phone?: string;
  }) => {
    if (!user) {
      return { error: new Error('User is not authenticated'), profile: null };
    }

    try {
      const trimmedName = full_name !== undefined ? full_name.trim() : profile?.full_name || '';
      const trimmedPhone = phone !== undefined ? phone.trim() : profile?.phone || '';
      const now = new Date().toISOString();

      const payload: Record<string, any> = {
        updated_at: now
      };
      if (full_name !== undefined) payload.full_name = trimmedName;
      if (phone !== undefined) payload.phone = trimmedPhone;

      // Update public.profiles with RLS: auth.uid() = id
      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
        .select('*')
        .maybeSingle();

      if (error) {
        return { error, profile: null };
      }

      const updated: UserProfile = {
        id: user.id,
        full_name: data?.full_name || trimmedName,
        email: data?.email || user.email || '',
        phone: data?.phone || trimmedPhone,
        role: (data?.role as UserRole) || profile?.role || 'customer',
        account_status: (data?.account_status as AccountStatus) || profile?.account_status || 'active',
        technician_status: (data?.technician_status as TechnicianStatus) ?? profile?.technician_status,
        company: data?.company || profile?.company,
        avatar_url: data?.avatar_url || profile?.avatar_url,
        created_at: data?.created_at || profile?.created_at,
        updated_at: data?.updated_at || now
      };

      // Also update auth user metadata for consistency
      await supabase.auth.updateUser({
        data: { full_name: trimmedName, phone: trimmedPhone }
      }).catch(() => {});

      setProfile(updated);
      return { error: null, profile: updated };
    } catch (err: any) {
      return { error: err, profile: null };
    }
  };

  // Owner-only: Update user role and status (Approve tech, promote to staff, etc.)
  const updateUserRoleAndStatus = async (
    targetUserId: string,
    updates: {
      role?: UserRole;
      account_status?: AccountStatus;
      technician_status?: TechnicianStatus | null;
    }
  ) => {
    if (!user || profile?.role !== 'owner') {
      return { error: new Error('Unauthorized: Only an authenticated Owner can modify roles or approval status.') };
    }

    try {
      const now = new Date().toISOString();
      const payload: Record<string, any> = {
        ...updates,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', targetUserId)
        .select('*')
        .maybeSingle();

      if (error) {
        return { error };
      }

      // If owner modified their own role/status, reload local profile
      if (targetUserId === user.id) {
        await fetchProfile(user);
      }

      return { error: null, data };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isProfileLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateUserRoleAndStatus,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
