import { useAuth } from "../contexts/auth-context";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.email || "Guest"}!</h1>
    </div>
  );
};

export default Home;
