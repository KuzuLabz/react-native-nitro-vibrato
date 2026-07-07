import { Button, Column, Row } from "@expo/ui";
import { ControlsProps } from "./types";
import { View } from "react-native";

export const Controls = (props: ControlsProps) => {
    return(
        <View style={{flex:1,}}>
            <Row spacing={8} alignment="center" >
                {!props.isInit && <Button label="Initialize" onPress={props.onInit} disabled={props.isLoading}  />}
                {props.isInit && <Row spacing={8}>
                    <Button label="Tokenize" onPress={props.onTokenize} disabled={!props.isInit} />
                    <Button label="💥" onPress={props.onDestroy} />
                </Row>}
            </Row>
        </View>
    );
};