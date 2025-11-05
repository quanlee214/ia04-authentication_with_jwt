
import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "../components/ui/sonner";

function fetchUser() {
    return axios.get("/user/me");
}

export default function Dashboard() {
    const queryClient = useQueryClient();
    const { accessToken, setAccessToken, logout } = useAuth();
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        if (!accessToken && window.__accessToken) {
            setAccessToken(window.__accessToken);
        }
        setCheckingAuth(false);
    }, [accessToken, setAccessToken]);

    useEffect(() => {
        if (!accessToken && !checkingAuth) {
            navigate("/login", { replace: true });
        }
    }, [accessToken, checkingAuth, navigate]);

    const { data, error, isLoading, isError } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        enabled: !!accessToken,
        retry: false,
    });

    if (!accessToken) return <div className="flex items-center justify-center h-screen text-lg">Checking authentication...</div>;
    if (isLoading) return <div className="flex items-center justify-center h-screen text-lg">Loading user info...</div>;
    if (isError) {
        toast.error("Không thể lấy thông tin user. Vui lòng đăng nhập lại.");
        return <div className="flex items-center justify-center h-screen text-lg text-red-600">Error: {error?.message || "Không thể lấy thông tin user."}</div>;
    }
    if (!data || !data.data) return <div className="flex items-center justify-center h-screen text-lg">No user data found.</div>;

    const user = data.data;
    const handleLogout = () => {
        logout();
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("Logged out successfully!");
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    alt="avatar"
                    className="mx-auto mb-4 rounded-full w-20 h-20 border-2 border-blue-300"
                />
                <h1 className="text-3xl font-bold mb-2 text-blue-700">Welcome, {user.email.split("@")[0]}</h1>
                <p className="mb-2 text-gray-600"><strong>Email:</strong> {user.email}</p>
                <p className="mb-6 text-gray-600"><strong>ID:</strong> {user.id}</p>
                <div className="flex gap-4 justify-center">
                    <button
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
