import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heading,
  Icon,
  IconButton,
  Pill,
  Txt,
  Button,
  shared,
} from "../../components/ui";
import { InvitationArt } from "../../components/InvitationArt";
import { Glass } from "../../components/Glass";
import { C, F, covers, type CoverId } from "../../lib/theme";
import { fold } from "../../lib/model";
const ids = Object.keys(covers) as CoverId[];
const FAVORITES = "buyrun.design.favorites.v1";
export default function Templates() {
  const insets = useSafeAreaInsets(),
    params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState(params.category || "Tümü"),
    [query, setQuery] = useState(""),
    [kind, setKind] = useState("Hepsi"),
    [favorites, setFavorites] = useState<string[]>([]),
    [loaded, setLoaded] = useState(false),
    [chosen, setChosen] = useState<CoverId | null>(null);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(FAVORITES)
      .then((raw) => {
        if (raw && alive) {
          const v = JSON.parse(raw);
          if (Array.isArray(v))
            setFavorites(
              v.filter(
                (id) => typeof id === "string" && Object.hasOwn(covers, id),
              ),
            );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (loaded)
      AsyncStorage.setItem(FAVORITES, JSON.stringify(favorites)).catch(
        () => {},
      );
  }, [favorites, loaded]);
  const [lastCategory, setLastCategory] = useState(params.category);
  if (params.category !== lastCategory) {
    setLastCategory(params.category);
    if (params.category) setCategory(params.category);
  }
  const toggle = (id: string) =>
    setFavorites((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
    );
  const visible = ids.filter((id) => {
    const c = covers[id];
    return (
      (category === "Tümü" || c.category === category) &&
      (kind === "Hepsi" ||
        (kind === "Kaydettiklerim" && favorites.includes(id)) ||
        (kind === "Fotoğraf" &&
          "collection" in c &&
          c.collection === "Fotoğraf") ||
        (kind === "İllüstrasyon" &&
          (!("collection" in c) || c.collection === "İllüstrasyon"))) &&
      fold(c.label + " " + c.category).includes(fold(query))
    );
  });
  const filters = ["Tümü", ...new Set(ids.map((id) => covers[id].category))];
  return (
    <View style={shared.screen}>
      <FlatList
        data={visible}
        keyExtractor={(id) => id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 22 }}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: 22,
        }}
        ListHeaderComponent={
          <>
            <View style={[shared.between, shared.pad]}>
              <Heading style={{ fontSize: 28 }}>Tasarım stüdyosu</Heading>
              <Icon name="sparkles" color="#9873C7" />
            </View>
            <View style={{ padding: 22, paddingBottom: 16 }}>
              <Txt
                style={{
                  fontFamily: F.serif,
                  fontSize: 39,
                  lineHeight: 41,
                  letterSpacing: -0.8,
                }}
              >
                Her bahaneye{"\n"}bir davetiye.
              </Txt>
              <Txt style={{ color: C.muted, fontSize: 13, marginTop: 10 }}>
                74 tasarım. Bir tanesi tam senlik.
              </Txt>
            </View>
            <View
              style={{
                marginHorizontal: 22,
                backgroundColor: C.white,
                borderRadius: 18,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                gap: 10,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: C.line,
              }}
            >
              <Icon name="search" size={18} color={C.muted} />
              <TextInput
                accessibilityLabel="Tasarım ara"
                placeholder="Doğum günü, kahve, kına…"
                placeholderTextColor={C.muted}
                value={query}
                onChangeText={setQuery}
                style={{
                  flex: 1,
                  fontFamily: F.regular,
                  color: C.ink,
                  paddingVertical: 15,
                  fontSize: 14,
                }}
              />
              {!!query && (
                <IconButton
                  name="close"
                  label="Aramayı temizle"
                  onPress={() => setQuery("")}
                />
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 8,
                paddingHorizontal: 22,
                paddingBottom: 13,
              }}
            >
              {["Hepsi", "İllüstrasyon", "Fotoğraf", "Kaydettiklerim"].map(
                (k) => (
                  <Pill
                    key={k}
                    label={k}
                    active={kind === k}
                    onPress={() => setKind(k)}
                  />
                ),
              )}
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 8,
                paddingHorizontal: 22,
                paddingBottom: 20,
              }}
            >
              {filters.map((c) => (
                <Pill
                  key={c}
                  label={c}
                  active={category === c}
                  onPress={() => setCategory(c)}
                />
              ))}
            </ScrollView>
            <View style={[shared.between, shared.pad, { marginBottom: 15 }]}>
              <Txt style={{ fontFamily: F.bold, fontSize: 13 }}>
                {category === "Tümü"
                  ? "Küçük planlar, büyük heyecanlar"
                  : category}
              </Txt>
              <Txt
                style={{ fontSize: 11, color: C.muted }}
                accessibilityLiveRegion="polite"
              >
                {visible.length} tasarım
              </Txt>
            </View>
          </>
        }
        renderItem={({ item: id }) => (
          <View style={{ flex: 1, maxWidth: "48%", marginBottom: 22 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={covers[id].label + " tasarımını incele"}
              onPress={() => setChosen(id)}
              style={{ borderRadius: 22, overflow: "hidden" }}
            >
              <InvitationArt event={{ coverId: id }} height={245} mini />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                favorites.includes(id)
                  ? "Kaydedilenlerden çıkar"
                  : "Tasarımı kaydet"
              }
              accessibilityState={{ selected: favorites.includes(id) }}
              onPress={() => toggle(id)}
              style={{ position: "absolute", right: 8, top: 8 }}
            >
              <Glass style={{ borderRadius: 20, padding: 10 }}>
                <Icon
                  name={favorites.includes(id) ? "heart" : "heart-outline"}
                  size={16}
                  color={favorites.includes(id) ? "#A23C66" : C.ink}
                />
              </Glass>
            </Pressable>
            <Txt
              numberOfLines={2}
              style={{ fontFamily: F.bold, fontSize: 13, marginTop: 10 }}
            >
              {covers[id].label}
            </Txt>
            <Txt style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
              {covers[id].category}
            </Txt>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 35, gap: 14, alignItems: "center" }}>
            <Icon name="search-outline" size={32} />
            <Heading style={{ fontSize: 22 }}>Biraz daha bakalım.</Heading>
            <Txt style={{ color: C.muted, textAlign: "center" }}>
              Bu seçimde tasarım bulunamadı. Farklı bir kategori deneyebilirsin.
            </Txt>
            <Button
              tone="white"
              onPress={() => {
                setQuery("");
                setCategory("Tümü");
                setKind("Hepsi");
              }}
            >
              Tüm tasarımları göster
            </Button>
          </View>
        }
      />
      <Modal
        visible={!!chosen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChosen(null)}
      >
        <View
          style={[
            shared.screen,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={shared.header}>
            <Txt style={{ fontFamily: F.bold }}>Biraz yakından bakalım</Txt>
            <IconButton
              name="close"
              label="Önizlemeyi kapat"
              onPress={() => setChosen(null)}
            />
          </View>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24 }}
          >
            {chosen && (
              <>
                <View style={{ borderRadius: 26, overflow: "hidden" }}>
                  <InvitationArt event={{ coverId: chosen }} height={470} />
                </View>
                <Heading style={{ fontSize: 25, marginTop: 20 }}>
                  {covers[chosen].label}
                </Heading>
                <Txt
                  style={{
                    color: C.muted,
                    fontSize: 13,
                    marginTop: 8,
                    lineHeight: 21,
                  }}
                >
                  İsimleri ve ayrıntıları ekle. Kendi fotoğrafınla da
                  kişiselleştirebilirsin.
                </Txt>
              </>
            )}
          </ScrollView>
          <View style={{ paddingHorizontal: 22 }}>
            <Button
              tone="lime"
              icon="arrow-forward"
              onPress={() => {
                if (chosen) {
                  const cover = chosen;
                  setChosen(null);
                  router.push({ pathname: "/create", params: { cover } });
                }
              }}
            >
              Bu tasarımla başla
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
