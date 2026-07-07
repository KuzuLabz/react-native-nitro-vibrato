import { ObservableState } from "@expo/ui";

export type TextInputProps = {
    value?: ObservableState<string>;
    onChangeText: (txt: string) => void;
};
