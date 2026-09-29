'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function AuthGuard({ children, variant }: { children: ReactNode; variant: 'gestao' | 'servidor' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) return;
    const key = variant === 'gestao' ? 'gestor_logged' : 'servidor_logged';
    if (localStorage.getItem(key) !== 'true') {
      router.push(variant === 'gestao' ? '/gestao' : '/servidor');
      return;
    }
    setChecked(true);
  }, [variant, router, pathname, checked]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
