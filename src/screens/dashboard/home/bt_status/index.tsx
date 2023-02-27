/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
  InteractionManager,
  AppState,
} from 'react-native';
// import Slider from '@react-native-community/slider';
import {
  appColors,
  appFonts,
  appRoutes,
  normalize,
  normalizeHeight,
} from 'src/config';
import {StatusScreenProps} from 'src/navigators/dashboard/connect/types';
import BleManager from 'react-native-ble-manager';
import database from '@react-native-firebase/database';
import {Buffer} from '@craftzdog/react-native-buffer';
import {disconnectPeripheral, parseDataPacket, showToast} from 'src/utils';
import {useAppAuth} from 'src/store';
import {DB_NODE} from '@env';
import perf from '@react-native-firebase/perf';

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
// const CMD_DELAY = 500;
// const SAVE_INTERVAL = 10000;

export default function Bt_status({route, navigation}: StatusScreenProps) {
  const {peripheralId} = route.params;
  const getInitialPressure = React.useRef(false);
  // const [userInput, setInput] = React.useState('');
  const [batterStatus, setBatterStatus] = React.useState(0);
  const [sliderPressure, setSliderPressure] = React.useState(0);
  const [hardwarePressure, setHardwarePressure] = React.useState(0);
  const [macAddress, setMacAddress] = React.useState('');
  const targetPressure = React.useRef(0);
  const {profile, hardware, setPeripheralValue, studyId} = useAppAuth(
    state => ({
      profile: state.profile,
      hardware: state.hardware,
      setPeripheralValue: state.setPeripheralAddress,
      studyId: state.studyId,
    }),
  );
  const [connected, setConnected] = React.useState<boolean>(false);
  const resultObject = {
    cmdCode: 0,
    profileId: '',
    hardwareId: '',
    studyId: '',
    macAddress: '',
    deviceName: '',
    key: 'Pressure',
    value: 0,
    dateTimeAcquired: 0,
    parsedData: {},
    rawData: {},
  };
  // const result = React.useRef(resultObject);
  const now = React.useRef<number>(Date.now());
  // const writeNow = React.useRef<number>(Date.now());
  const pressureQueue = React.useRef<Array<typeof resultObject>>([]);
  const cmdQueue = React.useRef<Array<number[]>>([]);
  // const results = React.useRef<Array<typeof resultObject>>([]);
  const writeFree = React.useRef<boolean>(true);

  React.useLayoutEffect(() => {
    (async () => {
      let isConnected = await BleManager.isPeripheralConnected(
        peripheralId,
        [],
      );
      if (isConnected) {
        setConnected(true);
      } else {
        BleManager.connect(peripheralId)
          .then(() => {
            showToast('Connected');
            setConnected(true);
          })
          .catch(() => {
            showToast('Not connected');
          })
          .finally(async () => {
            isConnected = await BleManager.isPeripheralConnected(
              peripheralId,
              [],
            );

            if (!isConnected) {
              // navigation.goBack();
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: appRoutes.DeviceConnect,
                  },
                ],
              });
            }
          });
      }
    })();
  }, [navigation, peripheralId]);

  /**
   *
   * @param cmd
   */
  const write = React.useCallback(
    // (cmd: Array<number>) => {
    () => {
      InteractionManager.runAfterInteractions(() => {
        // if (Date.now() - writeNow.current >= CMD_DELAY) {
        if (writeFree.current) {
          writeFree.current = false;
          console.log('Set writeFree to false.');

          console.log('QUEUE BEFORE: ', cmdQueue.current);
          const cmd = cmdQueue.current.shift();
          console.log('AFTER BEFORE: ', cmdQueue.current);

          if (cmd) {
            try {
              console.log(`${Date.now()} - Writing command: ${cmd}`);

              BleManager.retrieveServices(peripheralId).then(() => {
                BleManager.write(peripheralId, uuid, characteristic_uuid, cmd)
                  .then(() => {})
                  .catch(() => {})
                  .finally(() => {
                    // writeFree.current = true;
                  });
              });
            } catch (e) {
            } finally {
              writeFree.current = true;
            }
          } else {
            writeFree.current = true;
          }
        }
      });
    },
    [peripheralId],
  );

  /**
   *
   */
  const getPressureStatus = React.useCallback(() => {
    console.log('Getting bladder pressure...');
    try {
      const length = 0x01;
      const startCmd = 0x24;
      const cmdSansCrc = cmdIdentifier.concat([length, startCmd]);
      const crc = parseInt(calculateCRC(cmdSansCrc), 16);
      const cmd = cmdSansCrc.concat(crc);

      cmdQueue.current.push(cmd);
      write();
    } catch (e) {
      //database().ref('/write').push({e, info: 'getPressureStatus failed.'});
      console.log(e);
    }
  }, [write]);

  /**
   *
   * @param peripheralId
   */
  const inflateHardware = (value: number) => {
    InteractionManager.runAfterInteractions(() => {
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

        cmdQueue.current.push(cmd);
        // write();
      } catch (e) {
        console.log(e);
      }
    });
  };

  /**
   *
   */
  const stopInflation = () => {
    InteractionManager.runAfterInteractions(() => {
      console.log('Stopping bladder inflation...');

      try {
        const length = 0x01;
        const stopCmd = 0x23;
        const cmdSansCrc = cmdIdentifier.concat([length, stopCmd]);
        const crc = parseInt(calculateCRC(cmdSansCrc), 16);
        const cmd = cmdSansCrc.concat(crc);

        cmdQueue.current.push(cmd);
        write();
      } catch (e) {
        console.log(e);
      }
    });
  };

  /**
   *
   */
  function calculateCRC(data: number[]) {
    let crc = 0;

    for (let i = 0; i < data.length; i++) {
      crc ^= data[i] << ((i % 4) * 8);
    }

    return crc.toString(16);
  }

  /**
   *
   */
  const disconnectHardware = () => {
    InteractionManager.runAfterInteractions(() => {
      console.log('STEP 1');
      disconnectPeripheral(peripheralId);
      console.log('STEP 2');
      navigation.reset({
        index: 0,
        routes: [
          {
            name: appRoutes.DeviceConnect,
          },
        ],
      });
      console.log('STEP 3');
    });
  };

  /**
   * This operation empties the queue at the scheduled time
   */
  const emptyQueueResults = React.useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      if (pressureQueue.current.length > 0) {
        for (let record of pressureQueue.current) {
          console.log(
            `DATABASE WRITE: /${
              __DEV__ ? profile?._id : DB_NODE + '/' + profile?._id
            }-${hardware?._id}-${studyId}`,
          );

          database()
            .ref(
              // `/${__DEV__ ? profile?._id : DB_NODE + '/' + profile?._id}-${
              //   hardware?._id
              // }`,
              `/${profile?._id}-${hardware?._id}-${studyId}`,
            )
            .push(record);
        }
      }
      pressureQueue.current = [];
    });
  }, [hardware?._id, profile?._id, studyId]);

  // React.useEffect(() => {
  //   console.log(`My Ref has changed to: ${writeFree.current}`);
  //   write();
  // }, [writeFree, write]);

  React.useEffect(() => {
    let bleListener: EmitterSubscription;
    connected &&
      (async () => {
        const peripheral = await BleManager.retrieveServices(peripheralId);
        await BleManager.startNotification(
          peripheralId,
          uuid,
          characteristic_uuid,
        );
        const trace = await perf().startTrace('listener_trace');
        bleListener = bleManagerEmitter.addListener(
          'BleManagerDidUpdateValueForCharacteristic',
          ({value, peripheral: currentPeripheral, characteristic, service}) => {
            // Convert bytes array to string
            try {
              // Get the pressure when the app starts
              if (!getInitialPressure.current) {
                getInitialPressure.current = true;

                getPressureStatus();
              }

              //const data = bytesToString(value);
              const buffer = Buffer.from(value);
              const parsedData = parseDataPacket(buffer);
              setMacAddress(currentPeripheral);

              if (parsedData.cmdCode === SLAVE_STATUS_CMD) {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(
                  `Code: ${parsedData.cmdCode} - Slave status report`,
                );

                if (parsedData.para === 0) {
                  console.log('0: Invalid state');
                } else if (parsedData.para === 1) {
                  console.log('1: Idle state');
                } else if (parsedData.para === 2) {
                  console.log('2: Start inflation');
                } else if (parsedData.para === 3) {
                  console.log('3: Start packing');
                } else if (parsedData.para === 4) {
                  console.log('4: Start to deflate');
                }

                writeFree.current = true;
                write();
              } else if (parsedData.cmdCode === SLAVE_ERR_MSG_CMD) {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(
                  `Code: ${parsedData.cmdCode} - Slave error message`,
                );
              } else if (parsedData.cmdCode === PWR_INFO_CMD) {
                // console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                // console.log(
                //   `Code: ${parsedData.cmdCode} - Report power information from the machine`,
                // );

                setBatterStatus(parsedData.para);
                trace.putMetric('batteryStatus', parsedData.para);
                // batteryStatusDisplayed.current = true;
              } else if (parsedData.cmdCode === MASTER_QUERY_STATUS_CMD) {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(
                  `Code: ${parsedData.cmdCode} - Master query slave status`,
                );

                writeFree.current = true;
                write();
              } else if (parsedData.cmdCode === START_CMD) {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(`Code: ${parsedData.cmdCode} - Start command`);

                writeFree.current = true;
                getPressureStatus();
              } else if (parsedData.cmdCode === STOP_CMD) {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(`Code: ${parsedData.cmdCode} - Stop command`);

                writeFree.current = true;
                write();
              } else if (parsedData.cmdCode === MASTER_QUERY_PRESSURE_CMD) {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(
                  `Code: ${parsedData.cmdCode} - The master inquires the slave airbag pressure`,
                );
                trace.putMetric('BLE status', parsedData.para);
                setHardwarePressure(parsedData.para);

                // const profileId = '8HvXYizoxBXv5BfZN'; // TODO: This is temporary
                // const hardwareId = 'gTqqYrPmx9jsE6Mub'; // TODO: This is temporary

                // console.log(
                //   `Saving data to: /${profile?._id}-${hardware?._id}`,
                // );
                console.log(
                  `currentPressure: ${parsedData.para}, targetPressure: ${targetPressure.current}`,
                );
                pressureQueue.current.push({
                  cmdCode: parsedData.cmdCode,
                  profileId: profile?._id ?? '',
                  hardwareId: hardware?._id ?? '',
                  studyId: studyId ?? '',
                  macAddress: currentPeripheral,
                  deviceName: peripheral.name ?? '',
                  key: 'Pressure',
                  value: parsedData.para,
                  dateTimeAcquired: Date.now(),
                  parsedData: parsedData,
                  rawData: value,
                });

                if (Date.now() - now.current >= 10000) {
                  now.current = Date.now();
                  emptyQueueResults();
                }

                if (parsedData.para < targetPressure.current) {
                  console.log('Still inflating bladder...');

                  // getPressureStatus();
                } else if (parsedData.para > targetPressure.current) {
                  console.log('Pressure is higher than what was set...');

                  // getPressureStatus();
                  // } else {
                  //   console.log('STOP inflating!');

                  //   getPressureStatus();
                }

                writeFree.current = true;
                getPressureStatus();
              } else {
                console.log(`parsedData: ${JSON.stringify(parsedData)}`);
                console.log(`Code: ${parsedData.cmdCode} - Unknown`);
              }
            } catch (e) {
              console.log(e);
            }
            //console.log(`Received ${data} for characteristic ${characteristic}`);
          },
        );
        trace.stop();
      })();

    return () => {
      bleListener ? bleManagerEmitter.removeSubscription(bleListener) : null;
    };
  }, [
    connected,
    getPressureStatus,
    hardware?._id,
    peripheralId,
    profile?._id,
    studyId,
    setPeripheralValue,
    emptyQueueResults,
    write,
  ]);

  React.useEffect(() => {
    const subscription = navigation.addListener('blur', () => {
      emptyQueueResults();
    });

    return subscription;
  }, [emptyQueueResults, navigation]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active') {
        emptyQueueResults();
      }
    });

    return subscription.remove();
  }, [emptyQueueResults]);

  /**
   *
   */
  const decreasePressureHandler = () => {
    console.log(
      `decreasePressureHandler: previousSliderPressure = ${sliderPressure}`,
    );

    let nextSliderPressure = 0;

    if (sliderPressure === 20) {
      nextSliderPressure = 0;
    } else if (sliderPressure - 10 >= 20) {
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

    if (hexValue > 0) {
      inflateHardware(hexValue);
    }
  };

  /**
   *
   */
  const increasePressureHandler = () => {
    console.log(
      `increasePressureHandler: previousSliderPressure = ${sliderPressure}`,
    );

    let nextSliderPressure = 0;

    if (sliderPressure === 0) {
      nextSliderPressure = 20;
    } else if (sliderPressure + 10 <= 200) {
      // if (sliderPressure + 10 <= 200) {
      nextSliderPressure = sliderPressure + 10;
    } else {
      nextSliderPressure = sliderPressure;
    }

    setSliderPressure(nextSliderPressure);
    targetPressure.current = nextSliderPressure;

    console.log(`nextSliderPressure = ${nextSliderPressure}`);

    const hexValue = parseInt(nextSliderPressure.toString(16), 16);

    stopInflation();
    inflateHardware(hexValue);
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
      <Text style={[styles.pale, {color: appColors.black}]}>
        Set the pressure of the device by using the slider or buttons.
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
          marginTop: normalizeHeight(64),
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
            Device Pressure
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
            <Text
              style={[styles.title, {color: appColors.white}]}
              onPress={getPressureStatus}>
              {hardwarePressure}
            </Text>
          </View>
        </View>
        {/* <Text
          style={[
            styles.pale,
            {
              color: appColors.black,
              marginVertical: normalize(16),
              textAlign: 'center',
              fontSize: normalize(16),
            },
          ]}>
          Move slider or tap buttons to adjust pressure
        </Text> */}
        <Text
          style={[
            styles.pale,
            {
              marginTop: normalize(40),
              marginBottom: normalize(16),
              textAlign: 'center',
              color: 'black',
              fontSize: normalize(24),
            },
          ]}>
          {sliderPressure}
        </Text>
        {/* <Slider
          style={{
            width: '100%',
            height: normalize(8),
            backgroundColor: '#EEEEEE',
          }}
          value={sliderPressure}
          step={10}
          minimumValue={20}
          maximumValue={200}
          onSlidingComplete={val => {
            sliderHandler(val);
          }}
        /> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: normalize(16),
            marginBottom: normalize(24),
          }}>
          <TouchableOpacity
            onPress={decreasePressureHandler}
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
            onPress={increasePressureHandler}
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
        <Text
          style={{
            fontSize: normalize(12),
            lineHeight: normalize(16 * 1.5),
            fontFamily: appFonts.BARLOW_BD,
            color: appColors.black,
          }}>
          MAC Address: {macAddress}
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={disconnectHardware}
          style={{
            backgroundColor: appColors.blueprimary,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: normalize(64),
            borderRadius: normalize(48),
            width: normalize(148),
            height: normalize(56),
          }}>
          <Text
            style={{
              fontSize: normalize(16),
              lineHeight: normalize(16 * 1.5),
              fontFamily: appFonts.BARLOW_BD,
              color: appColors.white,
            }}>
            Disconnect
          </Text>
        </TouchableOpacity>
      </View>
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
