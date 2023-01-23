import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type OnboardStackScreenParams = {
  LOGIN: undefined;
  AUTH: undefined;
  RECOVER_PASSWORD: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<
  OnboardStackScreenParams,
  'LOGIN'
>;

export type AuthScreenProps = NativeStackScreenProps<
  OnboardStackScreenParams,
  'AUTH'
>;

export type RecoverScreenProps = NativeStackScreenProps<
  OnboardStackScreenParams,
  'RECOVER_PASSWORD'
>;
