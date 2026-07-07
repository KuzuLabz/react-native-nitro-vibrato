import { OutlinedTextField, Text, ObservableState } from '@expo/ui/jetpack-compose';
import { fillMaxWidth  } from '@expo/ui/jetpack-compose/modifiers';
import { TextInputProps } from './types';

export const TextInput = (props: TextInputProps) => {
    return(
        <OutlinedTextField value={props.value as ObservableState<string>} onValueChange={props.onChangeText} modifiers={[fillMaxWidth()]} keyboardOptions={{
            imeAction: 'done'
        }}>
            <OutlinedTextField.Label>
                <Text>Text</Text>
            </OutlinedTextField.Label>
        </OutlinedTextField>
    );
};