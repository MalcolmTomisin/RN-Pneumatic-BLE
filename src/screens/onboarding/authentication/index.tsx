import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../styles';
import {TextInput, Button} from 'src/components';
import {appColors, normalize, appRoutes} from 'src/config';
import type {AuthScreenProps} from 'src/navigators/onboarding/types';

export default function AuthScreen({navigation}: AuthScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Two Factor Authentication</Text>
      <Text style={styles.pale}>
        A code has been sent to your email. Enter the code below
      </Text>
      <TextInput
        label="Code"
        placeholder="Enter code here"
        placeholderTextColor={appColors.placeholder_grey}
      />
      <Text
        style={[
          styles.forgot,
          {
            textAlign: 'left',
            marginTop: normalize(8),
            marginBottom: normalize(265),
          },
        ]}>
        {' '}
        Didn’t get the code? <Text style={styles.recover}>Send a new Code</Text>
      </Text>

      <Button
        onPress={() => {
          navigation.pop();
          navigation.navigate(appRoutes.DASHBOARD);
        }}>
        Validate
      </Button>
    </View>
  );
}
