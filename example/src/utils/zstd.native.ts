// import { decompress } from 'react-native-zstd';
import { decompress } from "zstdify";
// import { Buffer } from 'react-native-nitro-buffer';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';

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

export const getDictData = async () => {
    const dicFile = new File(Paths.document, 'system.dic.zst');
    await saveDict(dicFile)

    const t = decompress(new Uint8Array(await dicFile.arrayBuffer()));
    return t.buffer;
};