import React from 'react';
import {View, Text} from 'react-native';
import {Button} from 'src/components';
import {normalizeHeight, normalize, appColors} from 'src/config';
import styles from 'src/screens/styles';

export default function ScannedDevices() {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Scanned Devices</Text>
      <Text style={styles.pale}>
        Pair with your device below. Make sure your device is powered on.
      </Text>
      <View style={{marginTop: normalizeHeight(328)}}>
        <Button
          style={[
            {
              marginBottom: normalize(24),
            },
            styles.outline_btn,
          ]}
          mode="outlined"
          labelStyle={{color: appColors.blueprimary}}>
          Scan
        </Button>
        <Button
          style={{
            backgroundColor: appColors.blueprimary,
          }}>
          Connect
        </Button>
      </View>
    </View>
  );
}
