import { decompress } from "zstdify";

export const getDictData = async () => {
    const result = await fetch(require('../../assets/dicts/system.dic.zst'));
    const buf = await result.arrayBuffer();
    return decompress(new Uint8Array(buf));
};