import { ShareKit } from "../../components/ShareKit";
import { PlanTools } from "../../components/PlanTools";
import { InvitationArt } from "../../components/InvitationArt";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Field,
  Heading,
  Icon,
  IconButton,
  Notice,
  Pill,
  Txt,
  shared,
} from "../../components/ui";
import { C, F, statusColors, statusLabels } from "../../lib/theme";
import {
  counts,
  dateText,
  fold,
  type Guest,
  type GuestStatus,
} from "../../lib/model";
import { useStore } from "../../lib/store";

type Section = "invite" | "guests" | "summary" | "tools";
const statuses: GuestStatus[] = ["going", "maybe", "pending", "declined"];
const sections: { id: Section; label: string }[] = [
  { id: "invite", label: "Davetiye" },
  { id: "guests", label: "Davetliler" },
  { id: "summary", label: "Özet" },
  { id: "tools", label: "Planla" },
];
const statusIcons = {
  going: "checkmark-circle-outline",
  maybe: "help-circle-outline",
  pending: "time-outline",
  declined: "close-circle-outline",
} as const;
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function EventScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const insets = useSafeAreaInsets();
  const { events, ready, addGuest, updateGuest, refresh } = useStore();
  const event = events.find((item) => item.id === id);
  const [section, setSection] = useState<Section>("invite");
  const [filter, setFilter] = useState<GuestStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [manualRefreshing, setRefreshing] = useState(false);
  const [fetchedId, setFetchedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestStatus, setGuestStatus] = useState<GuestStatus>("pending");
  const [guestCount, setGuestCount] = useState(1);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const refreshed = useRef<{ id: string; promise: Promise<void> } | null>(null);
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const eventId = event?.id;
  const demo = event?.demo;
  const refreshing =
    manualRefreshing || (!!eventId && !demo && fetchedId !== eventId);
  useEffect(() => {
    if (!ready || !eventId || demo) return;
    if (refreshed.current?.id !== eventId)
      refreshed.current = { id: eventId, promise: refreshRef.current(eventId) };
    let active = true;
    refreshed.current.promise
      .catch((cause) => {
        if (active)
          setError(
            errorMessage(
              cause,
              "Yanıtlar yenilenemedi. Tekrar deneyebilirsin.",
            ),
          );
      })
      .finally(() => {
        if (active) setFetchedId(eventId);
      });
    return () => {
      active = false;
    };
  }, [ready, eventId, demo]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };
  const reload = async () => {
    if (!event || event.demo || refreshing) return;
    setRefreshing(true);
    setError("");
    try {
      await refresh(event.id);
    } catch (cause) {
      setError(errorMessage(cause, "Yanıtlar yenilenemedi."));
    } finally {
      setRefreshing(false);
    }
  };
  const copyLink = async (url: string, individual = false) => {
    setError("");
    try {
      if (!(await Clipboard.setStringAsync(url))) throw new Error("copy");
      setFeedback(
        individual
          ? "Kişiye özel davet bağlantısı kopyalandı."
          : "Davet bağlantısı kopyalandı.",
      );
    } catch {
      setError("Bağlantı kopyalanamadı. Lütfen tekrar dene.");
    }
  };
  const shareLink = async (url: string, guest?: Guest) => {
    if (!event || event.demo) return;
    setError("");
    try {
      await Share.share({
        title: event.title,
        message: `${guest ? `Sevgili ${guest.name}, ` : ""}${event.title} için davetlisin! Ayrıntılar ve katılım yanıtın burada: ${url}`,
      });
    } catch {
      setError(
        "Paylaşım açılamadı. Davet bağlantısını kopyalayarak gönderebilirsin.",
      );
    }
  };
  const openMap = async () => {
    if (!event) return;
    const location = [event.venue, event.address].filter(Boolean).join(", ");
    if (!location) return;
    try {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
      );
    } catch {
      setError("Harita açılamadı. Biraz sonra tekrar deneyebilirsin.");
    }
  };
  const openGuest = (guest?: Guest) => {
    setEditing(guest || null);
    setGuestName(guest?.name || "");
    setGuestStatus(guest?.status || "pending");
    setGuestCount(Math.min(20, Math.max(1, guest?.count || 1)));
    setFormError("");
    setModalOpen(true);
  };
  const closeGuest = () => {
    if (!saving) {
      Keyboard.dismiss();
      setModalOpen(false);
      setFormError("");
    }
  };
  const saveGuest = async () => {
    if (!event || saving) return;
    const name = guestName.trim();
    if (!name) {
      setFormError("Davetlinin ya da ailenin adını yaz.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editing)
        await updateGuest(event.id, editing.id, {
          name,
          status: guestStatus,
          count: guestCount,
        });
      else await addGuest(event.id, name);
      setFeedback(
        editing
          ? `${name} için bilgiler güncellendi.`
          : `${name} listeye eklendi.`,
      );
      setModalOpen(false);
      setSection("guests");
      setFilter("all");
      setSearch("");
      Keyboard.dismiss();
    } catch (cause) {
      setFormError(errorMessage(cause, "Davetli kaydedilemedi. Tekrar dene."));
    } finally {
      setSaving(false);
    }
  };

  if (!ready)
    return (
      <View style={[shared.screen, styles.loading]}>
        <ActivityIndicator color={C.ink} />
        <Txt style={styles.loadingText}>Planın hazırlanıyor…</Txt>
      </View>
    );
  if (!event)
    return (
      <View style={[shared.screen, styles.loading, { paddingTop: insets.top }]}>
        <Icon name="ticket-outline" size={45} color={C.muted} />
        <Heading style={{ marginTop: 20, textAlign: "center" }}>
          Bu plan burada yok.
        </Heading>
        <Txt style={styles.notFoundCopy}>
          Yönetim kodun varsa Profil bölümünden planını bu cihaza
          getirebilirsin.
        </Txt>
        <Button tone="lime" onPress={() => router.replace("/(tabs)/profile")}>
          Profilime git
        </Button>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          style={styles.backText}
        >
          <Txt>Geri dön</Txt>
        </Pressable>
      </View>
    );

  const summary = counts(event);
  const distribution = {
    going: summary.going,
    maybe: summary.maybe,
    pending: summary.pending,
    declined: summary.declined,
  };
  const guests = event.guests.filter(
    (guest) =>
      (filter === "all" || guest.status === filter) &&
      (!search.trim() || fold(guest.name).includes(fold(search.trim()))),
  );
  const publicLink = !event.demo ? event.shareUrl : undefined;
  const capacity = event.capacity && event.capacity > 0 ? event.capacity : null;

  return (
    <View style={shared.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 18) + 18,
        }}
      >
        <View style={{ paddingTop: insets.top + 8 }}>
          <View
            style={[
              shared.between,
              { paddingHorizontal: 20, paddingBottom: 12 },
            ]}
          >
            <IconButton
              name="arrow-back"
              label="Planlarıma dön"
              onPress={goBack}
            />
            <Txt style={{ fontFamily: F.bold }}>Davet alanın</Txt>
            <IconButton
              name="create-outline"
              label="Davetiyeyi düzenle"
              onPress={() =>
                router.push({ pathname: "/create", params: { id: event.id } })
              }
            />
          </View>
          <View
            style={{
              marginHorizontal: 18,
              borderRadius: 28,
              overflow: "hidden",
            }}
          >
            <InvitationArt event={event} height={380} />
          </View>
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {sections.map((item) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: section === item.id }}
              key={item.id}
              onPress={() => {
                setSection(item.id);
                Keyboard.dismiss();
              }}
              style={[styles.tab, section === item.id && styles.activeTab]}
            >
              <Txt
                style={[
                  styles.tabText,
                  section === item.id && styles.activeTabText,
                ]}
              >
                {item.label}
              </Txt>
              {item.id === "guests" && (
                <View
                  style={[
                    styles.tabCount,
                    section === item.id && { backgroundColor: "#EBEBE6" },
                  ]}
                >
                  <Txt style={styles.tabCountText}>{summary.total}</Txt>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={shared.pad}>
          {event.demo && (
            <View style={styles.demoNote}>
              <Icon name="flask-outline" size={16} color="#76619B" />
              <Txt style={styles.demoText}>
                Örnek davet · Değişiklikler yalnızca bu cihazda.
              </Txt>
            </View>
          )}
          {!!error && <Notice message={error} />}
          {!!feedback && (
            <Pressable
              onPress={() => setFeedback("")}
              accessibilityRole="button"
              accessibilityLabel={`${feedback} Bildirimi kapat`}
              style={styles.feedback}
            >
              <Icon name="checkmark-circle" size={18} color={C.green} />
              <Txt style={styles.feedbackText}>{feedback}</Txt>
              <Icon name="close" size={16} color={C.green} />
            </Pressable>
          )}

          {section === "tools" && <PlanTools event={event} />}
          {section === "invite" && (
            <>
              <ShareKit event={event} />
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <View
                    style={[styles.detailIcon, { backgroundColor: "#EEF5DA" }]}
                  >
                    <Icon name="calendar-outline" size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt style={styles.detailTitle}>
                      {dateText(event.date, {
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                      })}
                    </Txt>
                    <Txt style={styles.detailSub}>
                      Saat {event.time} · {event.date.slice(0, 4)}
                    </Txt>
                  </View>
                </View>
                <View style={styles.detailLine} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${event.venue}, yol tarifini aç`}
                  onPress={openMap}
                  style={styles.detailRow}
                >
                  <View
                    style={[styles.detailIcon, { backgroundColor: "#EEE6FA" }]}
                  >
                    <Icon name="location-outline" size={23} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt style={styles.detailTitle}>
                      {event.venue || "Buluşma yeri"}
                    </Txt>
                    <Txt style={styles.detailSub}>
                      {event.address || "Haritada görüntüle"}
                    </Txt>
                  </View>
                  <Icon name="arrow-forward" size={18} color={C.muted} />
                </Pressable>
              </View>

              <View style={styles.description}>
                <Txt style={shared.eyebrow}>BU PLANIN HİKÂYESİ</Txt>
                <Txt style={styles.descriptionText}>
                  {event.description ||
                    "Güzel bir buluşma için her şey hazır. Sen de aramızda ol."}
                </Txt>
              </View>

              <View style={styles.attendingStrip}>
                <View style={styles.stackedPeople}>
                  {event.guests
                    .filter((g) => g.status === "going")
                    .slice(0, 3)
                    .map((guest, index) => (
                      <View
                        key={guest.id}
                        style={[
                          styles.personCircle,
                          {
                            backgroundColor: [C.lime, C.purple, "#FFD8BE"][
                              index
                            ],
                            marginLeft: index ? -10 : 0,
                          },
                        ]}
                      >
                        <Txt style={styles.personInitial}>
                          {guest.name.charAt(0).toLocaleUpperCase("tr")}
                        </Txt>
                      </View>
                    ))}
                  {summary.going === 0 && (
                    <View
                      style={[styles.personCircle, { backgroundColor: C.soft }]}
                    >
                      <Icon name="people-outline" size={20} />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Txt style={styles.attendingTitle}>
                    {summary.people > 0
                      ? `${summary.people} kişi geliyor`
                      : "Güzel bir kalabalık bekliyoruz."}
                  </Txt>
                  <Txt style={styles.attendingSub}>
                    {summary.pending > 0
                      ? `${summary.pending} davetin yanıtı bekleniyor.`
                      : summary.total
                        ? "Bütün davetlerin yanıtı geldi."
                        : "İlk davetlini ekleyerek başla."}
                  </Txt>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Davetlileri gör"
                  onPress={() => setSection("guests")}
                  style={styles.smallArrow}
                >
                  <Icon name="chevron-forward" size={18} />
                </Pressable>
              </View>

              {event.demo ? (
                <View style={styles.shareBlock}>
                  <Button
                    tone="lime"
                    icon="add"
                    onPress={() =>
                      router.push({
                        pathname: "/create",
                        params: { cover: event.coverId },
                      })
                    }
                  >
                    Kendi davetini oluştur
                  </Button>
                  <Txt style={styles.shareNote}>
                    Bu örnek davet paylaşılmaz. Kendi planını oluşturup
                    sevdiklerine gönder.
                  </Txt>
                </View>
              ) : (
                <View style={styles.shareBlock}>
                  {publicLink ? (
                    <>
                      <View style={styles.shareRow}>
                        <Button
                          tone="lime"
                          icon="share-social-outline"
                          onPress={() => shareLink(publicLink)}
                          style={{ flex: 1 }}
                        >
                          Davetini paylaş
                        </Button>
                        <IconButton
                          label="Davet bağlantısını kopyala"
                          name="copy-outline"
                          onPress={() => copyLink(publicLink)}
                          style={styles.copyMain}
                        />
                      </View>
                      <Txt style={styles.shareNote}>
                        Davetlilerin uygulama indirmeden katılım bildirebilir.
                      </Txt>
                    </>
                  ) : (
                    <Notice message="Davet bağlantısı henüz alınamadı. Yanıtları yenileyerek tekrar deneyebilirsin." />
                  )}
                </View>
              )}
            </>
          )}

          {section === "guests" && (
            <>
              <View
                style={[shared.between, { marginTop: 4, marginBottom: 16 }]}
              >
                <View>
                  <Heading style={styles.sectionTitle}>Kimler geliyor?</Heading>
                  <Txt style={styles.sectionSub}>
                    {summary.total} davet · {summary.people} kişi katılacak
                  </Txt>
                </View>
                {!event.demo &&
                  (refreshing ? (
                    <ActivityIndicator style={{ width: 44 }} color={C.ink} />
                  ) : (
                    <IconButton
                      name="refresh-outline"
                      label="Yanıtları yenile"
                      onPress={reload}
                    />
                  ))}
              </View>
              <Button
                tone="lime"
                icon="person-add-outline"
                onPress={() => openGuest()}
              >
                Davetli ekle
              </Button>
              {summary.total > 0 && (
                <>
                  <View style={{ marginTop: 22 }}>
                    <Field
                      label="Davetli ara"
                      value={search}
                      onChangeText={setSearch}
                      placeholder="İsim veya aile adı"
                      autoCorrect={false}
                      returnKeyType="search"
                      clearButtonMode="while-editing"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.filterRow}
                  >
                    <Pill
                      label={`Tümü ${summary.total}`}
                      active={filter === "all"}
                      onPress={() => setFilter("all")}
                    />
                    {statuses.map((status) => (
                      <Pill
                        key={status}
                        label={`${statusLabels[status]} ${distribution[status]}`}
                        active={filter === status}
                        onPress={() => setFilter(status)}
                      />
                    ))}
                  </ScrollView>
                </>
              )}
              {guests.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyPeople}>
                    <Icon
                      name={summary.total ? "search-outline" : "people-outline"}
                      size={30}
                    />
                  </View>
                  <Heading style={styles.emptyTitle}>
                    {summary.total
                      ? "Burada kimse görünmüyor."
                      : "İlk davet senden."}
                  </Heading>
                  <Txt style={styles.emptyCopy}>
                    {summary.total
                      ? "Başka bir isim veya katılım durumu deneyebilirsin."
                      : "Bir kişinin ya da ailenin adını ekle. Kişiye özel daveti hemen hazırlayalım."}
                  </Txt>
                  {summary.total > 0 && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setSearch("");
                        setFilter("all");
                      }}
                      style={styles.backText}
                    >
                      <Txt style={{ fontFamily: F.bold }}>
                        Filtreleri temizle
                      </Txt>
                    </Pressable>
                  )}
                </View>
              )}
              <View style={styles.guestList}>
                {guests.map((guest) => (
                  <View key={guest.id} style={styles.guestCard}>
                    <View style={styles.guestTop}>
                      <View style={styles.guestAvatar}>
                        <Txt style={styles.guestInitial}>
                          {guest.name.charAt(0).toLocaleUpperCase("tr")}
                        </Txt>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Txt style={styles.guestName}>{guest.name}</Txt>
                        <View style={styles.guestMeta}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: statusColors[guest.status] },
                            ]}
                          />
                          <Txt
                            style={[
                              styles.guestStatus,
                              { color: statusColors[guest.status] },
                            ]}
                          >
                            {statusLabels[guest.status]}
                            {guest.status === "going"
                              ? ` · ${guest.count} kişi`
                              : ""}
                          </Txt>
                        </View>
                      </View>
                      <IconButton
                        name="create-outline"
                        label={`${guest.name} için katılımı düzenle`}
                        onPress={() => openGuest(guest)}
                        style={{ backgroundColor: C.soft }}
                      />
                    </View>
                    {!!guest.note && (
                      <Txt style={styles.guestNote}>“{guest.note}”</Txt>
                    )}
                    {!event.demo && guest.rsvpUrl && (
                      <View style={styles.guestActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${guest.name} kişisel davetini paylaş`}
                          onPress={() => shareLink(guest.rsvpUrl!, guest)}
                          style={styles.guestAction}
                        >
                          <Icon name="share-social-outline" size={16} />
                          <Txt style={styles.guestActionText}>
                            Daveti paylaş
                          </Txt>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${guest.name} kişisel bağlantısını kopyala`}
                          onPress={() => copyLink(guest.rsvpUrl!, true)}
                          style={styles.guestAction}
                        >
                          <Icon name="copy-outline" size={16} />
                          <Txt style={styles.guestActionText}>Bağlantı</Txt>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {section === "summary" && (
            <>
              <View
                style={[shared.between, { marginTop: 5, marginBottom: 21 }]}
              >
                <Heading style={styles.sectionTitle}>
                  Bir bakışta planın.
                </Heading>
                {!event.demo &&
                  (refreshing ? (
                    <ActivityIndicator color={C.ink} />
                  ) : (
                    <IconButton
                      name="refresh-outline"
                      label="Katılım özetini yenile"
                      onPress={reload}
                    />
                  ))}
              </View>
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: C.lime }]}>
                  <Icon name="people-outline" size={23} />
                  <Txt style={styles.statValue}>{summary.people}</Txt>
                  <Txt style={styles.statLabel}>Gelecek kişi</Txt>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#E8DFFA" }]}>
                  <Icon name="chatbubble-ellipses-outline" size={22} />
                  <Txt style={styles.statValue}>
                    {summary.total ? `%${summary.percent}` : "—"}
                  </Txt>
                  <Txt style={styles.statLabel}>Yanıt oranı</Txt>
                </View>
              </View>
              <View style={styles.chartCard}>
                <View style={shared.between}>
                  <Txt style={styles.chartTitle}>Davetlerin durumu</Txt>
                  <Txt style={styles.chartTotal}>{summary.total} davet</Txt>
                </View>
                {summary.total > 0 ? (
                  <View
                    accessibilityRole="image"
                    accessibilityLabel={statuses
                      .map(
                        (status) =>
                          `${statusLabels[status]} ${distribution[status]} davet`,
                      )
                      .join(", ")}
                    style={styles.statusBar}
                  >
                    {statuses
                      .filter((status) => distribution[status] > 0)
                      .map((status) => (
                        <View
                          key={status}
                          style={{
                            width: `${(distribution[status] / summary.total) * 100}%`,
                            backgroundColor: statusColors[status],
                            height: 14,
                          }}
                        />
                      ))}
                  </View>
                ) : (
                  <Txt style={styles.chartEmpty}>
                    İlk davetlini eklediğinde yanıt dağılımı burada görünecek.
                  </Txt>
                )}
                {statuses.map((status) => (
                  <View style={styles.legendRow} key={status}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColors[status] },
                      ]}
                    />
                    <Txt style={styles.legendLabel}>{statusLabels[status]}</Txt>
                    <Txt style={styles.legendValue}>
                      {distribution[status]}
                      <Txt style={styles.legendUnit}> davet</Txt>
                    </Txt>
                  </View>
                ))}
                <Txt style={styles.chartNote}>
                  Bir davet, bir kişiyi veya bir aileyi temsil edebilir. “Belki”
                  yanıtları gelecek kişi sayısına dahil edilmez.
                </Txt>
              </View>
              {!!capacity && (
                <View style={styles.capacityCard}>
                  <View style={shared.between}>
                    <Txt style={styles.chartTitle}>Yerimizi ayarlayalım.</Txt>
                    <Icon name="restaurant-outline" size={22} />
                  </View>
                  <View style={styles.capacityNumbers}>
                    <Txt style={styles.capacityValue}>
                      {summary.people}
                      <Txt style={styles.capacityDenominator}>
                        {" "}
                        / {capacity}
                      </Txt>
                    </Txt>
                    <Txt style={styles.capacityLabel}>kişi</Txt>
                  </View>
                  <View style={styles.capacityTrack}>
                    <View
                      style={[
                        styles.capacityFill,
                        {
                          width: `${Math.min(100, (summary.people / capacity) * 100)}%`,
                          backgroundColor:
                            summary.people > capacity ? C.orange : C.ink,
                        },
                      ]}
                    />
                  </View>
                  <Txt style={styles.chartNote}>
                    {summary.people > capacity
                      ? `Planladığın kişi sayısı ${summary.people - capacity} kişi aşıldı. Mekân ve hazırlıkları buna göre gözden geçirebilirsin.`
                      : `${capacity} kişilik planına göre ${capacity - summary.people} kişilik yer var. Bu sayı, katılımı kesinleşen kişilere göre hesaplanır.`}
                  </Txt>
                </View>
              )}
              <Button
                onPress={() => setSection("guests")}
                tone="white"
                icon="people-outline"
                style={{ marginTop: 18 }}
              >
                Davetlileri gör
              </Button>
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={closeGuest}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeGuest}
            accessibilityRole="button"
            accessibilityLabel="Davetli penceresini kapat"
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 22) },
            ]}
          >
            <View style={[shared.between, { marginBottom: 18 }]}>
              <Heading style={styles.modalTitle}>
                {editing ? "Davetliyi düzenle." : "Birini daha çağıralım."}
              </Heading>
              <IconButton
                name="close"
                label="Kapat"
                onPress={closeGuest}
                style={{ backgroundColor: C.soft }}
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Notice message={formError} />
              <Field
                label="Ad soyad veya aile adı"
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Örn. Deniz ve ailesi"
                maxLength={80}
                autoCapitalize="words"
                autoFocus={!editing}
                returnKeyType={editing ? "done" : "go"}
                onSubmitEditing={editing ? Keyboard.dismiss : saveGuest}
                editable={!saving}
              />
              {editing ? (
                <>
                  <Txt style={styles.formLabel}>Katılım durumu</Txt>
                  <View style={styles.statusChoices}>
                    {statuses.map((status) => (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{
                          checked: guestStatus === status,
                          disabled: saving,
                        }}
                        disabled={saving}
                        key={status}
                        onPress={() => {
                          setGuestStatus(status);
                          Keyboard.dismiss();
                        }}
                        style={[
                          styles.statusChoice,
                          guestStatus === status && {
                            borderColor: statusColors[status],
                            backgroundColor: `${statusColors[status]}12`,
                          },
                        ]}
                      >
                        <Icon
                          name={statusIcons[status]}
                          size={20}
                          color={
                            guestStatus === status
                              ? statusColors[status]
                              : C.muted
                          }
                        />
                        <Txt
                          style={[
                            styles.statusChoiceText,
                            guestStatus === status && {
                              color: statusColors[status],
                            },
                          ]}
                        >
                          {statusLabels[status]}
                        </Txt>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.stepperRow}>
                    <View style={{ flex: 1 }}>
                      <Txt style={styles.stepperTitle}>Kişi sayısı</Txt>
                      <Txt style={styles.stepperHint}>
                        {guestStatus === "going"
                          ? "Kendisi dahil toplam"
                          : "Katılırsa, kendisi dahil toplam"}
                      </Txt>
                    </View>
                    <View style={styles.stepper}>
                      <Pressable
                        disabled={guestCount <= 1 || saving}
                        accessibilityRole="button"
                        accessibilityLabel="Kişi sayısını azalt"
                        accessibilityState={{
                          disabled: guestCount <= 1 || saving,
                        }}
                        onPress={() => setGuestCount((n) => Math.max(1, n - 1))}
                        style={[
                          styles.stepperButton,
                          (guestCount <= 1 || saving) && { opacity: 0.3 },
                        ]}
                      >
                        <Icon name="remove" size={20} />
                      </Pressable>
                      <Txt
                        accessibilityLiveRegion="polite"
                        style={styles.stepperValue}
                      >
                        {guestCount}
                      </Txt>
                      <Pressable
                        disabled={guestCount >= 20 || saving}
                        accessibilityRole="button"
                        accessibilityLabel="Kişi sayısını artır"
                        accessibilityState={{
                          disabled: guestCount >= 20 || saving,
                        }}
                        onPress={() =>
                          setGuestCount((n) => Math.min(20, n + 1))
                        }
                        style={[
                          styles.stepperButton,
                          (guestCount >= 20 || saving) && { opacity: 0.3 },
                        ]}
                      >
                        <Icon name="add" size={20} />
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : (
                <Txt style={styles.addHint}>
                  {event.demo
                    ? "Bu örneğe eklediğin davetli yalnızca cihazında saklanır."
                    : "Telefon numarası gerekmez. Ekledikten sonra kişiye özel bağlantısını paylaşabilirsin."}
                </Txt>
              )}
              <Button
                onPress={saveGuest}
                loading={saving}
                disabled={!guestName.trim()}
                tone="lime"
                icon={editing ? "checkmark" : "person-add-outline"}
              >
                {editing ? "Değişiklikleri kaydet" : "Davetli ekle"}
              </Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: "center", alignItems: "center", padding: 28 },
  loadingText: { color: C.muted, marginTop: 16, fontSize: 13 },
  notFoundCopy: {
    color: C.muted,
    textAlign: "center",
    marginVertical: 22,
    lineHeight: 23,
  },
  backText: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 8,
  },
  hero: { width: "100%", height: 418, justifyContent: "space-between" },
  heroButton: { backgroundColor: "#FFFFFFEA" },
  editButton: {
    backgroundColor: "#22222B80",
    minHeight: 44,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  editButtonText: { color: C.white, fontSize: 12, fontFamily: F.bold },
  heroBottom: { paddingHorizontal: 25, paddingBottom: 29 },
  categoryBadge: {
    backgroundColor: C.lime,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 13,
  },
  categoryText: { fontFamily: F.bold, fontSize: 10 },
  heroTitle: {
    fontFamily: F.bold,
    fontSize: 35,
    lineHeight: 41,
    letterSpacing: -1.4,
    color: C.white,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
  },
  hostAvatar: {
    backgroundColor: C.purple,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  hostInitial: { fontFamily: F.bold, fontSize: 11 },
  hostText: { color: "#E1DFE4", fontSize: 12, flex: 1 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 22,
    marginTop: 20,
    marginBottom: 22,
    padding: 4,
    borderRadius: 17,
    backgroundColor: C.soft,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
    flexDirection: "row",
    gap: 5,
  },
  activeTab: { backgroundColor: C.white },
  tabText: { fontSize: 12, color: C.muted, fontFamily: F.bold },
  activeTabText: { color: C.ink },
  tabCount: { borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 },
  tabCountText: { fontSize: 9, fontFamily: F.bold },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 12,
    backgroundColor: "#EEE8F8",
    borderRadius: 12,
    marginBottom: 18,
  },
  demoText: { fontSize: 10, lineHeight: 16, color: "#76619B", flex: 1 },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 13,
    minHeight: 44,
    backgroundColor: "#EAF3E8",
    borderRadius: 13,
    marginBottom: 16,
  },
  feedbackText: { flex: 1, fontSize: 12, color: C.green, lineHeight: 19 },
  detailsCard: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 22,
    backgroundColor: C.white,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 18,
    minHeight: 82,
  },
  detailIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  detailTitle: { fontSize: 14, fontFamily: F.bold, lineHeight: 21 },
  detailSub: { fontSize: 11, lineHeight: 18, color: C.muted, marginTop: 4 },
  detailLine: { height: 1, backgroundColor: C.line, marginLeft: 57 },
  description: { paddingTop: 29, paddingBottom: 25 },
  descriptionText: {
    lineHeight: 25,
    fontSize: 14,
    color: "#54545D",
    marginTop: 12,
  },
  attendingStrip: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.line,
    paddingVertical: 21,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  stackedPeople: { flexDirection: "row" },
  personCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.bg,
  },
  personInitial: { fontFamily: F.bold, fontSize: 10 },
  attendingTitle: { fontFamily: F.bold, fontSize: 12, lineHeight: 18 },
  attendingSub: { fontSize: 10, lineHeight: 17, color: C.muted, marginTop: 3 },
  smallArrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  shareBlock: { marginTop: 24 },
  shareRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  copyMain: {
    height: 54,
    width: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
  },
  shareNote: {
    textAlign: "center",
    fontSize: 11,
    color: C.muted,
    marginTop: 12,
    lineHeight: 18,
  },
  sectionTitle: { fontSize: 24, lineHeight: 31, letterSpacing: -0.8 },
  sectionSub: { color: C.muted, fontSize: 11, marginTop: 5 },
  filterRow: { gap: 7, paddingBottom: 20 },
  emptyState: { paddingVertical: 32, alignItems: "center" },
  emptyPeople: {
    width: 68,
    height: 68,
    backgroundColor: "#E8DFFA",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 19,
    transform: [{ rotate: "-7deg" }],
  },
  emptyTitle: { textAlign: "center", fontSize: 21, lineHeight: 28 },
  emptyCopy: {
    color: C.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 275,
  },
  guestList: { gap: 11 },
  guestCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: C.line,
  },
  guestTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.soft,
  },
  guestInitial: { fontFamily: F.bold, fontSize: 15 },
  guestName: { fontFamily: F.bold, fontSize: 13, lineHeight: 20 },
  guestMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  guestStatus: { fontSize: 10 },
  guestNote: {
    fontSize: 11,
    lineHeight: 19,
    color: C.muted,
    marginTop: 12,
    paddingLeft: 2,
  },
  guestActions: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: C.line,
    marginTop: 11,
    paddingTop: 4,
  },
  guestAction: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
  },
  guestActionText: { fontSize: 11, fontFamily: F.bold },
  statsRow: { flexDirection: "row", gap: 13, marginBottom: 17 },
  statCard: { flex: 1, borderRadius: 23, padding: 20 },
  statValue: {
    fontFamily: F.bold,
    fontSize: 42,
    lineHeight: 49,
    marginTop: 16,
    letterSpacing: -1.7,
  },
  statLabel: { fontFamily: F.bold, fontSize: 11, marginTop: 5 },
  chartCard: {
    backgroundColor: C.white,
    borderRadius: 23,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  chartTitle: { fontFamily: F.bold, fontSize: 14 },
  chartTotal: { fontSize: 11, color: C.muted },
  statusBar: {
    flexDirection: "row",
    borderRadius: 9,
    height: 14,
    overflow: "hidden",
    marginTop: 23,
    marginBottom: 13,
  },
  chartEmpty: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
  },
  legendLabel: { flex: 1, fontSize: 12, color: C.muted },
  legendValue: { fontFamily: F.bold, fontSize: 14 },
  legendUnit: { fontFamily: F.regular, color: C.muted, fontSize: 10 },
  chartNote: { color: C.muted, fontSize: 11, lineHeight: 19, marginTop: 15 },
  capacityCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 23,
    padding: 20,
    marginTop: 17,
  },
  capacityNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
    marginTop: 20,
  },
  capacityValue: { fontSize: 33, fontFamily: F.bold, letterSpacing: -1 },
  capacityDenominator: { fontSize: 21, color: C.muted },
  capacityLabel: { fontSize: 12, color: C.muted },
  capacityTrack: {
    backgroundColor: C.soft,
    borderRadius: 4,
    height: 7,
    overflow: "hidden",
    marginTop: 15,
  },
  capacityFill: { height: 7, borderRadius: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#15151E80",
    justifyContent: "flex-end",
  },
  modalSheet: {
    paddingTop: 22,
    paddingHorizontal: 23,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: C.bg,
    maxHeight: "88%",
    width: "100%",
    maxWidth: Platform.OS === "web" ? 460 : undefined,
    alignSelf: "center",
  },
  modalTitle: { flex: 1, marginRight: 7, fontSize: 23, lineHeight: 30 },
  formLabel: {
    color: C.muted,
    fontSize: 13,
    fontFamily: F.bold,
    marginBottom: 10,
  },
  statusChoices: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  statusChoice: {
    width: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: C.white,
  },
  statusChoiceText: { fontSize: 12, fontFamily: F.bold, color: C.muted },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 24,
  },
  stepperTitle: { fontFamily: F.bold, fontSize: 13 },
  stepperHint: { fontSize: 10, color: C.muted, marginTop: 5, lineHeight: 16 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 2,
  },
  stepperButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    fontFamily: F.bold,
    fontSize: 18,
    minWidth: 27,
    textAlign: "center",
  },
  addHint: { color: C.muted, fontSize: 12, lineHeight: 21, marginBottom: 22 },
});
