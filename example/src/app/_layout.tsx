import { RootHeaderActions } from "@/components/header";
import { initWasmAsync } from "@kuzulabz/react-native-nitro-vibrato";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { Appearance, Platform } from "react-native";

export default function RootLayout() {
    useEffect(() => {
        if (Platform.OS === 'web') {
            initWasmAsync();
        } else {
            Appearance.setColorScheme('dark');
        }
    },[]);
  return <ThemeProvider value={DarkTheme}><Stack screenOptions={{title: 'Nitro Vibrato 🫨', headerRight: () => <RootHeaderActions />}}/></ThemeProvider>;
}
