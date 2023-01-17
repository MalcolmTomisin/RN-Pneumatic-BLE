import {create} from 'zustand';

interface AuthState {
  isSignedIn: boolean;
  token?: string;
  setSignIn: (arg: boolean) => void;
  setToken: (arg: string) => void;
  hydrateState: (arg: {isSignedIn: boolean; token?: string}) => void;
}

export const useAppAuth = create<AuthState>(set => ({
  isSignedIn: false,
  token: '',
  setSignIn: (status: boolean) =>
    set(state => ({...state, isSignedIn: status})),
  setToken: (token: string) => set(state => ({...state, token})),
  hydrateState: (persistedState: {isSignedIn: boolean; token?: string}) =>
    set(state => ({...state, ...persistedState})),
}));
