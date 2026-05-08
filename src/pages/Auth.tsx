import React from 'react';
import { auth, db } from '../lib/firebase.ts';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserProfile } from '../types.ts';

export default function Auth() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check for existing profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create initial profile
        const isAdminEmail = user.email === 'vedantkasaudhan0@gmail.com';
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'New Business Partner',
          email: user.email || '',
          role: isAdminEmail ? 'admin' : 'customer',
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
      }
      
      const isAdminAfterAuth = user.email === 'vedantkasaudhan0@gmail.com' || userDoc.data()?.role === 'admin';
      navigate(isAdminAfterAuth ? '/admin' : '/catalog');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-10 bg-paper">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-12 rounded-[40px] border border-slate-100 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-saffron/10 rounded-full blur-2xl"></div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-saffron rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-saffron/20 rotate-3">
            <span className="text-white font-bold text-3xl font-serif">J</span>
          </div>
          <h2 className="text-4xl font-serif font-bold italic text-slate-800 mb-3">Partner Portal</h2>
          <p className="text-slate-500 text-sm mb-12 leading-relaxed px-10">
            Secure access for authorized retail partners of Jay Shree Ram Distributors.
          </p>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-4 bg-white border border-slate-200 text-slate-800 py-4 rounded-full font-bold hover:border-saffron hover:bg-orange-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {loading ? 'AUTHENTICATING...' : 'SIGN IN WITH GOOGLE'}
          </button>
          
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">
              <span className="bg-white px-6">Official Network</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              New business partner? <br />
              <span className="text-saffron cursor-pointer hover:underline">Download Verification Forms</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
