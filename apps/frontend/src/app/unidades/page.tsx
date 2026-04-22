'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnidadesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/config/unidades'); }, [router]);
  return null;
}
