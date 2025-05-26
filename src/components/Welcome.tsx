import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import * as THREE from 'three';
import { ThemeContext } from '../contexts/theme-context';

const AnimatedSphere = () => {
    const color = new THREE.Color('#6366f1'); // Indigo-500
    return (
        <mesh>
            <icosahedronGeometry args={[2.5, 2]} />
            <meshStandardMaterial color={color} wireframe />
        </mesh>
    );
};

const WelcomeOverlay = () => (
    <Html center>
        <motion.div
            className="text-center p-4 rounded-lg bg-white/80 dark:bg-black/50 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
        >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to ChatApp
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
                Select a contact to start chatting.
            </p>
        </motion.div>
    </Html>
);

const Welcome = () => {
    const { theme } = useContext(ThemeContext);
    const bgColor = theme === 'dark' ? '#0f172a' : '#f8fafc';

    return (
        <div className="h-full w-full">
            <Canvas
                shadows
                camera={{ position: [0, 0, 10], fov: 50 }}
                style={{ background: bgColor }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <AnimatedSphere />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                <WelcomeOverlay />
            </Canvas>
        </div>
    );
};

export default Welcome;
