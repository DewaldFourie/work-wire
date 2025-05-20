import { useAuth } from "../contexts/auth-context";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.user_metadata.username || "Guest"}!</h1>
    </div>
  );
};

export default Home;
