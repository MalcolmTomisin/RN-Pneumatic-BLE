import React, {useState} from 'react';
import {View, StatusBar, useColorScheme, Text} from 'react-native';
import {
  appColors,
  appRoutes,
  CombinedDarkTheme,
  CombinedDefaultTheme,
} from 'src/config';
import styles from '../../styles';
import {TextInput, Button} from 'src/components';
import type {LoginScreenProps} from 'src/navigators/onboarding/types';
import {useMutation} from '@tanstack/react-query';
import {axiosInstance} from 'src/network';
import {useAppAuth} from 'src/store';
import type {LoginResponseType} from 'src/schemas';
import {LoginResponseSchema} from 'src/schemas';
import {AxiosResponse} from 'axios';

export default function Login({navigation}: LoginScreenProps) {
  const darkMode = useColorScheme() === 'dark';
  const [textInput, setTextInput] = useState<{email: string; password: string}>(
    {email: '', password: ''},
  );
  const [secure, setSecure] = useState<boolean>(true);
  const {setSignIn, setToken, setHardware, setProfile} = useAppAuth(
    state => state,
  );
  const signIn = useMutation(
    () =>
      axiosInstance.post<LoginResponseType, AxiosResponse<LoginResponseType>>(
        '/api/sign-in',
        {
          email: textInput.email,
          password: textInput.password,
        },
      ),
    {
      onSuccess: ({data}) => {
        //#TODO plug in auth token
        try {
          const response = LoginResponseSchema.parse(data);
          const {profile, hardware, token} = response.data;
          setProfile(profile);
          setHardware(hardware);
          setToken(token);
          setSignIn(true);
        } catch (e) {
          console.log(e);
        }
      },
    },
  );
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
        value={textInput.email}
        onChangeText={(text: string) => {
          setTextInput(s => ({...s, email: text}));
        }}
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
        onChangeText={(text: string) => {
          setTextInput(s => ({...s, password: text}));
        }}
        value={textInput.password}
      />
      <Text style={styles.lowerText}>
        By signing in, I accept the{' '}
        <Text style={styles.terms}>Terms & Conditions and Privacy Policy</Text>
        of Smart Brace Technology by Spinal Technology
      </Text>
      <Button onPress={signIn.mutate} style={styles.btn}>
        Log In
      </Button>
      <Text
        onPress={() => {
          navigation.navigate(appRoutes.RECOVER_PASSWORD);
        }}
        style={styles.forgot}>
        Forgot Password? <Text style={styles.recover}>Recover Password</Text>
      </Text>
    </View>
  );
}
