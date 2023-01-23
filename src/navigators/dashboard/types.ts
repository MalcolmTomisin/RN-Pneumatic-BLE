import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {RootStackParams} from '..';

export type DrawerScreenParams = {
  Device: undefined;
  Profile: undefined;
  Logout: undefined;
};

export type DeviceScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerScreenParams, 'Device'>,
  NativeStackScreenProps<RootStackParams>
>;

export type ProfileScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerScreenParams, 'Profile'>,
  NativeStackScreenProps<RootStackParams>
>;
