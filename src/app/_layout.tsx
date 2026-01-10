import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initializeDatabase } from "../services/database";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="everyday.db" onInit={initializeDatabase}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerTransparent: true,
            headerBlurEffect: "systemMaterial",
            headerLargeTitleShadowVisible: false,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Habits",
              headerLargeTitle: true,
            }}
          />
          <Stack.Screen
            name="habit/[id]"
            options={{
              title: "",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
