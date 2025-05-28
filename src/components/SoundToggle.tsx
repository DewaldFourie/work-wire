import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/use-theme.ts";

type SoundToggleProps = {
    width?: number;
    height?: number;
    initialMuted?: boolean;
    onToggle?: (muted: boolean) => void;
};

export default function SoundToggle({
    width = 80,
    height = 40,
    initialMuted = false,
    onToggle,
}: SoundToggleProps) {
    const [isMuted, setIsMuted] = useState(initialMuted);
    const { theme } = useTheme();

    const handleToggle = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        if (onToggle) onToggle(newState);
    };

    const knobSize = height * 0.8;
    const knobTranslate = width - knobSize - 8; // padding compensation

    return (
        <button
            onClick={handleToggle}
            aria-label="Toggle sound"
            className="relative flex items-center justify-between bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-2"
            style={{ width, height }}
        >
            <Volume2
                className={`transition-all duration-300 ${isMuted
                        ? theme === "dark"
                            ? "opacity-50 text-gray-100"
                            : "opacity-50 grayscale"
                        : "opacity-100 text-green-500"
                    }`}
                style={{ width: height * 0.5, height: height * 0.5 }}
            />
            <VolumeX
                className={`transition-all duration-300 ${isMuted
                        ? "opacity-100 text-red-500"
                        : theme === "dark"
                            ? "opacity-50 text-gray-100"
                            : "opacity-50 grayscale"
                    }`}
                style={{ width: height * 0.5, height: height * 0.5 }}
            />
            <div
                className="absolute bg-white rounded-full shadow-md transition-transform duration-500 ease-in-out"
                style={{
                    top: (height - knobSize) / 2,
                    left: 4,
                    width: knobSize,
                    height: knobSize,
                    transform: isMuted
                        ? `translateX(${knobTranslate}px) rotate(180deg)`
                        : `translateX(0) rotate(0deg)`,
                }}
            />
        </button>
    );
}
