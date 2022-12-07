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
    marginTop: normalize(8),
    marginBottom: normalize(32),
  },
  lowerText: {
    fontFamily: appFonts.BARLOW_RG,
    fontSize: normalize(14),
    lineHeight: normalize(21),
    color: appColors.shade3,
    paddingRight: normalize(20),
    marginTop: normalize(162),
    letterSpacing: 0.25,
  },
  terms: {
    fontFamily: appFonts.BARLOW_MD,
    color: appColors.blueprimary,
  },
  btn: {
    marginVertical: normalize(24),
  },
  forgot: {
    fontFamily: appFonts.BARLOW_RG,
    fontSize: normalize(14),
    lineHeight: normalize(14 * 1.5),
    color: appColors.placeholder_grey,
    textAlign: 'center',
  },
  recover: {
    fontFamily: appFonts.BARLOW_BD,
    color: appColors.blueprimary,
  },
});
