import React from 'react';
import {View, Text} from 'react-native';
import {appColors, appRoutes, normalize} from 'src/config';
import styles from '../../styles';
import {TextInput, Button} from 'src/components';
import type {RecoverScreenProps} from 'src/navigators/onboarding/types';
import {useMutation} from '@tanstack/react-query';
import {axiosInstance} from 'src/network';
import {showToast} from 'src/utils';
import {isAxiosError} from 'axios';

export default function RecoverPassword({navigation}: RecoverScreenProps) {
  const [email, setEmail] = React.useState<string>('');

  const getResetLink = useMutation(
    () =>
      axiosInstance.post('/api/recover-password', {
        email,
      }),
    {
      onSuccess: () => {
        showToast('Reset link has been sent to your email');
        navigation.navigate(appRoutes.LOGIN);
      },
      onError: err => {
        if (isAxiosError(err)) {
          showToast(`${err.response?.data.message}`);
          return;
        }
        showToast('Network error');
      },
    },
  );

  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Recover Password</Text>
      <Text style={styles.pale}>
        Kindly enter the email address you signed up with.
      </Text>

      <TextInput
        placeholder="Enter mail here"
        placeholderTextColor={appColors.placeholder_grey}
        label="Email Address"
        value={email}
        onChangeText={(text: string) => {
          setEmail(text);
        }}
        keyboardType="email-address"
      />
      <Button
        loading={getResetLink.isLoading}
        onPress={getResetLink.mutate}
        style={{marginTop: normalize(362), marginBottom: normalize(90)}}>
        Get Reset Link
      </Button>
    </View>
  );
}
