import { initWasmAsync } from "@kuzulabz/react-native-nitro-vibrato";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
    useEffect(() => {
        if (Platform.OS === 'web') {
            initWasmAsync();
        }
    },[]);
  return <ThemeProvider value={DarkTheme}><Stack screenOptions={{title: 'Nitro Vibrato'}}/></ThemeProvider>;
}
