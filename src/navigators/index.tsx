import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {appRoutes} from 'src/config';
import Dashboard from './dashboard';
import Onboard from './onboarding';
import {useAppAuth} from 'src/store';

export type RootStackParams = {
  ONBOARD: undefined;
  DASHBOARD: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();

export default function AppNavigator() {
  const isSignedIn = useAppAuth(state => state.isSignedIn);

  console.log(`isSignedIn: ${isSignedIn}`);

  return (
    // #TODO wire up global state to handle authentication
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {!isSignedIn ? (
        <Stack.Screen name={appRoutes.ONBOARD} component={Onboard} />
      ) : (
        <>
          <Stack.Screen name={appRoutes.DASHBOARD} component={Dashboard} />
        </>
      )}
    </Stack.Navigator>
  );
}
