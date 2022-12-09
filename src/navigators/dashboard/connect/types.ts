import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {DrawerScreenParams} from '../types';

export type DeviceStackParams = {
  DeviceConnect: undefined;
  Scan: undefined;
};

export type DeviceScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DeviceStackParams, 'DeviceConnect'>,
  DrawerScreenProps<DrawerScreenParams>
>;

export type ScanScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DeviceStackParams, 'Scan'>,
  DrawerScreenProps<DrawerScreenParams>
>;
