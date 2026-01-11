import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";
import type { AppSettings } from "../../models/settings";

interface SettingsSheetProps {
  visible: boolean;
  onDismiss: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => Promise<void>;
  onOpenArchivedHabits: () => void;
}

export function SettingsSheet({
  visible,
  onDismiss,
  settings,
  onUpdateSetting,
  onOpenArchivedHabits,
}: SettingsSheetProps) {
  const haptics = useHaptics();

  const handleAutoSortToggle = async (value: boolean) => {
    haptics.selection();
    await onUpdateSetting("autoSortCompleted", value);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Text style={styles.doneButton}>Done</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Sorting Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Display</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto-sort completed</Text>
                <Text style={styles.settingDescription}>
                  Move completed habits to the bottom of the list
                </Text>
              </View>
              <Switch
                value={settings.autoSortCompleted}
                onValueChange={handleAutoSortToggle}
                trackColor={{
                  false: Colors.secondaryBackground,
                  true: Colors.systemGreen,
                }}
              />
            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Data</Text>
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                haptics.selection();
                onOpenArchivedHabits();
              }}
            >
              <View style={styles.menuRowContent}>
                <View style={styles.menuRowIcon}>
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={Colors.systemRed}
                  />
                </View>
                <View style={styles.menuRowText}>
                  <Text style={styles.menuRowTitle}>Recently Deleted</Text>
                  <Text style={styles.menuRowDescription}>
                    Deleted habits are kept for {settings.deletionPolicyDays} days
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.tertiaryLabel}
              />
            </Pressable>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Everyday helps you build positive habits through daily tracking
              and streaks.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  headerSpacer: {
    width: 50,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.label,
  },
  doneButton: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.systemBlue,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.secondaryLabel,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 10,
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.label,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.secondaryLabel,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 10,
    padding: 16,
  },
  menuRowContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.tertiaryBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuRowText: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.label,
  },
  menuRowDescription: {
    fontSize: 13,
    color: Colors.secondaryLabel,
    marginTop: 2,
  },
  infoSection: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.tertiaryLabel,
    textAlign: "center",
    lineHeight: 18,
  },
});
