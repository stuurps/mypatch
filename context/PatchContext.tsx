import React, { createContext, useReducer, useEffect, use } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter, useSegments } from 'expo-router';
import { getFirstPatch, getSetting } from '@/db/database';
import type { Patch } from '@/db/database';

export type ToastPayload = {
  species: string;
  type: 'logged' | 'new' | 'year' | 'deleted';
};

type State = {
  patch: Patch | null;
  isLoading: boolean;
  pendingToast: ToastPayload | null;
  editingPatch: boolean;
  userName: string | null;
};

type Action =
  | { type: 'SET_PATCH'; payload: Patch | null }
  | { type: 'UPDATE_PATCH'; payload: Partial<Patch> }
  | { type: 'SET_TOAST'; payload: ToastPayload | null }
  | { type: 'SET_EDITING_PATCH'; payload: boolean }
  | { type: 'SET_USER_NAME'; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PATCH':
      return { ...state, patch: action.payload, isLoading: false };
    case 'UPDATE_PATCH':
      if (!state.patch) return state;
      return { ...state, patch: { ...state.patch, ...action.payload } };
    case 'SET_TOAST':
      return { ...state, pendingToast: action.payload };
    case 'SET_EDITING_PATCH':
      return { ...state, editingPatch: action.payload };
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };
    default:
      return state;
  }
}

const PatchContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function PatchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { patch: null, isLoading: true, pendingToast: null, editingPatch: false, userName: null });
  const db = useSQLiteContext();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    Promise.all([getFirstPatch(db), getSetting(db, 'user_name')]).then(([patch, userName]) => {
      dispatch({ type: 'SET_PATCH', payload: patch ?? null });
      dispatch({ type: 'SET_USER_NAME', payload: userName });
    });
  }, []);

  useEffect(() => {
    if (state.isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!state.patch && !inOnboarding) {
      router.replace('/onboarding');
    } else if (state.patch && inOnboarding && !state.editingPatch) {
      router.replace('/(tabs)');
    }
  }, [state.isLoading, state.patch, state.editingPatch, segments]);

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
