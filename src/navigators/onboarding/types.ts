import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type OnboardStackScreenParams = {
  LOGIN: undefined;
  AUTH: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<
  OnboardStackScreenParams,
  'LOGIN'
>;

export type AuthScreenProps = NativeStackScreenProps<
  OnboardStackScreenParams,
  'AUTH'
>;
