// src/components/auth/SignupForm.tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";

interface SignupFormProps {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[SignupForm] Form submitted");
    console.log("[SignupForm] Name:", name);
    console.log("[SignupForm] Email:", email);
    
    setError("");
    setLoading(true);

    try {
      console.log("[SignupForm] Calling API signup...");
      await apiService.signup({ name, email, password });
      console.log("[SignupForm] Signup successful");
      
      // Auto-login after signup
      console.log("[SignupForm] Auto-login after signup...");
      const loginResponse = await apiService.login({ email, password });
      console.log("[SignupForm] Auto-login successful");
      
      // Extract user info from token
      console.log("[SignupForm] Decoding JWT token...");
      const tokenParts = loginResponse.access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log("[SignupForm] Token payload decoded:", { 
        name: payload.name, 
        email: payload.email,
        sub: payload.sub 
      });
      
      const userName = payload.name || name;
      console.log("[SignupForm] Logging in user:", userName);
      login(userName, loginResponse.access_token);
      
      console.log("[SignupForm] Signup and login complete, calling onSuccess");
      onSuccess();
    } catch (err: any) {
      console.error("[SignupForm] Signup/Login failed");
      console.error("[SignupForm] Error object:", err);
      
      let errorMessage = "Signup failed. Please try again.";
      
      if (err.response) {
        console.error("[SignupForm] Response error:", {
          status: err.response.status,
          data: err.response.data
        });
        errorMessage = err.response.data?.detail || errorMessage;
      } else if (err.request) {
        console.error("[SignupForm] No response received");
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else {
        console.error("[SignupForm] Request setup error:", err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      console.log("[SignupForm] Setting loading to false");
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
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        required
        disabled={loading}
      />
      
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
        minLength={6}
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}