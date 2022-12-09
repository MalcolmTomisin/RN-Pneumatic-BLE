import React from 'react';
import {View, Text} from 'react-native';
import styles from 'src/screens/styles';
import {Button} from 'src/components';
import {appColors, appRoutes, normalize, normalizeHeight} from 'src/config';
import type {DeviceScreenProps} from 'src/navigators/dashboard/connect/types';

export default function Home({navigation}: DeviceScreenProps) {
  const [disabled, setDisabled] = React.useState(true);
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Connect With A Device</Text>
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
          onPress={() => {
            navigation.navigate(appRoutes.Scan);
          }}
          labelStyle={{color: appColors.blueprimary}}>
          Scan
        </Button>
        <Button
          style={{
            backgroundColor: disabled
              ? appColors.disabled_grey
              : appColors.blueprimary,
          }}>
          Connect
        </Button>
      </View>
    </View>
  );
}
