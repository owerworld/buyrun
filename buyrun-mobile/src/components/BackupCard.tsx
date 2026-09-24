import React, { useEffect, useState } from "react";
import { Share, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Button, Icon, Txt, shared } from "./ui";
import { C, F } from "../lib/theme";

const KEY = "buyrun.backup.v1";

/** Kendine gönderilen mesaj; geri getirirken mesajın tamamı yapıştırılabilir. */
export function backupMessage(title: string, token: string) {
  return (
    `Buyrun · "${title}" davetimin yönetim kodu: ${token}\n\n` +
    "Telefon değişirse: Buyrun uygulaması → Profil → Bir planını geri getir → bu mesajı yapıştır."
  );
}

/**
 * Davetler hesap olmadan bu cihazda durur. Telefon değişirse ya da uygulama
 * silinirse geri getirmenin tek yolu yönetim kodu. Kod saklanana kadar bu kart
 * davet sekmesinde görünür; saklandıktan sonra kaybolur.
 */
export function BackupCard({
  event,
}: {
  event: { id: string; title: string; manageToken?: string; demo?: boolean };
}) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (alive) setSaved(list.includes(event.id));
      })
      .catch(() => alive && setSaved(false));
    return () => {
      alive = false;
    };
  }, [event.id]);

  if (event.demo || !event.manageToken || saved !== false) return null;
  const token = event.manageToken;

  async function markSaved() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(event.id))
        await AsyncStorage.setItem(KEY, JSON.stringify([...list, event.id]));
    } catch {
      // Kaydedilemezse kart bir dahaki açılışta yine görünür; zararı yok
    }
    setSaved(true);
  }

  async function send() {
    setNote("");
    try {
      const r = await Share.share({ message: backupMessage(event.title, token) });
      if (r.action !== Share.dismissedAction) await markSaved();
    } catch {
      await copy();
    }
  }

  async function copy() {
    setNote("");
    try {
      if (!(await Clipboard.setStringAsync(backupMessage(event.title, token))))
        throw new Error("copy");
      setNote("Kopyalandı. Kendine WhatsApp'tan ya da notlarına yapıştır.");
      await markSaved();
    } catch {
      setNote("Kopyalanamadı. Profil sekmesinden kodu yeniden kopyalayabilirsin.");
    }
  }

  return (
    <View
      style={[
        shared.card,
        { backgroundColor: "#FFF6E0", borderColor: "#F1DDA6", gap: 12, marginBottom: 18 },
      ]}
      accessibilityRole="summary"
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
        <Icon name="shield-checkmark-outline" size={22} color="#8A6412" />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: F.bold, fontSize: 15 }}>
            Davetini güvenceye al
          </Txt>
          <Txt style={{ fontSize: 13, lineHeight: 20, color: C.muted, marginTop: 4 }}>
            Davetin bu telefonda duruyor. Telefonun değişirse ya da uygulamayı
            silersen geri getirmek için yönetim kodunu kendine gönder.
          </Txt>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Button tone="lime" icon="paper-plane-outline" onPress={send}>
          Kendime gönder
        </Button>
        <Button tone="white" icon="copy-outline" onPress={copy}>
          Kopyala
        </Button>
      </View>
      {!!note && (
        <Txt accessibilityLiveRegion="polite" style={{ fontSize: 12, color: C.green }}>
          {note}
        </Txt>
      )}
    </View>
  );
}
