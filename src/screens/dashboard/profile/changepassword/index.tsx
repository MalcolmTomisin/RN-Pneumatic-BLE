import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Dimensions} from 'react-native';
import {TextInput, Button} from 'src/components';
import {appColors, appFonts, normalize} from 'src/config';

export default function ChangePassword() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextInput
          isPassword
          placeholder="Enter old password"
          label="Old Password"
          placeholderTextColor={appColors.placeholder_grey}
        />
        <TextInput
          isPassword
          placeholder="Enter new password"
          label="New Password"
          placeholderTextColor={appColors.placeholder_grey}
        />
      </View>
      <View style={styles.bottom_card}>
        <TouchableOpacity style={[styles.cancel_btn, styles.btn_shape]}>
          <Text style={[styles.cancel_txt, styles.btn_text]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn_shape, styles.primary_btn]}>
          <Text style={[styles.btn_text, {color: appColors.white}]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: normalize(16),
    paddingTop: normalize(28),
  },
  card: {
    padding: normalize(16),
    borderRadius: normalize(16),
    backgroundColor: appColors.white,
  },
  bottom_card: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    bottom: 0,
    left: 0,
    backgroundColor: appColors.white,
    padding: normalize(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancel_btn: {
    backgroundColor: appColors.cancel_pink,
  },
  btn_text: {
    fontFamily: appFonts.BARLOW_BD,
    fontSize: normalize(14),
    lineHeight: normalize(14 * 1.5),
    textAlign: 'center',
  },
  primary_btn: {
    backgroundColor: appColors.blueprimary,
  },
  btn_shape: {
    borderRadius: normalize(48),
    width: normalize(163),
    height: normalize(56),
    justifyContent: 'center',
  },
  cancel_txt: {
    color: appColors.cancel_red,
  },
});
