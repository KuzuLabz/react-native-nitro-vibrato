import { TextInput as ExpoTextInput, ObservableState } from '@expo/ui';

type TextInputProps = {
    value: ObservableState<string>;
    onChangeText: (txt: string) => void;
};

export const TextInput = ({ value, onChangeText }: TextInputProps) => {
    return(
        <ExpoTextInput value={value} onChangeText={onChangeText} multiline style={{ backgroundColor: '#2b2b2b', padding: 12, borderRadius: 6}} textStyle={{fontSize: 16}} />
    );
}