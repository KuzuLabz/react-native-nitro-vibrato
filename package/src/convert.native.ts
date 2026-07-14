import { NitroModules } from "react-native-nitro-modules";

export const convertToNativeBuffer = (existingBuffer: Uint8Array) => {
    const nativeBuffer = NitroModules.createNativeArrayBuffer(existingBuffer.byteLength);
    const targetView = new Uint8Array(nativeBuffer);

    targetView.set(existingBuffer);

    return nativeBuffer;
}

export const processUserDict = async (userDict?: string | Uint8Array) => {
    if (!userDict) {
        return undefined;
    }

    if (userDict instanceof Uint8Array) {
        return convertToNativeBuffer(userDict);
    }
    return userDict;
};

export const processUserDictWeb = async (userDict?: string | Uint8Array) => {
    // Unused on native
    return userDict;
};