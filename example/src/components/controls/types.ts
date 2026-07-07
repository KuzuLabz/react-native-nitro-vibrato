export type ControlsProps = {
    isInit: boolean;
    isLoading?: boolean;
    onInit: () => void;
    onTokenize: () => void;
    onWakati: () => void;
    onDestroy: () => void;
};