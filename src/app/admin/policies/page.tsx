'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPoliciesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-[#8C827A] flex items-center justify-center">
      <span>Redirigiendo al panel administrativo...</span>
    </div>
  );
}
