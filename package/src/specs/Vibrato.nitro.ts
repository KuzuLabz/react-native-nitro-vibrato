// TODO: Export specs that extend HybridObject<...> here
import { type HybridObject } from 'react-native-nitro-modules'
import type { InitializeOptions, Token } from '../types';

interface FileBytes {
    lexBytes: ArrayBuffer;
    matrixBytes: ArrayBuffer;
    charBytes: ArrayBuffer;
    unkBytes: ArrayBuffer;
}

interface FilePaths {
    lexPath: string;
    matrixPath: string;
    charPath: string;
    unkPath: string;
}

export interface NitroVibrato extends HybridObject<{
  ios: 'c++',
  android: 'c++'
}> {
  initialize(dictionaryPath: string, options?: InitializeOptions): Promise<void>;
  initializeFromBytes(bytes: ArrayBuffer, options?: InitializeOptions): Promise<void>;
  initializeFromTextdict(files: FilePaths, options?: InitializeOptions): Promise<void>;
  initializeFromTextdictBytes(files: FileBytes, options?: InitializeOptions): Promise<void>;
  tokenize(text: string): Promise<Token[]>;
  compileDict(files: FilePaths): Promise<ArrayBuffer>;
  compileDictBytes(files: FileBytes): Promise<ArrayBuffer>;
  freeDic(): void;
  readonly isInitialized: boolean;
}