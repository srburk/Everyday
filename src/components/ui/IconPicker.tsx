import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HabitIcons } from "../../constants/icons";
import { Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";

interface IconPickerProps {
  selectedIcon: string | null;
  color: string;
  onChange: (icon: string | null) => void;
}

export function IconPicker({ selectedIcon, color, onChange }: IconPickerProps) {
  const haptics = useHaptics();

  const handleSelect = (icon: string) => {
    haptics.selection();
    // If already selected, deselect (toggle off)
    if (selectedIcon === icon) {
      onChange(null);
    } else {
      onChange(icon);
    }
  };

  return (
    <View style={styles.container}>
      {HabitIcons.map((icon) => {
        const isSelected = selectedIcon === icon;
        return (
          <Pressable
            key={icon}
            style={[
              styles.iconButton,
              isSelected && { backgroundColor: color },
            ]}
            onPress={() => handleSelect(icon)}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={isSelected ? Colors.background : Colors.secondaryLabel}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondaryBackground,
  },
});
