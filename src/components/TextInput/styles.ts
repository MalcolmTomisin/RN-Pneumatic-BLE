import {StyleSheet} from 'react-native';
import {appColors, appFonts, normalize} from 'src/config';

export default StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: normalize(8),
  },
  eye: {
    width: normalize(25),
    height: normalize(25),
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: normalize(8),
    backgroundColor: appColors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    alignItems: 'center',
  },
  label: {
    color: appColors.label_black,
    fontFamily: appFonts.BARLOW_MD,
    fontSize: normalize(14),
    lineHeight: normalize(14 * 1.5),
    marginBottom: normalize(4),
  },
  focused: {
    borderColor: appColors.blueprimary,
    borderWidth: 2,
  },
  unfocused: {
    borderColor: appColors.border_grey,
    borderWidth: 1,
  },
  inputText: {
    flex: 1,
  },
});
