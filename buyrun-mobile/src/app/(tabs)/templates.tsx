import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heading, Icon, Pill, Txt, shared } from "../../components/ui";
import { C, F, covers, type CoverId } from "../../lib/theme";

const coverIds = Object.keys(covers) as CoverId[];
const filters = ["Tümü", ...new Set(coverIds.map((id) => covers[id].category))];

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState("Tümü");
  const visible = coverIds.filter(
    (id) => category === "Tümü" || covers[id].category === category,
  );
  const choose = (id: CoverId) =>
    router.push({ pathname: "/create", params: { cover: id } });

  return (
    <View style={shared.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 28,
        }}
      >
        <View style={[shared.between, shared.pad, { marginBottom: 25 }]}>
          <Heading style={{ fontSize: 25 }}>Kapaklar</Heading>
          <View style={styles.newBadge}>
            <Icon name="sparkles" size={15} />
            <Txt style={styles.badgeText}>Biraz ilham</Txt>
          </View>
        </View>

        <View style={[shared.pad, { marginBottom: 28 }]}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <Txt style={styles.heroEyebrow}>
                DAHA BAŞLAMADAN HEYECANLANSINLAR.
              </Txt>
              <View style={{ transform: [{ rotate: "-40deg" }] }}>
                <Icon name="arrow-forward" size={24} color={C.lime} />
              </View>
            </View>
            <Heading style={styles.heroTitle}>
              {"Bir planın havası\nkapaktan belli."}
            </Heading>
            <Txt style={styles.heroCopy}>
              Sen bir bahane bul. Davetin tarzı bizden.
            </Txt>
            <View style={styles.heroFooter}>
              <View style={styles.colorDot} />
              <View style={[styles.colorDot, { backgroundColor: C.purple }]} />
              <View style={[styles.colorDot, { backgroundColor: C.orange }]} />
              <Txt style={styles.heroNote}>Her buluşmaya bir ruh.</Txt>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((label) => (
            <Pill
              key={label}
              label={label}
              active={category === label}
              onPress={() => setCategory(label)}
            />
          ))}
        </ScrollView>

        <View
          style={[
            shared.between,
            shared.pad,
            { marginTop: 25, marginBottom: 15 },
          ]}
        >
          <Txt style={styles.sectionTitle}>
            {category === "Tümü" ? "Bir kapak seç, başlayalım." : category}
          </Txt>
          <Txt accessibilityLiveRegion="polite" style={styles.count}>
            {visible.length} kapak
          </Txt>
        </View>

        <View style={styles.gallery}>
          {visible.map((id) => {
            const cover = covers[id];
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`${cover.label}, ${cover.category}. Bu kapakla davet oluştur.`}
                onPress={() => choose(id)}
                style={({ pressed }) => [
                  styles.card,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <View
                  style={[styles.imageFrame, { backgroundColor: cover.color }]}
                >
                  <Image
                    source={cover.image}
                    resizeMode="cover"
                    style={[
                      StyleSheet.absoluteFill,
                      { width: "100%", height: "100%" },
                    ]}
                    accessible={false}
                  />
                  <View style={styles.useCover}>
                    <Icon name="add" size={21} />
                  </View>
                </View>
                <View style={styles.cardLabel}>
                  <Txt style={styles.cardTitle}>{cover.label}</Txt>
                  <Txt style={styles.cardCategory}>{cover.category}</Txt>
                </View>
              </Pressable>
            );
          })}
          {category === "Tümü" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kendi görselinle bir davet oluştur"
              onPress={() => router.push("/create")}
              style={({ pressed }) => [
                styles.customCard,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={styles.customIcon}>
                <Icon name="image-outline" size={27} />
              </View>
              <Heading style={styles.customTitle}>
                {"Bir de\nsenin tarzın."}
              </Heading>
              <Txt style={styles.customCopy}>
                Davetini oluştururken kendi görselini de ekleyebilirsin.
              </Txt>
              <View style={styles.customArrow}>
                <Icon name="arrow-forward" size={23} />
              </View>
            </Pressable>
          )}
        </View>

        <View style={styles.bottomNote}>
          <Icon name="color-palette-outline" size={19} color={C.muted} />
          <Txt style={styles.bottomCopy}>
            Kapak ilk adım. İsim, tarih ve bütün ayrıntılar sana ait.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  newBadge: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: C.lime,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontFamily: F.bold },
  hero: {
    backgroundColor: C.ink,
    padding: 24,
    borderRadius: 27,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  heroEyebrow: {
    color: C.lime,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 1.1,
    fontFamily: F.bold,
    flex: 1,
  },
  heroTitle: {
    color: C.white,
    fontSize: 31,
    lineHeight: 37,
    marginTop: 24,
    letterSpacing: -1.3,
  },
  heroCopy: { color: "#CACACE", fontSize: 13, lineHeight: 20, marginTop: 13 },
  heroFooter: { flexDirection: "row", alignItems: "center", marginTop: 26 },
  colorDot: {
    height: 19,
    width: 19,
    borderRadius: 10,
    backgroundColor: C.lime,
    borderWidth: 2,
    borderColor: C.ink,
    marginRight: -5,
  },
  heroNote: { color: "#BFBFC5", fontSize: 10, marginLeft: 16 },
  filters: { paddingHorizontal: 22, gap: 8 },
  sectionTitle: { fontSize: 14, fontFamily: F.bold, flex: 1, paddingRight: 8 },
  count: { fontSize: 12, color: C.muted },
  gallery: {
    paddingHorizontal: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "flex-start",
  },
  card: { width: "47%", flexGrow: 1, maxWidth: "49%", marginBottom: 5 },
  imageFrame: { aspectRatio: 0.77, borderRadius: 20, overflow: "hidden" },
  useCover: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: { paddingHorizontal: 2, paddingTop: 11, paddingBottom: 5 },
  cardTitle: { fontFamily: F.bold, fontSize: 14 },
  cardCategory: { color: C.muted, fontSize: 11, marginTop: 5 },
  customCard: {
    width: "47%",
    flexGrow: 1,
    maxWidth: "49%",
    backgroundColor: "#ECE5FB",
    borderRadius: 20,
    padding: 17,
    minHeight: 260,
    marginTop: 0,
  },
  customIcon: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#C5B4EB",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  customTitle: {
    fontSize: 24,
    lineHeight: 29,
    marginTop: 19,
    letterSpacing: -0.8,
  },
  customCopy: { fontSize: 11, lineHeight: 17, color: "#666073", marginTop: 10 },
  customArrow: { marginTop: 17, alignItems: "flex-end" },
  bottomNote: {
    marginTop: 28,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bottomCopy: { flex: 1, fontSize: 12, lineHeight: 19, color: C.muted },
});
