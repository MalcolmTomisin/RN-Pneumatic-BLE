import React, {useCallback} from 'react';
import {
  View,
  Text,
  Image,
  NativeEventEmitter,
  NativeModules,
  Platform,
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
} from 'src/config';
import styles from 'src/screens/styles';
import {bytesToString} from 'convert-string';
// import {Button} from 'react-native-paper';
import {DeviceConnectProps} from 'src/navigators/dashboard/connect/types';
import BleManager from 'react-native-ble-manager';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {hexToUUID} from 'src/utils';
import { useAppAuth } from 'src/store';
import { color } from 'react-native-reanimated';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const uuid = '0000FFF0-0000-1000-8000-00805F9B34FB';
const characteristic_uuid = '0000FFF6-0000-1000-8000-00805F9B34FB';

async function connectAndPrepare(
  peripheral: string,
  service: string,
  characteristic: string,
) {
  // Connect to device
  await BleManager.connect(peripheral);
  // Before startNotification you need to call retrieveServices
  await BleManager.retrieveServices(peripheral);
  // To enable BleManagerDidUpdateValueForCharacteristic listener
  await BleManager.startNotification(peripheral, service, characteristic);
  // Add event listener
  bleManagerEmitter.addListener(
    'BleManagerDidUpdateValueForCharacteristic',
    ({value, peripheral, characteristic, service}) => {
      // Convert bytes array to string
      const data = bytesToString(value);
      ToastAndroid.showWithGravity(
        `Received ${data} for characteristic ${characteristic}`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      console.log(`Received ${data} for characteristic ${characteristic}`);
    },
  );
  // Actions triggering BleManagerDidUpdateValueForCharacteristic event
}

export default function ListDevices({navigation}: DeviceConnectProps) {
  const [value, setValue] = React.useState('');
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

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length === 0) {
        console.log('No connected peripherals');
      }
      console.log('see results ==>', results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
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
                  navigation.popToTop();
                  navigation.navigate(appRoutes['Bt Status'], {
                    peripheralId: v.id,
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
                lineHeight: normalize(16 * 1.7),
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
