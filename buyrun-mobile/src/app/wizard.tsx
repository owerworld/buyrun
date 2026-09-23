import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Heading, Icon, IconButton, Txt, shared } from "../components/ui";
import { C, F, covers } from "../lib/theme";
import {
  askable,
  nextQuestion,
  planFromAnswers,
  progress,
  type Answers,
} from "../lib/wizard";
import { ANSWERS_KEY, DRAFT_KEY } from "../lib/wizardStore";

/**
 * Sihirbaz: ekran başına tek soru, tek dokunuş.
 *
 * Sonunda yazı yazdırmıyor; cevapları ve seçtiği kapağı taslağa yazıp tanıdık
 * oluşturma ekranına devrediyor. Davet metnini orada tek düğmeyle yazdırıyor.
 */
export default function Wizard() {
  const [answers, setAnswers] = useState<Answers>({});
  const question = nextQuestion(answers);
  const { done, total } = progress(answers);

  function geri() {
    const answered = askable(answers).filter((q) => answers[q.id]);
    const last = answered[answered.length - 1];
    if (!last) return router.back();
    setAnswers((a) => {
      const copy = { ...a };
      delete copy[last.id];
      return copy;
    });
  }

  async function sec(id: string, value: string) {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (nextQuestion(next)) return;

    // Sorular bitti: cevapları ve kapağı sakla, oluşturma ekranına geç
    const plan = planFromAnswers(next);
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
        }),
      );
    } catch {
      // Taslak yazılamazsa da akış devam etsin; oluşturma ekranı boş başlar
    }
    router.replace("/create");
  }

  if (!question) return null;

  return (
    <SafeAreaView style={shared.screen} edges={["top", "bottom"]}>
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
          <View
            style={{
              height: 5,
              borderRadius: 99,
              backgroundColor: C.ink,
              width: `${Math.round((done / total) * 100)}%`,
            }}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          shared.pad,
          { paddingTop: 22, paddingBottom: 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Heading>{question.title}</Heading>
        {!!question.lead && (
          <Txt style={{ color: C.muted, marginTop: 10 }}>{question.lead}</Txt>
        )}

        <View style={{ gap: 10, marginTop: 22 }}>
          {question.options.map((o) => (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              onPress={() => sec(question.id, o.id)}
              style={({ pressed }) => [
                shared.card,
                shared.between,
                {
                  paddingVertical: 16,
                  minHeight: 62,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Txt style={{ fontFamily: F.bold, fontSize: 16 }}>
                  {o.label}
                </Txt>
                {!!o.hint && (
                  <Txt style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>
                    {o.hint}
                  </Txt>
                )}
              </View>
              <Icon name="chevron-forward" size={19} color={C.muted} />
            </Pressable>
          ))}
        </View>

        {done > 0 && (
          <Txt
            style={{
              color: C.muted,
              fontSize: 13,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Kapağın şimdiden belli:{" "}
            {covers[planFromAnswers(answers).coverId].label}. Adı ve tarihi en
            sonda bir kerede alacağız.
          </Txt>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
