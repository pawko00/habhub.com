import type { Metadata } from 'next';
import { LoginPage } from '@/components/Auth';

export const metadata: Metadata = {
  title: "Logowanie - habhub",
};

export default function Login() {
  return <LoginPage />;
}
