import {MMKV} from 'react-native-mmkv';
import {Buffer} from '@craftzdog/react-native-buffer';
import {
  PersistedClient,
  Promisable,
} from '@tanstack/react-query-persist-client';
import {QueryClient} from '@tanstack/react-query';
import {Platform, ToastAndroid} from 'react-native';

type QueryStorage = {
  getItem: (key: string) => Promisable<PersistedClient | undefined>;
  removeItem: (key: string) => Promisable<void>;
  setItem: (key: string, value: PersistedClient) => Promisable<void>;
};

export const storage = new MMKV();
export const PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const PERIPHERAL_KEY = 'KEY12345';

// Function to parse the data packet
export function parseDataPacket(data: Buffer) {
  // Extract the Identification code (2 bytes)
  const identificationCode = data.slice(0, 2);
  const identificationCodeValue = identificationCode.readUInt16LE(0);

  // Extract the Data out length (1 byte)
  const dataOutLength = data[2];

  // Extract the Cmd_code (1 byte)
  const cmdCode = data[3];

  // Extract the Para field (variable length)
  // const paraLength = dataOutLength - 3; // subtract 3 bytes for the Identification code, Data out length, and Cmd_code
  // const para = dataOutLength === 1 ? data[4] : data.slice(4, 2);
  const para = data[4];

  // Extract the CRC8 field (1 byte)
  // const crc8 = dataOutLength === 1 ? data[5] : data[6];
  const crc8 = data[5];

  // Return the parsed fields as an object
  return {
    identificationCode: identificationCodeValue,
    dataOutLength,
    cmdCode,
    para: para,
    crc8,
  };
}

export function parseResponsePacket(data: Buffer) {
  const identificationCode = data.slice(0, 2);
  const identificationCodeValue = identificationCode.readUInt16LE(0);

  // Extract the Data out length (1 byte)
  const dataOutLength = data[2];

  // Extract the Cmd_code (1 byte)
  const cmdCode = data[3];
  const status = data[4];

  return {
    identificationCode: identificationCodeValue,
    dataOutLength,
    cmdCode,
    status,
  };
}

export function calculateCRC8(data) {
  // Define the polynomial and initial value
  const polynomial = 0x07; // 8-bit polynomial
  let crc = 0x00; // Initial value

  // Iterate over the data and perform the bitwise operations
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }

  // Return the resulting CRC value
  return crc;
}

// Function to build the command packet
export function buildStartCommandPacket(
  targetPressure: number,
  holdTime: number,
  releaseTime: number,
  mode: number,
  cycleLevel: number,
  cycleStepOfLevel: number,
) {
  // Calculate the length of the Para field (9 bytes)
  const paraLength = 9;

  // Calculate the length of the entire packet (13 bytes)
  const packetLength = paraLength + 5; // 5 bytes for the Command identifier, length, command, and CRC

  // Allocate a new ArrayBuffer to hold the packet data
  const packetData = new ArrayBuffer(packetLength);

  // Create a DataView to read and write the packet data as different types
  const packetView = new DataView(packetData);

  // Write the Command identifier (2 bytes)
  packetView.setUint8(0, 0x55);
  packetView.setUint8(1, 0xaa);

  // Write the length (1 byte)
  packetView.setUint8(2, packetLength);

  // Write the command (1 byte)
  packetView.setUint8(3, 0x22);

  // Write the Para field (9 bytes)
  packetView.setUint16(4, parseInt(targetPressure.toString(16), 16), true); // target pressure setting (2 bytes, little-endian)
  packetView.setUint16(6, parseInt(holdTime.toString(16), 16), true); // hold time (2 bytes, little-endian)
  packetView.setUint16(8, parseInt(releaseTime.toString(16), 16), true); // release time (2 bytes, little-endian)
  packetView.setUint8(10, parseInt(mode.toString(16), 16)); // mode (1 byte)
  packetView.setUint8(11, parseInt(cycleLevel.toString(16), 16)); // cycle level (1 byte)
  packetView.setUint8(12, parseInt(cycleStepOfLevel.toString(16), 16)); // cycle step of level (1 byte)

  // Calculate the CRC8 value for the entire packet (except the CRC8 bytes)

  return packetView.buffer;
}

export const getPersistedQueryStorage = (mmkv: MMKV) => {
  const persistStorage: QueryStorage = {
    getItem: name => {
      const value = mmkv.getString(name);
      return value ? (JSON.parse(value) as PersistedClient) : undefined;
    },
    removeItem: name => mmkv.delete(name),
    setItem: (name, value) => mmkv.set(name, JSON.stringify(value)),
  };

  return persistStorage;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      refetchOnReconnect: 'always',
      retry: 3,
      suspense: false,
    },
  },
});

export const showToast = (text: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  }
};
