"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shield, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin-pulse-master';
  
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call RPC function to verify credentials
      const { data, error } = await supabase.rpc('verify_admin_login', {
        p_login: login,
        p_password: password,
      });

      if (error) throw error;

      if (data && data.length > 0 && data[0].success) {
        const { admin_id } = data[0];
        
        // Create session
        const { data: sessionData, error: sessionError } = await supabase.rpc('create_admin_session', {
          p_admin_id: admin_id,
        });

        if (sessionError) throw sessionError;

        // Set cookie
        document.cookie = `admin_token=${sessionData}; path=/; max-age=86400; SameSite=Strict`;
        
        // Log admin action
        await supabase.rpc('log_admin_action', {
          p_admin_id: admin_id,
          p_action: 'login',
          p_ip_address: 'client',
        });

        // Redirect
        router.push(redirect);
      } else {
        setError(data?.[0]?.message || 'Invalid credentials');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pulse Admin</h1>
          <p className="text-gray-400">Master Control Center</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <User size={16} className="inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-gray-500
                           focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50
                           transition-all"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500
                             focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50
                             transition-all pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/20 px-4 py-3 rounded-xl">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500
                         text-white font-bold rounded-xl
                         hover:from-purple-600 hover:to-pink-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-purple-500/30
                         hover:shadow-purple-500/50
                         transition-all duration-300 active:scale-98"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              <Lock size={12} className="inline mr-1" />
              Secure admin access. All actions are logged.
            </p>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Pulse App
          </a>
        </div>
      </div>
    </div>
  );
}
