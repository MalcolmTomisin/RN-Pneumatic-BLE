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
    para,
    crc8,
  };
}
