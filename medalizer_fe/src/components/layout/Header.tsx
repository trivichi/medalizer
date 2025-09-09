import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onOpenAuth: () => void;
}

export default function Header({ onOpenAuth }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="w-[92%] max-w-[1400px] mx-auto py-4 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-primary-500"
        >
          Blood Report Analyzer
        </motion.h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Features", "How it Works", "About"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="relative text-gray-600 hover:text-primary-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item}
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}

          {/* Auth Buttons */}
          {!user ? (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              Login / Sign Up
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hi, {user}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 text-gray-600 hover:text-primary-500"
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.nav
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg py-4 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col space-y-4">
              {["Features", "How it Works", "About"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-600 hover:text-primary-500 transition-colors py-2"
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}

              {!user ? (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-center"
                >
                  Login / Sign Up
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition text-center"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}
