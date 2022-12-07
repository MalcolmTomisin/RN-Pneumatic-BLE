import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Login, Auth, Recover} from 'src/screens/onboarding';
import {appRoutes} from 'src/config';
import type {OnboardStackScreenParams} from './types';

const Stack = createNativeStackNavigator<OnboardStackScreenParams>();

export default function OnboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={appRoutes.LOGIN} component={Login} />
      <Stack.Screen name={appRoutes.AUTH} component={Auth} />
      <Stack.Screen name={appRoutes.RECOVER_PASSWORD} component={Recover} />
    </Stack.Navigator>
  );
}
