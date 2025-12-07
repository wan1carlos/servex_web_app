'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';

export default function DeliveryPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useDeliveryAuth();

  useEffect(() => {
    loadUser().then(() => {
      if (isAuthenticated) {
        router.push('/delivery/home');
      } else {
        router.push('/delivery/login');
      }
    });
  }, [isAuthenticated, router, loadUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}
