import { useEffect, useState, type ReactNode } from "react";
import { SoundContext } from "./sound-context";

export const SoundProvider = ({ children }: { children: ReactNode }) => {
    const [isMuted, setIsMuted] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sound-muted");
            return saved === "true";
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem("sound-muted", JSON.stringify(isMuted));
    }, [isMuted]);

    const toggleSound = () => setIsMuted(prev => !prev);
    const setMuted = (val: boolean) => setIsMuted(val);

    return (
        <SoundContext.Provider value={{ isMuted, toggleSound, setMuted }}>
            {children}
        </SoundContext.Provider>
    );
};
