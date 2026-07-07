import { NitroModules } from 'react-native-nitro-modules';
import type { NitroVibrato } from './specs/Vibrato.nitro';
import type { InitializeOptions, TextdictBytes, TextdictPaths, Token } from './types';
import { useEffect, useState } from 'react';

export const convertToNativeBuffer = (existingBuffer: ArrayBuffer) => {
    const nativeBuffer = NitroModules.createNativeArrayBuffer(existingBuffer.byteLength);

    const sourceView = new Uint8Array(existingBuffer);
    const targetView = new Uint8Array(nativeBuffer);

    targetView.set(sourceView);

  return nativeBuffer;
}

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

    async initialize(dic: string | ArrayBuffer, options?: InitializeOptions) {
        if (this.native.isInitialized) {
            this.native.freeDic();
        }
        try {
            if (dic instanceof ArrayBuffer) {
                await this.native.initializeFromBytes(convertToNativeBuffer(dic), options);
            } else {
                await this.native.initialize(dic, options);
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            this.notify();
        }
        
    };

    async initializeFromTextDic(files: TextdictBytes | TextdictPaths, options?: InitializeOptions) {
        if (this.native.isInitialized) {
            this.native.freeDic();
        }
        try {
            if (files.lex instanceof ArrayBuffer && files.matrix instanceof ArrayBuffer && files.char instanceof ArrayBuffer && files.unk instanceof ArrayBuffer) {
                await this.native.initializeFromTextdictBytes({
                    lexBytes: convertToNativeBuffer(files.lex),
                    matrixBytes: convertToNativeBuffer(files.matrix),
                    charBytes: convertToNativeBuffer(files.char),
                    unkBytes: convertToNativeBuffer(files.unk)
                }, options);
            } else {
                await this.native.initializeFromTextdict({
                    lexPath: files.lex as string,
                    matrixPath: files.matrix as string,
                    charPath: files.char as string,
                    unkPath: files.unk as string
                }, options)
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
        if (files.lex instanceof ArrayBuffer && files.matrix instanceof ArrayBuffer && files.char instanceof ArrayBuffer && files.unk instanceof ArrayBuffer) {
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
