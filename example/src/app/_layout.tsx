import { RootHeaderActions } from "@/components/header";
import { initWasmAsync } from "@kuzulabz/react-native-nitro-vibrato";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { useEffect, useState } from "react";
import { Appearance, Platform } from "react-native";

export default function RootLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const initializeWasm = async () => {
            await initWasmAsync();
            setReady(true);
        };

        Platform.OS !== 'web' && Appearance.setColorScheme('dark');
        initializeWasm();
    }, []);

    if (!ready) {
        return null;
    }
    
    return (
        <ThemeProvider value={DarkTheme}>
            <Stack screenOptions={{ title: 'Nitro Vibrato 🫨', headerRight: () => <RootHeaderActions /> }} />
        </ThemeProvider>
    );
}
