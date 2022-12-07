import React, {useState} from 'react';
import {View, StatusBar, useColorScheme, Text} from 'react-native';
import {
  appColors,
  appRoutes,
  CombinedDarkTheme,
  CombinedDefaultTheme,
} from 'src/config';
import styles from '../styles';
import {TextInput, Button} from 'src/components';
import type {LoginScreenProps} from 'src/navigators/onboarding/types';

export default function Login({navigation}: LoginScreenProps) {
  const darkMode = useColorScheme() === 'dark';
  const [secure, setSecure] = useState<boolean>(true);
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
      <TextInput
        placeholderTextColor={appColors.placeholder_grey}
        label="Email Address"
        placeholder="Enter Email Address"
      />
      <TextInput
        isPassword
        placeholderTextColor={appColors.placeholder_grey}
        secureTextEntry={secure}
        placeholder="Enter password"
        toggleSecure={() => {
          setSecure(!secure);
        }}
        label="Password"
      />
      <Text style={styles.lowerText}>
        By signing in, I accept the{' '}
        <Text style={styles.terms}>Terms & Conditions</Text> and privacy policy
        of Smart Brace Technology by Spinal Technology
      </Text>
      <Button
        onPress={() => {
          navigation.navigate(appRoutes.AUTH);
        }}
        style={styles.btn}>
        Log In
      </Button>
      <Text style={styles.forgot}>
        Forgot Password? <Text style={styles.recover}>Recover Password</Text>
      </Text>
    </View>
  );
}
