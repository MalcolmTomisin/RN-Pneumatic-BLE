import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home} from 'src/screens/dashboard';
import {appRoutes} from 'src/config';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={appRoutes.HOME} component={Home} />
    </Stack.Navigator>
  );
}
