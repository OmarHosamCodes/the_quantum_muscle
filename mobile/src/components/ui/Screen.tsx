import React from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from "react-native";

type ScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const Screen = ({ children, style }: ScreenProps) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  flex: {
    flex: 1,
  },
});

export default Screen;
