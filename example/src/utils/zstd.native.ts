// import { decompress } from 'react-native-zstd';
import { decompress } from "zstdify";
// import { Buffer } from 'react-native-nitro-buffer';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';

const decompressDic = (buffer: ArrayBuffer) => {
    const t = decompress(new Uint8Array(buffer));
    return t;
};

const saveDict = async (dicFile: File) => {
    try {
        if (dicFile.exists) {
            return;
        } else {
            const [{ localUri }] = await Asset.loadAsync(require('../../assets/dictionary/system.dic.zst'));
            console.log('Asset URI:', localUri);
            if (localUri) {
                const assetFile = new File(localUri);

                // save uncompressed
                dicFile.create();
                dicFile.write(decompressDic(await assetFile.arrayBuffer()));

                // remove asset
                assetFile.delete();
            }
        }
    } catch (e) {
        console.error(e);
    }
};

export const getDictData = async (format: 'uint8' | 'uri') => {
    try {
        const dicFile = new File(Paths.document, 'system.dic');
        await saveDict(dicFile);

        return format === 'uint8' ? new Uint8Array(await dicFile.arrayBuffer()) : dicFile.uri;
    } catch (e) {
        console.error(e);
    }
    
};