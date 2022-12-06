import {StyleSheet} from 'react-native';
import {appColors, appFonts, normalize} from 'src/config';

export default StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(50),
    flex: 1,
  },
  bold: {
    color: appColors.black,
    fontFamily: appFonts.BARLOW_BD,
    fontSize: normalize(28),
    lineHeight: normalize(28 * 1.4),
    textTransform: 'capitalize',
  },
  pale: {
    color: appColors.shade3,
    fontSize: normalize(16),
    lineHeight: normalize(16 * 1.7),
    fontFamily: appFonts.BARLOW_RG,
  },
});
