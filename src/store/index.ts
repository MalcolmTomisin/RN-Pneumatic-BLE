import {create} from 'zustand';
import type {HardwareType, ProfileType} from 'src/schemas';

interface AuthState {
  isSignedIn: boolean;
  token?: string;
  setSignIn: (arg: boolean) => void;
  setToken: (arg: string) => void;
  hydrateState: (arg: {isSignedIn: boolean; token?: string}) => void;
  hardware?: HardwareType;
  profile?: ProfileType;
  setHardware: (arg: HardwareType) => void;
  setProfile: (arg: ProfileType) => void;
  setEmptyState: () => void;
  peripheralAddress?: string;
  setPeripheralAddress: (address: string) => void;
  studyId?: string;
  setStudyId: (arg: string) => void;
  errorMessage?: string;
  setErrorMessage: (errormessage?: string) => void;
}

const initialState = {
  isSignedIn: false,
  token: '',
  hardware: undefined,
  profile: undefined,
  studyId: undefined,
  errorMessage: undefined,
};

export const useAppAuth = create<AuthState>(set => ({
  isSignedIn: false,
  token: '',
  setSignIn: (status: boolean) =>
    set(state => ({...state, isSignedIn: status})),
  setToken: (token: string) => set(state => ({...state, token})),
  hydrateState: (persistedState: {isSignedIn: boolean; token?: string}) =>
    set(state => ({...state, ...persistedState})),
  setHardware: (h: HardwareType) => set(state => ({...state, hardware: h})),
  setProfile: (h: ProfileType) => set(state => ({...state, profile: h})),
  setEmptyState: () => set(state => ({...state, ...initialState})),
  setPeripheralAddress: address =>
    set(state => ({...state, peripheralAddress: address})),
  setStudyId: (studyId: string) => set(state => ({...state, studyId})),
  setErrorMessage: (message?: string) =>
    set(state => ({...state, errorMessage: message})),
}));
