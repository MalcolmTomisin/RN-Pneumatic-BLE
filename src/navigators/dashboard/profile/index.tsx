import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {appRoutes} from 'src/config';
import {Profile, EditDetails, ChangePassword} from 'src/screens/dashboard';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen component={Profile} name={appRoutes['Profile Home']} />
      <Stack.Screen component={EditDetails} name={appRoutes['Edit Details']} />
      <Stack.Screen
        component={ChangePassword}
        name={appRoutes['Change Password']}
      />
    </Stack.Navigator>
  );
}
