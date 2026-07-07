import { BottomSheet, Button, Column, Text } from "@expo/ui";
import { InfoSheetProps } from "./types";

export const InfoSheet = (props: InfoSheetProps) => {
    const reading = props.selectedToken?.features.at(-1);
    const readingText = (props.selectedToken?.surface !== reading) && reading !== '*' ? `【${props.selectedToken?.features.at(-1)}】` : '';

    return(
        <BottomSheet isPresented={!!props.selectedToken} onDismiss={() => props.onDismiss()}>
            <Column spacing={12} style={{paddingBottom: 16}}>
                <Text textStyle={{ fontSize: 20, fontWeight: '700' }}>{`${props.selectedToken?.surface} ${readingText}`}</Text>
                <Text>{`Features: ${props.selectedToken?.features?.join(', ')}`}</Text>
                <Text>{`Lex Type: ${props.selectedToken?.lexType}`}</Text>
                <Text>{`Word Cost: ${props.selectedToken?.wordCost}`}</Text>
                <Text>{`Total Cost: ${props.selectedToken?.totalCost.toString()}`}</Text>
                <Text>{`Word ID: ${props.selectedToken?.wordId.toString()}`}</Text>
                <Text>{`Left / Right ID: ${props.selectedToken?.leftId.toString()} <--> ${props.selectedToken?.rightId.toString()}`}</Text>
            </Column>
        </BottomSheet>
    );
};