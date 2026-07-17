import init, { initSync, Vibrato as NativeVibrato } from '../web';
import type { InitializeOptions, TextdictBytes, TextdictPaths, Token, TokenWasm } from './types';
import type { MecabPreset } from './constants';
import { useEffect, useState } from 'react';
import { getTextDictBytes } from './utils';
import { processUserDictWeb } from './convert';

class VibratoClass {
    private _native: NativeVibrato | null = null;
    private listeners = new Set<(state: boolean) => void>();

    private notify() {
        this.listeners.forEach(listener => listener(this.isInitialized));
    }

    get isInitialized() {
        return this._native !== null;
    }

    /**
     * Subscribe to the dictionary initialization state.
     * 
     * The `useVibratoInitialized` hook can also be used.
     * 
     * @returns 
     */
    subscribe(listener: (state: boolean) => void) {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Creates a Vibrato instance.
     * 
     * @param dic A local path uri or a Uint8Arrays
     * 
     * @param options Optional dictionary settings. To get the same results as Mecab, use the {@linkcode MecabPreset}.
     */
    async initialize(dic: string | Uint8Array, userDict?: string | Uint8Array, options?: InitializeOptions) {
        if (this._native) {
            this._native.free();
        }

        try {
            const userDictData = await processUserDictWeb(userDict);
            if (dic instanceof Uint8Array) {
                this._native = new NativeVibrato(dic, userDictData, options?.ignoreSpace, options?.maxGroupingLength);
            } else {
                const response = await fetch(dic);
                const buf = await response.arrayBuffer();
                this._native = new NativeVibrato(new Uint8Array(buf), userDictData, options?.ignoreSpace, options?.maxGroupingLength);
                // console.warn('Local path is not supported on web.');
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            this.notify();
        }
    };

    /**
     * Creates a Vibrato instance from multiple dic files.
     * 
     * @param files A {@linkcode TextdictPaths} object of local path URIs or a {@linkcode TextdictBytes} object of Uint8Arrays.
     * 
     * @param options Optional dictionary settings. To get the same results as Mecab, use the {@linkcode MecabPreset}.
     * 
     * @example
     * ```
     * initializeFromTextDic({
     *  lex: lexUri,
        matrix: matrixUri,
        char: charUri,
        unk: unkUri
     * });
     * ```
    */
    async initializeFromTextDic(files: TextdictBytes | TextdictPaths, userDict?: string | Uint8Array, options?: InitializeOptions) {
        if (this._native) {
            this._native.free();
        }

        try {
            const userDictData = await processUserDictWeb(userDict);
            if (files.lex instanceof Uint8Array && files.matrix instanceof Uint8Array && files.char instanceof Uint8Array && files.unk instanceof Uint8Array) {
                this._native = NativeVibrato.from_textdict_bytes(
                    files.lex, files.matrix, files.char, files.unk,
                    userDictData,
                    options?.ignoreSpace,
                    options?.maxGroupingLength
                );
            } else {
                const fileBytes = await getTextDictBytes(files as TextdictPaths);
                if (!fileBytes) {
                    console.warn('Could not get dict files.');
                    return;
                }
                this._native = NativeVibrato.from_textdict_bytes(fileBytes.lex, fileBytes.matrix, fileBytes.char, fileBytes.unk);
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            this.notify();
        }
    }

    /**
     * Tokenize text.
     * @param text A string of text.
     * @returns An array of {@linkcode Token}
     */
    async tokenize(text: string): Promise<Token[] | null> {
        const tokens = this._native?.tokenize(text) as TokenWasm[] ?? null;
        return tokens?.map((t) => ({ 
            features: t.feature.split(','), 
            leftId: t.left_id, 
            rightId: t.right_id, 
            lexType: t.lex_type, 
            surface: t.surface, 
            totalCost: t.total_cost, 
            wordCost: t.word_cost, 
            wordId: t.word_id 
        })) ?? [];
    };

    /**
     * Text segmentation. Only returns the surface of each word.
     * @param text A string of text.
     * @returns An array of strings (surfaces)
     */
    async wakati(text: string): Promise<string[] | null> {
        const tokens = await this.tokenize(text);
        return tokens?.map((t) => t.surface) ?? null;
    }

    /**
     * Compile a system dictionary into a .dic file.
     * @param files A {@linkcode TextdictPaths} object of local path URIs or a {@linkcode TextdictBytes} object of Uint8Arrays.
     * @returns A Uint8Array of the .dic file
     */
    async compileDictionary(files: TextdictBytes | TextdictPaths): Promise<Uint8Array | null> {
        if (files.lex instanceof Uint8Array && files.matrix instanceof Uint8Array && files.char instanceof Uint8Array && files.unk instanceof Uint8Array) {
            return NativeVibrato.compile_dict(files.lex, files.matrix, files.char, files.unk) ?? null;
        }
        return null;
    }

    destroy() {
        this._native && this._native.free();
        this._native = null;
        this.notify();
    }
}

/**
 * Initialize WASM asynchronously
 * 
 * @platforms web
 */
export const initWasmAsync = async () => {
    await init(require('../web/vibrato_wasm_bg.wasm'));
};

/**
 * Initialize WASM synchronously
 * 
 * @platforms web
 */
export const initWasmSync = () => {
    initSync(require('../web/vibrato_wasm_bg.wasm'));
}

export const Vibrato = new VibratoClass();

/**
 * Checks the initialization state of the tokenizer. 
 * @returns boolean
 */
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