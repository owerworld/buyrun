import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../lib/store";
import { C, F } from "../../lib/theme";
import { Txt, Heading, Icon, Pill, Button, Notice } from "../../components/ui";
import { EventCard } from "../../components/EventCard";
export default function Home() {
  const { events, ready, name, error, refresh } = useStore();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("Yaklaşan");
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const shown = events
    .filter((e) =>
      filter === "Geçmiş"
        ? e.date < today
        : filter === "Benim planlarım"
          ? !e.demo
          : e.date >= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const reload = async () => {
    setRefreshing(true);
    setMessage("");
    try {
      await Promise.all(
        events.filter((e) => !e.demo).map((e) => refresh(e.id)),
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reload}
            tintColor={C.ink}
          />
        }
        contentContainerStyle={{ paddingBottom: 22 }}
      >
        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 14,
            paddingBottom: 25,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Txt
              style={{ fontFamily: F.bold, fontSize: 36, letterSpacing: -2.3 }}
            >
              buyrun
            </Txt>
            <Icon name="sparkles" size={23} color="#9174E0" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profilim"
            onPress={() => router.push("/profile")}
            style={{
              width: 43,
              height: 43,
              borderRadius: 22,
              backgroundColor: C.lime,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {name ? (
              <Txt style={{ fontFamily: F.bold }}>
                {name[0].toLocaleUpperCase("tr")}
              </Txt>
            ) : (
              <Icon name="happy-outline" size={25} />
            )}
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 22 }}>
          <Txt
            style={{
              fontSize: 11,
              fontFamily: F.bold,
              letterSpacing: 1.7,
              color: C.muted,
              marginBottom: 11,
            }}
          >
            İYİ Kİ BİR ARADAYIZ.
          </Txt>
          <Heading
            style={{ fontSize: 34, lineHeight: 40, letterSpacing: -1.6 }}
          >
            Güzel planlar,{"\n"}
            <Txt
              style={{
                fontFamily: F.bold,
                fontSize: 34,
                lineHeight: 40,
                color: "#8770B8",
              }}
            >
              güzel insanlar.
            </Txt>
          </Heading>
          <Txt
            style={{
              fontSize: 14,
              color: C.muted,
              marginTop: 13,
              lineHeight: 22,
            }}
          >
            Bir bahane bul. Sevdiklerini çağır.
          </Txt>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingVertical: 23,
            gap: 8,
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
        <View style={{ paddingHorizontal: 22 }}>
          <Notice message={message || error} />
          {!ready ? (
            <ActivityIndicator color={C.ink} />
          ) : shown.length ? (
            shown.map((event, i) => (
              <EventCard event={event} key={event.id} compact={i > 0} />
            ))
          ) : (
            <View
              style={{ paddingVertical: 36, alignItems: "center", gap: 16 }}
            >
              <View
                style={{
                  backgroundColor: C.purple,
                  width: 78,
                  height: 78,
                  borderRadius: 27,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="calendar-outline" size={34} />
              </View>
              <Heading style={{ fontSize: 24 }}>
                Sıradaki güzel anı sen başlat.
              </Heading>
              <Txt
                style={{ color: C.muted, textAlign: "center", lineHeight: 23 }}
              >
                Bir kapak seç, ayrıntıları ekle ve davetini paylaş.
              </Txt>
              <Button
                onPress={() => router.push("/create")}
                tone="lime"
                icon="add"
              >
                İlk planını oluştur
              </Button>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/templates")}
            style={{
              borderRadius: 23,
              backgroundColor: C.lime,
              padding: 23,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View style={{ flex: 1 }}>
              <Txt
                style={{
                  fontFamily: F.bold,
                  fontSize: 20,
                  letterSpacing: -0.6,
                }}
              >
                Bir bahanen var mı?
              </Txt>
              <Txt style={{ fontSize: 13, marginTop: 6, color: "#505C2B" }}>
                Davetine yakışan bir kapak bul.
              </Txt>
            </View>
            <Icon name="arrow-forward" size={24} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
