import {MMKV} from 'react-native-mmkv';
import {Buffer} from '@craftzdog/react-native-buffer';
import {stringify as uuidStringify} from 'uuid';

export const storage = new MMKV();
export const PERSISTENCE_KEY = 'NAVIGATION_STATE';

function isHex(h: string) {
  var a = parseInt(h, 16);
  console.log('string  ===>', a.toString(16));
  return a.toString(16) === h.toLowerCase();
}

export const hexToUUID = (hexString: string): string => {
  const hexNumber = 0xfff0;
  const parsedHexString = hexString.replace(new RegExp('^0x'), '');
  if (!isHex(parsedHexString)) {
    throw new Error('hexString is not valid hexadecimal number');
  }
  let hexBuffer = Buffer.from(parsedHexString, 'hex');
  console.log('buffer', hexBuffer.buffer);
  const uuidResultBuffer = uuidStringify([hexNumber]);

  //Create uuid utf8 string representation
  return uuidResultBuffer.toString('utf8');
};

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
  const paraLength = dataOutLength - 3; // subtract 3 bytes for the Identification code, Data out length, and Cmd_code
  const para = data.slice(4, 4 + paraLength);

  // Extract the CRC8 field (1 byte)
  const crc8 = data[data.length - 1];

  // Return the parsed fields as an object
  return {
    identificationCode: identificationCodeValue,
    dataOutLength,
    cmdCode,
    para: para.toJSON(),
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

function calculateCRC8(data) {
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
