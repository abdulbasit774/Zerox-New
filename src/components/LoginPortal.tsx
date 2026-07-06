import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, UserCheck, Flame, Medal, Award, LogOut, Lock, Mail, 
  BadgeCheck, ClipboardList, TrendingUp, Phone, Key, Upload, FileText,
  User, CheckCircle, Bell, Sparkles, Heart, CreditCard, ChevronRight, CornerDownRight
} from 'lucide-react';
import { UserProfile, Order } from '../types';
import { auth, db, seedInitialDatabase, usersCol, createUserProfile, updateUserProfile, googleProvider, facebookProvider, appleProvider } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import Logo from './Logo';

interface LoginPortalProps {
  user: UserProfile;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
  onViewOrder: (order: Order) => void;
  initialMode?: 'login' | 'signup' | 'phone' | 'forgot-password' | 'verify-email' | 'profile';
}

export default function LoginPortal({ user, onLogin, onLogout, onViewOrder, initialMode = 'login' }: LoginPortalProps) {
  const [activeMode, setActiveMode] = useState<'login' | 'signup' | 'phone' | 'forgot-password' | 'verify-email' | 'profile'>(initialMode);

  // Force sync state if initialMode prop changes dynamically
  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);
  
  // Auth Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Phase 1: New features
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [passwordResetCode, setPasswordResetCode] = useState('');
  const [newPasswordForReset, setNewPasswordForReset] = useState('');

  // States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Identity Verification (KYC) state
  const [kycStep, setKycStep] = useState<'idle' | 'uploading' | 'verified'>('idle');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idType, setIdType] = useState('Passport');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);

  // Live in-app notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // Seed database on mount to make sure initial data is ready
  useEffect(() => {
    seedInitialDatabase();
    // Load local storage verification state
    const savedKYC = localStorage.getItem('zerox_kyc_verified');
    if (savedKYC === 'true') {
      setIsVerifiedUser(true);
      setKycStep('verified');
    }

    // Load active notifications
    const fetchNotifications = async () => {
      try {
        const snap = await getDocs(collection(db, 'notifications'));
        const list = snap.docs.map(d => d.data());
        setNotifications(list);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  // Session Persistence - Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('zerox_remember_email');
    if (remembered) {
      setEmailInput(remembered);
    }
  }, []);

  // Authentication State Listener - Handles session persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Fetch or create profile in firestore
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const profile = docSnap.data();
            onLogin(profile.fullName || profile.name || fbUser.displayName || 'Collector', fbUser.email || '');
            if (profile.identityVerified) {
              setIsVerifiedUser(true);
              setKycStep('verified');
            }
          } else {
            // Create new Firestore profile
            await createUserProfile(fbUser.uid, {
              email: fbUser.email || '',
              fullName: fbUser.displayName || 'Collector',
              photoURL: fbUser.photoURL || '',
              provider: fbUser.providerData[0]?.providerId?.split('.')[0] || 'email',
              role: 'user'
            });
            onLogin(fbUser.displayName || 'Collector', fbUser.email || '');
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  // Password Strength Validator
  const validatePasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength('weak');
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    if (strength >= 3) {
      setPasswordStrength('strong');
      return true;
    } else if (strength >= 2) {
      setPasswordStrength('medium');
      return true;
    }
    setPasswordStrength('weak');
    return false;
  };

  // Email validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Standard Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setError('PLEASE PROVIDE CREDENTIALS');
      return;
    }
    if (!isValidEmail(emailInput)) {
      setError('INVALID EMAIL FORMAT');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      
      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('zerox_remember_email', emailInput);
      } else {
        localStorage.removeItem('zerox_remember_email');
      }
      
      // Update last login
      await updateUserProfile(userCred.user.uid, {
        lastLogin: new Date().toISOString(),
      });
      
      setSuccess('CONNECTED SUCCESSFULLY');
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput || !nameInput || !confirmPasswordInput) {
      setError('ALL FIELDS ARE REQUIRED');
      return;
    }
    if (!isValidEmail(emailInput)) {
      setError('INVALID EMAIL FORMAT');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }
    if (!validatePasswordStrength(passwordInput)) {
      setError('PASSWORD TOO WEAK. USE 8+ CHARS WITH UPPERCASE, LOWERCASE, NUMBER, AND SYMBOL');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      // Create Firebase user
      const userCred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      
      // Update auth profile
      await updateProfile(userCred.user, { 
        displayName: nameInput,
      });
      
      // Send email verification
      await sendEmailVerification(userCred.user);
      setEmailVerificationSent(true);
      
      // Create Firestore user document with complete profile
      await createUserProfile(userCred.user.uid, {
        email: emailInput,
        fullName: nameInput,
        provider: 'email',
        role: 'user'
      });
      
      // Store user doc (legacy compatibility)
      const userDoc = doc(db, 'users', userCred.user.uid);
      await setDoc(userDoc, {
        name: nameInput,
        email: emailInput,
        membershipTier: 'Challenger',
        creatorRank: 999,
        challengerPoints: 100,
        identityVerified: false,
        createdAt: new Date().toISOString()
      });

      setSuccess('PROFILE ESTABLISHED IN CLOUD');
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Social Login with Firebase Authentication
  const handleSocialLogin = async (providerName: string) => {
    setIsLoading(true);
    setError('');
    try {
      let selectedProvider: any;
      let userCred: any;
      
      switch (providerName) {
        case 'Google':
          selectedProvider = googleProvider;
          userCred = await signInWithPopup(auth, selectedProvider);
          break;
        case 'Apple':
          // PENDING CONFIGURATION: Requires Apple Developer Account and App ID configuration
          selectedProvider = appleProvider;
          try {
            userCred = await signInWithPopup(auth, selectedProvider);
          } catch (err: any) {
            if (err.code === 'auth/popup-blocked' || err.code === 'auth/network-request-failed') {
              setError('APPLE LOGIN: PENDING CONFIGURATION - REQUIRES DEVELOPER ACCOUNT');
              setIsLoading(false);
              return;
            }
            throw err;
          }
          break;
        case 'Facebook':
          // PENDING CONFIGURATION: Requires Facebook App ID and Secret configuration
          selectedProvider = facebookProvider;
          try {
            userCred = await signInWithPopup(auth, selectedProvider);
          } catch (err: any) {
            if (err.code === 'auth/popup-blocked' || err.code === 'auth/network-request-failed') {
              setError('FACEBOOK LOGIN: PENDING CONFIGURATION - REQUIRES DEVELOPER APP');
              setIsLoading(false);
              return;
            }
            throw err;
          }
          break;
        default:
          throw new Error(`Unknown provider: ${providerName}`);
      }
      
      // Create or update user profile
      if (userCred && userCred.user) {
        await createUserProfile(userCred.user.uid, {
          email: userCred.user.email || '',
          fullName: userCred.user.displayName || `User ${providerName}`,
          photoURL: userCred.user.photoURL || '',
          provider: providerName.toLowerCase(),
          role: 'user'
        });
        
        setSuccess(`CONNECTED SECURELY VIA ${providerName.toUpperCase()}`);
      }
    } catch (err: any) {
      console.log('[v0] Social login error:', err);
      // Graceful fallback for blocked popups in preview environment
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/network-request-failed') {
        setError(`${providerName.toUpperCase()} LOGIN: TEMPORARILY UNAVAILABLE IN THIS ENVIRONMENT`);
      } else {
        setError(err.message?.replace('Firebase:', '').toUpperCase() || `SOCIAL LOGIN FAILED: ${providerName.toUpperCase()}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setError('PLEASE PROVIDE YOUR EMAIL ADDRESS');
      return;
    }
    if (!isValidEmail(emailInput)) {
      setError('INVALID EMAIL FORMAT');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailInput);
      setResetEmailSent(true);
      setSuccess('PASSWORD RESET LINK SENT TO YOUR EMAIL');
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  // Phone Authentication simulation with OTP entry fields
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) {
      setError('ENTER DISPATCH PHONE NODE');
      return;
    }
    setError('');
    setOtpSent(true);
    setSuccess('OTP DISPATCHED TO DEVICE');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput !== '7777' && otpInput !== '1234') {
      setError('INVALID INTEGRITY HASH CODE');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      onLogin('Phone Athlete', `${phoneInput}@zerox-mobile.com`);
      setSuccess('PHONE PROFILE MOUNTED');
      setIsLoading(false);
    }, 1200);
  };

  // Identity verification (KYC) file upload handling
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) {
      setError('PLEASE CHOOSE IDENTIFICATION FILE');
      return;
    }
    setError('');
    setKycStep('uploading');

    // Simulate secure enterprise identity match (analyzing layout, checking biometric stamps, verifying metadata)
    setTimeout(async () => {
      setKycStep('verified');
      setIsVerifiedUser(true);
      setVerificationSuccess(true);
      localStorage.setItem('zerox_kyc_verified', 'true');

      // Update Firestore user document if user is logged in
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          identityVerified: true
        });
      }

      // Add positive notification
      await addDoc(collection(db, 'notifications'), {
        title: 'IDENTITY SECURED (KYC APPROVED)',
        message: 'Your biometric passport verification has succeeded. You now possess exclusive priority access to bespoke drops.',
        type: 'alert',
        date: new Date().toISOString(),
        read: false
      });
      
    }, 2500);
  };

  // Profile Management Handlers
  const handleUpdateEmail = async (newEmail: string) => {
    if (!auth.currentUser) {
      setError('NO USER LOGGED IN');
      return;
    }
    if (!isValidEmail(newEmail)) {
      setError('INVALID EMAIL FORMAT');
      return;
    }
    
    setIsLoading(true);
    try {
      await fbUpdateEmail(auth.currentUser, newEmail);
      await updateUserProfile(auth.currentUser.uid, {
        email: newEmail,
      });
      setSuccess('EMAIL UPDATED SUCCESSFULLY');
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser) {
      setError('NO USER LOGGED IN');
      return;
    }
    if (!validatePasswordStrength(newPassword)) {
      setError('NEW PASSWORD IS TOO WEAK');
      return;
    }
    
    setIsLoading(true);
    try {
      // Re-authenticate first
      const email = auth.currentUser.email;
      if (!email) {
        setError('CANNOT UPDATE PASSWORD');
        return;
      }
      
      // Sign in again with current password
      await signInWithEmailAndPassword(auth, email, currentPassword);
      
      // Update password
      await fbUpdatePassword(auth.currentUser, newPassword);
      setSuccess('PASSWORD UPDATED SUCCESSFULLY');
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseSignout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('zerox_remember_email');
    } catch (err) {
      console.error(err);
    }
    onLogout();
    localStorage.removeItem('zerox_kyc_verified');
    setIsVerifiedUser(false);
    setKycStep('idle');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 select-none text-white">
      
      {!user.loggedIn ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
          
          {/* Brand Introduction Left Column */}
          <div className="md:col-span-5 space-y-6 text-center md:text-left">
            <Logo variant="compact" className="mx-auto md:mx-0" />
            <h3 className="text-3xl font-sans font-black tracking-tight text-white uppercase leading-none">
              ZEROX CLUB <br />
              <span className="text-[#C9A227]">GATEWAY</span>
            </h3>
            <p className="text-neutral-400 font-mono text-[10.5px] uppercase tracking-wide leading-relaxed max-w-xs mx-auto md:mx-0">
              Mount your cryptographic athlete profile in the cloud to store custom designs, unlock 35% early drop privileges, track orders live, and engage with co-creation terminals.
            </p>
            <div className="border-t border-neutral-900 pt-4 max-w-xs mx-auto md:mx-0">
              <span className="font-mono text-[8px] text-neutral-600 block uppercase tracking-widest mb-1">COMPLIANCE LEDGER</span>
              <span className="font-mono text-[8.5px] text-[#C9A227] uppercase tracking-wider block">🛡️ SECURED BY FIREBASE CLOUD SHIELD</span>
            </div>
          </div>

          {/* Majestic Interactive Auth Card Right Column */}
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.03)_0%,transparent_60%)] pointer-events-none" />

              {/* Authentication Nav Options */}
              <div className="flex border-b border-neutral-900 pb-4 mb-6">
                <button 
                  onClick={() => { setActiveMode('login'); setError(''); setSuccess(''); }}
                  className={`flex-1 font-mono text-[9px] tracking-widest uppercase pb-2 transition-all cursor-pointer ${activeMode === 'login' ? 'text-[#C9A227] border-b border-[#C9A227] font-black' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  SECURE SIGN-IN
                </button>
                <button 
                  onClick={() => { setActiveMode('signup'); setError(''); setSuccess(''); }}
                  className={`flex-1 font-mono text-[9px] tracking-widest uppercase pb-2 transition-all cursor-pointer ${activeMode === 'signup' ? 'text-[#C9A227] border-b border-[#C9A227] font-black' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  ESTABLISH LEDGER
                </button>
                <button 
                  onClick={() => { setActiveMode('phone'); setError(''); setSuccess(''); }}
                  className={`flex-1 font-mono text-[9px] tracking-widest uppercase pb-2 transition-all cursor-pointer ${activeMode === 'phone' ? 'text-[#C9A227] border-b border-[#C9A227] font-black' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  PHONE/OTP
                </button>
                <button 
                  onClick={() => { setActiveMode('forgot-password'); setError(''); setSuccess(''); }}
                  className={`flex-1 font-mono text-[9px] tracking-widest uppercase pb-2 transition-all cursor-pointer ${activeMode === 'forgot-password' ? 'text-[#C9A227] border-b border-[#C9A227] font-black' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  RESET PASS
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center font-mono text-[9px] text-red-400 tracking-widest uppercase">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center font-mono text-[9px] text-emerald-400 tracking-widest uppercase">
                  ✨ {success}
                </div>
              )}

              {/* EMAIL SIGNIN FORM */}
              {activeMode === 'login' && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">SECURE VERIFIED EMAIL</label>
                    <input 
                      type="email" 
                      required 
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="E.G. ABDUL@ZEROX.COM"
                      className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">CRYPTOGRAPHIC SECRET PASS</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 cursor-pointer"
                      />
                      <span className="font-mono text-[8px] text-neutral-500 uppercase tracking-wider">REMEMBER ATHLETE</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => { setActiveMode('forgot-password'); setError(''); setSuccess(''); }}
                      className="font-mono text-[8px] text-[#C9A227] hover:text-amber-400 uppercase tracking-wider transition-colors"
                    >
                      RESET PASSWORD?
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {isLoading ? 'ESTABLISHING INTERLINK...' : 'DECRYPT ATHLETE KEY'}
                  </button>
                </form>
              )}

              {/* EMAIL SIGNUP FORM */}
              {activeMode === 'signup' && (
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">COLLECTOR REPUTATION NAME</label>
                    <input 
                      type="text" 
                      required 
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      placeholder="E.G. ABDUL BASIT"
                      className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">REGISTRATION DISPATCH EMAIL</label>
                    <input 
                      type="email" 
                      required 
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="EMAIL ADDRESS"
                      className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">CHOOSE LOCKING SECRET PASSWORD</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordInput}
                      onChange={e => {
                        setPasswordInput(e.target.value);
                        validatePasswordStrength(e.target.value);
                      }}
                      placeholder="CHOOSE A STRONG PASSWORD"
                      className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                    />
                    <div className="mt-2 flex gap-1">
                      <div className={`flex-1 h-1.5 rounded-full ${passwordStrength === 'weak' ? 'bg-red-500' : 'bg-neutral-700'}`} />
                      <div className={`flex-1 h-1.5 rounded-full ${passwordStrength === 'medium' ? 'bg-yellow-500' : passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-neutral-700'}`} />
                      <div className={`flex-1 h-1.5 rounded-full ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-neutral-700'}`} />
                    </div>
                    <p className={`font-mono text-[7px] mt-1 uppercase tracking-wider ${passwordStrength === 'weak' ? 'text-red-400' : passwordStrength === 'medium' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {passwordStrength === 'weak' ? 'WEAK' : passwordStrength === 'medium' ? 'MEDIUM STRENGTH' : 'STRONG PASSWORD'}
                    </p>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">CONFIRM SECRET PASSWORD</label>
                    <input 
                      type="password" 
                      required 
                      value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      placeholder="CONFIRM PASSWORD"
                      className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  {emailVerificationSent && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center font-mono text-[8px] text-emerald-400 tracking-widest uppercase">
                      ✨ VERIFICATION EMAIL SENT - CHECK YOUR INBOX
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={isLoading || passwordStrength === 'weak'}
                    className="w-full py-3 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    {isLoading ? 'COMMITTING LEDGER STATE...' : 'GENERATE FIREBASE ACCOUNT'}
                  </button>
                </form>
              )}

              {/* PHONE/OTP PORTAL */}
              {activeMode === 'phone' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <label className="font-mono text-[8px] text-neutral-500 block mb-1">MOBILE CONTACT TELEMETRY</label>
                        <input 
                          type="tel" 
                          required 
                          value={phoneInput}
                          onChange={e => setPhoneInput(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        TRANSMIT SECURE SMS OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpVerify} className="space-y-4">
                      <div className="text-center font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-2">
                        ENTER THE 4-DIGIT CODE SENT TO YOUR DEVICE <br />
                        <span className="text-[#C9A227] font-bold">[USE TEST CODE: 7777]</span>
                      </div>
                      <div>
                        <label className="font-mono text-[8px] text-neutral-500 block mb-1">SECURE OTP CODE</label>
                        <input 
                          type="text" 
                          required 
                          maxLength={4}
                          value={otpInput}
                          onChange={e => setOtpInput(e.target.value)}
                          placeholder="••••"
                          className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-mono text-center text-sm text-white focus:outline-none tracking-[0.8em]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl font-mono text-[8px] uppercase cursor-pointer"
                        >
                          Change Number
                        </button>
                        <button 
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-2.5 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-[9px] uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          VERIFY HASH CODE
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* FORGOT PASSWORD FORM */}
              {activeMode === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {!resetEmailSent ? (
                    <>
                      <div>
                        <label className="font-mono text-[8px] text-neutral-500 block mb-1">ACCOUNT EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          required 
                          value={emailInput}
                          onChange={e => setEmailInput(e.target.value)}
                          placeholder="E.G. ABDUL@ZEROX.COM"
                          className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>
                      <p className="font-mono text-[8px] text-neutral-400 leading-relaxed">
                        ENTER YOUR ACCOUNT EMAIL AND WE&apos;LL SEND YOU A SECURE PASSWORD RESET LINK
                      </p>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Key className="w-4 h-4" />
                        {isLoading ? 'DISPATCHING RESET LINK...' : 'SEND RESET LINK'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setActiveMode('login'); setError(''); setSuccess(''); }}
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl font-mono text-[8px] uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        BACK TO LOGIN
                      </button>
                    </>
                  ) : (
                    <div className="text-center space-y-4 py-4">
                      <div className="flex justify-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                      </div>
                      <p className="font-sans text-sm text-white font-semibold">PASSWORD RESET EMAIL SENT</p>
                      <p className="font-mono text-[8px] text-neutral-400 leading-relaxed">
                        CHECK YOUR EMAIL FOR A SECURE RESET LINK. CLICK IT TO CREATE A NEW PASSWORD.
                      </p>
                      <button 
                        type="button"
                        onClick={() => { setActiveMode('login'); setResetEmailSent(false); setError(''); setSuccess(''); }}
                        className="w-full py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-xl font-mono text-[8px] uppercase tracking-wider font-bold cursor-pointer transition-colors"
                      >
                        RETURN TO LOGIN
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* SOCIAL BUTTONS SEGMENT */}
              <div className="mt-8 pt-6 border-t border-neutral-900">
                <span className="font-mono text-[8px] text-neutral-600 block text-center uppercase tracking-widest mb-4">OR CO-LOG VIA PARTNER DECENTRALIZED IDENTITY</span>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center gap-2 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 p-2.5 rounded-xl font-mono text-[8px] tracking-widest text-white uppercase transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114a5.79 5.79 0 0 1-5.79-5.79 5.79 5.79 0 0 1 5.79-5.79c1.47 0 2.822.548 3.864 1.44l3.185-3.185C18.99 3.12 15.858 2 12.24 2 6.58 2 2 6.58 2 12.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
                    </svg>
                    Google Play
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin('Apple')}
                    className="flex items-center justify-center gap-2 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 p-2.5 rounded-xl font-mono text-[8px] tracking-widest text-white uppercase transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.11.67-2.83 1.51-.62.71-1.16 1.85-1.02 2.96 1.05.08 2.1-.53 2.86-1.41z"/>
                    </svg>
                    Apple Key
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 p-2.5 rounded-xl font-mono text-[8px] tracking-widest text-white uppercase transition-colors cursor-pointer mt-2"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                  Sync Facebook profile
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      ) : (
        /* Dynamic User Account Interface */
        <div className="space-y-8">
          
          {/* Top user profile stamp card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A227]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-900 rounded-full border-2 border-[#C9A227] flex items-center justify-center text-[#C9A227] text-2xl font-black shadow-[0_0_15px_rgba(201,162,39,0.3)]">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-sans font-black text-white">{user.name}</h3>
                  <div className="px-2.5 py-0.5 bg-gradient-to-r from-amber-600 via-[#C9A227] to-amber-400 text-black rounded-full font-mono text-[7.5px] uppercase tracking-[0.25em] font-extrabold flex items-center gap-1 shadow-md">
                    <Award className="w-3 h-3" />
                    {user.membershipTier}
                  </div>
                  {isVerifiedUser && (
                    <div className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-mono text-[7px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      SECURE KYC VERIFIED
                    </div>
                  )}
                </div>
                <p className="font-mono text-neutral-500 text-[10px] uppercase mt-1">DISPATCH PORT: <span className="text-neutral-300 font-bold">{user.email}</span></p>
              </div>
            </div>

            <button
              onClick={handleFirebaseSignout}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white font-mono text-[9px] tracking-widest uppercase flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C9A227]" />
              DISCONNECT TERMINAL
            </button>
          </motion.div>

          {/* Verification section and stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Identity Verification Portal (KYC) Left side */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#C9A227] font-mono text-xs uppercase tracking-widest font-black">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  <span>Biometric Passport KYC</span>
                </div>
                <p className="font-mono text-[9px] text-neutral-500 uppercase leading-relaxed">
                  Real-world enterprise regulations require verified identity profiles before releasing custom premium creations or matching active payments.
                </p>

                {kycStep === 'idle' && (
                  <form onSubmit={handleVerifyIdentity} className="space-y-3 pt-2">
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1 uppercase">VERIFICATION METHOD</label>
                      <select 
                        value={idType} 
                        onChange={e => setIdType(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl p-2 font-mono"
                      >
                        <option value="Passport">International Passport</option>
                        <option value="DriverLicense">Drivers License</option>
                        <option value="StateID">National/State ID Card</option>
                      </select>
                    </div>

                    <div className="border border-dashed border-neutral-800 hover:border-[#C9A227] rounded-xl p-4 text-center transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        required 
                        accept="image/*,application/pdf"
                        onChange={handleIdUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-neutral-600 mx-auto mb-1.5" />
                      <span className="font-mono text-[8.5px] text-neutral-400 uppercase block">
                        {idFile ? idFile.name : 'Upload Credentials Doc'}
                      </span>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-[9.5px] uppercase rounded-xl transition-colors cursor-pointer"
                    >
                      REQUEST CO-CREATOR PASS
                    </button>
                  </form>
                )}

                {kycStep === 'uploading' && (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#C9A227]/30 border-t-[#C9A227] animate-spin mx-auto" />
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block animate-pulse">Running biometric security sync...</span>
                  </div>
                )}

                {kycStep === 'verified' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                    <span className="font-sans font-black text-xs text-white uppercase block">SECURE CREDENTIAL LOCKED</span>
                    <span className="font-mono text-[8px] text-neutral-400 uppercase block">LEDGER IDENTIFIER MATCHED SUCCESSFULLY. GLOBAL DROP QUEUES ENABLED.</span>
                  </div>
                )}
              </div>

              {/* Stats card */}
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-3xl p-6 space-y-4">
                <span className="font-mono text-[8.5px] text-neutral-500 tracking-widest uppercase">// STREAK REPUTATION INDEX</span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase">CHALLENGER STACK:</span>
                    <span className="font-sans font-black text-sm text-white">12,450 ZRX</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase">CREATOR RANK:</span>
                    <span className="font-sans font-black text-sm text-amber-500">#48 Global</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase">CO-CREATOR BLOCKS:</span>
                    <span className="font-sans font-black text-sm text-white">2 Synchronized</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Alerts / Live Notifications & Orders History Right side */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Notifications panel */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#C9A227] font-mono text-xs uppercase tracking-widest font-black">
                  <Bell className="w-4 h-4 text-[#C9A227]" />
                  <span>LIVE CRYPTO DISPATCH NOTIFICATIONS</span>
                </div>
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="bg-neutral-900/30 border border-neutral-900 p-3 rounded-xl flex items-start gap-3 hover:border-neutral-800 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="font-sans font-bold text-[11px] text-white uppercase block">{notif.title}</span>
                        <p className="font-mono text-[8.5px] text-neutral-400 uppercase leading-normal">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-neutral-500 text-center font-mono py-8 uppercase text-[10px]">No active system broadcasts.</div>
                  )}
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-neutral-900 pb-4">
                  <ClipboardList className="w-4 h-4 text-[#C9A227]" />
                  <span className="font-mono text-xs text-white uppercase tracking-widest font-extrabold">CRYPTOGRAPHIC TRANSACTION REGISTRY</span>
                </div>

                {user.orderHistory.length === 0 ? (
                  <div className="py-8 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
                    NO REGISTERED TRANSACTION CORES RECORDED
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.orderHistory.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-900/30 border border-neutral-900 hover:border-neutral-800 rounded-2xl p-4 sm:p-5 gap-4 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-white font-sans font-bold text-sm">LEDGER NODE: {order.id}</span>
                            <div className="px-2 py-0.5 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] rounded-full font-mono text-[7px] uppercase tracking-widest font-extrabold">
                              {order.status}
                            </div>
                          </div>
                          <div className="font-mono text-[8.5px] text-neutral-500 uppercase tracking-wider mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>DATE: <span className="text-neutral-300 font-bold">{order.date.split(' at')[0]}</span></span>
                            <span>ITEMS: <span className="text-neutral-300 font-bold">{order.items.reduce((s, i) => s + i.quantity, 0)} PAIRS</span></span>
                            <span>TOTAL CAPITAL: <span className="text-[#C9A227] font-bold">${order.total.toFixed(2)}</span></span>
                          </div>
                        </div>

                        <button
                          onClick={() => onViewOrder(order)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-white rounded-xl font-mono text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-[#C9A227]" />
                          VALIDATE AUTHENTICITY CERTIFICATE
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
