import { useEffect, useState, useRef, type ReactNode } from "react";
import { SoundContext } from "./sound-context";

export const SoundProvider = ({ children }: { children: ReactNode }) => {
    const [isMuted, setIsMuted] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sound-muted");
            return saved === "true";
        }
        return false;
    });

    const toggleSfx = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        toggleSfx.current = new Audio("/sounds/alert.mp3"); 
        toggleSfx.current.volume = 0.9;
    }, []);

    useEffect(() => {
        localStorage.setItem("sound-muted", JSON.stringify(isMuted));
    }, [isMuted]);

    const toggleSound = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);

        // Only play sound when unmuting
        if (!newMuted && toggleSfx.current) {
            toggleSfx.current.currentTime = 0;
            toggleSfx.current.play().catch(() => {});
        }
    };

    const setMuted = (val: boolean) => {
        setIsMuted(val);
        if (!val && toggleSfx.current) {
            toggleSfx.current.currentTime = 0;
            toggleSfx.current.play().catch(() => {});
        }
    };

    return (
        <SoundContext.Provider value={{ isMuted, toggleSound, setMuted }}>
            {children}
        </SoundContext.Provider>
    );
};
