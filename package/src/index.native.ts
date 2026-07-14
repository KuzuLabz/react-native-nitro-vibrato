import { NitroModules } from 'react-native-nitro-modules';
import type { NitroVibrato } from './specs/Vibrato.nitro';
import type { InitializeOptions, TextdictBytes, TextdictPaths, Token } from './types';
import { useEffect, useState } from 'react';
import { convertToNativeBuffer, processUserDict } from './convert';

class VibratoClass {
    private native: NitroVibrato = NitroModules.createHybridObject<NitroVibrato>('NitroVibrato');
    private listeners = new Set<(state: boolean) => void>();

    private notify() {
        this.listeners.forEach(listener => listener(this.isInitialized));
    }

    get isInitialized(): boolean {
        return this.native.isInitialized;
    }

    subscribe(listener: (state: boolean) => void) {
        this.listeners.add(listener);
        
        return () => {
            this.listeners.delete(listener);
        };
    }

    async initialize(dic: string | Uint8Array, userDict?: string | Uint8Array, options?: InitializeOptions) {
        if (this.native.isInitialized) {
            this.native.freeDic();
        }
        try {
            const ud = await processUserDict(userDict);
            if (dic instanceof Uint8Array) {
                await this.native.initializeFromBytes(convertToNativeBuffer(dic), ud, options);
            } else {
                await this.native.initialize(dic, ud, options);
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            this.notify();
        }
        
    };

    async initializeFromTextDic(files: TextdictBytes | TextdictPaths, userDict?: string | ArrayBuffer, options?: InitializeOptions) {
        if (this.native.isInitialized) {
            this.native.freeDic();
        }
        try {
            if (files.lex instanceof Uint8Array && files.matrix instanceof Uint8Array && files.char instanceof Uint8Array && files.unk instanceof Uint8Array) {
                await this.native.initializeFromTextdictBytes({
                    lexBytes: convertToNativeBuffer(files.lex),
                    matrixBytes: convertToNativeBuffer(files.matrix),
                    charBytes: convertToNativeBuffer(files.char),
                    unkBytes: convertToNativeBuffer(files.unk)
                }, userDict, options);
            } else {
                await this.native.initializeFromTextdict({
                    lexPath: files.lex as string,
                    matrixPath: files.matrix as string,
                    charPath: files.char as string,
                    unkPath: files.unk as string
                }, userDict, options)
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            this.notify();
        }
        
    }

    async tokenize(text: string): Promise<Token[] | null> {
        try {
            const tokens = await this.native.tokenize(text) as Token[] ?? null;
            console.log(tokens);
            return tokens
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    async wakati(text: string): Promise<string[] | null> {
        const tokens = await this.tokenize(text);
        return tokens?.map((t) => t.surface) ?? null;
    }

    async compileDictionary(files: TextdictBytes | TextdictPaths): Promise<Uint8Array | null> {
        if (files.lex instanceof Uint8Array && files.matrix instanceof Uint8Array && files.char instanceof Uint8Array && files.unk instanceof Uint8Array) {
            const data = await this.native.compileDictBytes({
                charBytes: convertToNativeBuffer(files.char),
                lexBytes: convertToNativeBuffer(files.lex),
                matrixBytes: convertToNativeBuffer(files.matrix),
                unkBytes: convertToNativeBuffer(files.unk)
            });
            return data ? new Uint8Array(data) : null;
        } else if (typeof files.char === 'string' && typeof files.lex === 'string' && typeof files.matrix === 'string' && typeof files.unk === 'string') {
            const data = await this.native.compileDict({ charPath: files.char, lexPath: files.lex, matrixPath: files.matrix, unkPath: files.unk });
            return data ? new Uint8Array(data) : null;
        }

        return null;
    }

    destroy() {
        this.native.freeDic();
        this.notify();
    }
}

export const initWasmAsync = async () => {
    null;
};
export const initWasmSync = () => {
    null
}

export const Vibrato = new VibratoClass();

export const useVibratoInitialized = (): boolean => {
    const [initialized, setInitialized] = useState(Vibrato.isInitialized);

    useEffect(() => {
        const unsubscribe = Vibrato.subscribe(setInitialized);
        return () => unsubscribe();
    }, []);

    return initialized;
};
export type { InitializeOptions, TextdictBytes, TextdictPaths, Token } from './types';
export { MecabPreset } from './constants';
