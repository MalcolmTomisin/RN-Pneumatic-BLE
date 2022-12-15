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
  const [disabled] = React.useState(true);
  const darkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    BleManager.start({showAlert: false}).then(() => {
      console.log('Module initialized');
    });
  }, []);

  const requestPermissions = async () => {
    const requestAccess = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ]);
    if (
      requestAccess[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
      RESULTS.GRANTED
    ) {
      navigation.navigate(appRoutes['Scanned Devices']);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const permission = await checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ]);

      console.log(
        'android  ===>',
        RESULTS.GRANTED,
        permission[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
      );
      if (
        permission[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED
      ) {
        const requestAccess = await requestMultiple([
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);
        if (
          requestAccess[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !==
          RESULTS.GRANTED
        ) {
          Alert.alert(
            'Bluetooth and Location Permissions',
            'Bluetooth and location permissions help the app locate the composite hardware. Please grant these permissions to proceed',
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
      <Text style={styles.bold}>Connect With A Device</Text>
      <Text style={styles.pale}>
        Pair with your device below. Make sure your device is powered on.
      </Text>
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
          Scan
        </Button>
        <Button
          style={{
            backgroundColor: disabled
              ? appColors.disabled_grey
              : appColors.blueprimary,
          }}>
          Connect
        </Button>
      </View>
    </View>
  );
}
