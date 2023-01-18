import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Text, StyleSheet, Image, View} from 'react-native';
import {appColors, appFonts, appRoutes, normalize} from 'src/config';
import profile from 'assets/images/ic_profile.png';
import exit from 'assets/images/exit.png';
import compass from 'assets/images/compass.png';
import DeviceStack from './connect';
import ProfileStack from './profile';
import {emptyPersistedState} from 'src/utils';
import {useAppAuth} from 'src/store';

const Drawer = createDrawerNavigator();
const Logout = () => <View />;

export default function DashboardStack() {
  const setEmptyState = useAppAuth(state => state.setEmptyState);

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: appColors.white,
          paddingTop: normalize(170),
        },
        headerStyle: {
          backgroundColor: appColors.background,
        },
        headerTitleStyle: {
          fontFamily: appFonts.BARLOW_BD,
          color: appColors.black,
        },
      }}>
      <Drawer.Screen
        options={{
          drawerLabel: ({focused}) => (
            <Text
              style={[
                styles.drawerLabel,
                {
                  color: focused
                    ? appColors.blueprimary
                    : appColors.placeholder_grey,
                },
              ]}>
              Device
            </Text>
          ),
          drawerIcon: ({focused}) => (
            <Image
              source={compass}
              resizeMode="contain"
              style={{
                width: normalize(20),
                height: normalize(20),
                tintColor: focused
                  ? appColors.blueprimary
                  : appColors.placeholder_grey,
              }}
            />
          ),
        }}
        name={appRoutes.Device}
        component={DeviceStack}
      />
      <Drawer.Screen
        options={{
          drawerLabel: ({focused}) => (
            <Text
              style={[
                styles.drawerLabel,
                {
                  color: focused
                    ? appColors.blueprimary
                    : appColors.placeholder_grey,
                },
              ]}>
              My Profile
            </Text>
          ),
          drawerIcon: ({focused}) => (
            <Image
              source={profile}
              resizeMode="contain"
              style={{
                width: normalize(20),
                height: normalize(20),
                tintColor: focused
                  ? appColors.blueprimary
                  : appColors.placeholder_grey,
              }}
            />
          ),
        }}
        name={appRoutes['My Profile']}
        component={ProfileStack}
      />
      <Drawer.Screen
        name="Log Out"
        options={{
          drawerLabel: ({focused}) => (
            <Text
              style={[
                styles.drawerLabel,
                {
                  color: focused
                    ? appColors.blueprimary
                    : appColors.placeholder_grey,
                  marginTop: normalize(60),
                },
              ]}>
              Log Out
            </Text>
          ),
          drawerIcon: ({focused}) => (
            <Image
              source={exit}
              resizeMode="contain"
              style={{
                width: normalize(20),
                height: normalize(20),
                tintColor: focused
                  ? appColors.blueprimary
                  : appColors.placeholder_grey,
                marginTop: normalize(60),
              }}
            />
          ),
        }}
        component={Logout}
        listeners={({navigation}) => ({
          drawerItemPress: e => {
            e.preventDefault();
            setEmptyState();
            emptyPersistedState();
          },
        })}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerLabel: {
    fontFamily: appFonts.BARLOW_SB,
    fontSize: normalize(14),
    lineHeight: normalize(20),
  },
});
