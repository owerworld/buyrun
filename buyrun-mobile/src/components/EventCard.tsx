import { coverSource } from "../lib/cover";
import React from "react";
import { ImageBackground, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { C, F, covers, type CoverId } from "../lib/theme";
import { counts, dateText, type Party } from "../lib/model";
import { Txt, Icon } from "./ui";
export function EventCard({
  event,
  compact = false,
}: {
  event: Party;
  compact?: boolean;
}) {
  const cover = covers[event.coverId as CoverId] || covers.cherry;
  const n = counts(event);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${dateText(event.date)}, etkinliği aç`}
      onPress={() =>
        router.push({ pathname: "/event/[id]", params: { id: event.id } })
      }
      style={({ pressed }) => ({
        marginBottom: 23,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.line,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <ImageBackground
        source={coverSource(event)}
        imageStyle={{ width: "100%", height: "100%" }}
        style={{ width: "100%", height: compact ? 225 : 355 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,.32)", "transparent", "rgba(0,0,0,.1)"]}
          style={{ flex: 1, padding: 22, justifyContent: "space-between" }}
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,.9)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 9,
                }}
              >
                <Txt
                  style={{
                    fontSize: 10,
                    fontFamily: F.bold,
                    letterSpacing: 0.6,
                  }}
                >
                  {event.category.toLocaleUpperCase("tr")}
                </Txt>
              </View>
              {event.demo && (
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,.28)",
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: 7,
                  }}
                >
                  <Txt style={{ fontSize: 10, color: "white" }}>Örnek plan</Txt>
                </View>
              )}
            </View>
            <Txt
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={{
                fontFamily: F.bold,
                fontSize: compact ? 28 : 37,
                lineHeight: compact ? 34 : 43,
                color: "white",
                letterSpacing: -1.5,
                maxWidth: "90%",
              }}
            >
              {event.title}
            </Txt>
          </View>
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: C.white,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 9,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="calendar-outline" size={16} />
            <Txt style={{ fontSize: 12, fontFamily: F.bold }}>
              {dateText(event.date, { day: "numeric", month: "short" })} ·{" "}
              {event.time}
            </Txt>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={{ paddingHorizontal: 17, paddingVertical: 16, gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              flex: 1,
            }}
          >
            <Icon name="location-outline" size={15} color={C.muted} />
            <Txt
              numberOfLines={1}
              style={{ fontSize: 13, color: C.muted, flex: 1 }}
            >
              {event.venue}
            </Txt>
          </View>
          <Icon name="arrow-forward" size={18} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {event.guests.slice(0, 3).map((g, i) => (
              <View
                key={g.id}
                style={{
                  marginLeft: i ? -7 : 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: [C.purple, C.lime, "#F5C7B4"][i],
                  borderWidth: 2,
                  borderColor: C.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Txt style={{ fontSize: 9, fontFamily: F.bold }}>
                  {g.name.slice(0, 1)}
                </Txt>
              </View>
            ))}
            <Txt style={{ fontSize: 12, fontFamily: F.bold, marginLeft: 7 }}>
              {n.people ? `${n.people} kişi geliyor` : "İlk daveti gönder"}
            </Txt>
          </View>
          <View
            style={{
              backgroundColor: C.soft,
              paddingHorizontal: 9,
              paddingVertical: 5,
              borderRadius: 7,
            }}
          >
            <Txt style={{ fontSize: 10, color: C.muted }}>
              Sen düzenliyorsun
            </Txt>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
