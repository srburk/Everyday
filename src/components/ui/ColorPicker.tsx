import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HabitColors, Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onChange }: ColorPickerProps) {
  const haptics = useHaptics();

  const handleSelect = (color: string) => {
    haptics.selection();
    onChange(color);
  };

  return (
    <View style={styles.container}>
      {HabitColors.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <Pressable
            key={color}
            style={[styles.color, { backgroundColor: color }]}
            onPress={() => handleSelect(color)}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={20} color={Colors.background} />
            )}
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
  color: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
