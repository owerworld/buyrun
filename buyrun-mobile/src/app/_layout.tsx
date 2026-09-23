import React from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { View, Platform, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StoreProvider } from "../lib/store";
import { C } from "../lib/theme";
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope: require("../../assets/fonts/manrope-500.ttf"),
    ManropeBold: require("../../assets/fonts/manrope-700.ttf"),
  });
  if (!loaded && !error)
    return (
      <View
        style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center" }}
      >
        <ActivityIndicator color={C.ink} />
      </View>
    );
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: Platform.OS === "web" ? "#E6E6DF" : C.bg,
          }}
        >
          <View
            style={[
              { flex: 1, width: "100%", backgroundColor: C.bg },
              Platform.OS === "web" && {
                maxWidth: 460,
                alignSelf: "center",
                boxShadow: "0 0 100px #20202515",
              },
            ]}
          >
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: C.bg },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="event/[id]" />
              <Stack.Screen
                name="wizard"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="create"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
          </View>
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
