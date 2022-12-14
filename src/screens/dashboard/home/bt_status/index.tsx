import React from 'react';
import {Image, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';
import ic_chev from 'assets/images/ic_chevron.png';
import {appColors, appFonts, normalize, normalizeHeight} from 'src/config';

export default function Bt_status() {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: normalize(16),
        paddingBottom: normalize(49),
      }}>
      {/* <Text
        style={{
          fontFamily: appFonts.BARLOW_BD,
          fontSize: normalize(28),
          lineHeight: normalize(28 * 1.4),
          color: appColors.black,
        }}>
        <Image
          source={ic_chev}
          resizeMode="contain"
          style={{height: normalize(14), width: normalize(7)}}
        />{' '}
        Device
      </Text> */}
      <Text style={styles.pale}>
        Select the preferred pressure of the device.
      </Text>
      <View
        style={{
          borderRadius: normalize(16),
          backgroundColor: appColors.white,
          marginTop: normalizeHeight(96),
          padding: normalize(16),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={[styles.title, {color: appColors.label_black}]}>
            Battery Status
          </Text>
          <Text style={[styles.title, {color: appColors.label_black}]}>
            Selected Pressure
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: appColors.process_green,
              },
              styles.text_container,
            ]}>
            <Text style={[styles.title, {color: appColors.white}]}>Full</Text>
          </View>
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: appColors.blueprimary,
              },
              styles.text_container,
            ]}>
            <Text style={[styles.title, {color: appColors.white}]}>70</Text>
          </View>
        </View>
        <Text
          style={[
            styles.pale,
            {
              marginTop: normalize(32),
              marginBottom: normalize(28),
              textAlign: 'center',
            },
          ]}>
          Move slider or tap buttons to adjust pressure
        </Text>
        <Slider
          style={{
            width: '100%',
            height: normalize(8),
            backgroundColor: '#EEEEEE',
          }}
          minimumValue={0}
          maximumValue={100}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: normalize(32),
            marginBottom: normalize(24),
          }}>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: appColors.cancel_red,
              borderRadius: normalize(48),
              width: normalize(148),
              height: normalize(56),
            }}>
            <Text
              style={{
                fontFamily: appFonts.BARLOW_BD,
                fontSize: normalize(14),
                lineHeight: normalize(14 * 1.5),
                color: appColors.cancel_red,
              }}>
              Decrease
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: appColors.process_green,
              borderRadius: normalize(48),
              width: normalize(148),
              height: normalize(56),
            }}>
            <Text
              style={{
                fontFamily: appFonts.BARLOW_BD,
                fontSize: normalize(14),
                lineHeight: normalize(14 * 1.5),
                color: appColors.process_green,
              }}>
              Increase
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={{
          borderRadius: normalize(48),
          width: normalize(343),
          backgroundColor: appColors.blueprimary,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: normalize(97),
          height: normalize(56),
        }}>
        <Text
          style={{
            fontSize: normalize(16),
            lineHeight: normalize(16 * 1.5),
            fontFamily: appFonts.BARLOW_BD,
            color: appColors.white,
          }}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: appFonts.BARLOW_MD,
    fontSize: normalize(14),
    lineHeight: normalize(14 * 1.5),
  },
  text_container: {
    width: normalize(80),
    height: normalize(32),
    marginTop: normalize(8),
    borderRadius: normalize(4),
  },
  pale: {
    fontFamily: appFonts.BARLOW_RG,
    fontSize: normalize(16),
    lineHeight: normalize(16 * 1.7),
    color: appColors.shade3,
    marginTop: normalize(8),
  },
});
