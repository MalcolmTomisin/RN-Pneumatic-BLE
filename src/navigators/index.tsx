import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {appRoutes} from 'src/config';
import Dashboard from './dashboard';
import Onboard from './onboarding';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    // #TODO wire up global state to handle authentication
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {true ? (
        <Stack.Screen name={appRoutes.ONBOARD} component={Onboard} />
      ) : (
        <Stack.Screen name={appRoutes.DASHBOARD} component={Dashboard} />
      )}
    </Stack.Navigator>
  );
}
