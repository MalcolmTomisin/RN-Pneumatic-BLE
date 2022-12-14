import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {appRoutes} from 'src/config';
import Dashboard from './dashboard';
import Onboard from './onboarding';

export type RootStackParams = {
  ONBOARD: undefined;
  DASHBOARD: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();

export default function AppNavigator() {
  return (
    // #TODO wire up global state to handle authentication
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {false ? (
        <Stack.Screen name={appRoutes.ONBOARD} component={Onboard} />
      ) : (
        <>
          <Stack.Screen name={appRoutes.ONBOARD} component={Onboard} />
          <Stack.Screen name={appRoutes.DASHBOARD} component={Dashboard} />
        </>
      )}
    </Stack.Navigator>
  );
}
