const Welcome = () => {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-2">Welcome to ChatApp</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Select a contact to start chatting.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
