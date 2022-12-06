import React from 'react';
import {View, StatusBar, useColorScheme, Text} from 'react-native';
import {CombinedDarkTheme, CombinedDefaultTheme} from 'src/config';
import styles from './styles';

export default function Login() {
  const darkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={
          darkMode
            ? CombinedDarkTheme.colors.background
            : CombinedDefaultTheme.colors.background
        }
      />
      <Text style={styles.bold}>Welcome Back</Text>
      <Text style={styles.pale}>Enter login details to get started.</Text>
    </View>
  );
}
