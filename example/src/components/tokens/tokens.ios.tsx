import { BottomSheet, Button, VStack, Text, HStack, RNHostView, ZStack, Rectangle, LazyHStack, ScrollView } from "@expo/ui/swift-ui";
import { TokensProps } from "./types";
import { useState } from "react";
import { Token } from "@kuzulabz/react-native-nitro-vibrato";
import { InfoSheet } from "../info/info";
import { Pressable, View } from "react-native";
import { background, buttonStyle, cornerRadius, foregroundStyle, frame, padding } from "@expo/ui/swift-ui/modifiers";

const TokenItem = ({label, onPress}: {label: string; onPress: () => void}) => {
    return(
        <Button label={label} onPress={onPress} modifiers={[buttonStyle('bordered')]} />
    );
};

export const Tokens = ({ tokens }: TokensProps) => {
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    
    return(
        <VStack alignment="center" modifiers={[padding({top: 12})]}>
            <ScrollView axes="horizontal" showsIndicators={false}>
                <LazyHStack spacing={12} alignment="top">
                    {tokens?.map((t, idx) => <TokenItem key={idx} label={t.surface} onPress={() => setSelectedToken(t)} />)}
                </LazyHStack>
            </ScrollView>
            <InfoSheet selectedToken={selectedToken} onDismiss={() => setSelectedToken(null)} />
        </VStack>
    );
};