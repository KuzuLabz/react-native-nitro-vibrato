import { decompress } from "zstdify";

/**
 * Web only returns Uint8
 */
export const getDictData = async (format: 'uint8' | 'uri'): Promise<Uint8Array | string> => {
    const result = await fetch(require('../../assets/dictionary/system.dic.zst'));
    const buf = await result.arrayBuffer();
    return decompress(new Uint8Array(buf));
};