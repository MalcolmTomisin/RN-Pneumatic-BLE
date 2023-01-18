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
import {NavigationContainer, NavigationState} from '@react-navigation/native';
import AppNavigator from 'src/navigators';
import SplashScreen from 'react-native-splash-screen';
import {Provider as PaperProvider} from 'react-native-paper';
import {
  Linking,
  Platform,
  useColorScheme,
  InteractionManager,
  View,
  AppState,
  NativeModules,
} from 'react-native';
import {
  CombinedDefaultTheme,
  CombinedDarkTheme,
  appConfig,
  appColors,
  appRoutes,
} from 'src/config';
import {MMKV} from 'react-native-mmkv';
import {storage, PERSISTENCE_KEY, PERIPHERAL_KEY} from 'src/utils';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import codePush from 'react-native-code-push';
import {ApiProvider} from 'src/components';
import {useAppAuth} from 'src/store';

const Service: {
  launchService: (arg: string) => void;
  closeService: () => void;
} = NativeModules.BluetoothServiceLauncher;

interface PeripherContextProps {
  peripheralValue: string;
  setPeripheralValue: React.Dispatch<React.SetStateAction<string>>;
}

export const PeripheralContext = React.createContext<PeripherContextProps>({
  peripheralValue: '',
  setPeripheralValue: () => {},
});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = React.useState(__DEV__ ? true : false);
  const [initialState, setInitialState] = React.useState();
  const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;
  const appState = React.useRef(AppState.currentState);
  const [peripheralValue, setPeripheralValue] = React.useState<string>('');
  const hydrateState = useAppAuth(state => state.hydrateState);

  const handleStateChange = (state?: NavigationState) => {
    if (state) {
      // if (
      //   state.routes[state.index]?.state?.routes[
      //     state.routes[state?.index]?.state?.index
      //   ]?.state?.routes[state.routes[state.index]?.state?.routes[
      //     state.routes[state?.index]?.state?.index
      //   ]?.state?.index]?.params?.peripheralId
      // ) {
      //   peripheralId.current = state.routes[state.index].params?.peripheralId;
      // }
      InteractionManager.runAfterInteractions(() => {
        storage.set(PERSISTENCE_KEY, JSON.stringify(state));
      });
    }
  };

  React.useEffect(() => {
    console.log('peripheralValue -> ', peripheralValue);

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        appState.current = nextAppState;
        //call background service
        storage.set('APP_AUTH', JSON.stringify(useAppAuth.getState()));
        if (peripheralValue) {
          console.log('Service running...');
          Service.launchService(peripheralValue);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [peripheralValue]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        appState.current = nextState;
        Service.closeService();
        const stringifiedState = storage.getString('APP_AUTH');
        const persistedState:
          | {isSignedIn: boolean; token?: string}
          | undefined = stringifiedState
          ? JSON.parse(stringifiedState)
          : undefined;
        if (persistedState) {
          hydrateState(persistedState);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [hydrateState]);

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
    return <View style={{flex: 1, backgroundColor: appColors.background}} />;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider theme={theme}>
        <NavigationContainer
          initialState={initialState}
          onStateChange={handleStateChange}
          theme={theme}>
          <ApiProvider>
            <PeripheralContext.Provider
              value={{peripheralValue, setPeripheralValue}}>
              <AppNavigator />
            </PeripheralContext.Provider>
          </ApiProvider>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

// export default codePush({
//   checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
//   installMode: codePush.InstallMode.IMMEDIATE,
// })(App);

export default App;
