'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, MapPin, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useCart } from '@/lib/cart-store';
import { useApp } from '@/lib/app-store';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { count, items, initializeCart, getCartCount } = useCart();
  const { currentAddress } = useApp();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeCart();
    // Call getCartCount with error handling
    getCartCount().catch((error) => {
      console.log('Cart count fetch failed, continuing with count=0');
    });
  }, [initializeCart, getCartCount]);

  // Periodically refresh cart count until items are loaded, then stop
  useEffect(() => {
    if (!mounted) return;

    let intervalId: any = null;
    const shouldPoll = !Array.isArray(items) || items.length === 0;

    if (shouldPoll) {
      intervalId = setInterval(() => {
        getCartCount().catch(() => {});
      }, 10000); // every 10s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [mounted, items, getCartCount]);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-pink-600">ServEx</div>
          </Link>

          {/* Location - Only show on home page */}
          {pathname === '/home' && (
            <Link 
              href="/location" 
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-pink-600"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm truncate max-w-xs">{currentAddress}</span>
            </Link>
          )}

          {/* Navigation - Only show for non-authenticated users on landing page */}
          {!isAuthenticated && pathname === '/' && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/about" 
                className="hover:text-pink-600 text-gray-600"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="hover:text-pink-600 text-gray-600"
              >
                Contact
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart - Only show when authenticated */}
            {isAuthenticated && (
              <Link href="/cart" className="relative hover:text-pink-600">
                <ShoppingCart className="w-6 h-6" />
                {(Array.isArray(items) && items.length > 0) || count > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Array.isArray(items) && items.length > 0 ? items.length : count}
                  </span>
                ) : null}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 hover:text-pink-600"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden md:inline text-sm">{user.name}</span>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <Link 
                      href="/account" 
                      className="block px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : pathname !== '/login' && pathname !== '/signup' && (
              <Link 
                href="/login" 
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
