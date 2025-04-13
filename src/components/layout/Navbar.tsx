import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Bell, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export function Navbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-8 h-8 text-pink-500" />
            </motion.div>
            <span className="text-xl font-bold text-white">BlindDate</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-white hover:text-pink-400 transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </motion.button>

              <Link
                to="/profile"
                className="flex items-center space-x-2 text-white hover:text-pink-400 transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="hidden md:block">Profile</span>
              </Link>

              <button className="md:hidden text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-pink-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}