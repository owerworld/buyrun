import React, { useRef, useState } from "react";
import { Modal, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import QRCode from "react-native-qrcode-svg";
import { InvitationArt } from "./InvitationArt";
import { Button, Heading, IconButton, Notice, Txt, shared } from "./ui";
import { C, F } from "../lib/theme";
import type { Party } from "../lib/model";
const escapeICS = (v: string) =>
  v
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function ShareKit({ event }: { event: Party }) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const ref = useRef<View>(null),
    insets = useSafeAreaInsets();
  async function poster() {
    setBusy(true);
    setError("");
    try {
      if (Platform.OS === "web")
        throw new Error(
          "Görsel paylaşımı Android ve iPhone uygulamasında kullanılabilir.",
        );
      if (!(await Sharing.isAvailableAsync()))
        throw new Error("Bu cihazda paylaşım açılamıyor.");
      const uri = await captureRef(ref, {
        format: "png",
        quality: 1,
        width: 1080,
        result: "tmpfile",
      });
      try {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          UTI: "public.png",
          dialogTitle: "Davetiyeni paylaş",
        });
      } finally {
        try {
          new File(uri).delete();
        } catch {}
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function calendar() {
    setBusy(true);
    setError("");
    try {
      if (Platform.OS === "web")
        throw new Error("Takvime aktarma mobil uygulamada kullanılabilir.");
      if (!(await Sharing.isAvailableAsync()))
        throw new Error("Bu cihazda paylaşım açılamıyor.");
      const start = new Date(`${event.date}T${event.time}:00+03:00`),
        end = new Date(start.getTime() + 2 * 3600000),
        stamp = (d: Date) =>
          d
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Buyrun//TR",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${event.id}@buyrun.app`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        `LOCATION:${escapeICS([event.venue, event.address].filter(Boolean).join(", "))}`,
        `DESCRIPTION:${escapeICS(event.description + "\n" + (event.shareUrl || ""))}`,
        "END:VEVENT",
        "END:VCALENDAR",
        "",
      ];
      const file = new File(Paths.cache, "buyrun-" + event.id + ".ics");
      file.write(lines.join("\r\n"));
      try {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/calendar",
          UTI: "com.apple.ical.ics",
          dialogTitle: "Takvimine ekle",
        });
      } finally {
        file.delete();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 10, marginVertical: 18 }}>
      <Button
        tone="white"
        icon="image-outline"
        onPress={() => {
          setError("");
          setOpen(true);
        }}
      >
        Görsel & QR paylaş
      </Button>
      <Button
        tone="white"
        icon="calendar-outline"
        loading={busy && !open}
        onPress={calendar}
      >
        Takvim dosyasını paylaş
      </Button>
      {!open && !!error && <Notice message={error} />}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={[
            shared.screen,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={shared.header}>
            <Heading style={{ fontSize: 23 }}>Davetin cebinde.</Heading>
            <IconButton
              name="close"
              label="Paylaşım ekranını kapat"
              onPress={() => setOpen(false)}
            />
          </View>
          <ScrollView contentContainerStyle={{ padding: 22 }}>
            <View
              ref={ref}
              collapsable={false}
              style={{
                backgroundColor: C.white,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <InvitationArt event={event} height={430} />
              <View
                style={{
                  padding: 20,
                  flexDirection: "row",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                {!!event.shareUrl && !event.demo && (
                  <QRCode value={event.shareUrl} size={76} color={C.ink} />
                )}
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: F.bold, fontSize: 14 }}>
                    Sen de buyrun.
                  </Txt>
                  <Txt
                    style={{
                      fontSize: 11,
                      lineHeight: 18,
                      color: C.muted,
                      marginTop: 5,
                    }}
                  >
                    {event.demo
                      ? "Örnek davetiye"
                      : "Ayrıntılar ve katılım için QR kodu okut."}
                  </Txt>
                </View>
              </View>
            </View>
            <Txt
              style={{
                color: C.muted,
                fontSize: 12,
                lineHeight: 20,
                marginTop: 15,
              }}
            >
              WhatsApp, Instagram hikâyesi veya fotoğraf arşivin için. Misafir
              listesi ve yönetim bilgileri görsele eklenmez.
            </Txt>
            {!!error && <Notice message={error} />}
          </ScrollView>
          <View style={{ paddingHorizontal: 22 }}>
            <Button
              loading={busy}
              tone="lime"
              icon="share-outline"
              onPress={poster}
            >
              Görseli paylaş / kaydet
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
