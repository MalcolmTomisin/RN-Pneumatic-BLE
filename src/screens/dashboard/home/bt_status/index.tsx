import React from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
  ToastAndroid,
  EmitterSubscription,
} from 'react-native';
import Slider from '@react-native-community/slider';
import ic_chev from 'assets/images/ic_chevron.png';
import {appColors, appFonts, normalize, normalizeHeight} from 'src/config';
import {StatusScreenProps} from 'src/navigators/dashboard/connect/types';
import BleManager from 'react-native-ble-manager';
import {bytesToString, stringToBytes} from 'convert-string';
import database from '@react-native-firebase/database';
import {Buffer} from '@craftzdog/react-native-buffer';
import {
  parseDataPacket,
  buildStartCommandPacket,
  parseResponsePacket,
} from 'src/utils';
import {btoa} from 'react-native-quick-base64';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const uuid = '0000FFF0-0000-1000-8000-00805F9B34FB';
const characteristic_uuid = '0000FFF6-0000-1000-8000-00805F9B34FB';

export default function Bt_status({route}: StatusScreenProps) {
  const {peripheralId} = route.params;

  React.useEffect(() => {
    let bleListener: EmitterSubscription;
    (async () => {
      const peripheral = await BleManager.retrieveServices(peripheralId);
      database().ref('/peripherals').push(peripheral);
      await BleManager.startNotification(
        peripheralId,
        uuid,
        characteristic_uuid,
      );
      bleListener = bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        ({value, peripheral, characteristic, service}) => {
          // Convert bytes array to string
          try {
            //const data = bytesToString(value);
            const buffer = Buffer.from(value);
            const parsedData = parseDataPacket(buffer);

            database()
              .ref('/debug' + Date.now())
              .set({
                parsedData,
                peripheral,
                characteristic,
                service,
                value,
                buffer: buffer.toJSON(),
                bytes: buffer.toString('utf8'),
              });
            ToastAndroid.showWithGravity(
              `Received ${value} for characteristic ${characteristic}`,
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
            );
          } catch (e) {
            console.log(e);
            database()
              .ref('/error' + Date.now())
              .set({e});
          }
          //console.log(`Received ${data} for characteristic ${characteristic}`);
        },
      );
    })();
    // BleManager.retrieveServices(peripheralId).then(val => {
    //   database().ref('/peripherals').push(val);
    //   BleManager.read(peripheralId, uuid, characteristic_uuid)
    //     .then(value => {
    //       const buffer = Buffer.from(value);
    //       const sensorData = buffer.readUInt8(1, true);
    //       const parsedData = parseDataPacket(buffer);
    //       const data = bytesToString(value);
    //       database()
    //         .ref('/read' + Date.now())
    //         .set({
    //           bytes: data,
    //           parsedData,
    //           peripheralId,
    //           characteristic_uuid,
    //           service: uuid,
    //           sensorData,
    //         });
    //       ToastAndroid.showWithGravity(
    //         `Read data for characteristic ${data}`,
    //         ToastAndroid.SHORT,
    //         ToastAndroid.BOTTOM,
    //       );
    //     })
    //     .catch(e => {
    //       database()
    //         .ref('/error' + Date.now())
    //         .set({e});
    //     });
    // });
    // return () => {
    //   bleListener ? bleManagerEmitter.removeSubscription(bleListener) : null;
    // };
  }, [peripheralId]);

  const inflateHardware = (value: number) => {
    try {
      const startData = buildStartCommandPacket(value, 10, 6, 0, 4, 4);
      // const base64 = btoa(
      //   String.fromCharCode.apply(null, new Uint8Array(startData)),
      // );
      const base64 = Array.from(startData);
      // const bytes = stringToBytes('8010')

      BleManager.retrieveServices(peripheralId).then(val => {
        BleManager.write(peripheralId, uuid, characteristic_uuid, base64)
          .then(() => {
            database().ref('/write').push({
              write: 'successful',
            });
          })
          .catch(e => {
            database().ref('/write').push({e});
          });
      });
    } catch (e) {
      database()
        .ref('/write')
        .push({e, info: 'conversion to array byte not working'});
    }
  };

  const startHardware = (peripheralId: string) => {
    try {
      const startData = buildStartCommandPacket(80, 10, 6, 0, 4, 4);
      const base64 = Array.from(startData);
      // const bytes = stringToBytes('8010')

      BleManager.retrieveServices(peripheralId).then(val => {
        BleManager.write(peripheralId, uuid, characteristic_uuid, base64)
          .then(() => {
            database().ref('/write').push({
              write: 'successful',
            });
          })
          .catch(e => {
            database().ref('/write').push({e});
          });
      });
    } catch (e) {
      database()
        .ref('/write')
        .push({e, info: 'conversion to array byte not working'});
    }
  };
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: normalize(16),
        paddingBottom: normalize(49),
      }}>
      {/* <Text
        style={{
          fontFamily: appFonts.BARLOW_BD,
          fontSize: normalize(28),
          lineHeight: normalize(28 * 1.4),
          color: appColors.black,
        }}>
        <Image
          source={ic_chev}
          resizeMode="contain"
          style={{height: normalize(14), width: normalize(7)}}
        />{' '}
        Device
      </Text> */}
      <Text style={styles.pale}>
        Select the preferred pressure of the device.
      </Text>
      <View
        style={{
          borderRadius: normalize(16),
          backgroundColor: appColors.white,
          marginTop: normalizeHeight(96),
          padding: normalize(16),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={[styles.title, {color: appColors.label_black}]}>
            Battery Status
          </Text>
          <Text style={[styles.title, {color: appColors.label_black}]}>
            Selected Pressure
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: appColors.process_green,
              },
              styles.text_container,
            ]}>
            <Text style={[styles.title, {color: appColors.white}]}>Full</Text>
          </View>
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: appColors.blueprimary,
              },
              styles.text_container,
            ]}>
            <Text style={[styles.title, {color: appColors.white}]}>70</Text>
          </View>
        </View>
        <Text
          style={[
            styles.pale,
            {
              marginTop: normalize(32),
              marginBottom: normalize(28),
              textAlign: 'center',
            },
          ]}>
          Move slider or tap buttons to adjust pressure
        </Text>
        <Slider
          style={{
            width: '100%',
            height: normalize(8),
            backgroundColor: '#EEEEEE',
          }}
          minimumValue={30}
          maximumValue={250}
          onSlidingComplete={val => {
            inflateHardware(val);
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: normalize(32),
            marginBottom: normalize(24),
          }}>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: appColors.cancel_red,
              borderRadius: normalize(48),
              width: normalize(148),
              height: normalize(56),
            }}>
            <Text
              style={{
                fontFamily: appFonts.BARLOW_BD,
                fontSize: normalize(14),
                lineHeight: normalize(14 * 1.5),
                color: appColors.cancel_red,
              }}>
              Decrease
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => startHardware(peripheralId)}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: appColors.process_green,
              borderRadius: normalize(48),
              width: normalize(148),
              height: normalize(56),
            }}>
            <Text
              style={{
                fontFamily: appFonts.BARLOW_BD,
                fontSize: normalize(14),
                lineHeight: normalize(14 * 1.5),
                color: appColors.process_green,
              }}>
              Start
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={{
          borderRadius: normalize(48),
          width: normalize(343),
          backgroundColor: appColors.blueprimary,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: normalize(97),
          height: normalize(56),
        }}>
        <Text
          style={{
            fontSize: normalize(16),
            lineHeight: normalize(16 * 1.5),
            fontFamily: appFonts.BARLOW_BD,
            color: appColors.white,
          }}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: appFonts.BARLOW_MD,
    fontSize: normalize(14),
    lineHeight: normalize(14 * 1.5),
  },
  text_container: {
    width: normalize(80),
    height: normalize(32),
    marginTop: normalize(8),
    borderRadius: normalize(4),
  },
  pale: {
    fontFamily: appFonts.BARLOW_RG,
    fontSize: normalize(16),
    lineHeight: normalize(16 * 1.7),
    color: appColors.shade3,
    marginTop: normalize(8),
  },
});
