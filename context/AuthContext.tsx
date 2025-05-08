import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, Clan } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentOnboardingData: (data: Partial<User>) => void;
  currentOnboardingData: Partial<User>;
}

const defaultContext: AuthContextProps = {
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  setCurrentOnboardingData: () => {},
  currentOnboardingData: {},
};

const AuthContext = createContext<AuthContextProps>(defaultContext);

// For storage in dev environment
const STORAGE_KEY = 'user-auth';

async function saveToStorage(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getFromStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function removeFromStorage(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentOnboardingData, setCurrentOnboardingData] = useState<Partial<User>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.data.session.user.id)
            .single();

          if (profile) {
            const progress = profile.progress as { totalCompletedDays: number };
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              clan: profile.clan_id as unknown as Clan,
              totalDaysCompleted: progress?.totalCompletedDays || 0,
            };
            setUser(userData);
            router.replace('/(app)/(tabs)/totem');
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const progress = profile.progress as { totalCompletedDays: number };
          const userData: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            clan: profile.clan_id as unknown as Clan,
            totalDaysCompleted: progress?.totalCompletedDays || 0,
          };
          setUser(userData);
          router.replace('/(app)/(tabs)/totem');
        }
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name // Add name to user metadata
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const defaultProgress = {
          currentProgram: null,
          currentDay: 1,
          streak: 0,
          totalCompletedDays: 0
        };

        // Then create the profile with the name
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: name, // Use the name parameter here
              email: email,
              progress: defaultProgress,
              jour_actuel: 1
            }
          ]);

        if (profileError) throw profileError;

        const userData: User = {
          id: authData.user.id,
          name: name, // Set the name in the user object
          email: email,
          clan: null,
          totalDaysCompleted: 0,
        };
        
        setUser(userData);
        router.push('/(auth)/onboarding/clan');
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        currentOnboardingData,
        setCurrentOnboardingData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}