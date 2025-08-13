// components/Layout.tsx
import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}