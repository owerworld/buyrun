import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { C, F } from "../lib/theme";
export function Txt({
  children,
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: F.regular, color: C.ink, fontSize: 15 }, style]}
    >
      {children}
    </Text>
  );
}
export function Heading({
  children,
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Txt
      {...props}
      style={[
        {
          fontFamily: F.bold,
          fontSize: 30,
          lineHeight: 36,
          letterSpacing: -1.1,
        },
        style,
      ]}
    >
      {children}
    </Txt>
  );
}
export function Icon({
  name,
  size = 22,
  color = C.ink,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
export function IconButton({
  name,
  onPress,
  label,
  style,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  label: string;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: C.white,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.65 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}
export function Button({
  children,
  onPress,
  tone = "dark",
  loading = false,
  disabled = false,
  icon,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  tone?: "dark" | "lime" | "white";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  style?: StyleProp<ViewStyle>;
}) {
  const fg = tone === "dark" ? C.white : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor:
            tone === "dark" ? C.ink : tone === "lime" ? C.lime : C.white,
          minHeight: 54,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 9,
          paddingHorizontal: 20,
          opacity: disabled || loading ? 0.55 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} color={fg} size={19} />}
          <Txt style={{ fontFamily: F.bold, color: fg, fontSize: 15 }}>
            {children}
          </Txt>
        </>
      )}
    </Pressable>
  );
}
export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 9, marginBottom: 18 }}>
      <Txt style={{ fontFamily: F.bold, fontSize: 13, color: C.muted }}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#99999F"
        {...props}
        style={[
          {
            borderWidth: 1,
            borderColor: C.line,
            backgroundColor: C.white,
            minHeight: 54,
            borderRadius: 15,
            paddingHorizontal: 15,
            paddingVertical: 14,
            fontSize: 16,
            fontFamily: F.regular,
            color: C.ink,
          },
          style,
        ]}
      />
    </View>
  );
}
export function Notice({ message }: { message: string }) {
  return message ? (
    <View
      accessibilityRole="alert"
      style={{
        padding: 15,
        backgroundColor: "#FFF0E9",
        borderRadius: 15,
        marginBottom: 16,
      }}
    >
      <Txt style={{ color: "#943D25", fontSize: 13, lineHeight: 20 }}>
        {message}
      </Txt>
    </View>
  ) : null;
}
export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: active ? C.ink : C.white,
        borderWidth: 1,
        borderColor: active ? C.ink : C.line,
        minHeight: 44,
      }}
    >
      <Txt
        style={{
          fontSize: 13,
          fontFamily: F.bold,
          color: active ? C.white : C.muted,
        }}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
export const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { paddingHorizontal: 22 },
  row: { flexDirection: "row", alignItems: "center" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: F.bold,
    letterSpacing: 1.3,
    color: C.muted,
  },
  section: { marginTop: 25, marginBottom: 16 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
