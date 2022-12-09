import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {appRoutes} from 'src/config';
import {Home, Scan} from 'src/screens/dashboard';

const Stack = createNativeStackNavigator();

export default function DeviceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen component={Home} name={appRoutes.DeviceConnect} />
      <Stack.Screen component={Scan} name={appRoutes.Scan} />
    </Stack.Navigator>
  );
}
