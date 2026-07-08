import { Button, HStack } from "@expo/ui/swift-ui";
import { ControlsProps } from "./types";
import { useWindowDimensions } from "react-native";
import { Animation, animation, buttonStyle, disabled } from "@expo/ui/swift-ui/modifiers";

export const Controls = (props: ControlsProps) => {
    const {width} = useWindowDimensions();
    return(
        <HStack>
            {!props.isInit && <Button label="Initialize" onPress={props.onInit} modifiers={[disabled(props.isLoading), animation(Animation.easeIn(), props.isInit), animation(Animation.easeOut(), !props.isInit)]}  />}
            {props.isInit && <HStack spacing={8} alignment="center" modifiers={[animation(Animation.easeIn(), props.isInit), animation(Animation.easeOut(), !props.isInit)]}>
                     <Button label="Tokenize" onPress={props.onTokenize} modifiers={[buttonStyle('borderedProminent'), disabled(!props.isInit)]} />
                     <Button label="💥" onPress={props.onDestroy} />
                 </HStack>}
        </HStack>
    );
};