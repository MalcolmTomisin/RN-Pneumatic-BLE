import React from 'react';
import {
  View,
  Text,
  NativeEventEmitter,
  NativeModules,
  EmitterSubscription,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import {Button} from 'src/components';
import {
  normalizeHeight,
  normalize,
  appColors,
  appFonts,
  appRoutes,
  appConfig,
} from 'src/config';
import styles from 'src/screens/styles';
import {DeviceConnectProps} from 'src/navigators/dashboard/connect/types';
import BleManager from 'react-native-ble-manager';
import {useAppAuth} from 'src/store';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function ListDevices({navigation}: DeviceConnectProps) {
  const [list, setList] = React.useState([]);
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const peripherals = new Map();
  const setPeripheralValue = useAppAuth(state => state.setPeripheralAddress);

  const startScan = () => {
    BleManager.scan([], 15, true)
      .then(() => {
        //
        console.log('Scan is starting');
        setIsScanning(true);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const handleDiscoverPeripheral = peripheral => {
    //console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
  };

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  const handleDisconnectedPeripheral = data => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
  };

  const handleUpdateValueForCharacteristic = data => {
    // console.log(
    //   'Received data from ' +
    //     data.peripheral +
    //     ' characteristic ' +
    //     data.characteristic,
    //   data.value,
    // );
  };

  React.useEffect(() => {
    let listeners: Array<EmitterSubscription> = [];
    listeners.push(
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      ),
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic,
      ),
    );

    startScan();

    return () => {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i].remove();
      }
    };
  }, []);

  return (
    <ScrollView
      //contentContainerStyle={{marginBottom: normalize(80)}}
      style={[styles.container, {paddingBottom: normalize(80)}]}>
      <Text style={styles.bold}>Scanned Devices</Text>
      <Text style={[styles.pale, {color: appColors.black}]}>
        Pair with your device below. Make sure your device is powered on.
      </Text>

      {list
        .filter(v => v?.advertising?.isConnectable)
        .map((v, i) => (
          <TouchableOpacity
            key={`${i}`}
            style={{
              backgroundColor: appColors.white,
              marginVertical: normalize(4),
              borderRadius: normalize(8),
              padding: 10,
            }}
            onPress={() => {
              BleManager.connect(v.id)
                .then(() => {
                  setPeripheralValue(v.id);
                  ToastAndroid.showWithGravity(
                    'connected',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                  );
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: appRoutes['Bt Status'],
                        params: {
                          peripheralId: v.id,
                        },
                      },
                    ],
                  });
                })
                .catch(() => {
                  ToastAndroid.showWithGravity(
                    'error in connection',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                  );
                });
            }}>
            <Text
              style={{
                fontFamily: appFonts.BARLOW_RG,
                fontSize: normalize(16),
                lineHeight: appConfig.IS_IOS ? undefined : normalize(16 * 1.7),
                color: appColors.black,
              }}>{`${v.name ? v.name : 'NO NAME'}`}</Text>
          </TouchableOpacity>
        ))}
      <View style={{paddingVertical: normalizeHeight(100)}}>
        <Button
          style={[
            {
              marginBottom: normalize(24),
            },
            styles.outline_btn,
          ]}
          mode="outlined"
          onPress={
            !isScanning
              ? startScan
              : () => {
                  console.log('still scanning');
                }
          }
          labelStyle={{color: appColors.blueprimary}}>
          Scan
        </Button>
        {/* <Button
          style={{
            backgroundColor: appColors.blueprimary,
          }}>
          Connect
        </Button> */}
      </View>
    </ScrollView>
  );
}
