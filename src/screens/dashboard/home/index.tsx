import React from 'react';
import {
  View,
  Text,
  StatusBar,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';
import styles from 'src/screens/styles';
import {Button} from 'src/components';
import {
  appColors,
  appRoutes,
  normalize,
  normalizeHeight,
  CombinedDarkTheme,
  CombinedDefaultTheme,
} from 'src/config';
import type {DeviceScreenProps} from 'src/navigators/dashboard/connect/types';
import BleManager from 'react-native-ble-manager';
import {
  checkMultiple,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

export default function Home({navigation}: DeviceScreenProps) {
  const darkMode = useColorScheme() === 'dark';
  const isLessThanVersion12 = Platform.Version >= 23 && Platform.Version <= 30;

  React.useEffect(() => {
    BleManager.start({showAlert: false}).then(() => {
      console.log('Module initialized');
    });
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth enabled');
      })
      .catch(() => {
        Alert.alert(
          'Enable bluetooth',
          'Bluetooth is required to be enabled to initiate connection to composite hardware',
          [
            {
              text: 'Cancel',
              onPress: () => {},
            },
            {
              text: 'Enable',
              onPress: async () => {
                await BleManager.enableBluetooth();
              },
            },
          ],
        );
      });
  }, []);

  const requestPermissions = async () => {
    // to do: adapt for ios
    const requestAccess = await requestMultiple(
      isLessThanVersion12
        ? [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
        : [
            PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          ],
    );
    if (isLessThanVersion12) {
      return (
        requestAccess[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
        RESULTS.GRANTED
      );
    } else {
      return (
        requestAccess[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE] ===
          RESULTS.GRANTED &&
        requestAccess[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] ===
          RESULTS.GRANTED &&
        requestAccess[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED
      );
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const permission = await checkMultiple(
        isLessThanVersion12
          ? [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
          : [
              PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
              PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
              PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            ],
      );
      if (
        permission[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED
      ) {
        const requestAccess = await requestPermissions();
        if (!requestAccess) {
          Alert.alert(
            `Bluetooth ${
              isLessThanVersion12 ? 'and Location' : ''
            } Permissions`,
            `Bluetooth ${
              isLessThanVersion12 ? 'and Location' : ''
            } permissions help the app locate the composite hardware. Please grant these permissions to proceed`,
            [
              {
                text: 'Cancel',
                onPress: () => {},
              },
              {
                text: 'Proceed',
                onPress: requestPermissions,
              },
            ],
            {cancelable: false},
          );
          return;
        }
      }
      navigation.navigate(appRoutes['Scanned Devices']);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={
          darkMode
            ? CombinedDarkTheme.colors.background
            : CombinedDefaultTheme.colors.background
        }
      />
      <Text style={styles.bold}>Pairing Setup</Text>
      <Text style={[styles.pale, {color: appColors.black}]}>
        Allow access to your location and bluetooth. Make sure your device is powered on.</Text>
      <View style={{marginTop: normalizeHeight(328)}}>
        <Button
          style={[
            {
              marginBottom: normalize(24),
            },
            styles.outline_btn,
          ]}
          mode="outlined"
          onPress={checkPermissions}
          labelStyle={{color: appColors.blueprimary}}>
          Proceed to Scan
        </Button>
        {/* <Button
          style={{
            backgroundColor: disabled
              ? appColors.disabled_grey
              : appColors.blueprimary,
          }}>
          Connect
        </Button> */}
      </View>
    </View>
  );
}
