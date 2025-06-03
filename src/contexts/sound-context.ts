import { createContext } from "react";

export interface SoundContextType {
    isMuted: boolean;
    toggleSound: () => void;
    setMuted: (val: boolean) => void;
}

export const SoundContext = createContext<SoundContextType>({
    isMuted: false,
    toggleSound: () => {},
    setMuted: () => {},
});
