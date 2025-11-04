import { useNavigate } from "react-router-dom";

const Header = ({ user, onLogout }: { user: string | null; onLogout: () => void }) => {
  const navigate = useNavigate();
  const username = user ? user.split("@")[0] : "";
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white shadow border-b">
      <div className="font-bold text-xl text-[#5997c6]">IA03</div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="font-semibold">{username}</span>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
