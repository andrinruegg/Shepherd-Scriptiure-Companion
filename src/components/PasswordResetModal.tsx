
import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../services/supabase';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    setLoading(true);

    try {
        // Fix for TS18047: Assign to local variable to ensure type narrowing persists
        const client = supabase;
        if (!client) throw new Error("Database not connected");

        // Update the password
        const { error } = await client.auth.updateUser({ password: password });
        if (error) throw error;

        setSuccess(true);
        
        // Wait 2 seconds then sign out to force re-login with new password
        setTimeout(async () => {
            await client.auth.signOut();
            window.location.reload(); // Force reload to clear state and show login
        }, 2000);

    } catch (err: any) {
        setError(err.message || "Failed to update password.");
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl p-6 border border-stone-200 dark:border-stone-800 animate-scale-in">
        <div className="text-center mb-6">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-700 dark:text-amber-400">
                <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-white font-serif-text">Set New Password</h2>
            <p className="text-sm text-stone-500 mt-1">Please enter your new password below.</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        {success ? (
            <div className="text-center py-6">
                <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 mb-3">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Password Updated!</h3>
                <p className="text-stone-500 text-sm mt-2">Logging you out to sign in again...</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">New Password</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                        placeholder="••••••"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Confirm Password</label>
                    <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                        placeholder="••••••"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
