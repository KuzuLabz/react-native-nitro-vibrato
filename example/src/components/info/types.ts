import { Token } from "@kuzulabz/react-native-nitro-vibrato";

export type InfoSheetProps = {
    selectedToken: Token | null;
    onDismiss: () => void;
};