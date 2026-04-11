/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  auth, 
  db, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateEmail,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  deleteField,
  limit,
  OperationType,
  handleFirestoreError,
  testConnection,
  writeBatch,
  enableNetwork,
  disableNetwork,
  getDocs,
} from './firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  LogOut, 
  Plus, 
  TrendingDown, 
  Utensils, 
  User as UserIcon, 
  ChevronRight, 
  Languages,
  Calendar,
  Loader2,
  AlertCircle,
  Table,
  X,
  RefreshCcw,
  Eye,
  EyeOff,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from './lib/utils';
import { TRANSLATIONS, Role, Language, UserProfile, WeightEntry, Camp, FighterType, Sport, SessionNote } from './types';
import { CoachView } from './pages/CoachView';
import { SessionNoteCard } from './components/SessionNoteCard';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function ResolveLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900" />
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900" />
        <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900" />
        <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900" />
        <circle cx="12" cy="12" r="3" fill="currentColor" className="text-red-600" />
      </svg>
    </div>
  );
}

function LoginAnimation() {
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center overflow-hidden relative bg-slate-50 rounded-2xl mb-8 border border-slate-100">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Main Animation Container */}
      <div className="relative flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.5
          }}
          className="mb-4"
        >
          <ResolveLogo className="w-16 h-16" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">TEAM RESOLVE</h2>
          <p className="text-slate-500 text-sm font-medium">FIGHTER MANAGEMENT SYSTEM</p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -z-10 w-32 h-32 bg-red-100 rounded-full blur-2xl"
        />
      </div>
    </div>
  );
}

function ResetPasswordModal({ onClose, t }: { onClose: () => void, t: any }) {
  const [nickname, setNickname] = useState('');
  const [masterPass, setMasterPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !masterPass || !newPass) return;
    
    if (masterPass !== 'TeamResolve') {
      setError(t.invalidMasterPassword);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In Firebase Client SDK, we can't reset another user's password without being logged in.
      // However, we can simulate this by telling the user it's done if the master password is correct,
      // and in a real scenario, this would call a backend function.
      // For this app, we'll show a success message.
      
      // Simulate API call - In a real app, this would call a backend function to reset the password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess("Simulation: Password reset request received. (Note: Real password reset requires a backend for nickname-based accounts)");
    } catch (err: any) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{t.resetPassword}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <RefreshCcw className="w-8 h-8" />
              </div>
              <p className="text-slate-600 font-medium">{success}</p>
              <button 
                onClick={onClose}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
              >
                {t.back}
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.newUsername}</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. fighter123"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.masterPassword}</label>
                <input
                  type="password"
                  value={masterPass}
                  onChange={(e) => setMasterPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter master password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.newPassword}</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.resetPassword}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PrivacyModal({ onClose, t }: { onClose: () => void, t: any }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{t.privacyPolicy}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-8 text-slate-600 space-y-4">
          <p>Your privacy is important to us. This policy explains how we handle your data.</p>
          <h4 className="font-bold text-slate-900">Data Collection</h4>
          <p>We collect weight entries, meal descriptions, and profile information to provide tracking services.</p>
          <h4 className="font-bold text-slate-900">AI Processing</h4>
          <p>Meal descriptions are processed by Google's Gemini AI to estimate caloric content. No personal identifying information is sent to the AI service.</p>
          <h4 className="font-bold text-slate-900">Data Security</h4>
          <p>Your data is stored securely using Firebase. We do not share your data with third parties for marketing purposes.</p>
        </div>
      </motion.div>
    </div>
  );
}

function TermsModal({ onClose, t }: { onClose: () => void, t: any }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{t.termsConditions}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-8 text-slate-600 space-y-4">
          <p>By using MMA Weight Tracker, you agree to these terms.</p>
          <h4 className="font-bold text-slate-900">Usage</h4>
          <p>This app is for informational purposes only. Always consult with a medical professional before starting any weight cut or diet plan.</p>
          <h4 className="font-bold text-slate-900">Responsibility</h4>
          <p>Users are responsible for the accuracy of the data they input. Coaches are responsible for the plans they set for fighters.</p>
          <h4 className="font-bold text-slate-900">Termination</h4>
          <p>We reserve the right to terminate access for users who violate our community guidelines or misuse the service.</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [selectedFighterTypeView, setSelectedFighterTypeView] = useState<FighterType | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [showSettings, setShowSettings] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<{ title: string, content: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [massEditEntries, setMassEditEntries] = useState<WeightEntry[]>([]);
  
  // Auth state
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // Settings state
  const [maintCal, setMaintCal] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [startingWeight, setStartingWeight] = useState('');
  const [saltCut, setSaltCut] = useState('');
  const [waterCut, setWaterCut] = useState('');

  // Form state
  const [morningWeight, setMorningWeight] = useState('');
  const [eveningWeight, setEveningWeight] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [caloriesText, setCaloriesText] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [estimatedCalories, setEstimatedCalories] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('https://img.icons8.com/fluency/96/monkey.png');
  const [selectedSports, setSelectedSports] = useState<Sport[]>(['mma']);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [fighterToDelete, setFighterToDelete] = useState<string | null>(null);

  // Password/Username change state
  const [newNickname, setNewNickname] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Camp state
  const [camps, setCamps] = useState<Camp[]>([]);
  const [activeCamp, setActiveCamp] = useState<Camp | null>(null);
  const [showCampModal, setShowCampModal] = useState(false);
  const [showFighterModal, setShowFighterModal] = useState(false);
  const [editingFighter, setEditingFighter] = useState<UserProfile | null>(null);
  const [fighterForm, setFighterForm] = useState({
    name: '',
    targetWeight: '',
    startingWeight: '',
    maintenanceCalories: '',
    fighterType: 'amateur' as FighterType,
    sports: ['mma'] as Sport[]
  });
  const [newCampName, setNewCampName] = useState('');
  const [newCampTarget, setNewCampTarget] = useState('');
  const [newCampStartingWeight, setNewCampStartingWeight] = useState('');
  const [newCampTargetDate, setNewCampTargetDate] = useState('');

  const AVATARS = [
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix', name: 'Felix' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka', name: 'Aneka' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Milo', name: 'Milo' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Casper', name: 'Casper' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Tigger', name: 'Tigger' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna', name: 'Luna' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver', name: 'Oliver' },
    { url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bella', name: 'Bella' },
  ];

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data() as UserProfile;
            setProfile(data);
            setLanguage(data.language || 'en');
            setMaintCal(data.maintenanceCalories?.toString() || '');
            setTargetWeight(data.targetWeight?.toString() || '');
            setStartingWeight(data.startingWeight?.toString() || '');
            setSelectedAvatar(data.avatarUrl || AVATARS[0].url);
            if (data.fighterType) setSelectedFighterType(data.fighterType);
            if (data.sports) setSelectedSports(data.sports);
          } else {
            // New user - need to set role
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
          setEntries([]);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        // We still want to stop loading even if profile fetch fails
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !profile) return;
    
    let q;
    if ((profile.role === 'coach' || profile.role === 'master_coach') && !selectedFighterId) {
      q = query(collection(db, 'camps'));
    } else {
      const targetUid = (profile.role === 'coach' || profile.role === 'master_coach') && selectedFighterId ? selectedFighterId : user.uid;
      q = query(collection(db, 'camps'), where('uid', '==', targetUid));
    }

    return onSnapshot(q, (snapshot) => {
      const campList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Camp));
      setCamps(campList);
      
      if ((profile.role === 'coach' || profile.role === 'master_coach') && !selectedFighterId) {
        setActiveCamp(null);
      } else {
        const targetUid = (profile.role === 'coach' || profile.role === 'master_coach') && selectedFighterId ? selectedFighterId : user.uid;
        const active = campList.find(c => c.uid === targetUid && c.isActive);
        setActiveCamp(active || null);
      }
    });
  }, [user, profile, selectedFighterId]);

  const startNewCamp = async () => {
    if (!user || !profile || !newCampName || !newCampTarget || !newCampStartingWeight) return;
    
    try {
      const targetUid = (profile.role === 'coach' || profile.role === 'master_coach') && selectedFighterId ? selectedFighterId : user.uid;

      // Deactivate current camp if any
      if (activeCamp) {
        await updateDoc(doc(db, 'camps', activeCamp.id), { isActive: false });
      }

      const campData: Omit<Camp, 'id'> = {
        uid: targetUid,
        name: newCampName,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: newCampTargetDate || undefined,
        targetWeight: parseFloat(newCampTarget),
        startingWeight: parseFloat(newCampStartingWeight),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'camps'), campData);
      await updateDoc(doc(db, 'users', targetUid), { currentCampId: docRef.id });
      
      setNewCampName('');
      setNewCampTarget('');
      setNewCampStartingWeight('');
      setNewCampTargetDate('');
      setShowCampModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'camps');
    }
  };

  useEffect(() => {
    if (profile?.role === 'coach' && selectedFighterId) {
      const fighter = allUsers.find(u => u.uid === selectedFighterId);
      if (fighter) {
        setSaltCut(fighter.saltCutEstimate?.toString() || '');
        setWaterCut(fighter.waterCutEstimate?.toString() || '');
      }
    }
  }, [selectedFighterId, allUsers, profile]);

  // Fetch entries for current user or selected fighter
  useEffect(() => {
    if (!user || !profile) return;

    let q;
    if ((profile.role === 'coach' || profile.role === 'master_coach') && !selectedFighterId) {
      q = query(collection(db, 'entries'), orderBy('date', 'desc'));
    } else {
      const targetUid = (profile.role === 'coach' || profile.role === 'master_coach') && selectedFighterId ? selectedFighterId : user.uid;
      q = query(
        collection(db, 'entries'),
        where('uid', '==', targetUid),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeightEntry[];
      
      // Ensure unique IDs to prevent React duplicate key warnings
      const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
      setEntries(uniqueData.sort((a, b) => a.date.localeCompare(b.date)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'entries');
    });

    return () => unsubscribe();
  }, [user, profile, selectedFighterId]);

  // Coach: Fetch all users
  useEffect(() => {
    if (profile?.role !== 'coach') return;

    const q = query(collection(db, 'users'), where('role', '==', 'fighter'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      setAllUsers(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, [profile]);

  // Fetch session notes
  useEffect(() => {
    if (!user || !profile) return;

    let q;
    if ((profile.role === 'coach' || profile.role === 'master_coach') && !selectedFighterId) {
      q = query(collection(db, 'session_notes'), orderBy('date', 'desc'));
    } else {
      const targetUid = (profile.role === 'coach' || profile.role === 'master_coach') && selectedFighterId ? selectedFighterId : user.uid;
      q = query(
        collection(db, 'session_notes'),
        where('fighterId', '==', targetUid),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SessionNote[];
      setSessionNotes(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'session_notes');
    });

    return () => unsubscribe();
  }, [user, profile, selectedFighterId]);

  const handleSaveNote = async (fighterId: string, title: string, content: string, sport: string, noteId?: string) => {
    if (!user || !profile) return;
    try {
      const noteData: any = {
        fighterId,
        coachId: user.uid,
        coachName: profile.name,
        title,
        content,
        sport,
        updatedAt: serverTimestamp(),
      };

      if (noteId) {
        await updateDoc(doc(db, 'session_notes', noteId), noteData);
      } else {
        await addDoc(collection(db, 'session_notes'), {
          ...noteData,
          date: new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'session_notes');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'session_notes', noteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'session_notes');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNickname = nickname.trim().toLowerCase();
    if (!cleanNickname || !password) return;
    setLoading(true);
    setError(null);
    try {
      // Handle nicknames with spaces by replacing them with dots, consistent with how fighters are saved
      const nicknamePart = cleanNickname.replace(/\s+/g, '.');
      const email = cleanNickname.includes('@') ? cleanNickname : `${nicknamePart}@resolve.mma`;
      
      console.log("Attempting login for:", email);
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        // Fallback for accounts created with the old @mma.app domain
        if (!cleanNickname.includes('@') && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email')) {
          const fallbackEmail = `${nicknamePart}@mma.app`;
          console.log("Attempting fallback login for:", fallbackEmail);
          await signInWithEmailAndPassword(auth, fallbackEmail, password);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      let msg = "Login failed. Please check your nickname and password.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
        msg = "Incorrect nickname or password. Please try again.";
      } else if (err.code === 'auth/user-not-found') {
        msg = "No account found with this nickname.";
      } else if (err.code === 'auth/wrong-password') {
        msg = "Incorrect password.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Too many failed attempts. Please try again later.";
      } else if (err.code === 'auth/network-request-failed') {
        msg = "Network error. Please check your connection or try again.";
      } else {
        msg = `Error: ${err.code || err.message}`;
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNickname = nickname.trim().toLowerCase();
    if (!cleanNickname || !password) return;
    
    setLoading(true);
    setError(null);
    try {
      const email = `${cleanNickname.replace(/\s+/g, '.')}@resolve.mma`;
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Signup error:", err);
      let msg = err.message || "Signup failed";
      if (err.code === 'auth/email-already-in-use') {
        msg = "This nickname is already taken. Please choose another.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/network-request-failed') {
        msg = "Network error. Please check your connection or try again.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setNickname('');
    setPassword('');
  };

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setAuthError(null);
    setAuthSuccess(null);
    setIsSaving(true);

    try {
      if (newNickname && newNickname !== profile.name) {
        const newEmail = `${newNickname.toLowerCase().trim().replace(/\s+/g, '.')}@resolve.mma`;
        // This is tricky because we use email as a proxy for nickname
        // In a real app, we'd use a custom claim or a separate field
        // But for this simulation, we'll update the email and the profile name
        await updateEmail(user, newEmail);
        await updateDoc(doc(db, 'users', user.uid), { name: newNickname, email: newEmail });
        setProfile({ ...profile, name: newNickname, email: newEmail });
        setAuthSuccess("Nickname updated successfully!");
      }

      if (newPass) {
        if (newPass !== confirmPass) {
          setAuthError("Passwords do not match");
          setIsSaving(false);
          return;
        }
        await updatePassword(user, newPass);
        setAuthSuccess(prev => prev ? prev + " and password updated!" : "Password updated successfully!");
      }
      
      setNewNickname('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      console.error("Auth update error:", err);
      setAuthError(err.message || "Failed to update security settings");
    } finally {
      setIsSaving(false);
    }
  };

  const [selectedFighterType, setSelectedFighterType] = useState<FighterType>('amateur');

  const handleSetRole = async (role: Role) => {
    if (!user) return;
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || `${nickname.toLowerCase().trim().replace(/\s+/g, '.')}@resolve.mma`,
      role,
      name: nickname || user.displayName || 'Anonymous',
      language,
      avatarUrl: selectedAvatar,
      onboardingCompleted: false,
      sports: role === 'fighter' ? (selectedSports.length > 0 ? [selectedSports[0]] : ['mma']) : (selectedSports.length > 0 ? selectedSports : ['mma']),
      ...(role === 'fighter' ? { fighterType: selectedFighterType } : {})
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setOnboardingStep(1); // Trigger onboarding
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'jp' : 'en';
    setLanguage(newLang);
    if (profile) {
      try {
        await setDoc(doc(db, 'users', user.uid), { ...profile, language: newLang });
      } catch (err) {
        console.error("Failed to update language preference", err);
      }
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSaving(true);
    const updatedProfile: UserProfile = {
      ...profile,
      maintenanceCalories: maintCal ? parseFloat(maintCal) : undefined,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      startingWeight: startingWeight ? parseFloat(startingWeight) : undefined,
      avatarUrl: selectedAvatar,
      fighterType: selectedFighterType,
      sports: profile.role === 'fighter' ? (selectedSports.length > 0 ? [selectedSports[0]] : ['mma']) : (selectedSports.length > 0 ? selectedSports : ['mma']),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
      setShowSettings(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveCoachPlan = async (fighterId: string, field: string, value: string) => {
    if (profile?.role !== 'coach') return;
    try {
      await updateDoc(doc(db, 'users', fighterId), {
        [field]: value ? parseFloat(value) : deleteField()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${fighterId}`);
    }
  };

  const handleSaveFighter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'coach' && profile?.role !== 'master_coach') return;
    
    // Check for unique nickname
    const isNicknameTaken = allUsers.some(u => 
      u.name.toLowerCase() === fighterForm.name.toLowerCase() && 
      (!editingFighter || u.uid !== editingFighter.uid)
    ) || (profile?.name.toLowerCase() === fighterForm.name.toLowerCase());

    if (isNicknameTaken) {
      setError(t.nicknameTaken);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const fighterData = {
        name: fighterForm.name,
        email: editingFighter?.email || `${fighterForm.name.toLowerCase().replace(/\s+/g, '.')}@resolve.mma`, // Placeholder email
        role: 'fighter' as Role,
        targetWeight: parseFloat(fighterForm.targetWeight) || 0,
        startingWeight: parseFloat(fighterForm.startingWeight) || 0,
        maintenanceCalories: parseFloat(fighterForm.maintenanceCalories) || 2500,
        language: profile.language,
        onboardingCompleted: true,
        fighterType: fighterForm.fighterType,
        sports: fighterForm.sports
      };

      if (editingFighter) {
        await updateDoc(doc(db, 'users', editingFighter.uid), fighterData);
      } else {
        const newDoc = doc(collection(db, 'users'));
        await setDoc(newDoc, { ...fighterData, uid: newDoc.id });
      }
      setShowFighterModal(false);
      setEditingFighter(null);
      setFighterForm({ name: '', targetWeight: '', startingWeight: '', maintenanceCalories: '', fighterType: 'amateur', sports: ['mma'] });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFighter = async (fighterId: string) => {
    if (profile?.role !== 'coach' && profile?.role !== 'master_coach') return;
    setFighterToDelete(fighterId);
  };

  const confirmDeleteFighter = async () => {
    if (!fighterToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', fighterToDelete));
      if (selectedFighterId === fighterToDelete) setSelectedFighterId(null);
      setFighterToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${fighterToDelete}`);
    }
  };

  const estimateCalories = async () => {
    if (!caloriesText.trim()) return;
    setIsEstimating(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estimate the total calories for the following food consumption description. Return ONLY a JSON object with a "calories" field (number). Description: "${caloriesText}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER }
            },
            required: ["calories"]
          }
        }
      });
      const result = JSON.parse(response.text || "{}");
      setEstimatedCalories(result.calories || 0);
    } catch (err) {
      console.error("AI Estimation error:", err);
      setError("Failed to estimate calories. Please try again.");
    } finally {
      setIsEstimating(false);
    }
  };

  const [showToast, setShowToast] = useState(false);
  const [overwriteWarning, setOverwriteWarning] = useState<{ morning?: number, evening?: number } | null>(null);

  const saveEntry = async (e?: React.FormEvent, forceOverwrite = false) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const entryDate = editingEntryId ? entries.find(e => e.id === editingEntryId)?.date || today : today;
    
    // Check for overwrite warning if not forcing and not explicitly editing an old entry
    if (!forceOverwrite && !editingEntryId) {
      const existingEntry = entries.find(e => e.date === entryDate);
      if (existingEntry) {
        let warning: { morning?: number, evening?: number } = {};
        if (morningWeight && existingEntry.morningWeight && parseFloat(morningWeight) !== existingEntry.morningWeight) {
          warning.morning = existingEntry.morningWeight;
        }
        if (eveningWeight && existingEntry.eveningWeight && parseFloat(eveningWeight) !== existingEntry.eveningWeight) {
          warning.evening = existingEntry.eveningWeight;
        }
        if (warning.morning || warning.evening) {
          setOverwriteWarning(warning);
          return;
        }
      }
    }

    setIsSaving(true);
    
    const entry: WeightEntry = {
      uid: user.uid,
      date: entryDate,
      morningWeight: morningWeight ? parseFloat(morningWeight) : undefined,
      eveningWeight: eveningWeight ? parseFloat(eveningWeight) : undefined,
      waterIntake: waterIntake ? parseFloat(waterIntake) : undefined,
      caloriesText,
      estimatedCalories: estimatedCalories || undefined,
      mood: mood || undefined,
      timestamp: serverTimestamp(),
      campId: activeCamp?.id
    };

    try {
      const newEntryId = entryDate + '_' + user.uid;
      
      if (editingEntryId && editingEntryId !== newEntryId) {
        await deleteDoc(doc(db, 'entries', editingEntryId));
      }
      
      await setDoc(doc(db, 'entries', newEntryId), entry, { merge: true });
      
      setMorningWeight('');
      setEveningWeight('');
      setWaterIntake('');
      setCaloriesText('');
      setEstimatedCalories(null);
      setMood(null);
      setEditingEntryId(null);
      setOverwriteWarning(null);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'entries');
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = useMemo(() => {
    return entries.map(e => ({
      date: e.date,
      morning: e.morningWeight,
      evening: e.eveningWeight,
      avg: (e.morningWeight && e.eveningWeight) ? (e.morningWeight + e.eveningWeight) / 2 : (e.morningWeight || e.eveningWeight)
    }));
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleReconnect = async () => {
    try {
      await enableNetwork(db);
      await testConnection();
      setIsOnline(navigator.onLine);
    } catch (err) {
      console.error("Reconnect failed:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200"
        >
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t.title}</h1>
            <p className="text-slate-500 text-sm">
              {isLogin ? "Welcome back, Fighter" : "Join the MMA Weight Tracker"}
            </p>
          </div>

          <LoginAnimation />

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.nickname}</label>
              <input 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Iron Mike"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
                {error.includes("Network error") && (
                  <button 
                    type="button"
                    onClick={() => isLogin ? handleLogin(new Event('submit') as any) : handleSignup(new Event('submit') as any)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? t.login : "Sign Up")}
              </button>
              <button
                type="button"
                onClick={() => { setNickname(''); setPassword(''); setError(null); }}
                className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"
                title="Clear"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>

            {isLogin && (
              <div className="space-y-2">
                <button 
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mt-2"
                >
                  {t.forgotPassword}
                </button>
                <p className="text-[10px] text-slate-400 text-center">Note: Google Login is no longer supported. Please use your nickname.</p>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors">
              <Languages className="w-4 h-4" />
              {language === 'en' ? '日本語に切り替え' : 'Switch to English'}
            </button>
            <div className="flex gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-slate-500 transition-colors">{t.privacyPolicy}</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-slate-500 transition-colors">{t.termsConditions}</button>
            </div>
          </div>
        </motion.div>

        {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} t={t} />}
        {showTerms && <TermsModal onClose={() => setShowTerms(false)} t={t} />}
        {showResetModal && <ResetPasswordModal onClose={() => setShowResetModal(false)} t={t} />}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              title={t.back}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">{t.roleSelection}</h2>
            <div className="w-10" /> {/* Spacer */}
          </div>
          
          <div className="mb-8">
            <label className="text-lg font-black text-slate-800 block mb-6 text-center tracking-tight">{t.selectAvatar}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.url}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={cn(
                    "aspect-square rounded-3xl border-4 transition-all p-2 flex items-center justify-center bg-white shadow-sm",
                    selectedAvatar === avatar.url ? "border-blue-600 bg-blue-50 scale-110 shadow-xl z-10" : "border-slate-100 hover:border-slate-200 hover:scale-105"
                  )}
                  title={avatar.name}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name} 
                    className="w-full h-full object-contain rounded-xl" 
                    referrerPolicy="no-referrer" 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 text-center">{t.sport || 'Sport'}</label>
            <p className="text-xs text-slate-500 text-center mb-2">Select your sports (Fighters will use the first selected sport).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['mma', 'karate', 'kickboxing', 'jiu_jitsu'] as Sport[]).map(sport => (
                <label key={sport} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSports([...selectedSports, sport]);
                      } else {
                        setSelectedSports(selectedSports.filter(s => s !== sport));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {sport === 'mma' ? t.sportMMA || 'MMA' : 
                     sport === 'karate' ? t.sportKarate || 'Karate' : 
                     sport === 'kickboxing' ? t.sportKickboxing || 'Kickboxing' : 
                     t.sportJiuJitsu || 'Jiu-Jitsu'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 text-center">{t.fighterType}</label>
            <p className="text-xs text-slate-500 text-center mb-2">Select your type if you are joining as a Fighter.</p>
            <select
              value={selectedFighterType}
              onChange={(e) => setSelectedFighterType(e.target.value as FighterType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            >
              <option value="professional">{t.professional}</option>
              <option value="amateur">{t.amateur}</option>
              <option value="dojo_member">{t.dojoMember}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleSetRole('fighter')}
              className="group flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-200 hover:border-blue-600"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:bg-blue-500">
                  <UserIcon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <span className="text-lg font-semibold">{t.fighter}</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => handleSetRole('coach')}
              className="group flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-200 hover:border-blue-600"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:bg-blue-500">
                  <TrendingDown className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <span className="text-lg font-semibold">{t.coach}</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-2 text-xs font-bold sticky top-0 z-[100] flex items-center justify-center gap-4">
          <span>OFFLINE MODE - CHANGES MAY NOT SYNC</span>
          <button 
            onClick={handleReconnect}
            className="bg-white text-red-600 px-3 py-1 rounded-full text-[10px] hover:bg-red-50 transition-colors flex items-center gap-1"
          >
            <RefreshCcw size={10} />
            RECONNECT
          </button>
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ResolveLogo className="w-6 h-6" />
            <span className="font-bold text-slate-900 hidden sm:inline">{t.title}</span>
          </div>
          
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowBulkEntry(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                title={t.bulkEntry}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{t.bulkEntry}</span>
              </button>
              <button 
                onClick={() => {
                  // We'll pass the last 7 entries for mass editing
                  const last7 = entries.slice(-7);
                  setMassEditEntries(last7);
                  setShowBulkEntry(true);
                }}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                title={t.massEdit}
              >
                <Table className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{t.massEdit}</span>
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={cn("p-2 rounded-full transition-colors", showSettings ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 text-slate-500")}
              >
                <UserIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowCampModal(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                title={t.createCamp}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{t.competition}</span>
              </button>
              <button onClick={toggleLanguage} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <Languages className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                  <img 
                    src={profile?.avatarUrl || user.photoURL || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}`} 
                    alt={profile?.name} 
                    className="w-7 h-7 rounded-lg object-contain" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-bold text-slate-700">{profile?.name}</span>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-slate-500">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {profile && !profile.hasConsented && (
          <ConsentModal 
            t={t} 
            isCoach={profile.role === 'coach' || profile.role === 'master_coach'}
            onShowLegal={(title, content) => setShowLegalModal({ title, content })}
            onComplete={async () => {
              try {
                await setDoc(doc(db, 'users', user.uid), { ...profile, hasConsented: true }, { merge: true });
                setProfile({ ...profile, hasConsented: true });
              } catch (err) {
                console.error("Failed to save consent", err);
              }
            }} 
          />
        )}

        {onboardingStep && profile?.hasConsented && (
          <OnboardingModal 
            step={onboardingStep} 
            t={t} 
            onNext={() => setOnboardingStep(prev => prev && prev < 4 ? prev + 1 : null)}
            onBack={() => setOnboardingStep(prev => prev && prev > 1 ? prev - 1 : prev)}
            onSkip={() => setOnboardingStep(null)}
            onComplete={async () => {
              setOnboardingStep(null);
              if (profile) {
                try {
                  await setDoc(doc(db, 'users', user.uid), { ...profile, onboardingCompleted: true });
                  setProfile({ ...profile, onboardingCompleted: true });
                } catch (err) {
                  console.error("Failed to complete onboarding", err);
                }
              }
            }}
          />
        )}

        {showBulkEntry && (
          <BulkEntry 
            uid={user.uid} 
            t={t} 
            onClose={() => {
              setShowBulkEntry(false);
              setMassEditEntries([]);
            }} 
            existingEntries={massEditEntries}
          />
        )}

        {showCampModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t.createCamp}</h3>
                <button onClick={() => setShowCampModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.competitionName}</label>
                  <input 
                    type="text" 
                    value={newCampName}
                    onChange={(e) => setNewCampName(e.target.value)}
                    placeholder="e.g. UFC 300"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.targetWeight} (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newCampTarget}
                    onChange={(e) => setNewCampTarget(e.target.value)}
                    placeholder="70.3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.startingWeight} (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCampStartingWeight}
                    onChange={(e) => setNewCampStartingWeight(e.target.value)}
                    placeholder="80.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Fight / Weigh-in Date</label>
                  <input
                    type="date"
                    value={newCampTargetDate}
                    onChange={(e) => setNewCampTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Optional — enables the fight countdown</p>
                </div>
                <button
                  onClick={startNewCamp}
                  disabled={!newCampName || !newCampTarget || !newCampStartingWeight}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t.createCamp}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {fighterToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t.deleteFighter}</h3>
                <button onClick={() => setFighterToDelete(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-600 mb-6">{t.confirmDelete}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setFighterToDelete(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={confirmDeleteFighter}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  {t.delete}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showFighterModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">{editingFighter ? t.editFighter : t.addFighter}</h3>
                <button onClick={() => setShowFighterModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSaveFighter} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.nickname}</label>
                  <input 
                    type="text" 
                    required
                    value={fighterForm.name}
                    onChange={(e) => setFighterForm({ ...fighterForm, name: e.target.value })}
                    placeholder="e.g. Iron Mike"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.targetWeight} (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={fighterForm.targetWeight}
                      onChange={(e) => setFighterForm({ ...fighterForm, targetWeight: e.target.value })}
                      placeholder="70.3"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.startingWeight} (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={fighterForm.startingWeight}
                      onChange={(e) => setFighterForm({ ...fighterForm, startingWeight: e.target.value })}
                      placeholder="80.0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.maintenanceCalories}</label>
                  <input 
                    type="number" 
                    required
                    value={fighterForm.maintenanceCalories}
                    onChange={(e) => setFighterForm({ ...fighterForm, maintenanceCalories: e.target.value })}
                    placeholder="2500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.fighterType}</label>
                  <select
                    value={fighterForm.fighterType}
                    onChange={(e) => setFighterForm({ ...fighterForm, fighterType: e.target.value as FighterType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="professional">{t.professional}</option>
                    <option value="amateur">{t.amateur}</option>
                    <option value="dojo_member">{t.dojoMember}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t.sport || 'Sport'}</label>
                  <select
                    value={fighterForm.sports[0]}
                    onChange={(e) => setFighterForm({ ...fighterForm, sports: [e.target.value as Sport] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="mma">{t.sportMMA || 'MMA'}</option>
                    <option value="karate">{t.sportKarate || 'Karate'}</option>
                    <option value="kickboxing">{t.sportKickboxing || 'Kickboxing'}</option>
                    <option value="jiu_jitsu">{t.sportJiuJitsu || 'Jiu-Jitsu'}</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingFighter ? t.save : t.addFighter)}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"
          >
            <GuidanceModal title={t.settings} content={t.guidanceSettings} optOutKey="guidance_opt_out_settings" t={t} />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t.settings}</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={saveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.maintenanceCalories}</label>
                <input 
                  type="number" 
                  value={maintCal}
                  onChange={(e) => setMaintCal(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.targetWeight}</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="e.g. 70.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.startingWeight}</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={startingWeight}
                  onChange={(e) => setStartingWeight(e.target.value)}
                  placeholder="e.g. 85.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              
              {profile?.role === 'fighter' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.fighterType}</label>
                  <select
                    value={selectedFighterType}
                    onChange={(e) => setSelectedFighterType(e.target.value as FighterType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="professional">{t.professional}</option>
                    <option value="amateur">{t.amateur}</option>
                    <option value="dojo_member">{t.dojoMember}</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.sport || 'Sport'}</label>
                {profile?.role === 'fighter' ? (
                  <select
                    value={selectedSports[0] || 'mma'}
                    onChange={(e) => setSelectedSports([e.target.value as Sport])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="mma">{t.sportMMA || 'MMA'}</option>
                    <option value="karate">{t.sportKarate || 'Karate'}</option>
                    <option value="kickboxing">{t.sportKickboxing || 'Kickboxing'}</option>
                    <option value="jiu_jitsu">{t.sportJiuJitsu || 'Jiu-Jitsu'}</option>
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(['mma', 'karate', 'kickboxing', 'jiu_jitsu'] as Sport[]).map(sport => (
                      <label key={sport} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSports.includes(sport)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSports([...selectedSports, sport]);
                            } else {
                              setSelectedSports(selectedSports.filter(s => s !== sport));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {sport === 'mma' ? t.sportMMA || 'MMA' : 
                           sport === 'karate' ? t.sportKarate || 'Karate' : 
                           sport === 'kickboxing' ? t.sportKickboxing || 'Kickboxing' : 
                           t.sportJiuJitsu || 'Jiu-Jitsu'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.selectAvatar}</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.url}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={cn(
                        "aspect-square rounded-2xl border-2 transition-all p-1.5 flex items-center justify-center bg-white shadow-sm",
                        selectedAvatar === avatar.url ? "border-blue-600 bg-blue-50 scale-110 shadow-md z-10" : "border-slate-100 hover:border-slate-200 hover:scale-105"
                      )}
                      title={avatar.name}
                    >
                      <img 
                        src={avatar.url} 
                        alt={avatar.name} 
                        className="w-full h-full object-contain rounded-lg" 
                        referrerPolicy="no-referrer" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.saveSettings}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ResolveLogo className="w-5 h-5" />
                Security & Profile
              </h3>
              
              <form onSubmit={handleUpdateAuth} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.changeUsername}</label>
                    <p className="text-[10px] text-slate-400 mb-1">Changing this will change your login nickname.</p>
                    <input 
                      type="text" 
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      placeholder={profile?.name}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.newPassword}</label>
                    <input 
                      type="password" 
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div className="sm:col-start-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.confirmPassword}</label>
                    <input 
                      type="password" 
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm flex items-center gap-2 border border-green-100">
                    <ResolveLogo className="w-4 h-4" />
                    {authSuccess}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSaving || (!newNickname && !newPass)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Security Settings"}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <button onClick={() => setShowLegalModal({ title: t.privacyPolicy, content: t.privacyPolicyContent })} className="hover:text-blue-600 transition-colors">{t.privacyPolicy}</button>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <button onClick={() => setShowLegalModal({ title: t.termsConditions, content: t.termsConditionsContent })} className="hover:text-blue-600 transition-colors">{t.termsConditions}</button>
              </div>
              <button 
                onClick={() => auth.signOut()}
                className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </motion.div>
        )}

        {showLegalModal && (
          <LegalModal 
            title={showLegalModal.title} 
            content={showLegalModal.content} 
            onClose={() => setShowLegalModal(null)} 
          />
        )}

        {profile.role === 'coach' || profile.role === 'master_coach' ? (
          <CoachView
            user={user}
            profile={profile}
            allUsers={allUsers}
            entries={entries}
            camps={camps}
            sessionNotes={sessionNotes}
            t={t}
            loading={loading}
            refreshKey={refreshKey}
            setRefreshKey={setRefreshKey}
            selectedFighterId={selectedFighterId}
            setSelectedFighterId={setSelectedFighterId}
            onAddFighter={() => {
              setEditingFighter(null);
              setFighterForm({ name: '', targetWeight: '', startingWeight: '', maintenanceCalories: '', fighterType: 'amateur', sports: ['mma'] });
              setError(null);
              setShowFighterModal(true);
            }}
            onEditFighter={(fighter) => {
              setEditingFighter(fighter);
              setFighterForm({
                name: fighter.name,
                targetWeight: fighter.targetWeight?.toString() || '',
                startingWeight: fighter.startingWeight?.toString() || '',
                maintenanceCalories: fighter.maintenanceCalories?.toString() || '',
                fighterType: fighter.fighterType || 'amateur',
                sports: fighter.sports && fighter.sports.length > 0 ? fighter.sports : ['mma']
              });
              setError(null);
              setShowFighterModal(true);
            }}
            onDeleteFighter={handleDeleteFighter}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GuidanceModal title={t.title} content={t.guidanceDashboard} optOutKey="guidance_opt_out_dashboard" t={t} />
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">{t.save}</h2>
                </div>

                <form onSubmit={saveEntry} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.morning}</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={morningWeight}
                        onChange={(e) => setMorningWeight(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.evening}</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={eveningWeight}
                        onChange={(e) => setEveningWeight(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.waterIntake}</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      placeholder="e.g. 4.5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How do you feel?</label>
                    <div className="flex justify-between gap-1">
                      {([
                        { val: 1, emoji: '😴', label: 'Exhausted' },
                        { val: 2, emoji: '😟', label: 'Tired' },
                        { val: 3, emoji: '😐', label: 'Okay' },
                        { val: 4, emoji: '💪', label: 'Good' },
                        { val: 5, emoji: '⚡', label: 'Great' },
                      ] as const).map(({ val, emoji, label }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMood(mood === val ? null : val)}
                          title={label}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all text-xl",
                            mood === val
                              ? "border-blue-500 bg-blue-50 scale-105 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          )}
                        >
                          <span>{emoji}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.caloriesInput}</label>
                    <textarea
                      value={caloriesText}
                      onChange={(e) => setCaloriesText(e.target.value)}
                      placeholder="e.g. 2 eggs, 1 toast, chicken salad..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                  </div>

                  {estimatedCalories !== null && (
                    <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
                      <span className="text-sm font-medium text-blue-700">{t.estimated}:</span>
                      <span className="text-lg font-bold text-blue-700">{estimatedCalories} kcal</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm border border-red-100">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingEntryId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setMorningWeight('');
                          setEveningWeight('');
                          setWaterIntake('');
                          setCaloriesText('');
                          setEstimatedCalories(null);
                          setEditingEntryId(null);
                        }}
                        className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all"
                      >
                        {t.back}
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={estimateCalories}
                      disabled={isEstimating || !caloriesText.trim()}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      {isEstimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Utensils className="w-4 h-4" />}
                      {t.estimate}
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving || (!morningWeight && !eveningWeight)}
                      className="flex-[2] bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingEntryId ? t.save : t.save)}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Dashboard Section */}
            <div className="lg:col-span-2">
              <DashboardView 
                key={user.uid}
                entries={entries} 
                chartData={chartData} 
                t={t} 
                profile={profile} 
                isCoach={false}
                activeCamp={activeCamp}
                sessionNotes={sessionNotes}
                onEdit={(entry) => {
                  setMorningWeight(entry.morningWeight?.toString() || '');
                  setEveningWeight(entry.eveningWeight?.toString() || '');
                  setWaterIntake(entry.waterIntake?.toString() || '');
                  setCaloriesText(entry.caloriesText || '');
                  setEstimatedCalories(entry.estimatedCalories || null);
                  setMood((entry.mood as 1|2|3|4|5) || null);
                  setEditingEntryId(entry.id || null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
            
            {/* Toast Notification */}
            {showToast && (
              <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold">Weight Saved</span>
              </div>
            )}

            {/* Overwrite Warning Modal */}
            {overwriteWarning && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
                >
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Overwrite Entry?</h3>
                  <p className="text-slate-600 mb-6">
                    You already logged {overwriteWarning.morning ? `${overwriteWarning.morning}kg this morning` : ''}
                    {overwriteWarning.morning && overwriteWarning.evening ? ' and ' : ''}
                    {overwriteWarning.evening ? `${overwriteWarning.evening}kg this evening` : ''}.
                    Overwrite with {morningWeight ? `${morningWeight}kg` : ''}
                    {morningWeight && eveningWeight ? ' and ' : ''}
                    {eveningWeight ? `${eveningWeight}kg` : ''}?
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setOverwriteWarning(null)}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={(e) => saveEntry(e, true)}
                      className="flex-1 px-4 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Overwrite
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function GuidanceModal({ title, content, optOutKey, t }: { title: string, content: string, optOutKey: string, t: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [optOut, setOptOut] = useState(false);

  useEffect(() => {
    const hasOptedOut = localStorage.getItem(optOutKey);
    if (!hasOptedOut) {
      setIsOpen(true);
    }
  }, [optOutKey]);

  const handleClose = () => {
    if (optOut) {
      localStorage.setItem(optOutKey, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">{content}</p>
        <div className="flex items-center gap-2 mb-6">
          <input 
            type="checkbox" 
            id={`optout-${optOutKey}`}
            checked={optOut}
            onChange={(e) => setOptOut(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor={`optout-${optOutKey}`} className="text-sm text-slate-600">{t.guidanceOptOut}</label>
        </div>
        <button 
          onClick={handleClose}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          {t.gotIt}
        </button>
      </motion.div>
    </div>
  );
}

function FighterTypeChart({ type, fighters, t }: { type: FighterType, fighters: UserProfile[], t: any }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const chartData = [];
      for (const f of fighters) {
        const q = query(collection(db, 'entries'), where('uid', '==', f.uid), orderBy('date', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        let currentWeight = 0;
        if (!snapshot.empty) {
          const entry = snapshot.docs[0].data();
          currentWeight = entry.morningWeight || entry.eveningWeight || 0;
        }
        chartData.push({
          name: f.name,
          current: currentWeight,
          target: f.targetWeight || 0
        });
      }
      if (isMounted) {
        setData(chartData);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [fighters]);

  const typeLabel = type === 'professional' ? t.professional : type === 'amateur' ? t.amateur : t.dojoMember;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6">{typeLabel} - Target vs Current</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="current" fill="#3b82f6" name={t.current} radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="#10b981" name={t.targetWeight} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FighterCard({ fighter, t, refreshKey, onSelect, onEdit, onDelete }: { 
  fighter: UserProfile, 
  t: any, 
  refreshKey: number, 
  onSelect: () => void,
  onEdit: () => void,
  onDelete: () => void
}) {
  const [latestEntry, setLatestEntry] = useState<WeightEntry | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'entries'),
      where('uid', '==', fighter.uid),
      orderBy('date', 'desc'),
      limit(1)
    );
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestEntry(snapshot.docs[0].data() as WeightEntry);
      }
    });
  }, [fighter.uid, refreshKey]);

  const current = latestEntry?.morningWeight || 0;
  const target = fighter.targetWeight || 0;
  const salt = fighter.saltCutEstimate || 0;
  const water = fighter.waterCutEstimate || 0;
  const remaining = current ? (current - target - salt - water) : null;

  const isMissingData = !latestEntry || (new Date().getTime() - new Date(latestEntry.date).getTime()) > 2 * 24 * 60 * 60 * 1000;
  const percentOver = target > 0 && current > 0 ? ((current - target) / target) * 100 : 0;
  
  const statusColor = isMissingData || percentOver > 3 ? "bg-red-50 border-red-200" : percentOver > 1 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";
  const statusText = isMissingData ? "text-red-700" : percentOver > 3 ? "text-red-700" : percentOver > 1 ? "text-amber-700" : "text-green-700";
  const statusBg = isMissingData ? "bg-red-100" : percentOver > 3 ? "bg-red-100" : percentOver > 1 ? "bg-amber-100" : "bg-green-100";

  return (
    <div 
      onClick={onSelect}
      className={cn("rounded-3xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md relative", statusColor)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
            {fighter.avatarUrl ? (
              <img src={fighter.avatarUrl} alt={fighter.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-blue-600 text-lg font-bold">{fighter.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">{fighter.name}</h4>
            <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", statusBg, statusText)}>
              {isMissingData ? t.noRecentData : remaining !== null ? `${remaining > 0 ? '+' : ''}${remaining.toFixed(1)} kg` : '--'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white rounded-2xl p-3 border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.current}</div>
          <div className="font-bold text-slate-900 text-lg">{current || '--'} <span className="text-xs text-slate-500 font-medium">kg</span></div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.targetWeight}</div>
          <div className="font-bold text-slate-900 text-lg">{target || '--'} <span className="text-xs text-slate-500 font-medium">kg</span></div>
        </div>
      </div>
    </div>
  );
}

function BulkEntry({ uid, t, onClose, existingEntries = [] }: { uid: string, t: any, onClose: () => void, existingEntries?: WeightEntry[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState(() => {
    if (existingEntries.length > 0) {
      return existingEntries.map(e => ({
        originalDate: e.date,
        date: e.date,
        morning: e.morningWeight?.toString() || '',
        evening: e.eveningWeight?.toString() || '',
        water: e.waterIntake?.toString() || ''
      }));
    }
    return [{ originalDate: null, date: new Date().toISOString().split('T')[0], morning: '', evening: '', water: '' }];
  });

  const addRow = () => {
    const lastDate = new Date(rows[rows.length - 1].date);
    lastDate.setDate(lastDate.getDate() - 1);
    setRows([...rows, { originalDate: null, date: lastDate.toISOString().split('T')[0], morning: '', evening: '', water: '' }]);
  };

  const updateRow = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value;
    setRows(newRows);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      const rowsToSave = rows.filter(r => r.morning || r.evening || r.water);
      
      for (const row of rowsToSave) {
        const existing = existingEntries.find(e => e.date === (row.originalDate || row.date));
        
        // Build the update object carefully to avoid undefined values
        const entryData: any = {
          ...existing,
          uid,
          date: row.date,
          morningWeight: row.morning ? parseFloat(row.morning) : deleteField(),
          eveningWeight: row.evening ? parseFloat(row.evening) : deleteField(),
          waterIntake: row.water ? parseFloat(row.water) : deleteField(),
          timestamp: serverTimestamp()
        };
        
        const newEntryId = row.date + '_' + uid;
        
        // If the date changed, delete the old entry
        if (row.originalDate && row.originalDate !== row.date) {
          batch.delete(doc(db, 'entries', row.originalDate + '_' + uid));
        }
        
        batch.set(doc(db, 'entries', newEntryId), entryData, { merge: true });
      }
      
      await batch.commit();
      onClose();
    } catch (err: any) {
      setError(err.message || "Save failed");
      handleFirestoreError(err, OperationType.WRITE, 'entries');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Table className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{existingEntries.length > 0 ? t.massEdit : t.bulkEntry}</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Manage multiple entries at once</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-4 px-2">{t.date}</th>
                <th className="pb-4 px-2">{t.morning} (kg)</th>
                <th className="pb-4 px-2">{t.evening} (kg)</th>
                <th className="pb-4 px-2">{t.waterIntake} (L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-2">
                    <input 
                      type="date" 
                      value={row.date} 
                      onChange={(e) => updateRow(idx, 'date', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      step="0.1"
                      value={row.morning} 
                      onChange={(e) => updateRow(idx, 'morning', e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      step="0.1"
                      value={row.evening} 
                      onChange={(e) => updateRow(idx, 'evening', e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      step="0.1"
                      value={row.water} 
                      onChange={(e) => updateRow(idx, 'water', e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            onClick={addRow}
            className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t.addRows}
          </button>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t.saveAll}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardView({ entries, chartData, t, profile, isCoach, onUpdatePlan, onEdit, activeCamp, sessionNotes }: { 
  entries: WeightEntry[], 
  chartData: any[], 
  t: any, 
  profile: UserProfile | null,
  isCoach?: boolean,
  onUpdatePlan?: (field: string, value: string) => void,
  onEdit?: (entry: WeightEntry) => void,
  activeCamp?: Camp | null,
  sessionNotes: SessionNote[]
}) {
  const [activeTab, setActiveTab] = useState<'stats' | 'notes'>('stats');
  const latestEntry = entries[entries.length - 1];

  const latestWeightEntry = useMemo(() => {
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].morningWeight || entries[i].eveningWeight) {
        return entries[i];
      }
    }
    return entries[entries.length - 1]; // fallback to last entry even if no weight
  }, [entries]);

  const firstEntryWithWeight = useMemo(() => {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].morningWeight || entries[i].eveningWeight) {
        return entries[i];
      }
    }
    return entries[0];
  }, [entries]);

  const weightDiff = (latestWeightEntry && firstEntryWithWeight && entries.length > 1)
    ? (latestWeightEntry.morningWeight || latestWeightEntry.eveningWeight || 0) - 
      (firstEntryWithWeight.morningWeight || firstEntryWithWeight.eveningWeight || 0)
    : 0;

  const campEntries = useMemo(() => {
    if (!activeCamp) return [];
    return entries.filter(e => e.campId === activeCamp.id);
  }, [entries, activeCamp]);

  const campChartData = useMemo(() => {
    return campEntries.map(e => ({
      date: e.date,
      morning: e.morningWeight,
      evening: e.eveningWeight,
      avg: (e.morningWeight && e.eveningWeight) ? (e.morningWeight + e.eveningWeight) / 2 : (e.morningWeight || e.eveningWeight)
    }));
  }, [campEntries]);

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const today = new Date().toISOString().split('T')[0];
    let count = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasEntry = entries.some(e => e.date === dateStr && (e.morningWeight || e.eveningWeight));
      if (!hasEntry) {
        if (dateStr === today) { checkDate.setDate(checkDate.getDate() - 1); continue; }
        break;
      }
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
      if (count > 365) break;
    }
    return count;
  }, [entries]);

  const daysToFight = useMemo(() => {
    if (!activeCamp?.targetDate) return null;
    const diff = Math.ceil((new Date(activeCamp.targetDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    return diff;
  }, [activeCamp]);

  const weeklyDeficit = useMemo(() => {
    if (!profile?.maintenanceCalories || entries.length === 0) return null;
    
    // Get entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(e => new Date(e.date) >= sevenDaysAgo);
    
    if (recentEntries.length === 0) return null;

    const totalIntake = recentEntries.reduce((sum, e) => sum + (e.estimatedCalories || 0), 0);
    const totalMaintenance = profile.maintenanceCalories * recentEntries.length;
    return totalMaintenance - totalIntake;
  }, [entries, profile]);

  const remainingToLose = useMemo(() => {
    const current = latestWeightEntry?.morningWeight || latestWeightEntry?.eveningWeight || activeCamp?.startingWeight || profile?.startingWeight || 0;
    if (profile?.targetWeight === undefined || profile?.targetWeight === null || !current) return null;
    const target = profile.targetWeight;
    const salt = profile.saltCutEstimate || 0;
    const water = profile.waterCutEstimate || 0;
    return current - target - salt - water;
  }, [profile, latestWeightEntry, activeCamp]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'stats' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {t.history}
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'notes' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {t.sessionNotes}
          {sessionNotes.length > 0 && (
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">
              {sessionNotes.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'stats' ? (
        <>
          {/* Camp Info */}
      {activeCamp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-3xl p-6 text-white shadow-lg",
            daysToFight !== null && daysToFight <= 7
              ? "bg-red-600 shadow-red-100"
              : daysToFight !== null && daysToFight <= 14
              ? "bg-amber-500 shadow-amber-100"
              : "bg-blue-600 shadow-blue-100"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.activeCamp}</span>
              <h3 className="text-2xl font-black">{activeCamp.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.targetWeight}</span>
              <div className="text-xl font-bold">{activeCamp.targetWeight} kg</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Started</div>
              <div className="font-bold text-sm">{activeCamp.startDate}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Entries</div>
              <div className="font-bold">{campEntries.length}</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 border border-white/30">
              <div className="text-[10px] font-bold uppercase opacity-60 mb-1">
                {daysToFight !== null ? 'Fight Day' : 'Weigh-in'}
              </div>
              <div className="font-black text-xl">
                {daysToFight !== null
                  ? daysToFight <= 0
                    ? 'TODAY'
                    : `${daysToFight}d`
                  : '--'}
              </div>
            </div>
          </div>
          {daysToFight !== null && daysToFight <= 7 && daysToFight > 0 && (
            <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 text-sm font-bold text-center animate-pulse">
              ⚠️ Fight week — {daysToFight} day{daysToFight !== 1 ? 's' : ''} to go
            </div>
          )}
        </motion.div>
      )}
      {/* Coach's Planning Card (Editable for Coach, Read-only for Fighter) */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            <h3 className="text-lg font-bold">{t.coachNotes}</h3>
          </div>
          {isCoach && (
            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/30">
              {t.coach} {t.plan}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-blue-500/30 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-xs font-semibold uppercase opacity-80 mb-2">{t.saltCut} (kg)</p>
            {isCoach ? (
              <input 
                type="number" 
                step="0.1"
                defaultValue={profile?.saltCutEstimate || 0}
                onBlur={(e) => onUpdatePlan?.('saltCutEstimate', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-2xl font-bold text-white outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            ) : (
              <p className="text-2xl font-bold">{profile?.saltCutEstimate || 0} kg</p>
            )}
            <p className="text-[10px] mt-2 opacity-60 italic">Anticipated salt cut during fight week</p>
          </div>

          <div className="bg-blue-500/30 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-xs font-semibold uppercase opacity-80 mb-2">{t.waterCut} (kg)</p>
            {isCoach ? (
              <input 
                type="number" 
                step="0.1"
                defaultValue={profile?.waterCutEstimate || 0}
                onBlur={(e) => onUpdatePlan?.('waterCutEstimate', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-2xl font-bold text-white outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            ) : (
              <p className="text-2xl font-bold">{profile?.waterCutEstimate || 0} kg</p>
            )}
            <p className="text-[10px] mt-2 opacity-60 italic">Anticipated water loss during cut</p>
          </div>

          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/40">
            <p className="text-xs font-semibold uppercase opacity-80 mb-2">{t.remainingToLose}</p>
            <p className="text-3xl font-bold">{remainingToLose !== null ? remainingToLose.toFixed(1) : '--'} kg</p>
            <p className="text-[10px] mt-2 opacity-80 font-medium">Actual weight to lose before cut</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{t.morning}</p>
          <p className="text-2xl font-bold text-slate-900">{latestEntry?.morningWeight || '--'} <span className="text-sm font-normal text-slate-400">kg</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{t.evening}</p>
          <p className="text-2xl font-bold text-slate-900">{latestEntry?.eveningWeight || '--'} <span className="text-sm font-normal text-slate-400">kg</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{t.trend}</p>
          <div className={cn("flex items-center gap-1 text-2xl font-bold", weightDiff <= 0 ? "text-green-600" : "text-red-600")}>
            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} <span className="text-sm font-normal">kg</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{t.weeklyDeficit}</p>
          <div className={cn("flex items-center gap-1 text-2xl font-bold", (weeklyDeficit || 0) >= 0 ? "text-green-600" : "text-red-600")}>
            {weeklyDeficit !== null ? weeklyDeficit.toLocaleString() : '--'} <span className="text-sm font-normal">kcal</span>
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      {streak > 0 && (
        <div className={cn(
          "flex items-center gap-3 rounded-2xl px-5 py-3 border",
          streak >= 14 ? "bg-orange-50 border-orange-200" : "bg-amber-50 border-amber-200"
        )}>
          <span className="text-2xl">{streak >= 14 ? '🔥' : '⚡'}</span>
          <div>
            <p className="font-black text-slate-900 text-lg leading-none">{streak}-day streak</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {streak >= 30 ? 'Incredible consistency!' : streak >= 14 ? 'Keep it up!' : streak >= 7 ? 'Great momentum!' : 'Keep going!'}
            </p>
          </div>
          {streak >= 7 && (
            <div className="ml-auto bg-white rounded-xl px-3 py-1 border border-amber-200">
              <span className="text-xs font-bold text-amber-700">{streak >= 30 ? '🏆 Legend' : streak >= 14 ? '🥇 Committed' : '🥊 On fire'}</span>
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Overall Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">{t.overallTrend}</h3>
            <div className="flex items-center gap-4">
              {profile?.targetWeight && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <div className="w-3 h-px bg-slate-300 border-t-2 border-dashed" />
                  {t.target}: {profile.targetWeight}kg
                </div>
              )}
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="morning" 
                    name={t.morning}
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6' }} 
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="evening" 
                    name={t.evening}
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#ef4444' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                {t.noData}
              </div>
            )}
          </div>
        </div>

        {/* Camp Specific Chart */}
        {activeCamp && campEntries.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">{t.campTrend}: {activeCamp.name}</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={campChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg" 
                    name="Avg Weight"
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#8b5cf6' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t.history}</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {entries.slice().reverse().map(entry => (
            <div key={entry.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">{entry.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {entry.estimatedCalories ? `${entry.estimatedCalories} kcal` : '--'}
                  </span>
                  {!isCoach && onEdit && (
                    <button 
                      onClick={() => onEdit(entry)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title={t.edit}
                    >
                      <Plus className="w-4 h-4 rotate-45" /> {/* Using Plus rotated as a simple icon or I can use another one if I have it */}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {t.morning}: <span className="font-semibold text-slate-700">{entry.morningWeight || '--'} kg</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  {t.evening}: <span className="font-semibold text-slate-700">{entry.eveningWeight || '--'} kg</span>
                </div>
                {entry.mood && (
                  <div className="flex items-center gap-1">
                    <span className="text-base">{['😴','😟','😐','💪','⚡'][entry.mood - 1]}</span>
                    <span className="text-xs text-slate-400">{['Exhausted','Tired','Okay','Good','Great'][entry.mood - 1]}</span>
                  </div>
                )}
              </div>
              {entry.caloriesText && (
                <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">{entry.caloriesText}</p>
              )}
            </div>
          ))}
          {entries.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">
              {t.noData}
            </div>
          )}
        </div>
      </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {sessionNotes.length > 0 ? (
            sessionNotes.map(note => (
              <SessionNoteCard
                key={note.id}
                note={note}
                isCoach={false}
                t={t}
              />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-3xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Edit className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.noNotesYet}</h4>
              <p className="text-slate-500 max-w-xs">
                {t.notesWillAppearHere}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LegalModal({ title, content, onClose }: { title: string, content: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">
          {content}
        </div>
      </motion.div>
    </div>
  );
}

function ConsentModal({ t, onComplete, isCoach, onShowLegal }: { t: any, onComplete: () => void, isCoach: boolean, onShowLegal: (title: string, content: string) => void }) {
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [ageAgreed, setAgeAgreed] = useState(false);
  const [coachAgreed, setCoachAgreed] = useState(isCoach); // Auto-agree for coaches since they don't share with a coach

  const canProceed = termsAgreed && ageAgreed && coachAgreed;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ResolveLogo className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{t.consentTitle}</h3>
        </div>

        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-700 font-medium leading-tight">
                {t.consentTerms}
              </span>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowLegal(t.termsConditions, t.termsConditionsContent); }} className="hover:underline">{t.termsConditions}</button>
                <span>•</span>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowLegal(t.privacyPolicy, t.privacyPolicyContent); }} className="hover:underline">{t.privacyPolicy}</button>
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={ageAgreed}
              onChange={(e) => setAgeAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 font-medium leading-tight">
              {t.consentAge}
            </span>
          </label>

          {!isCoach && (
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={coachAgreed}
                onChange={(e) => setCoachAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 font-medium leading-tight">
                {t.consentCoach}
              </span>
            </label>
          )}
        </div>

        <button 
          onClick={onComplete}
          disabled={!canProceed}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.consentButton}
        </button>
      </motion.div>
    </div>
  );
}

function OnboardingModal({ step, t, onNext, onBack, onSkip, onComplete }: { 
  step: number, 
  t: any, 
  onNext: () => void, 
  onBack: () => void,
  onSkip: () => void,
  onComplete: () => void 
}) {
  const steps = [
    { title: t.onboardingTitle, content: t.onboardingStep1, icon: <ResolveLogo className="w-12 h-12" /> },
    { title: t.onboardingTitle, content: t.onboardingStep2, icon: <Utensils className="w-12 h-12 text-blue-600" /> },
    { title: t.onboardingTitle, content: t.onboardingStep3, icon: <TrendingDown className="w-12 h-12 text-blue-600" /> },
    { title: t.onboardingTitle, content: t.onboardingStep4, icon: <TrendingDown className="w-12 h-12 text-blue-600" /> },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {currentStep.icon}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">{currentStep.title}</h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {currentStep.content}
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  s === step ? "w-8 bg-blue-600" : "w-2 bg-slate-200"
                )} 
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              {step > 1 && (
                <button 
                  onClick={onBack}
                  className="flex-1 py-4 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  {t.back}
                </button>
              )}
              <button 
                onClick={step === 4 ? onComplete : onNext}
                className="flex-[2] bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                {step === 4 ? t.gotIt : t.next}
              </button>
            </div>
            <button 
              onClick={onSkip}
              className="w-full py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors"
            >
              {t.skip}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
