import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Heading, IconButton, Txt, shared } from "../components/ui";
import { C, F, covers, type CoverId } from "../lib/theme";
import {
  askable,
  nextQuestion,
  planFromAnswers,
  progress,
  buyukHarf,
  davetAdi,
  soruBasligi,
  SORU_TEPKI,
  tonOrnegi,
  TUR_TEPKI,
  visibleOptions,
  type Answers,
  type Option,
} from "../lib/wizard";
import { API_URL } from "../lib/api";
import { ANSWERS_KEY, DRAFT_KEY } from "../lib/wizardStore";

/**
 * Sihirbaz: ekran başına tek soru, tek dokunuş.
 *
 * Sınav gibi değil, sohbet gibi hissettirmek için: seçilen kart onaylanır ve titreşir,
 * soru yana kayarak değişir, seçenekler sırayla gelir, cevaba kısa bir karşılık verilir.
 * Kapak ve ekranın rengi cevaplarla canlı değişir; sonda "hazırlanıyor" anı var.
 * Cihazda "hareketi azalt" açıksa animasyonlar kapanır.
 */

/** Kapak renginin çok açık bir tonu: ekran zemini cevapla birlikte ısınır. */
function ton(hex: string, oran = 0.12) {
  const n = parseInt(hex.slice(1), 16);
  const bg = parseInt(C.bg.slice(1), 16);
  const kanal = (v: number, s: number) => Math.round((v >> s) & 255);
  const mix = (s: number) =>
    Math.round(kanal(bg, s) * (1 - oran) + kanal(n, s) * oran);
  return `rgb(${mix(16)}, ${mix(8)}, ${mix(0)})`;
}

/** Cevaba kısa karşılık; uydurma istatistik ya da boş övgü yok. */
function tepki(qid: string, v: string, a: Answers) {
  const kapak = covers[planFromAnswers(a).coverId].label;
  switch (qid) {
    case "tur":
      return TUR_TEPKI[v] ?? "";
    case "kim":
      return v === "buyukler"
        ? "Büyüklere yakışan, saygılı bir dil kuracağız."
        : v === "arkadaslar"
          ? "Samimi ve rahat bir dil, anlaşıldı."
          : "Herkese uyan bir dil kuracağız.";
    case "ton": {
      const ornek = tonOrnegi(a.tur, v);
      return ornek ? `Metnin bu havada olacak: ${ornek}` : "Not aldık.";
    }
    case "stil":
    case "hava":
      return `“${kapak}” kapağı sana çok yakışacak.`;
    default:
      return SORU_TEPKI[qid]?.[v] ?? "";
  }
}

function Secenek({
  o,
  i,
  secili,
  soluk,
  onPress,
  hareket,
}: {
  o: Option;
  i: number;
  secili: boolean;
  soluk: boolean;
  onPress: () => void;
  hareket: boolean;
}) {
  const [gel] = useState(() => new Animated.Value(hareket ? 0 : 1));
  const [bas] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!hareket) return;
    Animated.timing(gel, {
      toValue: 1,
      duration: 380,
      delay: 80 + i * 45,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [gel, i, hareket]);
  useEffect(() => {
    if (secili && hareket)
      Animated.spring(bas, {
        toValue: 1.02,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      }).start();
  }, [secili, bas, hareket]);
  const yaylan = (v: number) =>
    hareket &&
    Animated.spring(bas, {
      toValue: v,
      friction: 6,
      tension: 220,
      useNativeDriver: true,
    }).start();
  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(gel, soluk ? 0.45 : 1),
        transform: [
          {
            translateY: gel.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
          { scale: bas },
        ],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: secili }}
        onPress={onPress}
        onPressIn={() => yaylan(0.97)}
        onPressOut={() => !secili && yaylan(1)}
        style={[
          shared.card,
          shared.between,
          {
            paddingVertical: 16,
            minHeight: 62,
            borderColor: secili ? C.ink : C.line,
            borderWidth: secili ? 2 : 1,
            backgroundColor: secili ? C.soft : C.white,
          },
        ]}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Txt style={{ fontFamily: F.bold, fontSize: 16 }}>{o.label}</Txt>
          {!!o.hint && (
            <Txt style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>
              {o.hint}
            </Txt>
          )}
        </View>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: secili ? C.ink : "transparent",
            borderWidth: secili ? 0 : 1.5,
            borderColor: C.line,
          }}
        >
          {secili && (
            <Txt style={{ color: C.white, fontFamily: F.bold, fontSize: 13 }}>
              ✓
            </Txt>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Seçilen kapağın canlı önizlemesi; kapak değişince yumuşakça geçer. */
function KapakOnizleme({
  coverId,
  category,
  photoId,
}: {
  coverId: CoverId;
  category: string;
  /** Türe uygun telifsiz fotoğraf; sunucudan çekilir, yüklenemezse çizim kapak görünür */
  photoId?: string;
}) {
  const [g] = useState(() => new Animated.Value(0));
  useEffect(() => {
    g.setValue(0);
    Animated.timing(g, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [coverId, photoId, g]);
  const c = covers[coverId];
  // Yüklenemeyen fotoğrafın adı; tür değişince yeni fotoğraf yeniden denenir
  const [hataliFoto, setHataliFoto] = useState("");
  const foto =
    photoId && API_URL && photoId !== hataliFoto
      ? { uri: `${API_URL}/foto/${photoId}.jpg` }
      : null;
  return (
    <Animated.View
      style={{
        height: 150,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: c.color,
        opacity: g.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
        transform: [
          {
            scale: g.interpolate({
              inputRange: [0, 1],
              outputRange: [0.97, 1],
            }),
          },
        ],
      }}
      accessibilityLabel={`Kapak: ${c.label}`}
    >
      <Image
        source={c.image}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      {foto && (
        <Image
          source={foto}
          onError={() => setHataliFoto(photoId ?? "")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      )}
      {/* Yazı her kapakta okunsun: alttan koyu geçiş */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.62)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "70%",
        }}
      />
      <View style={{ position: "absolute", left: 16, bottom: 14, right: 16 }}>
        <Txt
          style={{
            color: C.white,
            fontFamily: F.bold,
            fontSize: 11,
            letterSpacing: 1.2,
          }}
        >
          {category.toLocaleUpperCase("tr")}
        </Txt>
        <Txt
          style={{
            color: C.white,
            fontFamily: F.bold,
            fontSize: 20,
            marginTop: 4,
          }}
        >
          {foto ? "Kapak fotoğrafın hazır" : c.label}
        </Txt>
      </View>
    </Animated.View>
  );
}

export default function Wizard() {
  const [answers, setAnswers] = useState<Answers>({});
  const [secilen, setSecilen] = useState<string | null>(null);
  const [karsilik, setKarsilik] = useState("");
  const [yon, setYon] = useState<1 | -1>(1);
  const [hazirlik, setHazirlik] = useState(-1);
  const [hareket, setHareket] = useState(true);
  const kilit = useRef(false);
  const question = nextQuestion(answers);
  const { done, total } = progress(answers);
  const plan = planFromAnswers(answers);
  const coverId = plan.coverId;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((azalt) => setHareket(!azalt))
      .catch(() => {});
  }, []);

  // Soru değişince yana kayarak gelir
  const [soru] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!hareket) return;
    soru.setValue(0);
    Animated.timing(soru, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [question?.id, soru, hareket]);

  // İlerleme çubuğu kayarak dolar
  const [bar] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(bar, {
      toValue: total ? done / total : 0,
      duration: hareket ? 450 : 0,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [done, total, bar, hareket]);

  const background = answers.tur ? ton(covers[coverId].color) : C.bg;

  function geri() {
    const answered = askable(answers).filter((q) => answers[q.id]);
    const last = answered[answered.length - 1];
    if (!last) return router.back();
    setYon(-1);
    setKarsilik("");
    setAnswers((a) => {
      const copy = { ...a };
      delete copy[last.id];
      return copy;
    });
  }

  function sec(id: string, value: string) {
    if (kilit.current) return;
    kilit.current = true;
    setSecilen(value);
    Haptics.selectionAsync().catch(() => {});
    const next = { ...answers, [id]: value };
    setTimeout(
      () => {
        kilit.current = false;
        setSecilen(null);
        setYon(1);
        setKarsilik(tepki(id, value, next));
        setAnswers(next);
        if (!nextQuestion(next)) void bitir(next);
      },
      hareket ? 260 : 0,
    );
  }

  async function bitir(next: Answers) {
    // Hazırlık adımları tek tek işaretlenir: kullanıcı cevaplarının işlendiğini görür
    setHazirlik(0);
    const plan = planFromAnswers(next);
    const kaydet = (async () => {
      try {
        await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(next));
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        const draft = raw ? JSON.parse(raw) : {};
        await AsyncStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title: "",
            hostName: "",
            date: "",
            time: "20:00",
            venue: "",
            address: "",
            description: "",
            capacity: null,
            ...draft,
            category: plan.category,
            coverId: plan.coverId,
            coverData: null,
            photoId: plan.photoId,
          }),
        );
      } catch {
        // Taslak yazılamazsa da akış devam etsin; oluşturma ekranı boş başlar
      }
    })();
    const bekle = (ms: number) =>
      new Promise((r) => setTimeout(r, hareket ? ms : 0));
    for (let n = 1; n <= 3; n++) {
      await bekle(420);
      setHazirlik(n);
      Haptics.selectionAsync().catch(() => {});
    }
    await kaydet;
    await bekle(380);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    router.replace({ pathname: "/create", params: { from: "wizard" } });
  }

  const zeminRengi = background;

  if (hazirlik >= 0) {
    const adimlar = [
      "Kapağın seçildi",
      "Davet dilin ayarlandı",
      "Taslağın hazırlanıyor",
    ];
    return (
      <Animated.View style={{ flex: 1, backgroundColor: zeminRengi }}>
        <SafeAreaView
          style={{ flex: 1, padding: 22, justifyContent: "center" }}
        >
          <KapakOnizleme
            coverId={coverId}
            category={plan.category}
            photoId={plan.photoId}
          />
          <Heading style={{ marginTop: 28 }}>
            {buyukHarf(davetAdi(answers))} hazırlanıyor
          </Heading>
          <View style={{ marginTop: 18, gap: 14 }}>
            {adimlar.map((m, i) => (
              <View key={m} style={[shared.row, { gap: 12 }]}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: hazirlik > i ? C.ink : "transparent",
                    borderWidth: hazirlik > i ? 0 : 1.5,
                    borderColor: C.line,
                  }}
                >
                  {hazirlik > i && (
                    <Txt
                      style={{
                        color: C.white,
                        fontFamily: F.bold,
                        fontSize: 13,
                      }}
                    >
                      ✓
                    </Txt>
                  )}
                </View>
                <Txt
                  style={{
                    color: hazirlik > i ? C.ink : C.muted,
                    fontSize: 16,
                  }}
                >
                  {m}
                </Txt>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  if (!question) return null;

  return (
    <Animated.View style={{ flex: 1, backgroundColor: zeminRengi }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={shared.header}>
          <IconButton name="chevron-back" onPress={geri} label="Geri" />
          <Txt style={shared.eyebrow}>
            {done + 1} / {total}
          </Txt>
        </View>

        <View style={[shared.pad, { paddingBottom: 6 }]}>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`Toplam ${total} sorudan ${done + 1}. soru`}
            style={{ height: 5, borderRadius: 99, backgroundColor: C.soft }}
          >
            <Animated.View
              style={{
                height: 5,
                borderRadius: 99,
                backgroundColor: C.ink,
                width: bar.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            shared.pad,
            { paddingTop: 18, paddingBottom: 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {!!answers.tur && (
            <KapakOnizleme
              coverId={coverId}
              category={plan.category}
              photoId={plan.photoId}
            />
          )}
          <Animated.View
            key={question.id}
            style={{
              opacity: soru,
              transform: [
                {
                  translateX: soru.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28 * yon, 0],
                  }),
                },
              ],
            }}
          >
            {!!karsilik && (
              <Txt
                style={{
                  color: C.green,
                  fontFamily: F.bold,
                  fontSize: 14,
                  marginTop: 18,
                }}
              >
                {karsilik}
              </Txt>
            )}
            <Heading style={{ marginTop: answers.tur || karsilik ? 12 : 4 }}>
              {soruBasligi(question, answers)}
            </Heading>
            {!!question.lead && (
              <Txt style={{ color: C.muted, marginTop: 10 }}>
                {question.lead}
              </Txt>
            )}

            <View style={{ gap: 10, marginTop: 22 }}>
              {visibleOptions(question, answers).map((o, i) => (
                <Secenek
                  key={o.id}
                  o={o}
                  i={i}
                  hareket={hareket}
                  secili={secilen === o.id}
                  soluk={secilen !== null && secilen !== o.id}
                  onPress={() => sec(question.id, o.id)}
                />
              ))}
            </View>

            {done === 0 && (
              <Txt
                style={{
                  color: C.muted,
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 24,
                }}
              >
                Yazı yazmak yok, sadece seç. Adı ve tarihi en sonda bir kerede
                alacağız.
              </Txt>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}
