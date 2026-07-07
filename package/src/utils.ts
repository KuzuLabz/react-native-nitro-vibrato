import { NitroModules } from "react-native-nitro-modules";
import type { TextdictPaths } from "./types";

export interface TextdictFiles {
    lex: Uint8Array;
    matrix: Uint8Array;
    char: Uint8Array;
    unk: Uint8Array;
}

export const getTextDictBytes = async (files: TextdictPaths): Promise<TextdictFiles | null> => {
    const getUint8Array = async (path: string) => {
        const response = await fetch(path);
        return new Uint8Array(await response.arrayBuffer());
    };
    return {
        char: await getUint8Array(files.char),
        lex: await getUint8Array(files.lex),
        matrix: await getUint8Array(files.matrix),
        unk: await getUint8Array(files.unk)
    }
}

export const processUserDict = async (userDict?: string | Uint8Array<ArrayBufferLike>) => {
    if (!userDict) {
        return undefined;
    }

    if (userDict instanceof Uint8Array) {
        return userDict;
    } else {
        const response = await fetch(userDict);
        const buf = await response.arrayBuffer();
        return new Uint8Array(buf);
    }
};

