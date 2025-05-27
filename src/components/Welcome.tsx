import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import * as THREE from 'three';
import { ThemeContext } from '../contexts/theme-context';

const AnimatedSphere = ({ theme }: { theme: string }) => {
    const color = new THREE.Color(theme === 'dark' ? '#6366f1' : 'white'); 
    const opacity = theme === 'dark' ? 1 : 0.2;

    return (
        <mesh>
            <icosahedronGeometry args={[2.5, 2]} />
            <meshStandardMaterial 
                color={color} 
                wireframe 
                opacity={opacity}
                transparent
            />
        </mesh>
    );
};


const WelcomeOverlay = () => (
    <Html center>
        <motion.div
            className="w-[40vw] max-w-md text-center px-8 py-6 transition-colors duration-500"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
        >
            <h1
                className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6"
                style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.25)', 
                }}
            >
                Welcome to <span className="text-indigo-500">WorkWire</span>
            </h1>
            <p
                className="text-lg text-gray-700 dark:text-gray-300  font-medium leading-relaxed"
                style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
            >
                Select a contact on the left to start chatting and connect instantly with others.
            </p>
        </motion.div>
    </Html>
);




const Welcome = () => {
    const { theme } = useContext(ThemeContext);
    const bgColor = theme === 'dark' ? '#0f172a' : '#f8fafc';

    return (
        <>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full w-full hover:cursor-pointer"
            >
                <Canvas
                    shadows
                    camera={{ position: [0, 0, 10], fov: 50 }}
                    style={{ background: bgColor }}
                >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <AnimatedSphere theme={theme} />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                    <WelcomeOverlay />
                </Canvas>
            </motion.div>
        </>


    );
};

export default Welcome;
