import { useContext } from "react";
import { SoundContext } from "./sound-context";

export const useSound = () => useContext(SoundContext);
