import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Crown,
  Settings,
  Award,
  Heart,
} from 'lucide-react';

const navItems = [
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/premium', icon: Crown, label: 'Premium' },
  { to: '/achievements', icon: Award, label: 'Achievements' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/5 backdrop-blur-lg border-r border-white/10">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-pink-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center space-x-3"
                  initial={false}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-4 text-white">
            <Crown className="w-8 h-8 mb-2" />
            <h3 className="font-bold mb-1">Upgrade to Premium</h3>
            <p className="text-sm opacity-90">
              Get unlimited matches and exclusive features
            </p>
            <button className="mt-3 w-full bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}