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
import {RadioButton} from 'react-native-paper';
import {DeviceConnectProps} from 'src/navigators/dashboard/connect/types';
import BleManager from 'react-native-ble-manager';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {hexToUUID} from 'src/utils';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const uuid = '0000FFF0-0000-1000-8000-00805F9B34FB';

export default function ListDevices({navigation}: DeviceConnectProps) {
  const [value, setValue] = React.useState('');
  const [list, setList] = React.useState([]);
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const peripherals = new Map();

  const startScan = () => {
    BleManager.scan([uuid], 30, true)
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
    console.log('Got ble peripheral', peripheral);
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
    console.log(
      'Received data from ' +
        data.peripheral +
        ' characteristic ' +
        data.characteristic,
      data.value,
    );
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
      <Text style={styles.pale}>
        Pair with your device below. Make sure your device is powered on.
      </Text>

      <RadioButton.Group
        onValueChange={value => {
          setValue(value);
          //navigation.navigate(appRoutes['Bt Status']);
        }}
        value={value}>
        {list.map((v, i) => (
          <RadioButton.Item
            key={`${i}`}
            label={`Scanned Device ${i + 1} ${v}`}
            value="first"
            position="leading"
            style={{
              backgroundColor: appColors.white,
              marginVertical: normalize(4),
              borderRadius: normalize(8),
            }}
            labelStyle={{
              fontFamily: appFonts.BARLOW_RG,
              fontSize: normalize(16),
              lineHeight: normalize(16 * 1.7),
              color: appColors.shade3,
            }}
            color={appColors.blueprimary}
            uncheckedColor={appColors.border_grey}
          />
        ))}
      </RadioButton.Group>
      <View style={{paddingTop: normalizeHeight(100)}}>
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
              ? retrieveConnected
              : () => {
                  console.log('still scanning');
                }
          }
          labelStyle={{color: appColors.blueprimary}}>
          Scan
        </Button>
        <Button
          style={{
            backgroundColor: appColors.blueprimary,
          }}>
          Connect
        </Button>
      </View>
    </ScrollView>
  );
}
