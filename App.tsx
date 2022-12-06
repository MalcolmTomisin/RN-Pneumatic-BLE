/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from 'src/navigators';
import SplashScreen from 'react-native-splash-screen';
import {Provider as PaperProvider} from 'react-native-paper';
import {
  Linking,
  Platform,
  useColorScheme,
  InteractionManager,
  View,
} from 'react-native';
import {
  CombinedDefaultTheme,
  CombinedDarkTheme,
  appConfig,
  appColors,
} from 'src/config';
import {MMKV} from 'react-native-mmkv';
import {storage, PERSISTENCE_KEY} from 'src/utils';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = React.useState(__DEV__ ? false : true);
  const [initialState, setInitialState] = React.useState();
  const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

  const handleStateChange = (state: any) => {
    InteractionManager.runAfterInteractions(() => {
      storage.set(PERSISTENCE_KEY, JSON.stringify(state));
    });
  };

  const restoreState = React.useCallback(async (mmkv: MMKV) => {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (Platform.OS !== 'web' && initialUrl == null) {
        // Only restore state if there's no deep link and we're not on web
        const savedStateString = mmkv.getString(PERSISTENCE_KEY);
        const state = savedStateString
          ? JSON.parse(savedStateString)
          : undefined;
        if (state !== undefined) {
          setInitialState(state);
        }
      }
    } finally {
      setIsReady(true);
      SplashScreen.hide();
    }
  }, []);

  useEffect(() => {
    restoreState(storage);
  }, [restoreState]);

  if (!isReady && appConfig.IS_ANDROID) {
    return <View style={{flex: 1, backgroundColor: appColors.blueprimary}} />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer
        initialState={initialState}
        onStateChange={handleStateChange}
        theme={theme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
