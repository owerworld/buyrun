import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  View,
  type ViewProps,
} from "react-native";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { BlurView } from "expo-blur";
/** Glass is reserved for controls. Respect system reduced-transparency settings. */
export function Glass({ children, style, ...props }: ViewProps) {
  const [opaque, setOpaque] = useState(Platform.OS === "ios");
  useEffect(() => {
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled !== "function")
      return;
    let alive = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((v) => {
        if (alive) setOpaque(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setOpaque,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  if (
    !opaque &&
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable()
  )
    return (
      <GlassView glassEffectStyle="regular" style={style} {...props}>
        {children}
      </GlassView>
    );
  if (!opaque && Platform.OS === "ios")
    return (
      <BlurView intensity={70} tint="light" style={style} {...props}>
        {children}
      </BlurView>
    );
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: opaque ? "#FFFFFF" : "rgba(255,255,255,0.94)",
          borderWidth: 1,
          borderColor: "#FFFFFF",
          boxShadow: "0 6px 28px #30304512",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
