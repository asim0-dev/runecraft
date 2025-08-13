// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-yellow-500">
          Dank Memer Proto
        </Link>
        <div className="space-x-4">
          <Link href="/gameplay" className="text-gray-300 hover:text-white transition-colors duration-200">
            Play
          </Link>
          <Link href="/market" className="text-gray-300 hover:text-white transition-colors duration-200">
            Market
          </Link>
          <Link href="/chat" className="text-gray-300 hover:text-white transition-colors duration-200">
            Chat
          </Link>
        </div>
      </div>
    </nav>
  );
}