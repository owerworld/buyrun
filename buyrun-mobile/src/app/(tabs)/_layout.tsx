import React from "react";
import { Tabs, router } from "expo-router";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "../../lib/theme";
import { Icon, Txt } from "../../components/ui";
type BottomTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];
function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const buttons = [
    { route: "index", label: "Planlar", icon: "albums-outline" as const },
    {
      route: "templates",
      label: "Tasarımlar",
      icon: "sparkles-outline" as const,
    },
    { route: "create", label: "Oluştur", icon: "add" as const },
    { route: "profile", label: "Profil", icon: "person-outline" as const },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: C.white,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 12),
        borderTopColor: C.line,
        borderTopWidth: 1,
      }}
    >
      {buttons.map((item) => {
        const active = state.routes[state.index]?.name === item.route;
        return (
          <Pressable
            key={item.route}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() =>
              item.route === "create"
                ? router.push("/create")
                : navigation.navigate(item.route)
            }
            style={{
              flex: 1,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <View
              style={{
                backgroundColor:
                  item.route === "create"
                    ? C.lime
                    : active
                      ? C.soft
                      : "transparent",
                borderRadius: 15,
                paddingVertical: 6,
                paddingHorizontal: 15,
              }}
            >
              <Icon
                name={item.icon}
                size={23}
                color={active || item.route === "create" ? C.ink : C.muted}
              />
            </View>
            <Txt
              style={{
                fontSize: 10,
                fontFamily: F.bold,
                color: active ? C.ink : C.muted,
              }}
            >
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="templates" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
