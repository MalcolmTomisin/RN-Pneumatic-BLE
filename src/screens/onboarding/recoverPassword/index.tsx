import React from 'react';
import {View, Text} from 'react-native';
import {appColors, normalize} from 'src/config';
import styles from '../../styles';
import {TextInput, Button} from 'src/components';
import type {RecoverScreenProps} from 'src/navigators/onboarding/types';

export default function RecoverPassword({navigation}: RecoverScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Recover Password</Text>
      <Text style={styles.pale}>
        Kindly enter email address you signed up with
      </Text>

      <TextInput
        placeholder="Enter mail here"
        placeholderTextColor={appColors.placeholder_grey}
        label="Email Address"
      />
      <Button style={{marginTop: normalize(362), marginBottom: normalize(90)}}>
        Get Reset Link
      </Button>
    </View>
  );
}
