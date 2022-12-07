import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Login, Auth} from 'src/screens/onboarding';
import {appRoutes} from 'src/config';

const Stack = createNativeStackNavigator();

export default function OnboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={appRoutes.LOGIN} component={Login} />
      <Stack.Screen name={appRoutes.AUTH} component={Auth} />
    </Stack.Navigator>
  );
}
