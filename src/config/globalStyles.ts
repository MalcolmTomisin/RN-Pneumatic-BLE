import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from 'react-native-paper';
import {Dimensions} from 'react-native';

const screen_width = Dimensions.get('window').width;

const theme = {
  ...PaperDefaultTheme,
  roundness: (8 / 375) * screen_width,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#0078C1',
    accent: '#F3F9FD',
    primaryInactive: '#FCB195',
    background: '#F3F9FD',
  },
};

const darkTheme = {
  ...PaperDarkTheme,
  roundness: (8 / 375) * screen_width,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#0078C1',
    accent: '#F3F9FD',
    primaryInactive: '#FCB195',
  },
};

export const CombinedDefaultTheme = {
  ...NavigationDefaultTheme,
  ...theme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...theme.colors,
  },
};
export const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...darkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkTheme.colors,
    background: '#F3F9FD',
  },
};

export const appColors = {
  blueprimary: '#0078C1',
  black: '#000000',
  white: '#fff',
  shade3: '#959595',
  border_grey: '#B0C1CB',
  label_black: '#0F0F0F',
  placeholder_grey: '#686868',
  background: '#F3F9FD',
  disabled_grey: '#BCBCBC',
  torquiose_green: '#159183',
  shade1: '#3D3D3D',
  neutral_grey1: '#E4E4E4',
  grey_2: '#767676',
  background_grey: '#FAFAFA',
  cancel_pink: '#FCF2F2',
  cancel_red: '#BB0000',
  profile_input_border: '#9ABACD',
  profile_input: '#F0F9FF',
  process_green: '#12AF77',
};

export const appFonts = {
  BARLOW_BD: 'Barlow-Bold',
  BARLOW_SB: 'Barlow-SemiBold',
  BARLOW_MD: 'Barlow-Medium',
  BARLOW_RG: 'Barlow-Regular',
};
