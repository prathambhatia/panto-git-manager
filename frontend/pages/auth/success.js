import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Success(){
  const router = useRouter();
  useEffect(() => {
    const t = router.query.token;
    if (t) {
      localStorage.setItem('token', t);
      router.replace('/repos');
    }
  }, [router.query]);
  return <div style={{padding:24}}>Logging you in...</div>;
}
