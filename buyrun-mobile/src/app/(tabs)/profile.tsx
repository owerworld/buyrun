import React, { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Field,
  Heading,
  Icon,
  IconButton,
  Notice,
  Txt,
  shared,
} from "../../components/ui";
import { C, F, covers, type CoverId } from "../../lib/theme";
import { useStore } from "../../lib/store";
import { dateText } from "../../lib/model";

type Sheet = "name" | "import" | "privacy" | null;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { events, ready, name, setName, importEvent, error } = useStore();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftName, setDraftName] = useState(name);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const plans = events.filter((event) => !event.demo);

  const openSheet = (next: Sheet) => {
    setFormError("");
    if (next === "name") setDraftName(name);
    setSheet(next);
  };
  const closeSheet = () => {
    if (!busy) {
      Keyboard.dismiss();
      setSheet(null);
      setFormError("");
    }
  };
  const saveName = () => {
    if (!ready) {
      setFormError("Profilin yükleniyor. Birazdan yeniden dene.");
      return;
    }
    const next = draftName.trim();
    if (!next) {
      setFormError("Sana nasıl hitap edelim? İsmini yaz.");
      return;
    }
    setName(next);
    setFeedback("İsmin güncellendi. Güzel planlarda görüşürüz!");
    closeSheet();
  };
  const copyCode = async (id: string, code: string) => {
    try {
      const copied = await Clipboard.setStringAsync(code);
      if (!copied) throw new Error("copy");
      setCopiedId(id);
      setFeedback(
        "Yönetim kodu kopyalandı. Saklamak için güvenli bir yere yapıştır.",
      );
    } catch {
      setFeedback("Kod kopyalanamadı. Lütfen tekrar dene.");
    }
  };
  const recover = async () => {
    if (busy) return;
    const code = token.trim();
    if (!code) {
      setFormError("Planının yönetim kodunu yaz.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const event = await importEvent(code);
      Keyboard.dismiss();
      setToken("");
      setSheet(null);
      setFeedback("Planın bu cihaza eklendi.");
      router.push({ pathname: "/event/[id]", params: { id: event.id } });
    } catch (e) {
      setFormError(
        e instanceof Error
          ? e.message
          : "Plan bulunamadı. Yönetim kodunu kontrol edip tekrar dene.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={shared.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 30,
        }}
      >
        <View style={[shared.between, shared.pad, { marginBottom: 22 }]}>
          <Heading style={{ fontSize: 25 }}>Senin alanın</Heading>
          <IconButton
            name="shield-checkmark-outline"
            label="Gizlilik hakkında"
            onPress={() => openSheet("privacy")}
          />
        </View>

        <View style={shared.pad}>
          <View style={styles.identity}>
            <View style={styles.identityTop}>
              <View style={styles.avatar}>
                <Txt style={styles.initial}>
                  {name.trim().charAt(0).toLocaleUpperCase("tr") || "B"}
                </Txt>
                <View style={styles.avatarSpark}>
                  <Icon name="sparkles" size={13} />
                </View>
              </View>
              <View style={styles.deviceBadge}>
                <Icon name="phone-portrait-outline" size={12} color="#675B86" />
                <Txt style={styles.deviceText}>Bu cihazda</Txt>
              </View>
            </View>
            <Heading style={styles.name}>
              {name ? `Merhaba, ${name}.` : "Güzel planların\ninsanı."}
            </Heading>
            <Txt style={styles.identityCopy}>
              Buluşmaların, davetlerin, biriktireceğin anılar.
            </Txt>
            <Pressable
              accessibilityRole="button"
              onPress={() => openSheet("name")}
              style={styles.editName}
            >
              <Txt style={styles.editText}>
                {name ? "İsmini düzenle" : "İsmini ekle"}
              </Txt>
              <Icon name="create-outline" size={17} />
            </Pressable>
          </View>

          <View style={styles.localSummary}>
            <View style={styles.countBlock}>
              <Txt style={styles.planCount}>{ready ? plans.length : "…"}</Txt>
              <Txt style={styles.countLabel}>kendi planın</Txt>
            </View>
            <View style={styles.summaryDivider} />
            <Txt style={styles.localCopy}>
              Profilin bu cihazda saklanır. Başka cihazda devam etmek için
              yönetim kodunu kullan.
            </Txt>
          </View>

          {!!error && <Notice message={error} />}
          {!!feedback && (
            <View accessibilityLiveRegion="polite" style={styles.feedback}>
              <Icon
                name={
                  feedback.includes("kopyalanamadı")
                    ? "information-circle-outline"
                    : "checkmark-circle-outline"
                }
                size={20}
                color={C.green}
              />
              <Txt style={styles.feedbackText}>{feedback}</Txt>
            </View>
          )}

          <View style={[shared.between, { marginTop: 12, marginBottom: 8 }]}>
            <Heading style={styles.sectionTitle}>
              Planların sende kalsın.
            </Heading>
            <Icon name="key-outline" size={23} />
          </View>
          <Txt style={styles.sectionCopy}>
            Her planın bir yönetim kodu var. Kodunu sakla; telefon değişse de
            kaldığın yerden devam et.
          </Txt>

          {ready && plans.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Icon name="ticket-outline" size={26} />
              </View>
              <Txt style={styles.emptyTitle}>
                İlk gerçek planın burada yerini alacak.
              </Txt>
              <Txt style={styles.emptyCopy}>
                Örnek davetler bu sayıya dahil değil. Yeni bir plan
                hazırladığında kodunu burada bulacaksın.
              </Txt>
              <Button
                onPress={() => router.push("/create")}
                tone="lime"
                icon="add"
              >
                Bir plan yap
              </Button>
            </View>
          ) : (
            <View style={styles.backupList}>
              {plans.map((event) => {
                const cover = covers[event.coverId as CoverId] || covers.cherry;
                return (
                  <View key={event.id} style={styles.backupCard}>
                    <View style={styles.backupTop}>
                      <Image
                        source={
                          event.coverData
                            ? { uri: event.coverData }
                            : cover.image
                        }
                        style={styles.thumbnail}
                        accessible={false}
                      />
                      <View style={{ flex: 1 }}>
                        <Txt style={styles.backupTitle}>{event.title}</Txt>
                        <Txt style={styles.backupDate}>
                          {dateText(event.date, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Txt>
                      </View>
                    </View>
                    {event.manageToken ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${event.title} için yönetim kodunu kopyala`}
                        onPress={() => copyCode(event.id, event.manageToken!)}
                        style={({ pressed }) => [
                          styles.copyButton,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <Icon
                          name={
                            copiedId === event.id ? "checkmark" : "copy-outline"
                          }
                          size={17}
                        />
                        <Txt style={styles.copyText}>
                          {copiedId === event.id
                            ? "Kod kopyalandı"
                            : "Yönetim kodunu kopyala"}
                        </Txt>
                      </Pressable>
                    ) : (
                      <Txt style={styles.missingCode}>
                        Bu planın yönetim kodu cihazda bulunamadı. Kaydettiğin
                        kodla aşağıdan geri alabilirsin.
                      </Txt>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => openSheet("import")}
            style={({ pressed }) => [
              styles.importCard,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <View style={styles.importIcon}>
              <Icon name="download-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={styles.importTitle}>Bir planını geri getir</Txt>
              <Txt style={styles.importCopy}>
                Yönetim kodunla bu cihaza ekle.
              </Txt>
            </View>
            <Icon name="chevron-forward" size={18} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => openSheet("privacy")}
            style={styles.privacyLink}
          >
            <Icon name="lock-closed-outline" size={16} color={C.muted} />
            <Txt style={styles.privacyText}>Gizlilik ve verilerin hakkında</Txt>
            <Icon name="arrow-forward" size={16} color={C.muted} />
          </Pressable>
          <Txt style={styles.footer}>
            buyrun. · Bahanesi bizden, buluşması sizden.
          </Txt>
        </View>
      </ScrollView>

      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeSheet}
            accessibilityRole="button"
            accessibilityLabel="Pencereyi kapat"
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 22), paddingTop: 22 },
            ]}
          >
            <View style={[shared.between, { marginBottom: 20 }]}>
              <Heading style={styles.sheetTitle}>
                {sheet === "name"
                  ? "Sana nasıl seslenelim?"
                  : sheet === "import"
                    ? "Planını geri getir."
                    : "Güvenle bir araya."}
              </Heading>
              <IconButton
                name="close"
                label="Kapat"
                onPress={closeSheet}
                style={{ backgroundColor: C.soft }}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Notice message={formError} />
              {sheet === "name" && (
                <>
                  <Txt style={styles.sheetCopy}>
                    Bu isim yalnızca bu cihazdaki profilinde saklanır.
                  </Txt>
                  <Field
                    label="İsmin"
                    value={draftName}
                    onChangeText={setDraftName}
                    maxLength={40}
                    placeholder="Örn. Ece"
                    autoCapitalize="words"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={saveName}
                  />
                  <Button onPress={saveName} tone="lime">
                    Kaydet
                  </Button>
                </>
              )}
              {sheet === "import" && (
                <>
                  <Txt style={styles.sheetCopy}>
                    Daha önce sakladığın yönetim kodunu yaz. Planın ve gelen
                    yanıtlar burada yeniden görünsün.
                  </Txt>
                  <Field
                    label="Yönetim kodu"
                    value={token}
                    onChangeText={setToken}
                    maxLength={180}
                    placeholder="Kodunu buraya yapıştır"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    returnKeyType="go"
                    onSubmitEditing={recover}
                    editable={!busy}
                  />
                  <Button
                    onPress={recover}
                    loading={busy}
                    disabled={!token.trim() || !ready}
                    tone="lime"
                    icon="download-outline"
                  >
                    Planı getir
                  </Button>
                  <Txt style={styles.codeNote}>
                    Yönetim kodu sana özeldir. Davetlilere davet linkini gönder.
                  </Txt>
                </>
              )}
              {sheet === "privacy" && (
                <>
                  <View style={styles.privacyItem}>
                    <Icon name="phone-portrait-outline" size={23} />
                    <View style={{ flex: 1 }}>
                      <Txt style={styles.privacyHeading}>
                        Bu cihazdaki profilin
                      </Txt>
                      <Txt style={styles.privacyBody}>
                        İsmin ve planlarına erişim bilgileri bu cihazda tutulur.
                        Bir hesap açman veya telefon numaranı vermen gerekmez.
                      </Txt>
                    </View>
                  </View>
                  <View style={styles.privacyItem}>
                    <Icon name="people-outline" size={23} />
                    <View style={{ flex: 1 }}>
                      <Txt style={styles.privacyHeading}>
                        Davetlerin ve yanıtlar
                      </Txt>
                      <Txt style={styles.privacyBody}>
                        Oluşturduğun etkinlik bilgileri ve davetlilerin
                        yanıtları planını yönetebilmen için sunucuda saklanır.
                        Paylaştığın davet bağlantısı etkinlik bilgilerini açar.
                      </Txt>
                    </View>
                  </View>
                  <View style={styles.privacyItem}>
                    <Icon name="key-outline" size={23} />
                    <View style={{ flex: 1 }}>
                      <Txt style={styles.privacyHeading}>
                        Kodun, planının anahtarı
                      </Txt>
                      <Txt style={styles.privacyBody}>
                        Yönetim koduna sahip kişi planını yönetebilir. Kodunu
                        güvenli bir yerde sakla ve davetlilerinle paylaşma.
                        Uygulamayı silersen planını bu kodla geri
                        getirebilirsin.
                      </Txt>
                    </View>
                  </View>
                  <Button onPress={closeSheet} tone="lime">
                    Tamamdır
                  </Button>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { backgroundColor: "#E8DFFA", borderRadius: 28, padding: 24 },
  identityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  avatar: {
    width: 67,
    height: 67,
    borderRadius: 24,
    backgroundColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-7deg" }],
  },
  initial: { fontFamily: F.bold, fontSize: 31 },
  avatarSpark: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: C.lime,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3EDFD",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  deviceText: { color: "#675B86", fontSize: 10, fontFamily: F.bold },
  name: { marginTop: 24, fontSize: 30, lineHeight: 36 },
  identityCopy: {
    fontSize: 12,
    color: "#6A607B",
    lineHeight: 20,
    marginTop: 10,
  },
  editName: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
    minHeight: 44,
    marginTop: 12,
  },
  editText: { fontSize: 12, fontFamily: F.bold },
  localSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 19,
    paddingVertical: 25,
    marginBottom: 6,
  },
  countBlock: { minWidth: 73 },
  planCount: {
    fontSize: 30,
    fontFamily: F.bold,
    lineHeight: 37,
    letterSpacing: -1,
  },
  countLabel: { fontSize: 11, color: C.muted, marginTop: 3 },
  summaryDivider: { width: 1, height: 49, backgroundColor: C.line },
  localCopy: { fontSize: 11, color: C.muted, flex: 1, lineHeight: 18 },
  feedback: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#EAF3E8",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  feedbackText: { color: "#315F42", fontSize: 12, lineHeight: 18, flex: 1 },
  sectionTitle: { fontSize: 21, lineHeight: 27, letterSpacing: -0.7, flex: 1 },
  sectionCopy: {
    fontSize: 12,
    lineHeight: 20,
    color: C.muted,
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 22,
    padding: 21,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontFamily: F.bold, fontSize: 16, lineHeight: 23 },
  emptyCopy: {
    fontSize: 12,
    lineHeight: 20,
    color: C.muted,
    marginTop: 8,
    marginBottom: 20,
  },
  backupList: { gap: 12 },
  backupCard: {
    padding: 15,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  backupTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  thumbnail: { width: 48, height: 56, borderRadius: 10 },
  backupTitle: { fontFamily: F.bold, fontSize: 14, lineHeight: 20 },
  backupDate: { color: C.muted, fontSize: 11, marginTop: 4 },
  copyButton: {
    backgroundColor: C.soft,
    borderRadius: 12,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  copyText: { fontFamily: F.bold, fontSize: 12 },
  missingCode: { color: C.muted, fontSize: 12, lineHeight: 18 },
  importCard: {
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    backgroundColor: C.lime,
    padding: 17,
    borderRadius: 21,
    marginTop: 16,
    minHeight: 90,
  },
  importIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EAFCA9",
    justifyContent: "center",
    alignItems: "center",
  },
  importTitle: { fontFamily: F.bold, fontSize: 13 },
  importCopy: { fontSize: 11, color: "#59643C", lineHeight: 17, marginTop: 5 },
  privacyLink: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 22,
  },
  privacyText: { fontSize: 11, color: C.muted },
  footer: {
    fontSize: 10,
    color: C.muted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#15151E80",
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingHorizontal: 23,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 460 : undefined,
    alignSelf: "center",
  },
  sheetTitle: { fontSize: 23, lineHeight: 29, flex: 1, marginRight: 8 },
  sheetCopy: { fontSize: 13, lineHeight: 21, color: C.muted, marginBottom: 23 },
  codeNote: {
    fontSize: 11,
    lineHeight: 18,
    color: C.muted,
    marginTop: 15,
    textAlign: "center",
  },
  privacyItem: { flexDirection: "row", gap: 13, marginBottom: 24 },
  privacyHeading: { fontFamily: F.bold, fontSize: 14, marginBottom: 8 },
  privacyBody: { color: C.muted, fontSize: 12, lineHeight: 21 },
});
