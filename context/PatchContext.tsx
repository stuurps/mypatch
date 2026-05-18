import React, { createContext, useReducer, useEffect, use } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter, useSegments } from 'expo-router';
import { getFirstPatch } from '@/db/database';
import type { Patch } from '@/db/database';

type State = {
  patch: Patch | null;
  isLoading: boolean;
};

type Action =
  | { type: 'SET_PATCH'; payload: Patch | null }
  | { type: 'UPDATE_PATCH'; payload: Partial<Patch> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PATCH':
      return { patch: action.payload, isLoading: false };
    case 'UPDATE_PATCH':
      if (!state.patch) return state;
      return { ...state, patch: { ...state.patch, ...action.payload } };
    default:
      return state;
  }
}

const PatchContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function PatchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { patch: null, isLoading: true });
  const db = useSQLiteContext();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    getFirstPatch(db).then(patch => {
      dispatch({ type: 'SET_PATCH', payload: patch ?? null });
    });
  }, []);

  useEffect(() => {
    if (state.isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!state.patch && !inOnboarding) {
      router.replace('/onboarding');
    } else if (state.patch && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [state.isLoading, state.patch, segments]);

  return (
    <PatchContext.Provider value={{ state, dispatch }}>
      {children}
    </PatchContext.Provider>
  );
}

export function usePatch() {
  const ctx = use(PatchContext);
  if (!ctx) throw new Error('usePatch must be used within PatchProvider');
  return ctx;
}
