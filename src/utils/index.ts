import {MMKV} from 'react-native-mmkv';
import {Buffer} from '@craftzdog/react-native-buffer';
import { stringify as uuidStringify } from 'uuid';

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
