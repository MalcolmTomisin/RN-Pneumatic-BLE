import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
import {Avatar} from 'react-native-paper';
import {
  appFonts,
  normalize,
  appColors,
  appRoutes,
  CombinedDarkTheme,
  CombinedDefaultTheme,
  appConfig,
} from 'src/config';
import ic_shield from 'assets/images/ic_shield.png';
import {Picker} from '@react-native-picker/picker';
import {FlatList} from 'react-native-gesture-handler';
import type {ProfileScreenProps} from 'src/navigators/dashboard/profile/types';
import {useAppAuth} from 'src/store';
import {useUserDetails} from 'src/network/hooks';

const Information = ({navigation, first_name, last_name, email}) => (
  <View>
    <View style={styles.card}>
      <View
        style={[
          styles.row,
          {alignItems: 'center', marginBottom: normalize(12)},
        ]}>
        <Avatar.Text
          style={{marginRight: normalize(16)}}
          label="BB"
          size={48}
        />
        <Text
          style={[
            styles.bold_color,
            styles.bold_title,
          ]}>{`${first_name} ${last_name}`}</Text>
      </View>
      <View style={[styles.row, styles.space_24]}>
        <View style={[{flex: 1}]}>
          <Text style={[styles.pale_info]}>User Role</Text>
          <View>
            <Text style={[styles.bold_color, styles.bold_info]}>Patient</Text>
          </View>
        </View>
        {/* <View style={[{flex: 1, justifyContent: 'flex-start'}]}>
          <Text style={[styles.pale_info]}>Status</Text>
          <View style={{width: normalize(50)}}>
            <Switch />
          </View>
        </View> */}
      </View>
      <View style={[styles.row, styles.space_24]}>
        <View style={[{flex: 1}]}>
          <Text style={[styles.pale_info]}>First Name</Text>
          <Text style={[styles.bold_color, styles.bold_info]}>
            {first_name}
          </Text>
        </View>
        <View style={[{flex: 1}]}>
          <Text style={[styles.pale_info]}>Last Name</Text>
          <Text style={[styles.bold_color, styles.bold_info]}>{last_name}</Text>
        </View>
      </View>
      {/* <View style={[styles.row, styles.space_24]}>
        <View style={[{flex: 1}]}>
          <Text style={[styles.pale_info]}>Date of Birth</Text>
          <Text style={[styles.bold_color, styles.bold_info]}>12/11/22</Text>
        </View>
        <View style={[{flex: 1}]}>
          <Text style={[styles.pale_info]}>Date of Amputation</Text>
          <Text style={[styles.bold_color, styles.bold_info]}>12/11/22</Text>
        </View>
      </View> */}
      <View style={[styles.space_24]}>
        <Text style={[styles.pale_info]}>Email</Text>
        <Text style={[styles.bold_color, styles.bold_info]}>{email}</Text>
      </View>
      {/* <View style={[styles.space_24]}>
        <Text style={[styles.pale_info]}>Phone</Text>
        <Text style={[styles.bold_color, styles.bold_info]}>
          (544) 856-1196
        </Text>
      </View> */}
    </View>
    <View
      style={[
        styles.row,
        {
          width: '100%',
          marginTop: normalize(16),
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      ]}>
      {/* <TouchableOpacity
        onPress={() => {
          navigation.navigate(appRoutes['Edit Details']);
        }}
        style={[styles.btn, styles.row]}>
        <Text style={[styles.btn_text, styles.green]}>Edit</Text>
        <Image
          source={ic_edit}
          resizeMode="contain"
          style={{width: normalize(16), height: normalize(16)}}
        />
      </TouchableOpacity> */}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(appRoutes['Change Password']);
        }}
        style={[styles.btn, styles.row]}>
        <Text style={[styles.btn_text, styles.reset_color]}>
          Reset Password
        </Text>
        <Image
          source={ic_shield}
          resizeMode="contain"
          style={{width: normalize(16), height: normalize(16)}}
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ActivityList = () => {
  const info = new Array(5).fill('Bruce Banner');
  const [selectedItem, setSelectedItem] = useState('Most Recent');
  const darkMode = useColorScheme() === 'dark';

  const _renderItem = ({item}) => (
    <View style={[styles.row]}>
      <View style={{alignItems: 'center'}}>
        <View style={styles.line} />
        <View style={styles.outer}>
          <View style={styles.inner} />
        </View>
        <View style={styles.line} />
      </View>
      <View
        style={{
          marginVertical: normalize(11),
          backgroundColor: appColors.background_grey,
          padding: normalize(16),
          borderRadius: normalize(8),
          marginLeft: normalize(8),
        }}>
        <Text style={[styles.date, styles.date_header]}>
          14 May 2022: 04:32PM
        </Text>
        <View style={styles.divider} />
        <Text style={[styles.date, styles.group_info]}>
          <Text style={styles.name_highlight}>{item}</Text> joined a new
          prothetist group
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.card]}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={
          darkMode
            ? CombinedDarkTheme.colors.background
            : CombinedDefaultTheme.colors.background
        }
      />
      <FlatList
        ListHeaderComponent={
          <View style={styles.list_header_container}>
            <Text style={styles.list_title}>Activity Log</Text>
            <View style={styles.dropdown}>
              <Picker
                selectedValue={selectedItem}
                prompt="Most Recent"
                dropdownIconColor={appColors.label_black}
                itemStyle={{color: appColors.label_black}}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedItem(itemValue)
                }>
                <Picker.Item label="Most Recent" value="most recent" />
              </Picker>
            </View>
          </View>
        }
        renderItem={_renderItem}
        data={info}
      />
    </View>
  );
};

export default function Profile({navigation}: ProfileScreenProps) {
  const layout = useWindowDimensions();
  const {firstName, lastName, userEmail} = useAppAuth(
    state => state.profile ?? {firstName: '', lastName: '', userEmail: ''},
  );

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'first':
        return (
          <Information
            first_name={firstName}
            last_name={lastName}
            email={userEmail}
            navigation={navigation}
          />
        );
      case 'second':
        return <ActivityList />;
      default:
        return null;
    }
  };

  const [index, setIndex] = useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Information'},
    // {key: 'second', title: 'Activity Log'},
  ]);
  return (
    <View style={styles.container}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        sceneContainerStyle={{paddingTop: 22}}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{backgroundColor: appColors.background}}
            indicatorStyle={{backgroundColor: appColors.blueprimary}}
            labelStyle={styles.tabLabel}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: normalize(16),
  },
  card: {
    padding: normalize(16),
    backgroundColor: appColors.white,
    borderRadius: normalize(16),
  },
  row: {
    flexDirection: 'row',
  },
  tabLabel: {
    fontFamily: appFonts.BARLOW_SB,
    fontSize: normalize(14),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(14 * 1.7),
    color: appColors.label_black,
    textTransform: 'capitalize',
  },
  bold_color: {
    color: appColors.label_black,
  },
  bold_info: {
    fontFamily: appFonts.BARLOW_SB,
    fontSize: normalize(16),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(16 * 1.7),
  },
  pale_info: {
    color: appColors.shade3,
    fontFamily: appFonts.BARLOW_RG,
    fontSize: normalize(14),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(14 * 1.5),
  },
  bold_title: {
    fontSize: normalize(18),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(18 * 1.4),
    fontFamily: appFonts.BARLOW_BD,
  },
  space_24: {
    marginVertical: normalize(12),
  },
  btn_text: {
    fontFamily: appFonts.BARLOW_BD,
    fontSize: normalize(14),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(14 * 1.5),
    //marginRight: normalize(10),
    textAlign: 'right',
  },
  green: {
    color: appColors.torquiose_green,
  },
  reset_color: {
    color: appColors.blueprimary,
  },
  btn: {
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: appColors.white,
    height: normalize(56),
    borderRadius: normalize(16),
    width: normalize(163),
  },
  divider: {
    height: 1,
    marginVertical: normalize(8),
    backgroundColor: appColors.neutral_grey1,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: appColors.neutral_grey1,
  },
  outer: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(16 * 0.9),
    backgroundColor: appColors.blueprimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: normalize(8),
    height: normalize(8),
    backgroundColor: appColors.white,
    borderRadius: normalize(8 * 0.9),
  },
  date: {
    fontFamily: appFonts.BARLOW_RG,
    fontSize: normalize(16),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(16 * 1.7),
  },
  name_highlight: {
    color: appColors.blueprimary,
  },
  group_info: {
    color: appColors.grey_2,
  },
  date_header: {
    color: appColors.shade1,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: normalize(48),
    padding: normalize(16),
  },
  list_header_container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  list_title: {
    fontFamily: appFonts.BARLOW_BD,
    fontSize: normalize(18),
    lineHeight: appConfig.IS_IOS ? undefined : normalize(18 * 1.4),
    color: appColors.label_black,
  },
});
