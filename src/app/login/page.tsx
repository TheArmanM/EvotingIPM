'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError('Username atau password salah.');
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md relative overflow-hidden">
        
        {/* Aksen garis kuning di bagian atas kartu */}
        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
        
        {/* Bagian Header / Logo Text */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <span className="text-2xl font-black text-slate-900 tracking-wider">IPM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">E-Vote Musyda</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">PD IPM Kabupaten Brebes</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors bg-white text-slate-900"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors bg-white text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3.5 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-yellow-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Pimpinan Daerah Ikatan Pelajar Muhammadiyah Kabupaten Brebes
          </p>
        </div>
      </div>
    </div>
  );
}