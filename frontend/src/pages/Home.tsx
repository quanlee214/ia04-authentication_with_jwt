import { useEffect, useState } from "react";
import * as Lucide from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const Home = () => {
  const [user, setUser] = useState<string | null>(null);
  const { accessToken } = useAuth();
  useEffect(() => {
    console.log("[Home] accessToken in session (memory):", accessToken);
  }, [accessToken]);

  useEffect(() => {
    const email = localStorage.getItem("email");
    setUser(email);
  }, []);

  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    setUser(null);
    toast({
      title: "Logged out successfully!",
      duration: 1000,
      className: "bg-green-100 border-green-500 text-green-900 shadow-lg"
    });
  };

  // Lấy tên trước dấu @
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafd]">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5997c61a] text-[#5997c6] text-sm font-medium mb-4">
              <Lucide.Shield className="w-4 h-4" />
              Secure Registration System
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#5997c6] to-[#b3d1ee] bg-clip-text text-transparent">
              Welcome to our website
            </h1>
            <p className="text-xl text-black max-w-2xl py-4 mx-auto">
              A modern user registration frontend built with React, TypeScript, and Tailwind CSS.
              Experience beautiful forms with comprehensive validation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-white border border-[#5997c6] hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#5997c61a] flex items-center justify-center mb-4 mx-auto">
                <Lucide.Shield className="w-6 h-6 text-[#5997c6]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">Secure Authentication</h3>
              <p className="text-sm text-black">
                Password hashing with Web Crypto API and secure database storage
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#5997c6] hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#5997c61a] flex items-center justify-center mb-4 mx-auto">
                <Lucide.UserPlus className="w-6 h-6 text-[#5997c6]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">Easy Registration</h3>
              <p className="text-sm text-black">
                Simple sign-up process with real-time validation
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#5997c6] hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#5997c61a] flex items-center justify-center mb-4 mx-auto">
                <Lucide.LogIn className="w-6 h-6 text-[#5997c6]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">Modern UI</h3>
              <p className="text-sm text-black">
                Beautiful interface built with shadcn/ui and Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;