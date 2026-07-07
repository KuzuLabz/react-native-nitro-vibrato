import { BottomSheet, Button, Column, Row, Text } from "@expo/ui";
import { TokensProps } from "./types";
import { useState } from "react";
import { Token } from "@kuzulabz/react-native-nitro-vibrato";
import { InfoSheet } from "../info/info";
import { Pressable, View } from "react-native";

const TokenItem = ({label, onPress}: {label: string; onPress: () => void}) => {
    return(
        <Pressable onPress={onPress} style={{padding: 6, paddingHorizontal: 12, justifyContent: 'center', height: '100%', borderRadius: 12, borderWidth: 0.5, backgroundColor: '#00489a'}}>
            <Text>{label}</Text>
        </Pressable>
    );
};

export const Tokens = ({ tokens }: TokensProps) => {
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    
    return(
        <View style={{flex: 1, paddingVertical: 12}}>
            <Column alignment="center">
                <Row alignment="center" spacing={12}>
                    {tokens?.map((t, idx) => <TokenItem key={idx} label={t.surface} onPress={() => setSelectedToken(t)} />)}
                </Row>
            </Column>
            <InfoSheet selectedToken={selectedToken} onDismiss={() => setSelectedToken(null)} />
        </View>
    );
};