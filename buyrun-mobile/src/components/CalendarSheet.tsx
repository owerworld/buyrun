import React, { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { C, F } from "../lib/theme";
import { Txt, IconButton, shared } from "./ui";
export function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function CalendarSheet({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const initial = value ? new Date(value + "T12:00:00") : new Date();
  const [month, setMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = localDate(new Date());
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0006",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Pressable
          accessibilityLabel="Takvimi kapat"
          onPress={onClose}
          style={{ flex: 1, width: "100%" }}
        />
        <View
          style={{
            width: "100%",
            maxWidth: 460,
            backgroundColor: C.bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 22,
            paddingBottom: 36,
          }}
        >
          <View style={[shared.between, { marginBottom: 24 }]}>
            <IconButton
              name="chevron-back"
              label="Önceki ay"
              onPress={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            />
            <Txt style={{ fontFamily: F.bold, fontSize: 18 }}>
              {month.toLocaleDateString("tr-TR", {
                month: "long",
                year: "numeric",
              })}
            </Txt>
            <IconButton
              name="chevron-forward"
              label="Sonraki ay"
              onPress={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"].map((d) => (
              <View
                key={d}
                style={{
                  width: "14.2857%",
                  alignItems: "center",
                  paddingBottom: 12,
                }}
              >
                <Txt style={{ fontSize: 12, color: C.muted }}>{d}</Txt>
              </View>
            ))}
            {Array.from(
              { length: Math.ceil((days + offset) / 7) * 7 },
              (_, i) => {
                const day = i - offset + 1;
                const real = day >= 1 && day <= days;
                const date = real
                  ? localDate(
                      new Date(month.getFullYear(), month.getMonth(), day),
                    )
                  : "";
                const disabled = !real || date < today;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={
                      real
                        ? new Date(date + "T12:00:00").toLocaleDateString(
                            "tr-TR",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : undefined
                    }
                    accessibilityState={{ disabled, selected: date === value }}
                    disabled={disabled}
                    onPress={() => {
                      onChange(date);
                      onClose();
                    }}
                    style={{
                      width: "14.2857%",
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          date === value ? C.lime : "transparent",
                      }}
                    >
                      <Txt
                        style={{
                          color: disabled ? "#C7C7C4" : C.ink,
                          fontFamily: date === value ? F.bold : F.regular,
                        }}
                      >
                        {real ? day : ""}
                      </Txt>
                    </View>
                  </Pressable>
                );
              },
            )}
          </View>
          <Pressable
            onPress={onClose}
            style={{ padding: 18, alignItems: "center" }}
          >
            <Txt style={{ color: C.muted }}>Vazgeç</Txt>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
