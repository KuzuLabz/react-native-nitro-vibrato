import { Platform, StyleSheet } from "react-native";
import { Vibrato, Token, MecabPreset, useVibratoInitialized } from '@kuzulabz/react-native-nitro-vibrato';
import { useCallback, useState } from "react";
import { Host, useNativeState, Column } from '@expo/ui';
import { getDictData } from "@/utils/zstd";
import { TextInput } from "@/components/textInput/input";
import { Controls } from "@/components/controls";
import { Tokens } from "@/components/tokens/tokens";
import { SOURCE_COLOR } from "@/constants";
// import { compileDict } from "@/utils/compile.native";

export default function Index() {
    const isInit = useVibratoInitialized();
    const [isLoading, setIsLoading] = useState(false);
    const [tokens, setTokens] = useState<Token[]>([]);
    const text = useNativeState('海賊王におれはなる!');

    const handleChangeText = useCallback(
        (value: string) => {
            'worklet';
            text.value =  value;
        },
        [text.value]
    );

    const onInit = async () => {
        try {
            setIsLoading(true);
            const zstDic = await getDictData('uri');
            await Vibrato.initialize(zstDic, undefined, MecabPreset);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
        
    };

    const onTokenize = async () => {
        const result = await Vibrato.tokenize(text.value);
        result && setTokens(result);
    };

    const onWakati = async () => {
        console.log(await Vibrato.wakati(text.value));
    };

    const onDestroy = () => {
        Vibrato.destroy();
        setTokens([]);
    };

    return (
        <Host seedColor={SOURCE_COLOR} colorScheme="dark" style={styles.container}>
            <Column spacing={8} alignment="center" style={{paddingTop: 12, paddingHorizontal: 12}}>
                <TextInput value={text} onChangeText={handleChangeText} />
                <Controls isInit={isInit} onInit={onInit} onTokenize={onTokenize} onWakati={onWakati} onDestroy={onDestroy} isLoading={isLoading} />
                {/* <Button label="Compile Dict" onPress={() => compileDict()} /> */}
                <Tokens tokens={tokens} />
            </Column>
        </Host>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: Platform.OS == 'web' ? 'center' : undefined,
        backgroundColor: '#303030',
    },
});
