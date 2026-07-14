export const convertToNativeBuffer = (existingBuffer: Uint8Array): ArrayBuffer => {
    // Unused on web
    return existingBuffer.buffer as ArrayBuffer;
}

export const processUserDict = async (userDict?: string | Uint8Array): Promise<string | ArrayBuffer | undefined> => {
    // Unused on web
    return typeof userDict === 'string' ? userDict : undefined;
};

export const processUserDictWeb = async (userDict?: string | Uint8Array) => {
    if (!userDict) {
        return undefined;
    }

    if (userDict instanceof Uint8Array) {
        return userDict;
    } else {
        const response = await fetch(userDict);
        const buf = await response.arrayBuffer();
        return new Uint8Array(buf);
    }
};