# react-native-nitro-vibrato

An unoffical [Vibrato](https://github.com/daac-tools/vibrato) React Native package built with [Nitro](https://nitro.margelo.com/)!

What is Vibrato?

> "Vibrato is a fast implementation of tokenization (or morphological analysis) based on the Viterbi algorithm."

## Platforms
- [x] Android 🤖
- [X] iOS 🍏
- [X] Web 🌐

## Installation
```bash
bun add @kuzulabz/react-native-nitro-vibrato react-native-nitro-modules
```

## Quick start
Checkout the [documentation site](https://kuzulabz.com/docs/react-native/vibrato) for the full API.

### 1. Initialization
```ts
import { initWasmAsync, Vibrato, MecabPreset } from '@kuzulabz/react-native-nitro-vibrato';

// Required for web! (safe to call on mobile)
await initWasmAsync();

// Minimal
const path = 'file://.../system.dic';
await Vibrato.initialize(path);

// With user dictionary
const userDict = 'file://.../user-dict.csv';
await Vibrato.initialize(path, userDict);

// With the Mecab Preset. 
// This will return the same token results as Mecab.
await Vibrato.initialize(path, userDict, MecabPreset);

// With multiple files
await Vibrato.initializeFromTextDic({
    char: 'file://.../char.def',
    lex: 'file://.../lex.csv',
    matrix: 'file://.../matrix.def',
    unk: 'file://.../unk.def'
});
```

### 2. Tokenize
```ts
import { Vibrato, Token } from '@kuzulabz/react-native-nitro-vibrato';

// Returns tokens, each containing the surface, features, word cost, etc
const result: Token[] = Vibrato.tokenize(text);
```

### 3. Extras

#### Initialization state hook
A reactive way to check if the dictionary is loaded or not.

You can also call `Vibrato.subscribe` to subscribe to the dictionary state.

```ts
import { useVibratoInitialized } from '@kuzulabz/react-native-nitro-vibrato'

const isInit = useVibratoInitialized();

// Or without the hook
const [initialized, setInitialized] = useState(Vibrato.isInitialized);
const unsubscribe = Vibrato.subscribe(setInitialized);
```

## Compile system dictionary
You can compile a system dictionary by using `Vibrato.compileDictionary`. It requires passing the char, lex, matrix, and unk files and returns a UInt8Array of the `.dic` file.

```ts
import { Vibrato } from '@kuzulabz/react-native-nitro-vibrato';

// Returns a Uint8Array of a .dic file
const data: Uint8Array = Vibrato.compileDictionary({
    char: 'file://.../char.def',
    lex: 'file://.../lex.csv',
    matrix: 'file://.../matrix.def',
    unk: 'file://.../unk.def'
});
```

## Zstd support
This library does not handle compression. Read below for an example on how to decompress. The example app also demonstrates how to import and load `.zst` dictionaries.

I recommend using bhouston's [zstdify](https://github.com/bhouston/zstdify). This works on all platforms.

```ts
import { decompress } from "zstdify";
import { File } from 'expo-filesystem'; // or any other filesystem library

// Mobile
const dictFile = new File('system.dic');
const dic = decompress(new Uint8Array(await dictFile.arrayBuffer()));

// Web
const result = await fetch(require('./assets/dicts/system.dic.zst'));
const dic = decompress(new Uint8Array(await result.arrayBuffer()));

// Takes an ArrayBuffer
await Vibrato.initialize(dic.buffer);
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.