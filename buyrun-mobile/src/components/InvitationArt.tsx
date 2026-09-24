import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { covers, F, type CoverId } from "../lib/theme";
import { coverSource } from "../lib/cover";
import { dateText, type EventInput } from "../lib/model";
import { Txt } from "./ui";
/**
 * Çizimli kapaklarda yazının güvenli alanı (kapak yüksekliğine/genişliğine oranla).
 * Süsleme her çizimde başka yerde: fiyonk ve nazar boncuğu üstte, satranç ve
 * çini kapaklarda yazı ortadaki kutunun içinde kalmalı. Tanımsız kapaklarda
 * varsayılan alan kullanılır. Oranlar scripts/design-catalog.mjs çizimlerinden ölçüldü.
 */
const TEXT_ZONE: Record<string, { top: number; bottom: number; x: number }> = {
  ribbon: { top: 0.44, bottom: 0.12, x: 0.1 },
  disco: { top: 0.38, bottom: 0.14, x: 0.08 },
  chess: { top: 0.25, bottom: 0.25, x: 0.14 },
  cobalt: { top: 0.25, bottom: 0.25, x: 0.14 },
  picnic: { top: 0.25, bottom: 0.25, x: 0.14 },
  nazar: { top: 0.38, bottom: 0.26, x: 0.08 },
  home: { top: 0.38, bottom: 0.28, x: 0.08 },
  film: { top: 0.3, bottom: 0.1, x: 0.1 },
  sunset: { top: 0.14, bottom: 0.34, x: 0.08 },
  henna: { top: 0.4, bottom: 0.14, x: 0.08 },
  paper: { top: 0.3, bottom: 0.2, x: 0.14 },
  pink: { top: 0.4, bottom: 0.3, x: 0.08 },
  moon: { top: 0.3, bottom: 0.12, x: 0.08 },
};

export function InvitationArt({
  event,
  height = 420,
  mini = false,
}: {
  event: Partial<EventInput> & { coverId: string };
  height?: number;
  mini?: boolean;
}) {
  const c = covers[event.coverId as CoverId] || covers.cherry;
  const illustrated =
    "collection" in c &&
    c.collection === "İllüstrasyon" &&
    !event.coverData &&
    !event.photoId;
  const text = illustrated ? c.text : "#FFF";
  const serif = "font" in c && c.font === "serif";
  const zone = illustrated
    ? TEXT_ZONE[event.coverId] || { top: 0.2, bottom: 0.18, x: 0 }
    : null;
  // Güvenli alan dar olan kapaklarda başlık küçülür; uzun Türkçe başlıklar taşmasın
  const room = zone ? 1 - zone.top - zone.bottom : 1;
  const size = mini
    ? Math.min(22, Math.round(height * 0.09 * Math.min(1, room / 0.55)))
    : Math.round(42 * Math.min(1, room / 0.5));
  return (
    <ImageBackground
      accessible={false}
      source={coverSource(event)}
      resizeMode="cover"
      style={{
        height,
        width: "100%",
        overflow: "hidden",
        backgroundColor: c.color,
      }}
      imageStyle={{ width: "100%", height: "100%" }}
    >
      {!illustrated && (
        <LinearGradient
          colors={["#00000012", "#00000000", "#000000BB"]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View
        style={{
          flex: 1,
          padding: mini ? 14 : 27,
          justifyContent: illustrated ? "center" : "flex-end",
          alignItems: illustrated ? "center" : "flex-start",
          paddingTop: zone ? height * zone.top : 20,
          paddingBottom: zone ? height * zone.bottom : mini ? 20 : 28,
          paddingHorizontal: zone && zone.x ? `${zone.x * 100}%` : mini ? 14 : 27,
        }}
      >
        <Txt
          style={{
            color: text,
            fontSize: mini ? 7 : 10,
            letterSpacing: mini ? 1.4 : 2,
            fontFamily: F.bold,
            textAlign: illustrated ? "center" : "left",
            marginBottom: mini ? 6 : 17,
          }}
        >
          {(event.category || c.category).toLocaleUpperCase("tr")}
        </Txt>
        <Txt
          numberOfLines={mini ? 3 : 5}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={{
            color: text,
            fontFamily: serif ? F.serif : F.bold,
            fontSize: size,
            lineHeight: size * (serif ? 1.03 : 1.1),
            letterSpacing: serif ? -0.5 : -1.3,
            textAlign: illustrated ? "center" : "left",
          }}
        >
          {event.title || c.caption}
        </Txt>
        {!mini && (
          <>
            <View
              style={{
                width: 34,
                height: 1,
                backgroundColor: text,
                opacity: 0.55,
                marginVertical: 20,
              }}
            />
            <Txt
              style={{
                color: text,
                fontSize: 11,
                textAlign: illustrated ? "center" : "left",
                lineHeight: 19,
              }}
            >
              {event.date ? dateText(event.date) : "Senin günün, senin hikâyen"}
              {event.date ? " · " + event.time : ""}
              {event.venue ? "\n" + event.venue : ""}
            </Txt>
          </>
        )}
      </View>
      {!mini && (
        <Txt
          style={{
            position: "absolute",
            bottom: 10,
            alignSelf: "center",
            fontSize: 9,
            color: text,
            opacity: 0.65,
            letterSpacing: 1,
          }}
        >
          buyrun ✦
        </Txt>
      )}
    </ImageBackground>
  );
}
