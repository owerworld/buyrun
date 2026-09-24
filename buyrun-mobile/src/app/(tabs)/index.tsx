import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../lib/store";
import { C, F, type CoverId } from "../../lib/theme";
import {
  Txt,
  Heading,
  Icon,
  Pill,
  Button,
  Notice,
  shared,
} from "../../components/ui";
import { EventCard } from "../../components/EventCard";
import { InvitationArt } from "../../components/InvitationArt";
import { Glass } from "../../components/Glass";
import { localDate } from "../../components/CalendarSheet";
const occasions = [
  ["🎂", "Doğum günü"],
  ["🍋", "Akşam yemeği"],
  ["🎓", "Mezuniyet"],
  ["🪩", "Ev partisi"],
  ["💍", "Düğün"],
  ["🌷", "Baby shower"],
];
export default function Home() {
  const { events, ready, name, error, refresh } = useStore(),
    insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("Yaklaşan"),
    [refreshing, setRefreshing] = useState(false),
    [message, setMessage] = useState("");
  const today = localDate(new Date());
  const real = events.filter((e) => !e.demo),
    shown = events
      .filter((e) =>
        filter === "Geçmiş"
          ? e.date < today
          : filter === "Benim planlarım"
            ? !e.demo
            : e.date >= today,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  async function reload() {
    setRefreshing(true);
    setMessage("");
    try {
      await Promise.all(real.map((e) => refresh(e.id)));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <View style={shared.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reload}
            tintColor={C.ink}
          />
        }
      >
        <View style={[shared.between, shared.pad, { marginBottom: 23 }]}>
          <View>
            <Txt
              style={{ fontFamily: F.bold, fontSize: 32, letterSpacing: -1.9 }}
            >
              buyrun
              <TextStar />
            </Txt>
            <Txt style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
              GÜZEL ŞEYLER BİRLİKTE.
            </Txt>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profilim"
            onPress={() => router.push("/profile")}
          >
            <Glass
              style={{
                width: 45,
                height: 45,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {name ? (
                <Txt style={{ fontFamily: F.bold }}>
                  {name.slice(0, 1).toLocaleUpperCase("tr")}
                </Txt>
              ) : (
                <Icon name="happy-outline" size={24} />
              )}
            </Glass>
          </Pressable>
        </View>
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: "#ECE6F3",
            borderRadius: 30,
            overflow: "hidden",
            minHeight: 305,
            padding: 23,
          }}
        >
          <Txt
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              color: "#765A8E",
              fontFamily: F.bold,
            }}
          >
            KÜÇÜK BİR PLAN. BÜYÜK BİR HEYECAN.
          </Txt>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 21,
            }}
          >
            <View style={{ width: "56%", zIndex: 2 }}>
              <Txt
                style={{
                  fontFamily: F.serif,
                  fontSize: 46,
                  lineHeight: 45,
                  color: "#342441",
                }}
              >
                Bir bahanen{"\n"}olsun.
              </Txt>
              <Txt
                style={{
                  fontSize: 12,
                  lineHeight: 20,
                  color: "#746680",
                  marginTop: 12,
                  maxWidth: 175,
                }}
              >
                Doğum gününden bir kahveye.{"\n"}Sevdiklerine yer aç.
              </Txt>
            </View>
            <View style={{ width: "44%", height: 169 }}>
              <View
                style={{
                  position: "absolute",
                  width: 110,
                  top: -10,
                  right: 45,
                  transform: [{ rotate: "-14deg" }],
                  borderRadius: 13,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: "white",
                }}
              >
                <InvitationArt
                  event={{ coverId: "citrus" }}
                  height={155}
                  mini
                />
              </View>
              <View
                style={{
                  position: "absolute",
                  width: 110,
                  top: 13,
                  right: -8,
                  transform: [{ rotate: "12deg" }],
                  borderRadius: 13,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: "white",
                }}
              >
                <InvitationArt
                  event={{ coverId: "ribbon" }}
                  height={155}
                  mini
                />
              </View>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/wizard")}
            style={{
              marginTop: 19,
              alignSelf: "flex-start",
              backgroundColor: C.ink,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 25,
              flexDirection: "row",
              gap: 20,
              alignItems: "center",
            }}
          >
            <Txt style={{ color: "white", fontSize: 12, fontFamily: F.bold }}>
              Davetini oluştur
            </Txt>
            <Icon name="arrow-forward" size={17} color="white" />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingVertical: 25,
            gap: 19,
          }}
        >
          {occasions.map(([emoji, category]) => (
            <Pressable
              key={category}
              accessibilityRole="button"
              accessibilityLabel={category + " tasarımlarını gör"}
              onPress={() =>
                router.push({ pathname: "/templates", params: { category } })
              }
              style={{ alignItems: "center", gap: 9, width: 61 }}
            >
              <View
                style={{
                  width: 54,
                  height: 54,
                  backgroundColor: C.white,
                  borderWidth: 1,
                  borderColor: C.line,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Txt style={{ fontSize: 25 }}>{emoji}</Txt>
              </View>
              <Txt numberOfLines={1} style={{ fontSize: 9, color: C.muted }}>
                {category}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
        <View style={[shared.between, shared.pad, { marginBottom: 14 }]}>
          <Heading style={{ fontSize: 23 }}>
            {name
              ? name.split(" ")[0] + ", sırada ne var?"
              : "Takvimine güzel bir şey ekle."}
          </Heading>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            gap: 8,
            paddingBottom: 18,
          }}
        >
          {["Yaklaşan", "Benim planlarım", "Geçmiş"].map((f) => (
            <Pill
              key={f}
              label={f}
              active={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </ScrollView>
        <View style={shared.pad}>
          <Notice message={message || error} />
          {!ready ? (
            <ActivityIndicator color={C.ink} />
          ) : shown.length ? (
            shown.map((event, i) => (
              <EventCard event={event} key={event.id} compact={i > 0} />
            ))
          ) : (
            <View
              style={{
                padding: 24,
                backgroundColor: "white",
                borderRadius: 25,
                gap: 15,
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Icon name="calendar-outline" size={30} />
              <Heading style={{ fontSize: 23, textAlign: "center" }}>
                Henüz bir plan yok.
              </Heading>
              <Txt
                style={{ fontSize: 13, color: C.muted, textAlign: "center" }}
              >
                İlk davetiye için birkaç güzel ayrıntı yeter.
              </Txt>
              <Button tone="lime" onPress={() => router.push("/wizard")}>
                Bir plan yapalım
              </Button>
            </View>
          )}
        </View>
        <View
          style={[
            shared.between,
            shared.pad,
            { marginTop: 8, marginBottom: 15 },
          ]}
        >
          <Heading style={{ fontSize: 23 }}>Biraz ilham al.</Heading>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/templates")}
            style={{ padding: 8 }}
          >
            <Txt style={{ fontSize: 12, fontFamily: F.bold }}>Tümü ↗</Txt>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, gap: 13 }}
        >
          {(["cobalt", "pink", "film", "olive", "moon"] as CoverId[]).map(
            (id) => (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={id + " tasarımıyla başla"}
                onPress={() =>
                  router.push({ pathname: "/create", params: { cover: id } })
                }
                style={{ width: 153, borderRadius: 21, overflow: "hidden" }}
              >
                <InvitationArt event={{ coverId: id }} height={218} mini />
              </Pressable>
            ),
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
function TextStar() {
  return <Txt style={{ fontSize: 25, color: "#A889C6" }}> ✳</Txt>;
}
