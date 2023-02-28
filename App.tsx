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
} from 'src/config';
import {MMKV} from 'react-native-mmkv';
import {storage, PERSISTENCE_KEY} from 'src/utils';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import codePush from 'react-native-code-push';
import {ApiProvider} from 'src/components';
import {useAppAuth} from 'src/store';

const Service: {
  launchService: (arg: string) => void;
  closeService: () => void;
} = NativeModules.BluetoothServiceLauncher;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();
  const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;
  const appState = React.useRef(AppState.currentState);
  const {hydrateState, peripheralValue, errorMessage, setErrorMessage} =
    useAppAuth(state => ({
      hydrateState: state.hydrateState,
      peripheralValue: state.peripheralAddress,
      errorMessage: state.errorMessage,
      setErrorMessage: state.setErrorMessage,
    }));

  console.log('errrorrr', errorMessage);
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
          Platform.OS === 'android' && Service.launchService(peripheralValue);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [peripheralValue]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        appState.current = nextState;
        Platform.OS === 'android' && Service.closeService();
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
        if (state) {
          setInitialState(state);
        }
      }
    } finally {
      setIsReady(true);
      SplashScreen.hide();
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      restoreState(storage);
    }
  }, [isReady, restoreState]);

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
            <AppNavigator />
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

const sub1 = useAppAuth.subscribe(console.log);
