import {StyleSheet} from 'react-native';
import {appColors, appFonts, normalize} from 'src/config';

export default StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: normalize(48),
  },
  buttontext: {
    fontFamily: appFonts.BARLOW_BD,
    fontSize: normalize(16),
    lineHeight: normalize(16 * 1.5),
    color: appColors.white,
  },
});
