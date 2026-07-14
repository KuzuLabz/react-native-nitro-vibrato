export interface TokenWasm {
    surface: string;
    lex_type: string;
    feature: string;
    word_id: number;
    left_id: number;
    right_id: number;
    word_cost: number;
    total_cost: number;
}

export interface Token {
    surface: string;
    lexType: string;
    features: string[];
    wordId: number;
    leftId: number;
    rightId: number;
    wordCost: number;
    totalCost: number;
}

export interface TextdictPaths {
    lex: string;
    matrix: string;
    char: string;
    unk: string;
}

export interface TextdictBytes {
    lex: Uint8Array;
    matrix: Uint8Array;
    char: Uint8Array;
    unk: Uint8Array;
}

export interface InitializeOptions {
    ignoreSpace?: boolean;
    maxGroupingLength?: number;
}