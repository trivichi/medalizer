// src/components/auth/LoginForm.tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LoginForm] Form submitted");
    console.log("[LoginForm] Email:", email);
    
    setError("");
    setLoading(true);

    try {
      console.log("[LoginForm] Calling API login...");
      const response = await apiService.login({ email, password });
      console.log("[LoginForm] API login successful, token received");
      
      // Extract user info from token
      console.log("[LoginForm] Decoding JWT token...");
      const tokenParts = response.access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log("[LoginForm] Token payload decoded:", { 
        name: payload.name, 
        email: payload.email,
        sub: payload.sub 
      });
      
      const userName = payload.name || email;
      console.log("[LoginForm] Logging in user:", userName);
      login(userName, response.access_token);
      
      console.log("[LoginForm] Login complete, calling onSuccess");
      onSuccess();
    } catch (err: any) {
      console.error("[LoginForm] Login failed");
      console.error("[LoginForm] Error object:", err);
      
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (err.response) {
        console.error("[LoginForm] Response error:", {
          status: err.response.status,
          data: err.response.data
        });
        errorMessage = err.response.data?.detail || errorMessage;
      } else if (err.request) {
        console.error("[LoginForm] No response received");
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else {
        console.error("[LoginForm] Request setup error:", err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      console.log("[LoginForm] Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        required
        disabled={loading}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        required
        disabled={loading}
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}