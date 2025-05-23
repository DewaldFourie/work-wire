import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 text-black dark:text-white p-2">
                <Outlet />
            </main>
        </div>
    );
}
