import React, {forwardRef, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  TextInputProps,
  TextStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import ic_show from 'assets/images/show.png';
import ic_hide from 'assets/images/hide.png';
import styles from './styles';

export default forwardRef<
  TextInput,
  TextInputProps & {
    label?: string;
    labelStyle?: StyleProp<TextStyle>;
    inputContainerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<ViewStyle & TextStyle>;
    isPassword?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    rightIcon?: React.ReactNode;
    toggleSecure?: () => void;
  }
>(function Input(props, ref) {
  const [focused, setFocused] = useState<boolean>(false);
  return (
    <View style={[styles.container, props.containerStyle]}>
      <Text style={[styles.label, props.labelStyle]}>{props.label}</Text>
      <View
        style={[
          styles.input,
          focused ? styles.focused : styles.unfocused,
          props.inputContainerStyle,
        ]}>
        <TextInput
          {...props}
          onFocus={e => {
            props.onFocus && props.onFocus(e);
            setFocused(true);
          }}
          onBlur={e => {
            props.onBlur && props.onBlur(e);
            setFocused(false);
          }}
          ref={ref}
          style={[styles.inputText, props.inputStyle]}
        />

        {props.isPassword ? (
          props.secureTextEntry ? (
            <TouchableOpacity onPress={props.toggleSecure}>
              <Image style={styles.eye} resizeMode="contain" source={ic_show} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={props.toggleSecure}>
              <Image style={styles.eye} resizeMode="contain" source={ic_hide} />
            </TouchableOpacity>
          )
        ) : null}
        {props.rightIcon}
      </View>
    </View>
  );
});
