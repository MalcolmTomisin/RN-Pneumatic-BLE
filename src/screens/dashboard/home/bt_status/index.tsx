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
  TextInput,
  InteractionManager,
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
  calculateCRC8,
} from 'src/utils';
import {btoa} from 'react-native-quick-base64';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const uuid = '0000FFF0-0000-1000-8000-00805F9B34FB';
const characteristic_uuid = '0000FFF6-0000-1000-8000-00805F9B34FB';
const cmdIdentifier = [0x55, 0xaa];
// const holdTime = [0xb4, 0x00];
const holdTime = [0xff, 0xff];
const SLAVE_STATUS_CMD = 1;
const SLAVE_ERR_MSG_CMD = 2;
const PWR_INFO_CMD = 3;
const MASTER_QUERY_STATUS_CMD = 33;
const START_CMD = 34;
const STOP_CMD = 35;
const MASTER_QUERY_PRESSURE_CMD = 36;
const CMD_DELAY = 500;

export default function Bt_status({route}: StatusScreenProps) {
  const {peripheralId} = route.params;
  // const batteryStatusDisplayed = React.useRef(false);
  const [userInput, setInput] = React.useState('');
  const [batterStatus, setBatterStatus] = React.useState(0);
  const [sliderPressure, setSliderPressure] = React.useState(0);
  const [hardwarePressure, setHardwarePressure] = React.useState(0);
  const targetPressure = React.useRef(0);

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

            // if (!(parsedData.cmdCode === 3 && batteryStatusDisplayed.current)) {
            //   console.log('Displayed to mobile screen.');

            //   ToastAndroid.showWithGravity(
            //     `Received ${value} for characteristic ${characteristic}`,
            //     ToastAndroid.SHORT,
            //     ToastAndroid.BOTTOM,
            //   );
            // }

            if (parsedData.cmdCode === SLAVE_STATUS_CMD) {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(`Code: ${parsedData.cmdCode} - Slave status report`);

              if (parsedData.para === 0) {
                console.log('0: Invalid state');
              } else if (parsedData.para === 1) {
                console.log('1: Idle state');
              } else if (parsedData.para === 2) {
                console.log('2: Start inflation');

                getPressureStatus();
              } else if (parsedData.para === 3) {
                console.log('3: Start packing');

                getPressureStatus();
              } else if (parsedData.para === 4) {
                console.log('4: Start to deflate');

                getPressureStatus();
              }
            } else if (parsedData.cmdCode === SLAVE_ERR_MSG_CMD) {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(`Code: ${parsedData.cmdCode} - Slave error message`);
            } else if (parsedData.cmdCode === PWR_INFO_CMD) {
              // console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              // console.log(
              //   `Code: ${parsedData.cmdCode} - Report power information from the machine`,
              // );

              setBatterStatus(parsedData.para);
              // batteryStatusDisplayed.current = true;
            } else if (parsedData.cmdCode === MASTER_QUERY_STATUS_CMD) {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(
                `Code: ${parsedData.cmdCode} - Master query slave status`,
              );
            } else if (parsedData.cmdCode === START_CMD) {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(`Code: ${parsedData.cmdCode} - Start command`);
            } else if (parsedData.cmdCode === STOP_CMD) {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(`Code: ${parsedData.cmdCode} - Stop command`);
            } else if (parsedData.cmdCode === MASTER_QUERY_PRESSURE_CMD) {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(
                `Code: ${parsedData.cmdCode} - The master inquires the slave airbag pressure`,
              );

              setHardwarePressure(parsedData.para);

              console.log(
                `currentPressure: ${parsedData.para}, targetPressure: ${targetPressure.current}`,
              );

              if (parsedData.para <= targetPressure.current) {
                console.log('Still inflating bladder...');

                // getPressureStatus(); // TODO: Add delay
              } else {
                console.log('STOP inflating!');

                getPressureStatus();
              }
            } else {
              console.log(`parsedData: ${JSON.stringify(parsedData)}`);
              console.log(`Code: ${parsedData.cmdCode} - Unknown`);
            }
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

    return () => {
      bleListener ? bleManagerEmitter.removeSubscription(bleListener) : null;
    };
  }, [peripheralId]);

  /**
   *
   * @param text
   */
  const processUserInput = (text: string) => {
    setInput(text);
  };

  /**
   *
   */
  const submitHandler = () => {
    const userInputArray = userInput.split(',');
    const cmdArray = userInputArray.map(value => {
      return parseInt(value, 16);
    });

    write(cmdIdentifier.concat(cmdArray));
  };

  /**
   *
   * @param value
   */
  const sliderHandler = (value: number) => {
    console.log(`previousSliderPressure = ${sliderPressure}`);

    const hexValue = parseInt(value.toString(16), 16);

    setSliderPressure(value);
    targetPressure.current = value;

    console.log(`nextSliderPressure = ${value}`);

    inflateHardware(hexValue);
  };

  /**
   *
   */
  const decreasePressureHandler = () => {
    console.log(`previousSliderPressure = ${sliderPressure}`);

    let nextSliderPressure = 0;

    if (sliderPressure === 40) {
      nextSliderPressure = 0;
    } else if (sliderPressure - 10 >= 40) {
    // if (sliderPressure - 10 >= 0) {
      nextSliderPressure = sliderPressure - 10;
    } else {
      nextSliderPressure = sliderPressure;
    }

    setSliderPressure(nextSliderPressure);
    targetPressure.current = nextSliderPressure;

    console.log(`nextSliderPressure = ${nextSliderPressure}`);

    const hexValue = parseInt(nextSliderPressure.toString(16), 16);

    stopInflation();
    setTimeout(() => {
      inflateHardware(hexValue);
    }, CMD_DELAY);
  };

  /**
   *
   */
  const increasePressureHandler = () => {
    console.log(`previousSliderPressure = ${sliderPressure}`);

    let nextSliderPressure = 0;

    if (sliderPressure === 0) {
      nextSliderPressure = 40;
    } else if (sliderPressure + 10 <= 130) {
    // if (sliderPressure + 10 <= 130) {
      nextSliderPressure = sliderPressure + 10;
    } else {
      nextSliderPressure = sliderPressure;
    }

    setSliderPressure(nextSliderPressure);
    targetPressure.current = nextSliderPressure;

    console.log(`nextSliderPressure = ${nextSliderPressure}`);

    const hexValue = parseInt(nextSliderPressure.toString(16), 16);

    stopInflation();
    setTimeout(() => {
      inflateHardware(hexValue);
    }, CMD_DELAY);
  };

  /**
   *
   * @param peripheralId
   */
  const inflateHardware = (value: number) => {
    console.log('Inflating bladder...');

    try {
      const length = 0x0a;
      const startCmd = 0x22;
      const pressure = [value, 0x00];
      const cmdSansCrc = cmdIdentifier.concat(
        [length, startCmd].concat(
          pressure.concat(holdTime.concat([0x05, 0x00, 0x00, 0x01, 0x02])),
        ),
      );
      const crc = parseInt(calculateCRC(cmdSansCrc), 16);
      const cmd = cmdSansCrc.concat(crc);

      write(cmd);
    } catch (e) {
      database().ref('/write').push({e, info: 'inflateHardware failed.'});
    }
  };

  /**
   *
   */
  const stopInflation = () => {
    console.log('Stopping bladder inflation...');

    try {
      const length = 0x01;
      const stopCmd = 0x23;
      const cmdSansCrc = cmdIdentifier.concat([length, stopCmd]);
      const crc = parseInt(calculateCRC(cmdSansCrc), 16);
      const cmd = cmdSansCrc.concat(crc);

      write(cmd);
    } catch (e) {
      database().ref('/write').push({e, info: 'stopInflation failed.'});
    }
  };

  /**
   *
   */
  const getPressureStatus = () => {
    console.log('Getting bladder pressure...');
    try {
      const length = 0x01;
      const startCmd = 0x24;
      const cmdSansCrc = cmdIdentifier.concat([length, startCmd]);
      const crc = parseInt(calculateCRC(cmdSansCrc), 16);
      const cmd = cmdSansCrc.concat(crc);

      write(cmd);
    } catch (e) {
      database().ref('/write').push({e, info: 'getPressureStatus failed.'});
    }
  };

  function calculateCRC(data: number[]) {
    let crc = 0;

    for (let i = 0; i < data.length; i++) {
      crc ^= data[i] << ((i % 4) * 8);
    }

    return crc.toString(16);
  }

  /**
   *
   * @param cmd
   */
  const write = (cmd: Array<number>) => {
    try {
      console.log(`Writing command: ${cmd}`);

      BleManager.retrieveServices(peripheralId).then(val => {
        BleManager.write(peripheralId, uuid, characteristic_uuid, cmd)
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
      {/* <TextInput
        value={userInput}
        onChangeText={processUserInput}
        onSubmitEditing={submitHandler}
        style={{
          borderWidth: 1,
          borderColor: 'black',
          height: 48,
          width: '100%',
          color: 'black',
        }}
      /> */}
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
            <Text style={[styles.title, {color: appColors.white}]}>
              {batterStatus}%
            </Text>
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
            <Text style={[styles.title, {color: appColors.white}]} onPress={() => getPressureStatus()}>
              {hardwarePressure}
            </Text>
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
        <Text
          style={[
            styles.pale,
            {
              marginTop: normalize(4),
              marginBottom: normalize(28),
              textAlign: 'left',
              color: 'black',
              fontSize: normalize(32),
            },
          ]}>
          {sliderPressure}
        </Text>
        <Slider
          style={{
            width: '100%',
            height: normalize(8),
            backgroundColor: '#EEEEEE',
          }}
          value={sliderPressure}
          step={10}
          minimumValue={40}
          maximumValue={130}
          onSlidingComplete={val => {
            sliderHandler(val);
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
            onPress={() => decreasePressureHandler()}
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
            onPress={() => increasePressureHandler()}
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
              Increase
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => stopInflation()}
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
          TEST: STOP
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
