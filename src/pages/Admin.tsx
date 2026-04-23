import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  getDoc,
  setDoc,
  getDocs,
  deleteField
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Trash2, 
  Save,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Globe,
  X,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Users,
  UserPlus,
  User,
  PlayCircle,
  Info,
  Sparkles,
  Plus,
  Minus,
  GraduationCap,
  Baby,
  FileUp
} from 'lucide-react';
import { DEFAULT_CONFIG, deepMergeConfig, migrateConfig } from '../lib/constants';
import toast, { Toaster } from 'react-hot-toast';

// Base administrator emails for initial setup (Bootstrap)
const BOOTSTRAP_ADMINS = ['teamind50@gmail.com', 'budmantzvi@gmail.com', 'budmantz@gmail.com'];

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [authorizedAdmins, setAuthorizedAdmins] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Global Settings']));
  
  // Base administrator emails handled outside component for stability

  const toggleSection = (title: string) => {
    const newSections = new Set(openSections);
    if (newSections.has(title)) {
      newSections.delete(title);
    } else {
      newSections.add(title);
    }
    setOpenSections(newSections);
  };
  
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const toggleMessage = (id: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMessages(newExpanded);
  };
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<any>({});
  const [dataLoading, setDataLoading] = useState({ contacts: true, orders: true, config: true });
  const [dataError, setDataError] = useState<string | null>(null);
  const [siteConfig, setSiteConfig] = useState<any>(DEFAULT_CONFIG);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const fetchedTabs = useRef<Set<string>>(new Set());
  const adminFetched = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        setIsAuthorized(false);
        setConfigLoading(false);
        adminFetched.current = false; // Reset so next person can check auth
      }
    });
    
    return () => unsubscribe();
  }, []);

  // One-time auth check logic
  useEffect(() => {
    if (!user || adminFetched.current) return;
    
    const checkAuth = async () => {
      adminFetched.current = true;
      if (!user.email) {
        setIsAuthorized(false);
        setConfigLoading(false);
        return;
      }

      const lowerEmail = user.email.toLowerCase().trim();
      const isBootstrap = BOOTSTRAP_ADMINS.includes(lowerEmail);

      try {
        // 1. First, establish current user authorization via specific doc check
        const userAdminDoc = await getDoc(doc(db, 'admins', lowerEmail));
        const isDbAdmin = userAdminDoc.exists();
        
        const authorized = isBootstrap || isDbAdmin;
        setIsAuthorized(authorized);

        if (authorized) {
          // 2. Only if authorized, fetch the full list for the UI
          const snap = await getDocs(collection(db, 'admins'));
          const adminList = snap.docs.map(d => ({ email: d.id.toLowerCase(), ...d.data() }));
          setAuthorizedAdmins(adminList);
          
          // Auto-persist bootstrap admins for consistency
          if (isBootstrap && !isDbAdmin) {
            await setDoc(doc(db, 'admins', lowerEmail), {
              addedBy: 'system-bootstrap',
              addedAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // If we can't fetch the list but we are bootstrap, we stay authorized
        setIsAuthorized(isBootstrap);
      } finally {
        setConfigLoading(false);
      }
    };

    checkAuth();
  }, [user]);

  // Lazy load data based on active tab to save Firestore quota
  useEffect(() => {
    if (!user || !isAuthorized) return;
    
    let unsubContacts: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    
    if (activeTab === 'contacts' && !fetchedTabs.current.has('contacts')) {
      fetchedTabs.current.add('contacts');
      setDataLoading(prev => ({ ...prev, contacts: true }));
      unsubContacts = onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')), (snap) => {
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setDataLoading(prev => ({ ...prev, contacts: false }));
      }, (err: any) => {
        console.error("Error fetching contacts realtime:", err);
        setDataError(err.code === 'resource-exhausted' ? "Daily limit reached." : "Failed to load contacts.");
        setDataLoading(prev => ({ ...prev, contacts: false }));
      });
    }
    
    if (activeTab === 'orders' && !fetchedTabs.current.has('orders')) {
      fetchedTabs.current.add('orders');
      setDataLoading(prev => ({ ...prev, orders: true }));
      unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setDataLoading(prev => ({ ...prev, orders: false }));
      }, (err: any) => {
        console.error("Error fetching orders realtime:", err);
        setDataError(err.code === 'resource-exhausted' ? "Daily limit reached." : "Failed to load orders.");
        setDataLoading(prev => ({ ...prev, orders: false }));
      });
    }

    return () => {
      // We don't unsubscribe immediately on tab change to keep the listeners active once started
    };
  }, [user, isAuthorized, activeTab]);

  useEffect(() => {
    if (!user || !isAuthorized) return;
    if (!(activeTab === 'content' || activeTab === 'images' || activeTab === 'dashboard')) return;
    
    if (fetchedTabs.current.has('config')) return;
    fetchedTabs.current.add('config');

    setDataLoading(prev => ({ ...prev, config: true }));
    
    const unsubConfig = onSnapshot(doc(db, 'config', 'site'), (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      if (snap.exists()) {
        const data = snap.data();
        const { images: _ign, ...rest } = data;
        setSiteConfig(deepMergeConfig(DEFAULT_CONFIG, migrateConfig(rest)));
      }
      setDataLoading(prev => ({ ...prev, config: false }));
    }, (err) => {
      console.error("Config fetch error:", err);
      if (err.code === 'resource-exhausted') {
        setDataError("Daily database limit reached (Quota Exceeded).");
      }
      setDataLoading(prev => ({ ...prev, config: false }));
    });

    const unsubImages = onSnapshot(collection(db, 'siteImages'), (snap) => {
      const images: any = {};
      snap.forEach(doc => {
        images[doc.id] = doc.data().url;
      });
      setSiteImages(images);
    }, (err) => {
      console.error("Images fetch error:", err);
    });

    return () => {
      unsubConfig();
      unsubImages();
      fetchedTabs.current.delete('config'); 
    };
  }, [user, isAuthorized, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!navigator.onLine) {
      return setAuthError("No internet connection. Please check your network.");
    }
    
    const lowEmail = email.toLowerCase().trim();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, lowEmail, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        setAuthSuccess('Please verify your email to access the dashboard.');
        await sendEmailVerification(user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Try Login with Google or reset your password.');
      } else {
        setAuthError('Login failed: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!navigator.onLine) return setAuthError("No internet connection.");
    
    const lowEmail = email.toLowerCase().trim();
    if (password.length < 6) return setAuthError("Password must be at least 6 characters.");

    try {
      // 1. Mandatory Pre-check: Only pre-authorized emails can register
      const isBootstrap = BOOTSTRAP_ADMINS.includes(lowEmail);
      let isAuthorized = isBootstrap;
      
      if (!isBootstrap) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', lowEmail));
          if (adminDoc.exists()) isAuthorized = true;
        } catch (docErr) {
          console.error("Admin pre-check failed:", docErr);
          // If we can't check the whitelist due to permissions, and it's not a bootstrap admin, we have to block
          return setAuthError("Access denied. Could not verify administrator authorization.");
        }
      }
      
      if (!isAuthorized) {
        return setAuthError("Access denied. This email is not authorized to register as an administrator.");
      }

      // 2. Handle Re-registration (if account exists but they were "rejected" and now re-authorized)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, lowEmail, password);
        await sendEmailVerification(userCredential.user);
        setAuthSuccess('Account created! Please check your email and click the verification link to complete registration.');
        setIsRegistering(false);
        await signOut(auth);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // If the account already exists, they might just need to login
          setAuthError('This email is already registered in our system. Please try logging in instead. If you were recently added back as an admin, your old account will now work.');
        } else {
          throw authErr;
        }
      }
    } catch (err: any) {
      console.error(err);
      setAuthError('Registration failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setAuthSuccess('Verification email sent!');
      } catch (err: any) {
        setAuthError('Failed to send verification email.');
      }
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToAdd = newAdminEmail.toLowerCase().trim();
    if (!emailToAdd) return;
    
    setIsAddingAdmin(true);
    const loadingToast = toast.loading('Adding admin...');
    try {
      await setDoc(doc(db, 'admins', emailToAdd), {
        addedBy: user.email,
        addedAt: new Date().toISOString()
      });
      toast.success('Admin added successfully', { id: loadingToast });
      setAuthorizedAdmins(prev => [...prev, { email: emailToAdd, addedBy: user.email, addedAt: new Date().toISOString() }]);
      setNewAdminEmail('');
    } catch (err: any) {
      toast.error('Failed to add admin: ' + err.message, { id: loadingToast });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    const targetEmail = emailToRemove.toLowerCase().trim();
    const isSelf = user?.email?.toLowerCase() === targetEmail;
    
    if (!window.confirm(isSelf ? "Are you sure you want to remove yourself from being an admin?" : `Are you sure you want to revoke access for ${emailToRemove}?`)) return;

    const loadingToast = toast.loading('Revoking access...');
    try {
      await deleteDoc(doc(db, 'admins', targetEmail));
      toast.success('Access revoked', { id: loadingToast });
      setAuthorizedAdmins(prev => prev.filter(a => a.email !== targetEmail));
      if (isSelf) {
        await signOut(auth);
      }
    } catch (err: any) {
      console.error("Revoke failed:", err);
      toast.error("Failed to remove admin: " + (err.message || err.code), { id: loadingToast });
    }
  };

  const handleAdminPasswordReset = async (email: string) => {
    const loadingToast = toast.loading('Sending reset link...');
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Reset link sent', { id: loadingToast });
    } catch (err: any) {
      toast.error('Failed to send reset link: ' + err.message, { id: loadingToast });
    }
  };

  const handleResetPassword = async () => {
    const lowEmail = email.toLowerCase().trim();
    setAuthError(null);
    setAuthSuccess(null);
    if (!lowEmail) return setAuthError('Please enter your email address in the field above.');
    if (!navigator.onLine) return setAuthError("No internet connection.");
    
    try {
      await sendPasswordResetEmail(auth, lowEmail);
      setAuthSuccess('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      let message = 'Failed to send reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      }
      setAuthError(message);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!navigator.onLine) return setAuthError("No internet connection.");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Login cancelled.');
      } else {
        setAuthError('Google login failed: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    const loadingToast = toast.loading('Deleting contact...');
    try {
      await deleteDoc(doc(db, 'contacts', id));
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact deleted', { id: loadingToast });
    } catch (err: any) {
      console.error("Delete contact error:", err);
      toast.error(err.message || 'Error deleting contact', { id: loadingToast });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    const loadingToast = toast.loading('Deleting order...');
    try {
      await deleteDoc(doc(db, 'orders', id));
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Order deleted', { id: loadingToast });
    } catch (err: any) {
      console.error("Delete order error:", err);
      toast.error(err.message || 'Error deleting order', { id: loadingToast });
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    if (isNaN(date.getTime())) return 'N/A';
    return `${date.toLocaleDateString('he-IL')} | ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleUpdateConfig = async (newConfig: any, silent = true) => {
    let loadingToast;
    if (!silent) loadingToast = toast.loading('Saving changes...');
    try {
      // Deep sanitize to prevent undefined fields in Firestore
      const sanitize = (obj: any): any => {
        if (obj === undefined) return null;
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(v => sanitize(v)).filter(v => v !== undefined);
        const cleaned: any = {};
        for (const k in obj) {
          const v = sanitize(obj[k]);
          if (v !== undefined) cleaned[k] = v;
        }
        return cleaned;
      };

      // Ensure we don't save the images object back to the main config
      const { images, ...configToSave } = newConfig;
      const finalConfig = sanitize(configToSave);
      
      await setDoc(doc(db, 'config', 'site'), finalConfig);
      if (!silent) toast.success('Changes saved successfully', { id: loadingToast });
    } catch (err: any) {
      console.error("Error updating config:", err);
      if (err.code === 'resource-exhausted') {
        toast.error('Daily limit reached. Changes not saved.', { id: loadingToast });
      } else {
        toast.error('Failed to save: ' + err.message, { id: loadingToast });
      }
    }
  };

  const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.65)); // Compress slightly more to speed up loading
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        let loadingToast;
        try {
          loadingToast = toast.loading('Compressing and uploading...');
          const compressed = await compressImage(base64String);
          
          // Save to separate collection to avoid 1MB document limit
          await setDoc(doc(db, 'siteImages', field), { 
            url: compressed,
            updatedAt: new Date().toISOString()
          });
          
          toast.success('Image updated successfully', { id: loadingToast });
        } catch (err: any) {
          console.error("Error uploading image:", err);
          toast.error('Failed to upload image', { id: loadingToast });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestimonialImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        let loadingToast;
        try {
          loadingToast = toast.loading('Uploading profile picture...');
          const compressed = await compressImage(base64String, 400, 400); 
          
          const newList = [...siteConfig.testimonials];
          newList[index].image = compressed;
          const newConfig = { ...siteConfig, testimonials: newList };
          setSiteConfig(newConfig);
          handleUpdateConfig(newConfig, true);
          
          toast.success('Profile picture updated successfully', { id: loadingToast });
        } catch (err: any) {
          toast.error('Failed to upload image', { id: loadingToast });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (field: string, value: string) => {
    let finalValue: any = value;
    if (field === 'kitPrice') {
      if (value === '') {
        finalValue = '';
      } else {
        const num = Number(value);
        if (!isNaN(num)) finalValue = num;
      }
    }
    
    // Safety: don't save if no change
    if (siteConfig?.[field] === finalValue) return;

    // 1. Update local state immediately for snappy UI
    const newConfig = { ...siteConfig, [field]: finalValue };
    setSiteConfig(newConfig);

    // 2. Debounce the Firestore save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      // Don't save empty string for price
      if (field === 'kitPrice' && (finalValue === '' || isNaN(finalValue))) {
        return; 
      }
      handleUpdateConfig(newConfig, true);
    }, 3000); // Increased to 3 seconds to save quota
  };

  const handleNestedTextChange = (parent: string, field: string, value: string) => {
    // 1. Update local state immediately
    const newConfig = {
      ...siteConfig,
      [parent]: { ...siteConfig?.[parent], [field]: value }
    };
    setSiteConfig(newConfig);

    // 2. Debounce the Firestore save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleUpdateConfig(newConfig, true);
    }, 1000);
  };

  const handleListChange = (listName: string, index: number, field: string, value: string) => {
    const newList = [...(siteConfig?.[listName] || [])];
    if (newList[index]) {
      newList[index] = { ...newList[index], [field]: value };
      const newConfig = { ...siteConfig, [listName]: newList };
      setSiteConfig(newConfig);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        handleUpdateConfig(newConfig, true);
      }, 1000);
    }
  };

  if (loading || configLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-teal-600" /></div>;

  const isUserAuthorized = isAuthorized;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-[48px] shadow-2xl p-12 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold mb-2">{isRegistering ? 'Admin Registration' : 'Admin Login'}</h1>
            <p className="text-slate-500 font-medium">{isRegistering ? 'Create your authorized account' : 'Access your dashboard'}</p>
          </div>
          
          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-3 text-rose-600 text-xs font-bold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{authError}</p>
              </motion.div>
            )}
            {authSuccess && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-3 text-emerald-600 text-xs font-bold"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{authSuccess}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-full focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold" placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-full focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-brand-green text-white font-black rounded-full hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20">
              {isRegistering ? 'Create Account' : 'Login'}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-300 font-bold tracking-widest">Or</span></div>
            </div>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-full hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200/50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
              {isRegistering ? 'Register with Google' : 'Login with Google'}
            </button>
            <div className="flex flex-col gap-4 text-center">
              {!isRegistering && (
                <button type="button" onClick={handleResetPassword} className="text-xs font-bold text-slate-400 hover:text-brand-green transition-colors">Forgot Password?</button>
              )}
              <div className="h-px bg-slate-100 w-full" />
              <p className="text-xs font-medium text-slate-400">
                {isRegistering ? 'Already have an account?' : 'Need to register authorized email?'}
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)} 
                  className="ml-2 text-brand-green font-black hover:underline"
                >
                  {isRegistering ? 'Login here' : 'Register here'}
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!isUserAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 w-full">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-[48px] shadow-2xl p-12 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-4">Access Denied</h2>
          <div className="space-y-4 mb-8">
            <p className="text-slate-500 font-medium leading-relaxed">
              The email <span className="text-slate-900 font-bold">{user.email}</span> is not authorized to access this dashboard.
            </p>
            {!user.emailVerified && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold">
                Note: Your email is not verified. Please verify your email first.
              </div>
            )}
            <p className="text-xs text-slate-400">
              User ID: <span className="font-mono">{user.uid.substring(0, 8)}...</span>
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => {
                adminFetched.current = false;
                window.location.reload();
              }}
              className="w-full py-4 bg-teal-600 text-white font-black rounded-full hover:bg-teal-700 transition-all shadow-lg"
            >
              Refresh Authorization
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-full hover:bg-slate-200 transition-all"
            >
              Sign Out & Try Another Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 w-full">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-[48px] shadow-2xl p-12 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
            <Mail className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-4">Email Verification Required</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            We've sent a verification link to <span className="text-slate-900 font-bold">{user.email}</span>. 
            Please check your inbox and confirm your address to continue.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleResendVerification}
              className="w-full py-4 bg-brand-green text-white font-black rounded-full hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20"
            >
              Resend Verification Email
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-full hover:bg-slate-50 transition-all"
            >
              Log Out
            </button>
          </div>
          <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Refresh page after verifying
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen">
      <Toaster position="bottom-right" toastOptions={{ className: 'font-bold' }} />
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-6 md:p-8 sticky top-0 z-40">
        {dataError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-bold text-rose-600 leading-tight">
                {dataError}
              </p>
            </div>
          </div>
        )}
        <div className="mb-8 md:mb-12 flex justify-between items-start">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-green">Admin Panel</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">TEAMIND Dashboard</p>
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${dataError ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)} 
            className="p-3 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all flex items-center gap-2 shadow-sm shadow-rose-500/10"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Logout</span>
          </button>
        </div>
        
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 no-scrollbar">
          {[
            { id: 'contacts', label: 'Contacts', icon: MessageSquare },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'content', label: 'Content', icon: Settings },
            { id: 'images', label: 'Images', icon: ImageIcon },
            { id: 'admins', label: 'Admins', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === tab.id ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto overflow-x-hidden">
        {/* dataError display removed per user request */}

        <AnimatePresence mode="wait">
          {activeTab === 'contacts' && (
            <motion.div key="contacts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-slate-900">Contact Inquiries</h3>
                <span className="px-4 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-black uppercase tracking-widest">
                  {dataLoading.contacts ? 'Loading...' : `${contacts.length} Total`}
                </span>
              </div>

              {dataLoading.contacts ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[40px]" />
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <div className="bg-white rounded-[40px] p-12 text-center border-2 border-dashed border-slate-100">
                  <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No inquiries found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {contacts.map((c) => (
                  <div key={c.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green font-black text-xl">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg leading-tight">{c.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedContact(c)} className="p-3 text-brand-green bg-brand-green/10 rounded-2xl hover:bg-brand-green/20 transition-colors" title="View Details"><MessageSquare className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteContact(c.id)} className="p-3 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors" title="Delete"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>

                      <div className="space-y-4 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                            <a 
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${c.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-green font-bold hover:underline break-all"
                            >
                              {c.email}
                            </a>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                            <p className="text-slate-700 font-bold">{c.phone || 'N/A'}</p>
                          </div>
                        </div>

                      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</p>
                        <div className="relative">
                          <p className={`text-slate-700 font-medium leading-relaxed whitespace-pre-wrap break-words ${expandedMessages.has(c.id) ? '' : 'line-clamp-4'}`}>
                            {c.message}
                          </p>
                          {c.message.length > 150 && (
                            <button 
                              onClick={() => toggleMessage(c.id)}
                              className="text-brand-green text-xs font-bold mt-3 hover:underline flex items-center gap-1"
                            >
                              {expandedMessages.has(c.id) ? 'Show Less' : 'Read Full Message'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Modal */}
              <AnimatePresence>
                {selectedContact && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedContact(null)}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl p-12 overflow-hidden"
                    >
                      <button 
                        onClick={() => setSelectedContact(null)}
                        className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <div className="space-y-8">
                        <div>
                          <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2">Contact Details</p>
                          <h2 className="text-3xl font-serif font-bold text-slate-900">{selectedContact.name}</h2>
                          <p className="text-slate-500">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                            <a 
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedContact.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xl font-bold text-teal-600 hover:underline"
                            >
                              {selectedContact.email}
                            </a>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                            <p className="text-xl font-bold text-slate-900">{selectedContact.phone || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Message</p>
                          <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 max-h-[40vh] overflow-y-auto">
                            <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                              {selectedContact.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <a 
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedContact.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-4 bg-brand-green text-white font-black rounded-full text-center hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20"
                          >
                            Reply via Gmail
                          </a>
                          <button 
                            onClick={() => setSelectedContact(null)}
                            className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-full hover:bg-slate-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Program Orders</h3>
                  <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                    {dataLoading.orders ? 'Loading...' : `${orders.length} Total`}
                  </span>
                </div>
                <div className="relative w-full md:w-96">
                  <input 
                    type="text" 
                    placeholder="Search by ID, Name or Email..." 
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-sm"
                  />
                  <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {dataLoading.orders ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[40px]" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-[40px] p-12 text-center border-2 border-dashed border-slate-100">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No orders found.</p>
                </div>
              ) : (
                <>
                  {orders.filter(o => {
                    const search = (orderSearchTerm || '').toLowerCase().trim().replace('#', '');
                    const id = (o.orderId || '').toLowerCase().replace('#', '');
                    const name = (o.customerName || '').toLowerCase();
                    const email = (o.customerEmail || '').toLowerCase();
                    return id.includes(search) || name.includes(search) || email.includes(search);
                  }).length === 0 ? (
                    <div className="bg-white rounded-[40px] p-12 text-center border-2 border-dashed border-slate-100">
                      <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">No orders match your search.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {orders
                        .filter(o => {
                          const search = (orderSearchTerm || '').toLowerCase().trim().replace('#', '');
                          const id = (o.orderId || '').toLowerCase().replace('#', '');
                          const name = (o.customerName || '').toLowerCase();
                          const email = (o.customerEmail || '').toLowerCase();
                          return id.includes(search) || name.includes(search) || email.includes(search);
                        })
                        .map((o) => (
                          <div key={o.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 leading-tight truncate">{o.customerName}</h4>
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 truncate">
                                    {formatDate(o.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteOrder(o.id)} className="p-2 md:p-3 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors shrink-0"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-3xl mb-6">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
                              <p className="text-sm font-mono font-bold text-white tracking-wider" dir="ltr">#{o.orderId?.replace('order_', '') || 'N/A'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                              <div className="p-3 md:p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Program</p>
                                {(() => {
                                  const Icon = ((pName: any) => {
                                    const p = String(pName || '').toLowerCase();
                                    if (p.includes('early') || p.includes('childhood') || p.includes('3-6')) return Baby;
                                    if (p.includes('elementary') || p.includes('6-12')) return GraduationCap;
                                    if (p.includes('parent')) return Users;
                                    return ShoppingBag;
                                  })(o.program);
                                  return (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-500 truncate w-full px-1">{String(o.program || '')}</span>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="p-3 md:p-4 bg-teal-50 rounded-3xl border border-teal-100 flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Amount</p>
                                <p className="text-sm md:text-base font-black text-teal-700">₪{String(o.amount || '0')}</p>
                              </div>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                              <div className="p-3 md:p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping Address</p>
                                {o.shippingAddress ? (
                                  <p className="text-xs md:text-sm font-bold text-slate-700 leading-snug">
                                    {o.shippingAddress.street} {o.shippingAddress.houseNumber}
                                    {o.shippingAddress.apartment && `, דירה ${o.shippingAddress.apartment}`}
                                    <br />
                                    {o.shippingAddress.city} {o.shippingAddress.zipCode && `(${o.shippingAddress.zipCode})`}
                                  </p>
                                ) : (
                                  <p className="text-xs md:text-sm font-bold text-slate-400 italic">No address provided</p>
                                )}
                              </div>
                              <div className="p-3 md:p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Email</p>
                                <a 
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${o.customerEmail}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-600 font-bold hover:underline text-xs md:text-sm break-all"
                                >
                                  {o.customerEmail}
                                </a>
                              </div>
                              <div className="p-3 md:p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                <p className="text-xs md:text-sm font-bold text-slate-700">{o.phone || 'N/A'}</p>
                              </div>
                              <div className="flex justify-center">
                                <span className="px-6 py-2 bg-teal-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-600/20">{o.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 pb-24">
              <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-serif font-bold text-slate-900">Content Management</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-500">Website Default Language:</span>
                  <button
                    onClick={async () => {
                      const current = siteConfig?.defaultLanguage || 'he';
                      const next = current === 'he' ? 'en' : 'he';
                      const newConfig = { ...siteConfig, defaultLanguage: next };
                      setSiteConfig(newConfig);
                      
                      // MUST await the update before reloading
                      await handleUpdateConfig(newConfig, true);
                      
                      localStorage.setItem('i18nextLng', next);
                      localStorage.removeItem('user_language_override'); 
                      window.location.reload(); 
                    }}
                    className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
                      (siteConfig?.defaultLanguage || 'he') === 'he'
                        ? 'bg-brand-pink text-white shadow-lg shadow-pink-500/20'
                        : 'bg-brand-light-blue text-white shadow-lg shadow-teal-500/20'
                    }`}
                  >
                    {(siteConfig?.defaultLanguage || 'he') === 'he' ? 'Hebrew' : 'English'}
                  </button>
                </div>
              </div>

              {[
                {
                  title: "Global Settings",
                  icon: Globe,
                  fields: [
                    { id: 'contactEmail', label: 'Contact Email', type: 'text' },
                    { id: 'contactPhone', label: 'Contact Phone', type: 'text' },
                    { id: 'navBtnText', label: 'Nav Button Text', type: 'text' },
                    { id: 'tagline', label: 'Logo Tagline', type: 'text' },
                    { id: 'footerText', label: 'Footer Description', type: 'textarea' },
                  ]
                },
                {
                  title: "Hero",
                  icon: LayoutDashboard,
                  fields: [
                    { id: 'heroBadge', label: 'Badge', type: 'text' },
                    { id: 'heroTitle', label: 'Title', type: 'text' },
                    { id: 'heroSubtitle', label: 'Subtitle', type: 'textarea' },
                    { id: 'heroBtnPrimary', label: 'Primary Button', type: 'text' },
                    { id: 'heroBtnSecondary', label: 'Secondary Button', type: 'text' },
                  ]
                },
                {
                  title: "Video",
                  icon: PlayCircle,
                  fields: [
                    { id: 'videoBadge', label: 'Badge', type: 'text' },
                    { id: 'videoTitle', label: 'Title', type: 'text' },
                    { id: 'videoSubtitle', label: 'Subtitle', type: 'textarea' },
                  ]
                },
                {
                  title: "About",
                  icon: Info,
                  fields: [
                    { id: 'aboutTitle', label: 'Title', type: 'text' },
                    { id: 'aboutText', label: 'Main Text', type: 'textarea' },
                    { id: 'aboutSubtext', label: 'Subtext', type: 'textarea' },
                    { id: 'aboutFootnote', label: 'Footnote', type: 'textarea' },
                  ]
                },
                {
                  title: "Why Teamind",
                  icon: Info,
                  fields: [
                    { id: 'whyTitle', label: 'Section Title', type: 'text' },
                    { id: 'whySubtitle', label: 'Section Subtitle', type: 'textarea' },
                  ]
                },
                {
                  title: "Programs (Home)",
                  icon: LayoutDashboard,
                  fields: [
                    { id: 'programsTitle', label: 'Section Title', type: 'text' },
                    { id: 'programsSubtitle', label: 'Section Subtitle', type: 'textarea' },
                  ]
                },
                {
                  title: "Characters",
                  icon: Users,
                  fields: [
                    { id: 'charactersTitle', label: 'Section Title', type: 'text' },
                    { id: 'charactersSubtitle', label: 'Section Subtitle', type: 'textarea' },
                  ]
                },
                {
                  title: "Success Stories",
                  icon: MessageSquare,
                  fields: [
                    { id: 'successStoriesTitle', label: 'Section Title', type: 'text' },
                  ]
                },
                {
                  title: "Founders",
                  icon: Users,
                  fields: [
                    { id: 'foundersTitle', label: 'Section Title', type: 'text' },
                    { id: 'foundersSubtitle', label: 'Section Subtitle', type: 'textarea' },
                  ]
                },
                {
                  title: "Faq",
                  icon: Settings,
                  fields: [
                    { id: 'faqTitle', label: 'Section Title', type: 'text' },
                  ]
                },
                {
                  title: "Early Childhood Program",
                  icon: Settings,
                  isProgramPage: true,
                  progKey: 'earlyChildhood',
                  fields: []
                },
                {
                  title: "Elementary Program",
                  icon: Settings,
                  isProgramPage: true,
                  progKey: 'elementary',
                  fields: []
                },
                {
                  title: "Parents Program",
                  icon: Settings,
                  isProgramPage: true,
                  progKey: 'parents',
                  fields: []
                },
                {
                  title: "Contact",
                  icon: MessageSquare,
                  fields: [
                    { id: 'contactTitle', label: 'Title', type: 'text' },
                    { id: 'contactSubtitle', label: 'Subtitle', type: 'textarea' },
                  ]
                },
              ].map((section: any) => (
                <div key={section.title} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <button 
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between p-10 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                        <section.icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-serif font-bold text-slate-900">{section.title}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    {section.title !== "Global Settings" && (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-xl">
                        <input 
                          type="checkbox" 
                          checked={siteConfig?.['show' + section.title.replace(/\s+/g, '')] !== false}
                          onChange={(e) => {
                            const flag = 'show' + section.title.replace(/\s+/g, '');
                            const newConfig = {...siteConfig, [flag]: e.target.checked};
                            setSiteConfig(newConfig);
                            handleUpdateConfig(newConfig, true);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-teal-600 cursor-pointer"
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Visible</span>
                      </div>
                    )}
                    {openSections.has(section.title) ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
                  </div>
                </button>
                  
                  {openSections.has(section.title) && (
                    <div className="p-10 pt-0 space-y-8">
                      <div className="border-t border-slate-50 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {section.fields.map((field) => {
                          const heId = field.id + '_he';
                          const skipHebrew = ['contactEmail', 'contactPhone'].includes(field.id);
                          
                          return (
                          <React.Fragment key={field.id}>
                            <div className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''} ${skipHebrew ? 'md:col-span-2' : ''}`}>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{field.label} {skipHebrew ? '' : '(EN)'}</label>
                              {field.type === 'textarea' ? (
                                <textarea 
                                  value={siteConfig?.[field.id] || ''} 
                                  onChange={(e) => handleTextChange(field.id, e.target.value)}
                                  className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[32px] font-bold h-32 resize-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                                />
                              ) : (
                                <input 
                                  type="text" 
                                  value={siteConfig?.[field.id] || ''} 
                                  onChange={(e) => handleTextChange(field.id, e.target.value)}
                                  className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                                />
                              )}
                            </div>
                            
                            {!skipHebrew && (
                              <div className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`} dir="rtl">
                                <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest mr-4 inline-block">{field.label} (עברית)</label>
                                {field.type === 'textarea' ? (
                                  <textarea 
                                    value={siteConfig?.[heId] || ''} 
                                    onChange={(e) => handleTextChange(heId, e.target.value)}
                                    className="w-full px-8 py-4 bg-pink-50/30 border border-pink-100 rounded-[32px] font-bold h-32 resize-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                                  />
                                ) : (
                                  <input 
                                    type="text" 
                                    value={siteConfig?.[heId] || ''} 
                                    onChange={(e) => handleTextChange(heId, e.target.value)}
                                    className="w-full px-8 py-4 bg-pink-50/30 border border-pink-100 rounded-full font-bold focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                                  />
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        )})}

                        {section.title === "Success Stories" && (
                          <div className="md:col-span-2 space-y-6">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest">Manage Testimonials</h5>
                              <button 
                                onClick={() => {
                                  const newList = [...(siteConfig.testimonials || [])];
                                  newList.push({ name: "New Person", role: "Role", text: "Testimonial text...", image: "https://i.pravatar.cc/150" });
                                  const newConfig = {...siteConfig, testimonials: newList};
                                  setSiteConfig(newConfig);
                                  handleUpdateConfig(newConfig, true);
                                }}
                                className="px-4 py-2 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-100"
                              >
                                <Plus className="w-3 h-3" /> Add Testimonial
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {(siteConfig.testimonials || []).map((t: any, idx: number) => (
                                <div key={idx} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4 relative group">
                                  <button 
                                    onClick={() => {
                                      const newList = siteConfig.testimonials.filter((_: any, i: number) => i !== idx);
                                      const newConfig = {...siteConfig, testimonials: newList};
                                      setSiteConfig(newConfig);
                                      handleUpdateConfig(newConfig, true);
                                    }}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                                      <input 
                                        value={t.name}
                                        onChange={(e) => handleListChange('testimonials', idx, 'name', e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                                      <input 
                                        value={t.role}
                                        onChange={(e) => handleListChange('testimonials', idx, 'role', e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL</label>
                                      <div className="relative">
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={(e) => handleTestimonialImageUpload(e, idx)}
                                          className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <button className="flex items-center gap-1 text-[9px] font-black text-teal-600 uppercase tracking-widest hover:underline">
                                          <FileUp className="w-3 h-3" /> Upload File
                                        </button>
                                      </div>
                                    </div>
                                    <input 
                                      value={t.image}
                                      onChange={(e) => {
                                        const newList = [...siteConfig.testimonials];
                                        newList[idx].image = e.target.value;
                                        setSiteConfig({...siteConfig, testimonials: newList});
                                      }}
                                      onBlur={() => handleUpdateConfig(siteConfig, true)}
                                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Testimonial</label>
                                    <textarea 
                                      value={t.text}
                                      onChange={(e) => handleListChange('testimonials', idx, 'text', e.target.value)}
                                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[24px] text-xs font-bold outline-none h-24 resize-none"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.title === "Founders" && (
                          <div className="md:col-span-2 space-y-6">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest">Manage Founders</h5>
                              <button onClick={() => {
                                const newList = [...(siteConfig.foundersMembers || [])];
                                newList.push({ name: "Founder Name", role: "Title", desc: "Bio...", name_he: "", role_he: "", desc_he: "", stats: [], image: "" });
                                const newConfig = {...siteConfig, foundersMembers: newList};
                                setSiteConfig(newConfig);
                                handleUpdateConfig(newConfig, true);
                              }} className="px-4 py-2 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-100">
                                <Plus className="w-3 h-3" /> Add Founder
                              </button>
                            </div>
                            <div className="space-y-6">
                              {(siteConfig.foundersMembers || []).map((f: any, idx: number) => (
                                <div key={idx} className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6 relative group">
                                  <button onClick={() => {
                                    const newList = siteConfig.foundersMembers.filter((_: any, i: number) => i !== idx);
                                    const newConfig = {...siteConfig, foundersMembers: newList};
                                    setSiteConfig(newConfig);
                                    handleUpdateConfig(newConfig, true);
                                  }} className="absolute top-4 right-4 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (EN)</label>
                                        <input value={f.name} onChange={(e) => handleListChange('foundersMembers', idx, 'name', e.target.value)} className="w-full px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold outline-none" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role (EN)</label>
                                        <input value={f.role} onChange={(e) => handleListChange('foundersMembers', idx, 'role', e.target.value)} className="w-full px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold outline-none" />
                                      </div>
                                    </div>
                                    <div className="space-y-4" dir="rtl">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">שם (HE)</label>
                                        <input value={f.name_he} onChange={(e) => handleListChange('foundersMembers', idx, 'name_he', e.target.value)} className="w-full px-6 py-3 bg-pink-50/30 border border-pink-100 rounded-full text-sm font-bold outline-none" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">תפקיד (HE)</label>
                                        <input value={f.role_he} onChange={(e) => handleListChange('foundersMembers', idx, 'role_he', e.target.value)} className="w-full px-6 py-3 bg-pink-50/30 border border-pink-100 rounded-full text-sm font-bold outline-none" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio (EN)</label>
                                      <textarea value={f.desc} onChange={(e) => handleListChange('foundersMembers', idx, 'desc', e.target.value)} className="w-full px-6 py-3 bg-white border border-slate-200 rounded-[32px] text-sm font-bold h-32 resize-none outline-none" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">ביו/תיאור (HE)</label>
                                      <textarea value={f.desc_he} onChange={(e) => handleListChange('foundersMembers', idx, 'desc_he', e.target.value)} className="w-full px-6 py-3 bg-pink-50/30 border border-pink-100 rounded-[32px] text-sm font-bold h-32 resize-none outline-none" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {section.title === "Global Settings" && (
                          <div className="md:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Kit Price (₪)</p>
                                <input 
                                  type="number" 
                                  value={siteConfig?.kitPrice ?? 799} 
                                  onChange={(e) => handleTextChange('kitPrice', e.target.value)} 
                                  placeholder="799"
                                  className="w-full px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-sm outline-none focus:border-teal-500" 
                                />
                                <p className="text-[10px] text-slate-400 font-medium px-4">
                                  This price will be used across all kits on the checkout page.
                                </p>
                              </div>
                            </div>
                            
                             <div className="space-y-4 pt-4 border-t border-slate-200">
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Notifications</p>
                               <div className="flex flex-col gap-4">
                                 <div className="flex items-center gap-4">
                                   <select 
                                     value={siteConfig?.emailNotifications || 'both'} 
                                     onChange={(e) => handleTextChange('emailNotifications', e.target.value)} 
                                     className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-sm outline-none focus:border-teal-500 min-w-[200px]"
                                   >
                                     <option value="both">Send to Both (Team & Sender)</option>
                                     <option value="admin">Send to Team Only</option>
                                     <option value="sender">Send to Sender Only</option>
                                     <option value="none">No Email Notifications</option>
                                   </select>
                                   <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Who receives the email?</span>
                                 </div>
                                 
                                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                   <div className="flex justify-between items-center">
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient List (Team)</p>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => {
                                            const contact = siteConfig.contactEmail?.toLowerCase();
                                            const admins = authorizedAdmins.map(a => a.email.toLowerCase());
                                            const all = Array.from(new Set([...(contact ? [contact] : []), ...admins]));
                                            const newConfig = {...siteConfig, notificationAdmins: all};
                                            setSiteConfig(newConfig);
                                            handleUpdateConfig(newConfig, true);
                                          }}
                                          className="text-[10px] font-black text-teal-600 uppercase"
                                        >Select All</button>
                                        <button 
                                          onClick={() => {
                                            const newConfig = {...siteConfig, notificationAdmins: []};
                                            setSiteConfig(newConfig);
                                            handleUpdateConfig(newConfig, true);
                                          }}
                                          className="text-[10px] font-black text-slate-400 uppercase"
                                        >Clear</button>
                                      </div>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                     {/* Combined List of All Potential Recipients */}
                                     {Array.from(new Set([
                                       ...(siteConfig.contactEmail ? [siteConfig.contactEmail.toLowerCase()] : []),
                                       ...authorizedAdmins.map(a => a.email.toLowerCase())
                                     ])).map((email) => {
                                       const isPrimary = email === siteConfig.contactEmail?.toLowerCase();
                                       const isSelected = (siteConfig?.notificationAdmins || []).some((e: string) => e.toLowerCase() === email);
                                       
                                       return (
                                         <button 
                                           key={email}
                                           onClick={() => {
                                             const current = siteConfig?.notificationAdmins || [];
                                             const next = current.some((e: string) => e.toLowerCase() === email) 
                                               ? current.filter((e: string) => e.toLowerCase() !== email)
                                               : [...current, email];
                                             const newConfig = {...siteConfig, notificationAdmins: next};
                                             setSiteConfig(newConfig);
                                             handleUpdateConfig(newConfig, true);
                                           }}
                                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                                             isSelected
                                               ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold shadow-sm'
                                               : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                           }`}
                                         >
                                           <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                              isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-200'
                                           }`}>
                                             {isSelected && <CheckCircle2 size={8} className="text-white"/>}
                                           </div>
                                           <div className="flex flex-col items-start leading-none">
                                              <span className="text-xs">{email}</span>
                                              {isPrimary && <span className="text-[7px] font-black text-teal-400 uppercase mt-0.5">Global Contact</span>}
                                           </div>
                                         </button>
                                       );
                                     })}
                                   </div>
                                   {(siteConfig?.notificationAdmins || []).length === 0 && (
                                      <p className="text-[10px] text-amber-600 font-bold italic px-1">
                                        Note: If no recipients are selected, notifications will fallback to the Primary Contact Email.
                                      </p>
                                   )}
                                 </div>
                               </div>
                             </div>

                             <div className="space-y-4 pt-4 border-t border-slate-200">
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Notifications</p>
                               <div className="flex flex-col gap-4">
                                 <div className="flex items-center gap-4">
                                   <select 
                                     value={siteConfig?.orderNotifications || 'both'} 
                                     onChange={(e) => handleTextChange('orderNotifications', e.target.value)}
                                     className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-sm outline-none focus:border-teal-500 min-w-[200px]"
                                   >
                                     <option value="both">Send to Both (Team & Customer)</option>
                                     <option value="admin">Send to Team Only</option>
                                     <option value="customer">Send to Customer Only</option>
                                     <option value="none">No Email Notifications</option>
                                   </select>
                                   <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Who receives the email?</span>
                                 </div>

                                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                   <div className="flex justify-between items-center">
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient List (Team)</p>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => {
                                            const contact = siteConfig.contactEmail?.toLowerCase();
                                            const admins = authorizedAdmins.map(a => a.email.toLowerCase());
                                            const all = Array.from(new Set([...(contact ? [contact] : []), ...admins]));
                                            const newConfig = {...siteConfig, orderNotificationAdmins: all};
                                            setSiteConfig(newConfig);
                                            handleUpdateConfig(newConfig, true);
                                          }}
                                          className="text-[10px] font-black text-teal-600 uppercase"
                                        >Select All</button>
                                        <button 
                                          onClick={() => {
                                            const newConfig = {...siteConfig, orderNotificationAdmins: []};
                                            setSiteConfig(newConfig);
                                            handleUpdateConfig(newConfig, true);
                                          }}
                                          className="text-[10px] font-black text-slate-400 uppercase"
                                        >Clear</button>
                                      </div>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                     {/* Combined List of All Potential Recipients */}
                                     {Array.from(new Set([
                                       ...(siteConfig.contactEmail ? [siteConfig.contactEmail.toLowerCase()] : []),
                                       ...authorizedAdmins.map(a => a.email.toLowerCase())
                                     ])).map((email) => {
                                       const isPrimary = email === siteConfig.contactEmail?.toLowerCase();
                                       const isSelected = (siteConfig?.orderNotificationAdmins || []).some((e: string) => e.toLowerCase() === email);
                                       
                                       return (
                                         <button 
                                           key={email}
                                           onClick={() => {
                                             const current = siteConfig?.orderNotificationAdmins || [];
                                             const next = current.some((e: string) => e.toLowerCase() === email) 
                                               ? current.filter((e: string) => e.toLowerCase() !== email)
                                               : [...current, email];
                                             const newConfig = {...siteConfig, orderNotificationAdmins: next};
                                             setSiteConfig(newConfig);
                                             handleUpdateConfig(newConfig, true);
                                           }}
                                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                                             isSelected
                                               ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold shadow-sm'
                                               : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                           }`}
                                         >
                                           <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                              isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-200'
                                           }`}>
                                             {isSelected && <CheckCircle2 size={8} className="text-white"/>}
                                           </div>
                                           <div className="flex flex-col items-start leading-none">
                                              <span className="text-xs">{email}</span>
                                              {isPrimary && <span className="text-[7px] font-black text-teal-400 uppercase mt-0.5">Global Contact</span>}
                                           </div>
                                         </button>
                                       );
                                     })}
                                   </div>
                                   {(siteConfig?.orderNotificationAdmins || []).length === 0 && (
                                      <p className="text-[10px] text-amber-600 font-bold italic px-1">
                                        Note: If no recipients are selected, notifications will fallback to the Primary Contact Email.
                                      </p>
                                   )}
                                 </div>
                               </div>
                             </div>
                          </div>
                        )}

                        {section.title === "Why Teamind" && (
                          <div className="md:col-span-2 space-y-6">
                            <h5 className="font-bold text-slate-800 border-b pb-2">Why TEAMIND Cards (3 Items)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(siteConfig?.whyCards || []).map((card: any, idx: number) => (
                                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                  <div className="space-y-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title (EN)</label>
                                      <input value={card.title} onChange={(e) => handleListChange('whyCards', idx, 'title', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold outline-none" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">כותרת (HE)</label>
                                      <input value={card.title_he} onChange={(e) => handleListChange('whyCards', idx, 'title_he', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-full text-sm font-bold outline-none" />
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description (EN)</label>
                                      <textarea value={card.desc} onChange={(e) => handleListChange('whyCards', idx, 'desc', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none h-20 resize-none" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">תיאור (HE)</label>
                                      <textarea value={card.desc_he} onChange={(e) => handleListChange('whyCards', idx, 'desc_he', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-2xl text-sm font-bold outline-none h-20 resize-none" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.title === "Faq" && (
                          <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h5 className="font-bold text-slate-800">FAQ Management</h5>
                              <button onClick={() => {
                                const newList = [...(siteConfig.faqs || []), { question: "New Question", answer: "New Answer", question_he: "", answer_he: "" }];
                                setSiteConfig({...siteConfig, faqs: newList});
                                handleUpdateConfig({...siteConfig, faqs: newList}, true);
                              }} className="px-4 py-2 bg-teal-600 text-white rounded-full text-xs font-bold hover:bg-teal-700 transition-colors">
                                + Add FAQ
                              </button>
                            </div>
                            <div className="space-y-6">
                              {(siteConfig?.faqs || []).map((faq: any, idx: number) => (
                                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative group">
                                  <button onClick={() => {
                                    const newList = siteConfig.faqs.filter((_: any, i: number) => i !== idx);
                                    setSiteConfig({...siteConfig, faqs: newList});
                                    handleUpdateConfig({...siteConfig, faqs: newList}, true);
                                  }} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question (EN)</label>
                                      <input value={faq.question} onChange={(e) => handleListChange('faqs', idx, 'question', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold outline-none" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">שאלה (HE)</label>
                                      <input value={faq.question_he} onChange={(e) => handleListChange('faqs', idx, 'question_he', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-full text-sm font-bold outline-none" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Answer (EN)</label>
                                      <textarea value={faq.answer} onChange={(e) => handleListChange('faqs', idx, 'answer', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none h-20 resize-none" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">תשובה (HE)</label>
                                      <textarea value={faq.answer_he} onChange={(e) => handleListChange('faqs', idx, 'answer_he', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-2xl text-sm font-bold outline-none h-20 resize-none" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.title === "Programs (Home)" && (
                          <div className="md:col-span-2 space-y-8 pt-8 border-t border-slate-50">
                            <h5 className="font-bold text-slate-800 border-b pb-2">Home Page Flip Cards Settings</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {['earlyChildhood', 'elementary', 'parents'].map((prog) => {
                                const prog_he = prog + '_he';
                                return (
                                <div key={prog} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                  <h6 className="font-bold text-teal-600 capitalize pr-2">{prog.replace(/([A-Z])/g, ' $1')}</h6>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title (EN)</label>
                                    <input value={siteConfig?.[prog]?.title || ''} onChange={(e) => handleNestedTextChange(prog, 'title', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold outline-none" />
                                  </div>
                                  <div className="space-y-1" dir="rtl">
                                    <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">כותרת (HE)</label>
                                    <input value={siteConfig?.[prog_he]?.title || ''} onChange={(e) => handleNestedTextChange(prog_he, 'title', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-full text-sm font-bold outline-none" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back Text (EN)</label>
                                    <textarea value={siteConfig?.[prog]?.cardDescription || ''} onChange={(e) => handleNestedTextChange(prog, 'cardDescription', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none h-20 resize-none" />
                                  </div>
                                  <div className="space-y-1" dir="rtl">
                                    <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest">טקסט אחורי (HE)</label>
                                    <textarea value={siteConfig?.[prog_he]?.cardDescription || ''} onChange={(e) => handleNestedTextChange(prog_he, 'cardDescription', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-2xl text-sm font-bold outline-none h-20 resize-none" />
                                  </div>
                                </div>
                              )})}
                            </div>
                          </div>
                        )}

                        {section.isProgramPage && (
                          <div className="md:col-span-2 space-y-8 pt-8 border-t border-slate-50">
                            <h5 className="font-bold text-slate-800 border-b pb-2 capitalize">{section.progKey.replace(/([A-Z])/g, ' $1')} Page Detailed Content</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {[
                                { id: 'title', label: 'Page Hero Title', type: 'text' },
                                { id: 'subtitle', label: 'Page Hero Subtitle', type: 'textarea' },
                                { id: 'description', label: 'Summary Description', type: 'textarea' },
                                { id: 'detailsTitle', label: 'Main Content Title', type: 'text' },
                                { id: 'kitTitle', label: 'Kit Section Title', type: 'text' },
                                { id: 'kitSubtitle', label: 'Kit Section Subtitle', type: 'text' },
                                { id: 'investTitle', label: 'Invest Section Title', type: 'text' },
                                { id: 'investSubtitle', label: 'Invest Section Subtitle', type: 'textarea' },
                              ].map((field) => (
                                <React.Fragment key={field.id}>
                                  <div className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{field.label} (EN)</label>
                                    {field.type === 'textarea' ? (
                                      <textarea value={siteConfig?.[section.progKey]?.[field.id] || ''} onChange={(e) => handleNestedTextChange(section.progKey, field.id, e.target.value)} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[32px] font-bold h-24 resize-none outline-none" />
                                    ) : (
                                      <input type="text" value={siteConfig?.[section.progKey]?.[field.id] || ''} onChange={(e) => handleNestedTextChange(section.progKey, field.id, e.target.value)} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold outline-none" />
                                    )}
                                  </div>
                                  <div className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`} dir="rtl">
                                    <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest mr-4 inline-block">{field.label} (HE)</label>
                                    {field.type === 'textarea' ? (
                                      <textarea value={siteConfig?.[section.progKey + '_he']?.[field.id + '_he'] || siteConfig?.[section.progKey + '_he']?.[field.id] || ''} onChange={(e) => handleNestedTextChange(section.progKey + '_he', field.id + (field.id === 'description' || field.id === 'title' || field.id === 'subtitle' ? '' : '_he'), e.target.value)} className="w-full px-8 py-4 bg-pink-50/30 border border-pink-100 rounded-[32px] font-bold h-24 resize-none outline-none" />
                                    ) : (
                                      <input type="text" value={siteConfig?.[section.progKey + '_he']?.[field.id + '_he'] || siteConfig?.[section.progKey + '_he']?.[field.id] || ''} onChange={(e) => handleNestedTextChange(section.progKey + '_he', field.id + (field.id === 'title' || field.id === 'subtitle' ? '' : '_he'), e.target.value)} className="w-full px-8 py-4 bg-pink-50/30 border border-pink-100 rounded-full font-bold outline-none" />
                                    )}
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.title === "Characters" && (
                          <div className="md:col-span-2 space-y-8 pt-8 border-t border-slate-50">
                            <div className="flex justify-between items-center bg-slate-100 p-6 rounded-3xl">
                              <h5 className="font-bold text-slate-800">Characters Content Management</h5>
                              <button 
                                onClick={async () => {
                                  if (!window.confirm("This will reset all character names and descriptions to their original state in both languages. Continue?")) return;
                                  const newConfig = {
                                    ...siteConfig,
                                    charactersList: DEFAULT_CONFIG.charactersList,
                                    charactersList_he: DEFAULT_CONFIG.charactersList_he
                                  };
                                  setSiteConfig(newConfig);
                                  await handleUpdateConfig(newConfig, false);
                                }}
                                className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-100"
                              >
                                Reset Characters to Defaults
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {[0, 1, 2, 3, 4, 5].map((idx) => {
                                const char = (siteConfig?.charactersList || [])[idx] || DEFAULT_CONFIG.charactersList[idx] || {};
                                const char_he = (siteConfig?.charactersList_he || [])[idx] || DEFAULT_CONFIG.charactersList_he[idx] || {};
                                
                                const labels = [
                                  "Leader (Brainman)", 
                                  "Steering (Driver Dan)", 
                                  "Ladder (Lenny)", 
                                  "Camera (Moni Matzlemoni)", 
                                  "Mirror (Libi HaMareh)", 
                                  "Stop Sign (Tom HaTamrur)"
                                ];

                                return (
                                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative">
                                  <div className="absolute top-4 right-6 text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">Slot #{idx + 1}</div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                    <h6 className="text-xs font-black text-teal-600 uppercase tracking-widest">{labels[idx]}</h6>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Name (EN)</label>
                                      <input value={char.name || ''} onChange={(e) => handleListChange('charactersList', idx, 'name', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-teal-500" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest mr-2">שם (HE)</label>
                                      <input value={char_he.name || ''} onChange={(e) => handleListChange('charactersList_he', idx, 'name', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-full text-xs font-bold outline-none focus:border-pink-500 text-right" />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Role (EN)</label>
                                      <input value={char.role || ''} onChange={(e) => handleListChange('charactersList', idx, 'role', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-teal-500" />
                                    </div>
                                    <div className="space-y-1" dir="rtl">
                                      <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest mr-2">תפקיד (HE)</label>
                                      <input value={char_he.role || ''} onChange={(e) => handleListChange('charactersList_he', idx, 'role', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-full text-xs font-bold outline-none focus:border-pink-500 text-right" />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description (EN)</label>
                                    <textarea value={char.desc || ''} onChange={(e) => handleListChange('charactersList', idx, 'desc', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[20px] text-xs font-bold outline-none h-16 resize-none focus:border-teal-500" />
                                  </div>
                                  <div className="space-y-1" dir="rtl">
                                    <label className="text-[10px] font-black text-brand-pink uppercase tracking-widest mr-2">תיאור (HE)</label>
                                    <textarea value={char_he.desc || ''} onChange={(e) => handleListChange('charactersList_he', idx, 'desc', e.target.value)} className="w-full px-4 py-2 bg-pink-50/30 border border-pink-100 rounded-[20px] text-xs font-bold outline-none h-16 resize-none focus:border-pink-500 text-right" />
                                  </div>
                                </div>
                              )})}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
          {activeTab === 'images' && (
            <motion.div key="images" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 pb-24">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-slate-900">Image Management</h3>
                <p className="text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100">Sole source of truth: Firestore</p>
              </div>

              {[
                {
                  title: "Home Page",
                  images: [
                    { id: 'hero', label: 'Home Hero', desc: 'Main image for the home page hero section' },
                    { id: 'about', label: 'About Image', desc: 'Image used in the About section' },
                    { id: 'videoThumbnail', label: 'Video Thumbnail', desc: 'Thumbnail shown on the video player overlay' },
                  ]
                },
                {
                  title: "Early Childhood Program",
                  images: [
                    { id: 'earlyHero', label: 'Hero Image', desc: 'Main image for Early Childhood page' },
                    { id: 'earlyKit', label: 'Kit Image', desc: 'Image of the Early Childhood kit' },
                    { id: 'earlyGallery1', label: 'Gallery 1', desc: 'First gallery image' },
                    { id: 'earlyGallery2', label: 'Gallery 2', desc: 'Second gallery image' },
                    { id: 'earlyGallery3', label: 'Gallery 3', desc: 'Third gallery image' },
                    { id: 'earlyGallery4', label: 'Gallery 4', desc: 'Fourth gallery image' },
                    { id: 'earlyGallery5', label: 'Gallery 5', desc: 'Fifth gallery image' },
                  ]
                },
                {
                  title: "Elementary Program",
                  images: [
                    { id: 'elementaryHero', label: 'Hero Image', desc: 'Main image for Elementary page' },
                    { id: 'elementaryKit', label: 'Kit Image', desc: 'Image of the Elementary kit' },
                    { id: 'elementaryGallery1', label: 'Gallery 1', desc: 'First gallery image' },
                    { id: 'elementaryGallery2', label: 'Gallery 2', desc: 'Second gallery image' },
                    { id: 'elementaryGallery3', label: 'Gallery 3', desc: 'Third gallery image' },
                    { id: 'elementaryGallery4', label: 'Gallery 4', desc: 'Fourth gallery image' },
                    { id: 'elementaryGallery5', label: 'Gallery 5', desc: 'Fifth gallery image' },
                  ]
                },
                {
                  title: "Parents Program",
                  images: [
                    { id: 'parentsHero', label: 'Hero Image', desc: 'Main image for Parents page' },
                    { id: 'parentsKit', label: 'Kit Image', desc: 'Image of the Parents kit' },
                    { id: 'parentsGallery1', label: 'Gallery 1', desc: 'First gallery image' },
                    { id: 'parentsGallery2', label: 'Gallery 2', desc: 'Second gallery image' },
                    { id: 'parentsGallery3', label: 'Gallery 3', desc: 'Third gallery image' },
                    { id: 'parentsGallery4', label: 'Gallery 4', desc: 'Fourth gallery image' },
                    { id: 'parentsGallery5', label: 'Gallery 5', desc: 'Fifth gallery image' },
                  ]
                }
              ].map((section) => (
                <div key={section.title} className="space-y-6">
                  <h4 className="text-lg font-serif font-bold text-teal-600 border-b border-teal-100 pb-2">{section.title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {section.images.map((img) => (
                      <div key={img.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{img.label}</label>
                            <p className="text-[10px] text-slate-500 font-medium">{img.desc}</p>
                          </div>
                          
                          <div className="aspect-video bg-slate-50 rounded-3xl border border-dashed border-slate-200 overflow-hidden relative group">
                            {siteImages[img.id] ? (
                              <>
                                <img src={siteImages[img.id]} alt={img.label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, img.id)} 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={siteImages[img.id] || ''} 
                              onChange={async (e) => {
                                const val = e.target.value;
                                try {
                                  if (!val) {
                                    await deleteDoc(doc(db, 'siteImages', img.id));
                                  } else {
                                    await setDoc(doc(db, 'siteImages', img.id), { 
                                      url: val,
                                      updatedAt: new Date().toISOString()
                                    });
                                  }
                                } catch (err) {
                                  toast.error('Failed to update image');
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold outline-none"
                              placeholder="Or paste URL here..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'admins' && (
            <motion.div key="admins" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900">Admin Management</h3>
              <p className="text-slate-500 font-medium text-xs md:text-sm">Manage who can access this dashboard</p>
            </div>
            <form onSubmit={handleAddAdmin} className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="New Admin Email"
                className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-sm outline-none focus:border-teal-600 transition-all flex-1 sm:w-64"
              />
              <button 
                type="submit"
                disabled={isAddingAdmin}
                className="px-6 py-3 bg-brand-green text-white font-black rounded-full text-xs uppercase tracking-widest hover:bg-brand-green/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAddingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Add Admin
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {/* All Admins Grid */}
            {authorizedAdmins.map((admin) => (
              <motion.div 
                key={admin.email}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border transition-all relative group ${admin.email === user?.email?.toLowerCase() ? 'border-teal-200 shadow-lg ring-4 ring-teal-500/5' : 'border-slate-100 shadow-sm hover:shadow-md'}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-colors ${admin.email === user?.email?.toLowerCase() ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate text-sm md:text-base">{admin.email}</h4>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Admin</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Added At</span>
                    <span className="text-slate-600">{admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : 'Initial'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Added By</span>
                    <span className="text-slate-600 truncate max-w-[80px] md:max-w-[100px]">{admin.addedBy || 'System'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleAdminPasswordReset(admin.email)}
                    className="py-2.5 md:py-3 bg-teal-50 text-teal-600 font-black rounded-xl md:rounded-2xl text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    title="Send Password Reset Email"
                  >
                    <Mail className="w-3 h-3" />
                    Reset
                  </button>
                  
                  <button 
                    onClick={() => handleRemoveAdmin(admin.email)}
                    className="py-2.5 md:py-3 bg-rose-50 text-rose-500 font-black rounded-xl md:rounded-2xl text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Revoke
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {authorizedAdmins.length === 0 && (
            <div className="text-center py-10 md:py-20 bg-slate-50 rounded-[48px] md:rounded-[64px] border-2 border-dashed border-slate-200">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-sm md:text-base">No additional admins authorized.</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
      </main>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
