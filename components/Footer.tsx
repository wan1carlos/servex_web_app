'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useEffect, useState } from 'react';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">ServEx</h3>
            <p className="text-gray-400 text-sm">
              Your trusted on-demand service and delivery platform. Order from your favorite stores and get it delivered to your doorstep.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-blue-400"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-400"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-400"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/home" className="hover:text-white">Home</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-gray-400">
              {!isAuthenticated && (
                <>
                  <li><Link href="/login" className="hover:text-white">Login</Link></li>
                  <li><Link href="/signup" className="hover:text-white">Sign Up</Link></li>
                </>
              )}
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-white">My Orders</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@servex.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">123 Main St, City, Country</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ServEx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
