import { FlowRow, Text, SuggestionChip, FilterChip, AnimatedVisibility } from "@expo/ui/jetpack-compose";
import { TokensProps } from "./types";
import { InfoSheet } from "../info/info";
import { useState } from "react";
import { Token } from "@kuzulabz/react-native-nitro-vibrato";

export const Tokens = ({ tokens }: TokensProps) => {
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);

    return(
        <AnimatedVisibility visible={!!tokens}>
            <FlowRow horizontalArrangement={{spacedBy: 8}}>
                {tokens?.map((token, idx) => (
                    <SuggestionChip key={idx} onClick={() => setSelectedToken(token)}>
                        <SuggestionChip.Label>
                            <Text>{token.surface}</Text>
                        </SuggestionChip.Label>
                    </SuggestionChip>
                ))}
            </FlowRow>
            <InfoSheet selectedToken={selectedToken} onDismiss={() => setSelectedToken(null)} />
        </AnimatedVisibility>
    );
};