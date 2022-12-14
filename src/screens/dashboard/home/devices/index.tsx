import React from 'react';
import {View, Text, Image} from 'react-native';
import {Button} from 'src/components';
import {
  normalizeHeight,
  normalize,
  appColors,
  appFonts,
  appRoutes,
} from 'src/config';
import styles from 'src/screens/styles';
import {RadioButton} from 'react-native-paper';
import {DeviceConnectProps} from 'src/navigators/dashboard/connect/types';

export default function ListDevices({navigation}: DeviceConnectProps) {
  const [value, setValue] = React.useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Scanned Devices</Text>
      <Text style={styles.pale}>
        Pair with your device below. Make sure your device is powered on.
      </Text>
      <RadioButton.Group
        onValueChange={value => {
          setValue(value);
          navigation.navigate(appRoutes['Bt Status']);
        }}
        value={value}>
        <RadioButton.Item
          label="Scanned Device 1"
          value="first"
          position="leading"
          style={{
            backgroundColor: appColors.white,
            marginVertical: normalize(4),
            borderRadius: normalize(8),
          }}
          labelStyle={{
            fontFamily: appFonts.BARLOW_RG,
            fontSize: normalize(16),
            lineHeight: normalize(16 * 1.7),
            color: appColors.shade3,
          }}
          color={appColors.blueprimary}
          uncheckedColor={appColors.border_grey}
        />
        <RadioButton.Item
          label="Scanned Device 2"
          value="second"
          position="leading"
          style={{
            backgroundColor: appColors.white,
            marginVertical: normalize(4),
            borderRadius: normalize(8),
          }}
          labelStyle={{
            fontFamily: appFonts.BARLOW_RG,
            fontSize: normalize(16),
            lineHeight: normalize(16 * 1.7),
            color: appColors.shade3,
          }}
          color={appColors.blueprimary}
          uncheckedColor={appColors.border_grey}
        />
        <RadioButton.Item
          label="Scanned Device 3"
          value="third"
          position="leading"
          style={{
            backgroundColor: appColors.white,
            marginVertical: normalize(4),
            borderRadius: normalize(8),
          }}
          labelStyle={{
            fontFamily: appFonts.BARLOW_RG,
            fontSize: normalize(16),
            lineHeight: normalize(16 * 1.7),
            color: appColors.shade3,
          }}
          color={appColors.blueprimary}
          uncheckedColor={appColors.border_grey}
        />
      </RadioButton.Group>
      <View style={{marginTop: normalizeHeight(100)}}>
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
