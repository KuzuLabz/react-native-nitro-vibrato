import { DOCS_URL, GITHUB_URL, SOURCE_COLOR } from "@/constants";
import { Button, Host } from "@expo/ui";
import { useState } from "react";
import { Image, Linking, Platform, Pressable, View } from "react-native";

const openLink = (type: 'github' | 'docs') => {
    Linking.openURL(type === 'github' ? GITHUB_URL : DOCS_URL);
};

const iconSize = Platform.select({native: 28, web: 32})

export const RootHeaderActions = () => {
    const [isHovered, setIsHovered] = useState(false);

    return(
        <View style={{flexDirection: 'row', alignItems: 'center', marginRight: Platform.OS === 'web' ? 12 : 0, gap: 16, paddingHorizontal: Platform.OS === 'ios' ? 16 : undefined}}>
            <Host matchContents>
                <Button label="Docs" variant={Platform.OS === 'web' ? "outlined" : 'text'} onPress={() => openLink('docs')} />
            </Host>
            <Pressable style={{aspectRatio: 1, width: iconSize}} onPress={() => openLink('github')} onHoverIn={() => setIsHovered(true)} onHoverOut={() => setIsHovered(false)}>
                <Image 
                    source={require('../../assets/images/GitHub_Invertocat_White.png')} 
                    tintColor={isHovered ? SOURCE_COLOR : undefined} 
                    resizeMode="contain" 
                    style={{width: '100%', height: '100%'}} 
                />
            </Pressable>
        </View>
    );
};