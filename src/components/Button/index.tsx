import React from 'react';
import {Button} from 'react-native-paper';
import styles from './styles';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';

export default function IButton(
  props: React.ComponentProps<typeof Button> & {
    contentStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
  },
) {
  return (
    <Button
      contentStyle={[styles.button, props.contentStyle]}
      labelStyle={[styles.buttontext, props.labelStyle]}
      mode="contained"
      uppercase={false}
      {...props}>
      {props.children}
    </Button>
  );
}
