import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {TextInput} from 'src/components';
import {appColors, appConfig, appFonts, normalize} from 'src/config';
import {Picker} from '@react-native-picker/picker';
import ic_calendar from 'assets/images/ic_calendar.png';

export default function Profile() {
  const [selectedItem, setSelectedItem] = React.useState('');
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.pale}>Edit this users information</Text>
        <Text style={styles.label}>
          User Role<Text style={styles.asterisk}>*</Text>
        </Text>
        <View style={styles.dropdown_input}>
          <Picker
            onValueChange={(itemValue, itemIndex) => {
              setSelectedItem(itemValue);
            }}
            selectedValue={selectedItem}>
            <Picker.Item label="Patient" value={0} />
            <Picker.Item label="People" value={1} />
          </Picker>
        </View>
        <TextInput
          label={
            <>
              First Name<Text style={styles.asterisk}>*</Text>
            </>
          }
          inputContainerStyle={styles.dropdown_input}
        />
        <TextInput
          label={
            <>
              Last Name<Text style={styles.asterisk}>*</Text>
            </>
          }
          inputContainerStyle={styles.dropdown_input}
        />
        <TextInput
          label={
            <>
              Email Address<Text style={styles.asterisk}>*</Text>
            </>
          }
          inputContainerStyle={styles.dropdown_input}
        />
        <TextInput
          label="Phone Number"
          inputContainerStyle={styles.dropdown_input}
        />
        <TextInput
          label="Birthday"
          rightIcon={
            <Image
              source={ic_calendar}
              style={{width: normalize(18), height: normalize(18)}}
              resizeMode="contain"
            />
          }
          inputContainerStyle={styles.dropdown_input}
        />
        <TextInput
          label="Date of Amputation"
          rightIcon={
            <Image
              source={ic_calendar}
              style={{width: normalize(18), height: normalize(18)}}
              resizeMode="contain"
            />
          }
          inputContainerStyle={styles.dropdown_input}
        />
      </View>
      <View style={styles.lower_card}>
        <TouchableOpacity style={[styles.cancel_btn, styles.btn_shape]}>
          <Text style={[styles.cancel_txt, styles.btn_text]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn_shape, styles.primary_btn]}>
          <Text style={[styles.btn_text, {color: appColors.white}]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {},
  card: {
    backgroundColor: appColors.white,
    padding: normalize(16),
    marginHorizontal: normalize(16),
    marginBottom: normalize(149),
  },
  pale: {
    fontFamily: appFonts.BARLOW_MD,
    fontSize: normalize(14),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(14 * 1.5),
    color: appColors.shade3,
  },
  label: {
    fontFamily: appFonts.BARLOW_MD,
    fontSize: normalize(14),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(14 * 1.5),
    color: appColors.label_black,
    marginTop: normalize(24),
  },
  asterisk: {color: appColors.cancel_red},
  cancel_btn: {
    backgroundColor: appColors.cancel_pink,
  },
  btn_text: {
    fontFamily: appFonts.BARLOW_BD,
    fontSize: normalize(14),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(14 * 1.5),
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
  lower_card: {
    width: Dimensions.get('window').width,
    padding: normalize(16),
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appColors.white,
    flexDirection: 'row',
  },
  dropdown_input: {
    width: '100%',
    height: normalize(56),
    borderWidth: 2,
    borderColor: appColors.profile_input_border,
    borderRadius: normalize(8),
    marginBottom: normalize(12),
    backgroundColor: appColors.profile_input,
  },
});
