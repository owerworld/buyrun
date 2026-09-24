import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";
import {
  emptySocial,
  type SocialData,
  type SocialSettings,
} from "../lib/socialSchema";
import type { Party } from "../lib/model";
import { C, F } from "../lib/theme";
import { Button, Field, Heading, Icon, Notice, Txt, shared } from "./ui";
const fresh = (): SocialData => ({
  settings: emptySocial(),
  version: 0,
  totals: {},
  voters: 0,
  own: { votes: [], answers: {} },
});
const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export function PlanTools({ event }: { event: Party }) {
  const [data, setData] = useState<SocialData | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [question, setQuestion] = useState(""),
    [announcement, setAnnouncement] = useState(""),
    [pollTitle, setPollTitle] = useState("Ne zaman buluşalım?"),
    [options, setOptions] = useState(["", "", ""]),
    [tab, setTab] = useState<"poll" | "questions" | "updates" | "list">("poll");
  const [done, setDone] = useState<string[]>([]),
    [checkReady, setCheckReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const p = event.demo
      ? Promise.resolve(fresh())
      : api.social(event.manageToken || "");
    p.then((d) => {
      if (alive) setData(d);
    }).catch((e) => {
      if (alive) setError(e.message);
    });
    AsyncStorage.getItem("buyrun.checklist." + event.id)
      .then((v) => {
        if (v && alive) {
          const a = JSON.parse(v);
          if (Array.isArray(a)) setDone(a.filter((x) => typeof x === "string"));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setCheckReady(true);
      });
    return () => {
      alive = false;
    };
  }, [event.id, event.manageToken, event.demo]);
  async function save(settings: SocialSettings) {
    if (!data || busy) return false;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      setData(
        event.demo
          ? { ...data, settings, version: data.version + 1 }
          : await api.updateSocial(
              event.manageToken || "",
              settings,
              data.version,
            ),
      );
      setMessage(
        event.demo
          ? "Örnek plan bu ekranda güncellendi."
          : "Davet sayfası güncellendi.",
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    setError("");
    setBusy(true);
    try {
      setData(
        event.demo
          ? data || fresh()
          : await api.social(event.manageToken || ""),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const checklist = [
    "Davetiyeyi kişiselleştir",
    "Davet bağlantısını paylaş",
    "Katılım yanıtlarına göz at",
    "Mekân ve menüyü netleştir",
    "Son hatırlatmayı gönder",
  ];
  async function toggleCheck(item: string) {
    const next = done.includes(item)
      ? done.filter((x) => x !== item)
      : [...done, item];
    try {
      await AsyncStorage.setItem(
        "buyrun.checklist." + event.id,
        JSON.stringify(next),
      );
      setDone(next);
    } catch {
      setError("Hazırlık listesi kaydedilemedi.");
    }
  }
  return (
    <View style={{ gap: 16, paddingVertical: 22 }}>
      <View style={shared.between}>
        <Heading style={{ fontSize: 27 }}>Birlikte planlayalım.</Heading>
        <Pressable
          accessibilityLabel="Plan araçlarını yenile"
          accessibilityRole="button"
          onPress={reload}
          style={{ padding: 12 }}
        >
          <Icon name="refresh" size={20} />
        </Pressable>
      </View>
      <Txt style={{ color: C.muted, fontSize: 13, lineHeight: 21 }}>
        Bir tarih bul, küçük ayrıntıları sor, herkesi haberdar et.
      </Txt>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(
          [
            ["poll", "Oylama", "stats-chart-outline"],
            ["questions", "Sorular", "chatbubble-outline"],
            ["updates", "Duyurular", "megaphone-outline"],
            ["list", "Hazırlık", "checkbox-outline"],
          ] as const
        ).map(([id, label, icon]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            onPress={() => {
              setTab(id);
              setMessage("");
            }}
            style={{
              flexGrow: 1,
              borderRadius: 15,
              backgroundColor: tab === id ? C.ink : C.white,
              padding: 12,
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={icon} size={15} color={tab === id ? "white" : C.ink} />
            <Txt
              style={{
                color: tab === id ? "white" : C.ink,
                fontSize: 11,
                fontFamily: F.bold,
              }}
            >
              {label}
            </Txt>
          </Pressable>
        ))}
      </View>
      {!!error && <Notice message={error} />}
      {!!message && (
        <Txt
          accessibilityLiveRegion="polite"
          style={{ fontSize: 12, color: C.green }}
        >
          {message}
        </Txt>
      )}
      {!data && !error && <ActivityIndicator color={C.ink} />}
      {data && tab === "poll" && (
        <View style={[shared.card, { gap: 15 }]}>
          {data.settings.poll ? (
            <>
              <Txt style={{ fontFamily: F.serif, fontSize: 28 }}>
                {data.settings.poll.title}
              </Txt>
              <Txt style={{ fontSize: 12, color: C.muted }}>
                {data.voters} kişi oy verdi ·{" "}
                {data.settings.poll.closed
                  ? "Oylama tamamlandı"
                  : "Birden çok seçenek işaretlenebilir"}
              </Txt>
              {data.settings.poll.options.map((o) => (
                <View key={o.id} style={{ gap: 8 }}>
                  <View style={shared.between}>
                    <Txt style={{ fontSize: 13, flex: 1 }}>{o.label}</Txt>
                    <Txt style={{ fontFamily: F.bold, fontSize: 13 }}>
                      {data.totals[o.id] || 0}
                    </Txt>
                  </View>
                  <View
                    style={{
                      height: 9,
                      borderRadius: 6,
                      backgroundColor: C.soft,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: 9,
                        borderRadius: 6,
                        width: `${data.voters ? ((data.totals[o.id] || 0) / data.voters) * 100 : 0}%`,
                        backgroundColor: C.purple,
                      }}
                    />
                  </View>
                </View>
              ))}
              <Button
                loading={busy}
                tone="white"
                onPress={() =>
                  save({
                    ...data.settings,
                    poll: {
                      ...data.settings.poll!,
                      closed: !data.settings.poll!.closed,
                    },
                  })
                }
              >
                {data.settings.poll.closed
                  ? "Oylamayı yeniden aç"
                  : "Oylamayı bitir"}
              </Button>
              <Txt style={{ fontSize: 11, color: C.muted, lineHeight: 18 }}>
                Sonuçlar davet tarihini kendiliğinden değiştirmez. Karar
                verdiğinde davetiyeyi düzenleyebilirsin.
              </Txt>
            </>
          ) : (
            <>
              <View
                style={{
                  backgroundColor: "#ECE7F8",
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <Icon name="calendar-outline" size={28} color="#8062B1" />
                <Heading style={{ fontSize: 23, marginTop: 12 }}>
                  Herkese uyan bir gün.
                </Heading>
                <Txt
                  style={{
                    fontSize: 12,
                    lineHeight: 20,
                    color: C.muted,
                    marginTop: 6,
                  }}
                >
                  İki ya da üç alternatif ekle. Misafirler davet bağlantısından
                  oy versin.
                </Txt>
              </View>
              <Field
                label="OYLAYACAĞIMIZ ŞEY"
                value={pollTitle}
                onChangeText={setPollTitle}
                maxLength={140}
              />
              {options.map((v, i) => (
                <Field
                  key={i}
                  label={`${i + 1}. SEÇENEK${i === 2 ? " · İSTEĞE BAĞLI" : ""}`}
                  placeholder={
                    ["Cumartesi 18.00", "Pazar 14.00", "Başka bir zaman"][i]
                  }
                  value={v}
                  maxLength={100}
                  onChangeText={(t) =>
                    setOptions((a) => a.map((x, j) => (i === j ? t : x)))
                  }
                />
              ))}
              <Button
                loading={busy}
                tone="lime"
                onPress={() => {
                  const labels = options.map((x) => x.trim()).filter(Boolean);
                  if (
                    !pollTitle.trim() ||
                    labels.length < 2 ||
                    new Set(labels).size !== labels.length
                  ) {
                    setError(
                      "Başlık ve birbirinden farklı en az iki seçenek ekle.",
                    );
                    return;
                  }
                  save({
                    ...data.settings,
                    poll: {
                      id: newId(),
                      title: pollTitle.trim(),
                      closed: false,
                      options: labels.map((label) => ({ id: newId(), label })),
                    },
                  });
                }}
              >
                Oylamayı davete ekle
              </Button>
            </>
          )}
        </View>
      )}
      {data && tab === "questions" && (
        <View style={{ gap: 16 }}>
          <View style={[shared.card, { gap: 12 }]}>
            <Heading style={{ fontSize: 23 }}>Küçük ama önemli.</Heading>
            <Txt style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
              Alerjiler, şarkı önerileri, getireceklerimiz… En fazla üç soru.
              Yanıtları yalnızca sen görürsün.
            </Txt>
            {data.settings.questions.map((q) => (
              <View
                key={q.id}
                style={[shared.row, { gap: 10, paddingVertical: 8 }]}
              >
                <Icon name="chatbubble-ellipses-outline" size={18} />
                <Txt style={{ fontSize: 13, flex: 1 }}>{q.prompt}</Txt>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={q.prompt + " sorusunu kaldır"}
                  disabled={busy}
                  onPress={() =>
                    save({
                      ...data.settings,
                      questions: data.settings.questions.filter(
                        (x) => x.id !== q.id,
                      ),
                    })
                  }
                  style={{ padding: 12 }}
                >
                  <Icon name="close" size={18} />
                </Pressable>
              </View>
            ))}
            {data.settings.questions.length < 3 && (
              <>
                <Field
                  label="MİSAFİRLERİNE SOR"
                  placeholder="Beslenmeyle ilgili bilmem gereken bir şey var mı?"
                  value={question}
                  onChangeText={setQuestion}
                  maxLength={140}
                />
                <Button
                  loading={busy}
                  tone="white"
                  onPress={async () => {
                    if (!question.trim()) {
                      setError("Önce sorunu yaz.");
                      return;
                    }
                    if (
                      await save({
                        ...data.settings,
                        questions: [
                          ...data.settings.questions,
                          { id: newId(), prompt: question.trim() },
                        ],
                      })
                    )
                      setQuestion("");
                  }}
                >
                  Soruyu ekle
                </Button>
              </>
            )}
          </View>
          {data.responses
            ?.filter((r) => Object.values(r.answers).some(Boolean))
            .map((r, i) => (
              <View key={i} style={[shared.card, { gap: 10 }]}>
                <Txt style={{ fontFamily: F.bold }}>{r.name}</Txt>
                {data.settings.questions
                  .filter((q) => r.answers[q.id])
                  .map((q) => (
                    <View key={q.id}>
                      <Txt style={{ color: C.muted, fontSize: 11 }}>
                        {q.prompt}
                      </Txt>
                      <Txt style={{ fontSize: 13, marginTop: 5 }}>
                        {r.answers[q.id]}
                      </Txt>
                    </View>
                  ))}
              </View>
            ))}
        </View>
      )}
      {data && tab === "updates" && (
        <View style={{ gap: 16 }}>
          <View style={[shared.card, { gap: 12 }]}>
            <Heading style={{ fontSize: 23 }}>Haberimiz var.</Heading>
            <Txt style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>
              Duyurun davet sayfasında görünür. İstersen bağlantıyı WhatsApp’tan
              da paylaşabilirsin.
            </Txt>
            <Field
              label="YENİ DUYURU"
              value={announcement}
              onChangeText={setAnnouncement}
              multiline
              maxLength={600}
              placeholder="Buluşma yeri değişti, yeni adres…"
            />
            <Button
              tone="lime"
              loading={busy}
              onPress={async () => {
                if (!announcement.trim()) {
                  setError("Önce duyurunu yaz.");
                  return;
                }
                if (
                  await save({
                    ...data.settings,
                    announcements: [
                      {
                        id: newId(),
                        text: announcement.trim(),
                        at: new Date().toISOString(),
                      },
                      ...data.settings.announcements,
                    ].slice(0, 20),
                  })
                )
                  setAnnouncement("");
              }}
            >
              Davet sayfasına ekle
            </Button>
          </View>
          {data.settings.announcements.map((a) => (
            <View key={a.id} style={[shared.card, { gap: 10 }]}>
              <Txt style={{ color: C.muted, fontSize: 11 }}>
                {new Date(a.at).toLocaleDateString("tr-TR")}
              </Txt>
              <Txt style={{ fontSize: 14, lineHeight: 23 }}>{a.text}</Txt>
              <Button
                tone="white"
                loading={busy}
                onPress={() =>
                  save({
                    ...data.settings,
                    announcements: data.settings.announcements.filter(
                      (x) => x.id !== a.id,
                    ),
                  })
                }
              >
                Duyuruyu kaldır
              </Button>
            </View>
          ))}
        </View>
      )}
      {tab === "list" && (
        <View style={[shared.card, { gap: 12 }]}>
          <Heading style={{ fontSize: 23 }}>Aklın kalmasın.</Heading>
          <Txt style={{ color: C.muted, fontSize: 12 }}>
            {done.length} / {checklist.length} hazırlık tamamlandı · Bu cihazda
            saklanır.
          </Txt>
          <View style={{ height: 8, backgroundColor: C.soft, borderRadius: 5 }}>
            <View
              style={{
                height: 8,
                backgroundColor: C.lime,
                width: `${(done.length / checklist.length) * 100}%`,
                borderRadius: 5,
              }}
            />
          </View>
          {checklist.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done.includes(item) }}
              disabled={!checkReady}
              onPress={() => toggleCheck(item)}
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                paddingVertical: 13,
              }}
            >
              <Icon
                name={
                  done.includes(item) ? "checkmark-circle" : "ellipse-outline"
                }
                color={done.includes(item) ? C.green : C.muted}
              />
              <Txt
                style={{
                  flex: 1,
                  fontSize: 13,
                  textDecorationLine: done.includes(item)
                    ? "line-through"
                    : "none",
                  color: done.includes(item) ? C.muted : C.ink,
                }}
              >
                {item}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
