import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, User, Mail, Phone, MapPin, Lock, Eye, EyeOff,
  Camera, ChevronDown, ArrowRight, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useAuthStore } from '@/store/authStore';
import api, { syncUserProfile } from '@/lib/api';

const CROP_OPTIONS = [
  'Wheat', 'Rice / Paddy', 'Maize / Corn', 'Sugarcane',
  'Cotton', 'Soybean', 'Mustard / Rapeseed', 'Groundnut',
  'Vegetables (Mixed)', 'Fruits (Mixed)', 'Pulses (Dal)',
  'Spices', 'Other',
];

const CATEGORY_OPTIONS = [
  { value: 'MARGINAL', label: 'Marginal', sub: '< 1 ha' },
  { value: 'SMALL', label: 'Small', sub: '1–2 ha' },
  { value: 'LARGE', label: 'Large', sub: '> 2 ha' },
];

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState<'FARMER' | 'MANDI_ADMIN'>('FARMER');
  const [mandiId, setMandiId] = useState('');
  const [customMandiName, setCustomMandiName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const passwordsMatch = confirmPassword === '' || password === confirmPassword;
  const passwordStrong = password.length >= 8;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'FARMER') {
      if (!cropType) { setError('Please select a crop type.'); return; }
      if (!category) { setError('Please select a farmer category.'); return; }
    } else if (role === 'MANDI_ADMIN') {
      if (!mandiId) { setError('Please select an assigned Mandi.'); return; }
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!passwordStrong) { setError('Password must be at least 8 characters.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      await updateProfile(user, { displayName: fullName });
      await api.get('/auth/verify');
      
      const finalMandiId = mandiId === 'OTHER' ? customMandiName : mandiId;

      const syncResponse = await syncUserProfile({
        name: fullName,
        email: user.email!,
        role,
        mandiId: role === 'MANDI_ADMIN' ? finalMandiId : undefined,
        profileData: {
          phone,
          location,
          cropType: role === 'FARMER' ? cropType : undefined,
          category: role === 'FARMER' ? category : undefined,
        }
      });
      
      const dbUser = syncResponse.user;
      login({ 
        id: user.uid, 
        name: dbUser.name, 
        email: dbUser.email, 
        role: dbUser.role, 
        mandiId: dbUser.mandiId 
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in.',
        'auth/weak-password': 'Password too weak. Use at least 8 characters.',
        'auth/invalid-email': 'Invalid email address.',
      };
      setError(msg[err.code] || err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-lime-500/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-lg z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-lime-500/10 p-3 rounded-full mb-4 ring-1 ring-lime-500/30 shadow-[0_0_30px_rgba(132,204,22,0.2)]">
            <Sprout className="h-8 w-8 text-lime-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AgriSync.</h1>
          <p className="text-zinc-400 mt-1 text-sm">Create your farmer account</p>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-lime-500' : 'bg-zinc-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-lime-500' : 'bg-zinc-800'}`} />
          <span className="text-xs text-zinc-500 shrink-0">Step {step} / 2</span>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-lg flex items-start gap-2 text-sm text-red-400"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleStep1}
              className="space-y-4"
            >
              <h2 className="text-base font-semibold text-zinc-100 mb-1">Personal Information</h2>

              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-lime-500 transition-colors overflow-hidden group"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Camera className="h-6 w-6 text-zinc-500 group-hover:text-lime-500 transition-colors" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </button>
                <span className="text-xs text-zinc-500">Profile Photo (optional)</span>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text" placeholder="Ramesh Kumar Patel" required
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <span className="absolute left-9 top-2.5 text-zinc-500 text-sm border-r border-zinc-700 pr-2.5">+91</span>
                  <input
                    type="tel" placeholder="98765 43210" required maxLength={10} pattern="[6-9][0-9]{9}"
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-20 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Village / District / State</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text" placeholder="Anandpur, Jaipur, Rajasthan" required
                    value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole('FARMER')}
                    className={`flex flex-col items-center py-3 px-2 rounded-lg border text-center transition-all ${role === 'FARMER' ? 'border-lime-500 bg-lime-500/10 text-lime-400' : 'border-zinc-800 bg-zinc-950/40 text-zinc-400'}`}
                  >
                    <span className="text-sm font-semibold">Farmer</span>
                  </button>
                  <button type="button" onClick={() => setRole('MANDI_ADMIN')}
                    className={`flex flex-col items-center py-3 px-2 rounded-lg border text-center transition-all ${role === 'MANDI_ADMIN' ? 'border-lime-500 bg-lime-500/10 text-lime-400' : 'border-zinc-800 bg-zinc-950/40 text-zinc-400'}`}
                  >
                    <span className="text-sm font-semibold">Mandi Admin</span>
                  </button>
                </div>
              </div>

              {/* Mandi Admin Specific */}
              <AnimatePresence>
                {role === 'MANDI_ADMIN' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-300 font-medium">Select Assigned Mandi</label>
                      <select
                        value={mandiId === 'OTHER' ? 'OTHER' : mandiId} onChange={(e) => setMandiId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                        required={role === 'MANDI_ADMIN' && mandiId !== 'OTHER'}
                      >
                        <option value="">Select a Mandi...</option>
                        <option value="Kanpur Central Mandi">Kanpur Central Mandi</option>
                        <option value="Lucknow Wholesale Market">Lucknow Wholesale Market</option>
                        <option value="Varanasi Agri Hub">Varanasi Agri Hub</option>
                        <option value="Agra Produce Market">Agra Produce Market</option>
                        <option value="Meerut Farmer's Market">Meerut Farmer's Market</option>
                        <option value="OTHER">Other (Add Custom Mandi)</option>
                      </select>
                    </div>

                    <AnimatePresence>
                      {mandiId === 'OTHER' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <label className="text-sm text-zinc-300 font-medium mb-1.5 block">Custom Mandi Name</label>
                          <input
                            type="text" placeholder="e.g. Unnao Sub Mandi" required
                            value={customMandiName}
                            onChange={(e) => setCustomMandiName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Farmer Specific */}
              <AnimatePresence>
                {role === 'FARMER' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                    {/* Crop Type */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-300 font-medium">Primary Crop Type</label>
                      <div className="relative">
                        <button
                          type="button" onClick={() => setCropOpen((o) => !o)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all"
                        >
                          <span className={cropType ? 'text-white' : 'text-zinc-600'}>{cropType || 'Select crop…'}</span>
                          <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${cropOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {cropOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                              className="absolute z-20 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-auto max-h-44"
                            >
                              {CROP_OPTIONS.map((c) => (
                                <button key={c} type="button"
                                  onClick={() => { setCropType(c); setCropOpen(false); }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition-colors ${cropType === c ? 'text-lime-400' : 'text-zinc-300'}`}
                                >{c}</button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Farmer Category */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-300 font-medium">Farmer Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORY_OPTIONS.map((opt) => (
                          <button key={opt.value} type="button" onClick={() => setCategory(opt.value)}
                            className={`flex flex-col items-center py-3 px-2 rounded-lg border text-center transition-all ${category === opt.value ? 'border-lime-500 bg-lime-500/10 text-lime-400' : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'}`}
                          >
                            <span className="text-xs font-semibold">{opt.label}</span>
                            <span className="text-[10px] mt-0.5 opacity-60">{opt.sub}</span>
                            {category === opt.value && <CheckCircle2 className="h-3 w-3 mt-1 text-lime-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit"
                className="w-full mt-2 py-2.5 bg-lime-500 hover:bg-lime-600 text-zinc-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)] transition-all"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </motion.form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-1">
                <button type="button" onClick={() => { setError(''); setStep(1); }}
                  className="text-zinc-500 hover:text-zinc-200 text-xs transition-colors"
                >← Back</button>
                <h2 className="text-base font-semibold text-zinc-100">Account Credentials</h2>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input type="email" placeholder="ramesh@example.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                {password.length > 0 && (
                  <div className="flex gap-1">
                    {[2, 4, 6, 8].map((threshold) => (
                      <div key={threshold} className={`h-1 flex-1 rounded-full transition-all ${password.length >= threshold ? (passwordStrong ? 'bg-lime-500' : 'bg-yellow-500') : 'bg-zinc-800'}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300 font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" required
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 bg-zinc-950/50 border rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${passwordsMatch ? 'border-zinc-800 focus:ring-lime-500/50 focus:border-lime-500/50' : 'border-red-500/60 focus:ring-red-500/30'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                {!passwordsMatch && confirmPassword.length > 0 && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-zinc-800/40 rounded-lg p-3 space-y-1.5 text-xs text-zinc-400">
                <p className="text-zinc-300 font-medium">Summary</p>
                {[
                  ['Name', fullName],
                  ['Phone', phone ? `+91 ${phone}` : '—'],
                  ['Location', location],
                  ['Crop', cropType],
                  ['Category', CATEGORY_OPTIONS.find(o => o.value === category)?.label || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span>{label}</span>
                    <span className="text-zinc-200 truncate max-w-[55%] text-right">{val || '—'}</span>
                  </div>
                ))}
              </div>

              <button type="submit"
                disabled={isLoading || !passwordsMatch || !passwordStrong}
                className="w-full py-2.5 bg-lime-500 hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)] transition-all"
              >
                {isLoading ? <span className="animate-pulse">Creating Account…</span> : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </motion.form>
          )}

          <p className="text-center text-xs text-zinc-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-lime-500 hover:text-lime-400 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
