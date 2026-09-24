import { InvitationArt } from "./InvitationArt";
import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { C, F } from "../lib/theme";
import { counts, dateText, type Party } from "../lib/model";
import { Txt, Icon } from "./ui";
export function EventCard({
  event,
  compact = false,
}: {
  event: Party;
  compact?: boolean;
}) {
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
      <InvitationArt event={event} height={compact ? 280 : 370} />
      {event.demo && (
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            backgroundColor: "#FFFFFFED",
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Txt style={{ fontSize: 10 }}>Örnek plan</Txt>
        </View>
      )}
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
