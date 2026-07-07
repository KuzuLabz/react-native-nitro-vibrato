import { Row, Button, OutlinedButton, TooltipBox, Text, Spacer, Shape, CircularProgressIndicator, AnimatedVisibility, EnterTransition, ExitTransition, useMaterialColors } from "@expo/ui/jetpack-compose";
import { weight, width, fillMaxWidth, size } from '@expo/ui/jetpack-compose/modifiers';
import { ControlsProps } from "./types";
import { Vibrato } from "@kuzulabz/react-native-nitro-vibrato";
import { Color } from "expo-router";

export const Controls = (props: ControlsProps) => {
    const colors = useMaterialColors();

    return(
        <Row horizontalArrangement={{spacedBy: 8}}>
            <AnimatedVisibility visible={!props.isInit} enterTransition={EnterTransition.scaleIn()} exitTransition={ExitTransition.scaleOut()} >
                <Button onClick={props.onInit} enabled={!props.isInit} modifiers={[fillMaxWidth()]}>
                    <AnimatedVisibility visible={!!props.isLoading}>
                        <CircularProgressIndicator color={colors.onPrimary} modifiers={[size(18, 18)]} strokeWidth={2} />
                    </AnimatedVisibility>
                    {props.isLoading && <Spacer modifiers={[width(8)]} />}
                    <Text>Initialize</Text>
                </Button>
            </AnimatedVisibility>
            <AnimatedVisibility visible={props.isInit} enterTransition={EnterTransition.scaleIn()} exitTransition={ExitTransition.scaleOut()}>
                <Row horizontalArrangement={{spacedBy: 8}}>
                    <Button onClick={props.onTokenize} enabled={props.isInit} modifiers={[weight(1)]}>
                        <Text>Tokenize</Text>
                    </Button>
                    {/* <OutlinedButton onClick={props.onWakati} enabled={props.isInit} modifiers={[weight(1)]}>
                        <Text>Wakati</Text>
                    </OutlinedButton> */}
                    <TooltipBox>
                        <TooltipBox.PlainTooltip>
                            <Text>Unload dictionary</Text>
                        </TooltipBox.PlainTooltip>
                        <OutlinedButton onClick={props.onDestroy} modifiers={[weight(0.3)]}>
                            <Text>💥</Text>
                        </OutlinedButton>
                    </TooltipBox>
                </Row>
            </AnimatedVisibility>
        </Row>
    );
};