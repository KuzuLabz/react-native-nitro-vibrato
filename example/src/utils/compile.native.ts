import { Vibrato } from "@kuzulabz/react-native-nitro-vibrato";
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

// Example of compiling a dictionary

const getDictFiles = async () => {
    const assets = await Asset.loadAsync([
        // require('../../assets/dicts/split/char.def'),
        // require('../../assets/dicts/split/lex.csv'),
        // require('../../assets/dicts/split/matrix.def'),
        // require('../../assets/dicts/split/unk.def'),
    ]);

    return assets?.map((asset) => {
        if (asset.localUri) {
            return new File(asset.localUri);
        } else {
            return null
        }
    }).filter((file) => file !== null);
};

const saveDict = async (dest: File) => {
    if (dest.exists) {
        return;
    } else {
        const [{ localUri }] = await Asset.loadAsync(require('../../assets/dicts/system.dic.zst'));
        if (localUri) {
            const assetFile = new File(localUri);
            assetFile.rename('system.dic.zst');
            await assetFile.move(dest);
        }
    }
};

export const compileDict = async () => {
    try {
        console.log('Compiling dictionary...');
        const files = await getDictFiles()
        const dict = await Vibrato.compileDictionary({
            char: files[0].uri,
            lex: files[1].uri,
            matrix: files[2].uri,
            unk: files[3].uri
        });
        console.log('Successful!');
    } catch (error) {
        console.error(error);
    }
};