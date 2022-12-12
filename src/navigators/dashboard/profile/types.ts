import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {DrawerScreenParams} from '../types';

export type ProfileStackParams = {
  'Profile Home': undefined;
  'Edit Details': undefined;
  'Change Password': undefined;
};

export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParams, 'Profile Home'>,
  DrawerScreenProps<DrawerScreenParams>
>;

export type DetailsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParams, 'Edit Details'>,
  DrawerScreenProps<DrawerScreenParams>
>;

export type ChangePasswordScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParams, 'Change Password'>,
  DrawerScreenProps<DrawerScreenParams>
>;
