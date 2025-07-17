import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import UnauthenticatedLanding from '../components/UnauthenticatedLanding';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return null;
  }

  return <UnauthenticatedLanding />;
}
