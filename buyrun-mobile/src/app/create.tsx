import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { coverSource } from "../lib/cover";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Button,
  Field,
  Heading,
  Icon,
  IconButton,
  Notice,
  Pill,
  shared,
  Txt,
} from "../components/ui";
import { CalendarSheet, localDate } from "../components/CalendarSheet";
import { C, F, categories, covers, type CoverId } from "../lib/theme";
import { ANSWERS_KEY, DRAFT_KEY } from "../lib/wizardStore";
import { api, ApiError } from "../lib/api";
import { dateText, type EventInput } from "../lib/model";
import { useStore } from "../lib/store";
const DRAFT = DRAFT_KEY;
const titles = ["Havasını seç.", "Planı güzelleştir.", "Davetiyen hazır."];
export default function Create() {
  const store = useStore();
  const params = useLocalSearchParams<{ cover?: string; id?: string }>();
  if (!store.ready)
    return (
      <View
        style={[
          shared.screen,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator color={C.ink} />
        <Txt style={{ marginTop: 12 }}>Planların yükleniyor…</Txt>
      </View>
    );
  if (params.id && !store.events.some((e) => e.id === params.id))
    return (
      <SafeAreaView
        style={[shared.screen, { padding: 22, justifyContent: "center" }]}
      >
        <Notice message="Bu plan bu cihazda bulunamadı. Profil bölümünden yönetim kodunla geri getirebilirsin." />
        <Button onPress={() => router.replace("/profile")}>
          Profilime git
        </Button>
      </SafeAreaView>
    );
  return <CreateForm key={params.id || params.cover || "new"} />;
}
function CreateForm() {
  const params = useLocalSearchParams<{ cover?: string; id?: string }>();
  const store = useStore();
  const existing = store.events.find((e) => e.id === params.id);
  const editing = !!existing;
  const selected = Object.hasOwn(covers, params.cover || "")
    ? (params.cover as CoverId)
    : "cherry";
  const [data, setData] = useState<EventInput>(() =>
    existing
      ? { ...existing }
      : {
          title: "",
          category: covers[selected].category,
          hostName: store.name,
          date: "",
          time: "20:00",
          venue: "",
          address: "",
          description: "",
          coverId: selected,
          coverData: null,
          capacity: null,
        },
  );
  const [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [picking, setPicking] = useState(false),
    [calendar, setCalendar] = useState(false),
    [draftReady, setDraftReady] = useState(editing),
    [restored, setRestored] = useState(false),
    [answers, setAnswers] = useState<Record<string, string> | null>(null),
    [writing, setWriting] = useState(false);
  const completed = useRef(false);
  const draftWrite = useRef(Promise.resolve());
  const scroll = useRef<ScrollView>(null);
  const patch = (p: Partial<EventInput>) => setData((d) => ({ ...d, ...p }));
  useEffect(() => {
    let alive = true;
    if (editing) return;
    AsyncStorage.getItem(DRAFT)
      .then((raw) => {
        if (raw && alive) {
          const draft = JSON.parse(raw) as EventInput;
          setData({
            ...draft,
            ...(params.cover
              ? {
                  coverId: selected,
                  coverData: null,
                  photoId: "",
                  category: covers[selected].category,
                }
              : {}),
          });
          setRestored(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setDraftReady(true);
      });
    return () => {
      alive = false;
    };
  }, [editing, params.cover, selected]);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(ANSWERS_KEY)
      .then((raw) => {
        if (raw && alive) setAnswers(JSON.parse(raw) as Record<string, string>);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  /** Her basışta sıradaki öneri; son yazdırılan metin isteğe karışmasın diye saklanır. */
  const oneri = useRef({ sira: 0, son: "" });
  /** Sihirbazdan geldiyse davet metnini sunucuya yazdırır. Hata olursa not elle yazılır. */
  async function writeNote() {
    if (!answers) return;
    setError("");
    if (!data.title.trim() || !data.venue.trim() || !data.date) {
      setError("Metni yazabilmemiz için önce adı, tarihi ve mekânı doldur.");
      return;
    }
    setWriting(true);
    try {
      const not = data.description.trim();
      // Kutudaki metin bizim önceki önerimizse istek değildir; kullanıcının kendi notuysa metne eklenir
      const kendiNotu = not && not !== oneri.current.son ? not.slice(0, 160) : "";
      const { text } = await api.wizardText({
        answers,
        title: data.title.trim(),
        hostName: data.hostName.trim(),
        date: data.date,
        venue: data.venue.trim(),
        request: kendiNotu,
        variant: oneri.current.sira,
      });
      oneri.current = { sira: oneri.current.sira + 1, son: text };
      patch({ description: text });
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Metin yazılamadı. Notu kendin yazabilirsin.",
      );
    } finally {
      setWriting(false);
    }
  }
  useEffect(() => {
    if (!draftReady || editing || saving || completed.current) return;
    const timer = setTimeout(() => {
      draftWrite.current = draftWrite.current
        .then(() => AsyncStorage.setItem(DRAFT, JSON.stringify(data)))
        .catch(() =>
          setError(
            "Taslak cihazda kaydedilemedi. Bu ekranı kapatmadan oluşturmayı tamamlayın.",
          ),
        );
    }, 450);
    return () => clearTimeout(timer);
  }, [data, draftReady, editing, saving]);
  function next() {
    setError("");
    if (step === 1) {
      if (
        !data.title.trim() ||
        !data.hostName.trim() ||
        !data.venue.trim() ||
        !data.date
      ) {
        setError("Etkinlik adı, ev sahibi, tarih ve mekânı doldur.");
        return;
      }
      if (data.date < localDate(new Date()) && data.date !== existing?.date) {
        setError("Bugün veya daha ileri bir tarih seç.");
        return;
      }
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) {
        setError("Saati 20:00 biçiminde yaz.");
        return;
      }
      if (
        data.capacity !== null &&
        data.capacity !== undefined &&
        (!Number.isInteger(data.capacity) ||
          data.capacity < 1 ||
          data.capacity > 10000)
      ) {
        setError("Kişi hedefini 1 ile 10.000 arasında yaz.");
        return;
      }
    }
    setStep((s) => Math.min(2, s + 1));
    scroll.current?.scrollTo({ y: 0, animated: true });
  }
  async function choosePhoto() {
    setError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.9,
      });
      if (result.canceled) return;
      setPicking(true);
      const asset = result.assets[0];
      if (!asset.width || !asset.height)
        throw new Error("Görselin boyutu okunamadı. Başka bir fotoğraf seç.");
      const width = Math.min(1080, asset.width);
      const height = Math.max(
        1,
        Math.round((asset.height * width) / asset.width),
      );
      const image = await ImageManipulator.manipulate(asset.uri)
        .resize({ width, height })
        .renderAsync();
      let out = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.75,
        base64: true,
      });
      if ((out.base64?.length || 0) > 1900000)
        out = await image.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.45,
          base64: true,
        });
      if (!out.base64 || out.base64.length > 1900000)
        throw new Error("Bu görsel çok büyük. Daha küçük bir fotoğraf seç.");
      patch({ coverData: "data:image/jpeg;base64," + out.base64 });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Fotoğraf açılamadı. Başka bir görsel dene.",
      );
    } finally {
      setPicking(false);
    }
  }
  async function save() {
    setSaving(true);
    setError("");
    try {
      const clean = {
        ...data,
        title: data.title.trim(),
        hostName: data.hostName.trim(),
        venue: data.venue.trim(),
      };
      const event = editing
        ? await store.update(existing.id, clean)
        : await store.create(clean);
      completed.current = true;
      if (!editing) {
        await draftWrite.current;
        await AsyncStorage.removeItem(DRAFT).catch(() => {});
        // Sihirbaz cevapları bu davete aitti; bir sonraki davet sıfırdan başlasın
        await AsyncStorage.removeItem(ANSWERS_KEY).catch(() => {});
      }
      router.replace({ pathname: "/event/[id]", params: { id: event.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi. Yeniden dene.");
    } finally {
      setSaving(false);
    }
  }
  const cover = covers[data.coverId as CoverId] || covers.cherry;
  if (!draftReady)
    return (
      <View
        style={[
          shared.screen,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator color={C.ink} />
        <Txt style={{ marginTop: 12 }}>Taslağın hazırlanıyor…</Txt>
      </View>
    );
  return (
    <SafeAreaView style={shared.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={shared.header}>
          <IconButton
            name={step ? "arrow-back" : "close"}
            label={step ? "Önceki adım" : "Kapat"}
            onPress={() => {
              if (step) {
                setStep((s) => s - 1);
                setError("");
              } else if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
          />
          <Txt style={{ fontFamily: F.bold }}>
            {editing ? "Planı düzenle" : "Yeni bir plan"}
          </Txt>
          <Txt style={{ color: C.muted, fontSize: 13 }}>{step + 1} / 3</Txt>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            paddingHorizontal: 22,
            paddingBottom: 20,
          }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                backgroundColor: i <= step ? C.ink : C.line,
              }}
            />
          ))}
        </View>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <Heading style={{ marginBottom: 8 }}>{titles[step]}</Heading>
          <Txt style={{ color: C.muted, lineHeight: 23, marginBottom: 22 }}>
            {
              [
                "Bir kapakla başla. Gerisi güzel bir hikâye.",
                "Ne zaman, nerede, kimlerle?",
                "Son bir göz at. Sonra sevdiklerine gönder.",
              ][step]
            }
          </Txt>
          {restored && step === 0 && (
            <View
              style={{
                marginBottom: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="checkmark-circle" size={18} color={C.green} />
              <Txt style={{ fontSize: 12, color: C.green }}>
                Kaldığın taslak geri geldi.
              </Txt>
            </View>
          )}
          {!!error && <Notice message={error} />}
          {step === 0 && (
            <>
              <ImageBackground
                source={coverSource(data)}
                imageStyle={{ width: "100%", height: "100%" }}
                style={{
                  width: "100%",
                  height: 330,
                  borderRadius: 26,
                  overflow: "hidden",
                  justifyContent: "flex-end",
                  marginBottom: 18,
                }}
              >
                <LinearGradient
                  colors={["transparent", "#0009"]}
                  style={{ padding: 24, paddingTop: 150 }}
                >
                  <Txt
                    numberOfLines={3}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    style={{
                      color: "#FFF",
                      fontFamily: F.bold,
                      fontSize: 34,
                      lineHeight: 38,
                      letterSpacing: -1,
                    }}
                  >
                    {data.title || cover.caption}
                  </Txt>
                  <Txt style={{ color: "#FFF", marginTop: 10, fontSize: 12 }}>
                    senin planın, senin tarzın ✦
                  </Txt>
                </LinearGradient>
              </ImageBackground>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
                {Object.entries(covers).map(([id, c]) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={c.label + " kapağını seç"}
                    accessibilityState={{
                      selected: data.coverId === id && !data.coverData,
                    }}
                    onPress={() => patch({ coverId: id, coverData: null, photoId: "" })}
                    style={{ flex: 1, gap: 7 }}
                  >
                    <View
                      style={{
                        padding: 3,
                        borderWidth: 2,
                        borderColor:
                          data.coverId === id && !data.coverData
                            ? C.ink
                            : "transparent",
                        borderRadius: 18,
                      }}
                    >
                      <Image
                        source={c.image}
                        style={{ height: 88, width: "100%", borderRadius: 12 }}
                      />
                    </View>
                    <Txt
                      style={{
                        fontSize: 11,
                        textAlign: "center",
                        color: C.muted,
                      }}
                    >
                      {c.label}
                    </Txt>
                  </Pressable>
                ))}
              </View>
              <Button
                tone="white"
                icon="image-outline"
                loading={picking}
                onPress={choosePhoto}
              >
                {data.coverData
                  ? "Fotoğrafını değiştir"
                  : "Kendi fotoğrafını ekle"}
              </Button>
              <Txt
                style={[shared.eyebrow, { marginTop: 28, marginBottom: 13 }]}
              >
                NE KUTLUYORUZ?
              </Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {categories.map((category) => (
                  <Pill
                    key={category}
                    label={category}
                    active={data.category === category}
                    onPress={() => patch({ category })}
                  />
                ))}
              </View>
            </>
          )}
          {step === 1 && (
            <>
              <Field
                label="ETKİNLİK ADI"
                placeholder="Bir bahane bulalım…"
                value={data.title}
                onChangeText={(title) => patch({ title })}
                maxLength={100}
              />
              <Field
                label="EV SAHİBİ"
                placeholder="Adın veya isimleriniz"
                value={data.hostName}
                onChangeText={(hostName) => patch({ hostName })}
                maxLength={80}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1.5, marginBottom: 18, gap: 9 }}>
                  <Txt
                    style={{ fontFamily: F.bold, fontSize: 13, color: C.muted }}
                  >
                    TARİH
                  </Txt>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Etkinlik tarihi seç"
                    onPress={() => setCalendar(true)}
                    style={{
                      backgroundColor: C.white,
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: C.line,
                      minHeight: 54,
                      padding: 14,
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="calendar-outline" size={18} />
                    <Txt style={{ fontSize: 14 }}>
                      {data.date
                        ? dateText(data.date, {
                            day: "numeric",
                            month: "short",
                          })
                        : "Tarih seç"}
                    </Txt>
                  </Pressable>
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="SAAT"
                    placeholder="20:00"
                    value={data.time}
                    onChangeText={(time) => patch({ time })}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <Field
                label="MEKÂN"
                placeholder="Bir çatı, bir bahçe, bizim ev…"
                value={data.venue}
                onChangeText={(venue) => patch({ venue })}
                maxLength={160}
              />
              <Field
                label="ADRES · İSTEĞE BAĞLI"
                placeholder="Misafirlerin kolayca bulsun"
                value={data.address}
                onChangeText={(address) => patch({ address })}
                maxLength={400}
              />
              <Field
                label="KÜÇÜK BİR NOT · İSTEĞE BAĞLI"
                placeholder="Kıyafet, müzik, getireceklerimiz…"
                value={data.description}
                onChangeText={(description) => patch({ description })}
                multiline
                maxLength={2000}
                style={{ minHeight: 110, textAlignVertical: "top" }}
              />
              {!!answers && (
                <View style={{ marginTop: -8, marginBottom: 18, gap: 7 }}>
                  <Button
                    tone="white"
                    icon="sparkles-outline"
                    loading={writing}
                    onPress={writeNote}
                  >
                    {data.description.trim()
                      ? "Başka bir metin öner"
                      : "Davet metnini benim için yaz"}
                  </Button>
                  <Txt style={{ color: C.muted, fontSize: 13 }}>
                    Sihirbazdaki cevaplarına göre yazıyoruz. Yazdıktan sonra
                    istediğin gibi değiştirebilirsin.
                  </Txt>
                </View>
              )}
              <Field
                label="KAÇ KİŞİLİK PLAN? · İSTEĞE BAĞLI"
                placeholder="Örn. 25"
                value={data.capacity == null ? "" : String(data.capacity)}
                onChangeText={(text) =>
                  patch({
                    capacity: text ? Number(text.replace(/[^0-9]/g, "")) : null,
                  })
                }
                keyboardType="number-pad"
                maxLength={5}
              />
              <Txt style={{ fontSize: 12, color: C.muted, lineHeight: 18 }}>
                Kişi hedefi, hazırlık yapmana yardımcı olur. Katılımı otomatik
                olarak sınırlandırmaz.
              </Txt>
            </>
          )}
          {step === 2 && (
            <>
              <ImageBackground
                source={coverSource(data)}
                imageStyle={{ width: "100%", height: "100%" }}
                style={{
                  width: "100%",
                  height: 380,
                  borderRadius: 27,
                  overflow: "hidden",
                  justifyContent: "flex-end",
                }}
              >
                <LinearGradient
                  colors={["transparent", "#000B"]}
                  style={{ padding: 25, paddingTop: 160 }}
                >
                  <Txt
                    style={{ color: "#FFF", fontSize: 12, marginBottom: 12 }}
                  >
                    {data.category.toLocaleUpperCase("tr")}
                  </Txt>
                  <Heading
                    numberOfLines={4}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    style={{ color: "#FFF", fontSize: 38, lineHeight: 43 }}
                  >
                    {data.title}
                  </Heading>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      gap: 7,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="calendar-outline" color="#FFF" size={18} />
                    <Txt style={{ color: "#FFF", fontSize: 13 }}>
                      {dateText(data.date)} · {data.time}
                    </Txt>
                  </View>
                </LinearGradient>
              </ImageBackground>
              <View style={{ paddingVertical: 22, gap: 13 }}>
                <View style={[shared.row, { gap: 12 }]}>
                  <Icon name="location-outline" />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontFamily: F.bold }}>{data.venue}</Txt>
                    {!!data.address && (
                      <Txt
                        style={{ fontSize: 12, color: C.muted, marginTop: 4 }}
                      >
                        {data.address}
                      </Txt>
                    )}
                  </View>
                </View>
                <View style={[shared.row, { gap: 12 }]}>
                  <Icon name="person-outline" />
                  <Txt>{data.hostName} davet ediyor.</Txt>
                </View>
                {!!data.description && (
                  <Txt style={{ color: C.muted, lineHeight: 24, marginTop: 6 }}>
                    {data.description}
                  </Txt>
                )}
              </View>
              <View
                style={[
                  shared.card,
                  { backgroundColor: "#EDF2E0", borderWidth: 0 },
                ]}
              >
                <Txt style={{ fontSize: 12, lineHeight: 20 }}>
                  Davetliler linkten, uygulama indirmeden yanıt verebilir.
                  Davetiyeni daha sonra da düzenleyebilirsin. Bilgiler
                  etkinlikten 90 gün sonra silinir.
                </Txt>
              </View>
              {existing?.demo && (
                <Txt style={{ marginTop: 14, fontSize: 12, color: C.muted }}>
                  Bu bir örnek plan. Değişikliklerin yalnızca bu cihazda
                  gösterilir.
                </Txt>
              )}
            </>
          )}
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderTopColor: C.line,
            backgroundColor: C.bg,
          }}
        >
          <Button
            tone="lime"
            icon={step === 2 ? "checkmark" : "arrow-forward"}
            loading={saving || picking}
            onPress={step === 2 ? save : next}
          >
            {step === 2
              ? editing
                ? "Değişiklikleri kaydet"
                : "Davetiyeyi oluştur"
              : "Devam et"}
          </Button>
        </View>
      </KeyboardAvoidingView>
      {calendar && (
        <CalendarSheet
          value={data.date}
          onChange={(date) => patch({ date })}
          onClose={() => setCalendar(false)}
        />
      )}
    </SafeAreaView>
  );
}
