import {Platform, Dimensions, PixelRatio, StyleSheet} from 'react-native';

function createEnum<T extends {[P in keyof T]: P}>(o: T) {
  return o;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = SCREEN_WIDTH / 375;
const hScale = SCREEN_HEIGHT / 812;

export function normalize(size: number) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export function normalizeHeight(size: number) {
  const newSize = size * hScale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export const appRoutes = createEnum({
  LOGIN: 'LOGIN',
  HOME: 'HOME',
  DASHBOARD: 'DASHBOARD',
  ONBOARD: 'ONBOARD',
  AUTH: 'AUTH',
  RECOVER_PASSWORD: 'RECOVER_PASSWORD',
  Profile: 'Profile',
  Device: 'Device',
  Scan: 'Scan',
  DeviceConnect: 'DeviceConnect',
});

export const appConfig = {
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  SCREEN_HEIGHT: SCREEN_HEIGHT,
  SCREEN_WIDTH: SCREEN_WIDTH,
};

export {
  CombinedDefaultTheme,
  CombinedDarkTheme,
  appColors,
  appFonts,
} from './globalStyles';
