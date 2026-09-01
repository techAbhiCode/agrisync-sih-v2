import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, ChevronDown, CheckCircle2, Save, AlertCircle, Edit2, CreditCard, ShieldCheck, Wallet, XCircle, Loader2 } from 'lucide-react';
import { getUserProfile, updateUserProfile, submitMandiRequest } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

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

export default function Profile() {
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [role, setRole] = useState<Role>('FARMER');
  const [mandiId, setMandiId] = useState('');
  const [customMandiName, setCustomMandiName] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('');
  const [category, setCategory] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cropOpen, setCropOpen] = useState(false);

  // Mandi Request State
  const [showMandiModal, setShowMandiModal] = useState(false);
  const [mandiReqData, setMandiReqData] = useState({ mandiName: '', location: '', licenseNumber: '', governmentId: '' });
  const [submittingReq, setSubmittingReq] = useState(false);

  const handleMandiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReq(true);
    try {
      await submitMandiRequest(mandiReqData);
      toast.success('Application Submitted', { description: 'Your Mandi registration request is pending approval.' });
      setShowMandiModal(false);
    } catch (err: any) {
      toast.error('Submission Failed', { description: err.response?.data?.error || 'Failed to submit.' });
    } finally {
      setSubmittingReq(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        if (data.user) {
          setFullName(data.user.name || '');
          setPhone(data.user.profileData?.phone || '');
          setLocation(data.user.profileData?.location || '');
          setCropType(data.user.profileData?.cropType || '');
          setCategory(data.user.profileData?.category || '');
          setAadharNumber(data.user.profileData?.aadharNumber || '');
          setBankAccount(data.user.profileData?.bankAccount || '');
          setUpiId(data.user.profileData?.upiId || '');
          setRole(data.user.role || 'FARMER');
          const serverMandi = data.user.mandiId || '';
          const knownMandis = ['Kanpur Central Mandi', 'Lucknow Wholesale Market', 'Varanasi Agri Hub', 'Agra Produce Market', "Meerut Farmer's Market"];
          if (serverMandi && !knownMandis.includes(serverMandi)) {
            setMandiId('OTHER');
            setCustomMandiName(serverMandi);
          } else {
            setMandiId(serverMandi);
          }
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const finalMandiId = mandiId === 'OTHER' ? customMandiName : mandiId;

      const data = await updateUserProfile({
        name: fullName,
        phone,
        location,
        cropType,
        category,
        aadharNumber,
        bankAccount,
        upiId,
        role,
        mandiId: finalMandiId
      });
      setSuccess(true);
      if (user && data.user) {
        login({ ...user, name: data.user.name, role: data.user.role, mandiId: data.user.mandiId });
      }
      setIsEditing(false); // Switch back to view mode on save
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === category)?.label || category;

  return (
    <div className="max-w-3xl mx-auto py-8 relative">
      <div className="absolute top-0 right-[-10%] w-64 h-64 bg-lime-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Profile</h1>
          <p className="text-zinc-400 mt-1">Manage your account details and farm information.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/40 rounded-lg flex items-center gap-2 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-lime-500/10 border border-lime-500/40 rounded-lg flex items-center gap-2 text-sm text-lime-400"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Core Info */}
            <div>
              <h3 className="text-sm font-semibold text-lime-500 mb-4 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm text-zinc-300 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text" placeholder="Your Name" required
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <span className="absolute left-9 top-2.5 text-zinc-500 text-sm border-r border-zinc-700 pr-2.5">+91</span>
                    <input
                      type="tel" placeholder="98765 43210" maxLength={10} pattern="[6-9][0-9]{9}"
                      value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-20 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Village / District / State</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text" placeholder="e.g. Anandpur, Jaipur, Rajasthan"
                      value={location} onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>            {/* Role & Access (Securely Managed) */}
            <div className="pt-4 border-t border-zinc-800/50">
              <h3 className="text-sm font-semibold text-purple-500 mb-4 uppercase tracking-wider">Account Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm text-zinc-300 font-medium">Your Role</label>
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold uppercase">{role}</p>
                      <p className="text-zinc-500 text-sm">Roles are securely managed by AgriSync.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Farming Details */}
            <div className="pt-4 border-t border-zinc-800/50">
              <h3 className="text-sm font-semibold text-emerald-500 mb-4 uppercase tracking-wider">Farming Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
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

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm text-zinc-300 font-medium">Farmer Category</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setCategory(opt.value)}
                        className={`flex flex-col items-center py-4 px-2 rounded-xl border text-center transition-all ${category === opt.value ? 'border-lime-500 bg-lime-500/10 text-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.15)]' : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60'}`}
                      >
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className="text-xs mt-1 opacity-60">{opt.sub}</span>
                        {category === opt.value && <CheckCircle2 className="h-4 w-4 mt-2 text-lime-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Documents */}
            <div className="pt-4 border-t border-zinc-800/50">
              <h3 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Optional & Secure Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Aadhar Number</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text" placeholder="XXXX XXXX XXXX" maxLength={12}
                      value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Bank Account Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text" placeholder="Account Number"
                      value={bankAccount} onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm text-zinc-300 font-medium">UPI ID</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text" placeholder="username@bank"
                      value={upiId} onChange={(e) => setUpiId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800/50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-transparent hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg text-sm transition-all border border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)] transition-all"
              >
                {saving ? <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* View Mode */}
            <div>
              <h3 className="text-sm font-semibold text-lime-500 mb-4 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Full Name</p>
                  <p className="text-base text-zinc-100 font-medium">{fullName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Phone Number</p>
                  <p className="text-base text-zinc-100 font-medium">{phone ? `+91 ${phone}` : 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Location</p>
                  <p className="text-base text-zinc-100 font-medium">{location || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50">
              <h3 className="text-sm font-semibold text-emerald-500 mb-4 uppercase tracking-wider">Farming Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Primary Crop Type</p>
                  <p className="text-base text-zinc-100 font-medium">{cropType || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Farmer Category</p>
                  <p className="text-base text-zinc-100 font-medium">{categoryLabel || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50">
              <h3 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider">Secure Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Aadhar Number</p>
                  <p className="text-base text-zinc-100 font-medium">{aadharNumber ? `********${aadharNumber.slice(-4)}` : 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Bank Account</p>
                  <p className="text-base text-zinc-100 font-medium">{bankAccount ? `********${bankAccount.slice(-4)}` : 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">UPI ID</p>
                  <p className="text-base text-zinc-100 font-medium">{upiId || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50">
              <h3 className="text-sm font-semibold text-purple-500 mb-4 uppercase tracking-wider">Account Role</h3>
              <div className="grid grid-cols-1 gap-y-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Current Role</p>
                  <p className="text-base text-zinc-100 font-medium uppercase">{role}</p>
                </div>
                {role === 'mandi_admin' && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Assigned Mandi</p>
                    <p className="text-base text-zinc-100 font-medium">{mandiId || 'Not assigned'}</p>
                  </div>
                )}
                {role !== 'mandi_admin' && role !== 'system_admin' && (
                  <div>
                    <button onClick={() => setShowMandiModal(true)} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg">
                      Register as Mandi Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mandi Request Modal */}
      <AnimatePresence>
        {showMandiModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Mandi Registration</h2>
                <button onClick={() => setShowMandiModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleMandiSubmit} className="p-6 space-y-4">
                <p className="text-sm text-zinc-400 mb-2">Submit your official details to become a registered Mandi Admin on AgriSync.</p>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Mandi Name</label>
                  <input required type="text" placeholder="e.g. Kanpur Central Mandi" value={mandiReqData.mandiName} onChange={e => setMandiReqData({...mandiReqData, mandiName: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Location</label>
                  <input required type="text" placeholder="City, State" value={mandiReqData.location} onChange={e => setMandiReqData({...mandiReqData, location: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Mandi License / Registration Number</label>
                  <input required type="text" placeholder="e.g. M-12345" value={mandiReqData.licenseNumber} onChange={e => setMandiReqData({...mandiReqData, licenseNumber: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-300 font-medium">Government ID (Aadhar/PAN)</label>
                  <input required type="text" placeholder="Your Govt ID" value={mandiReqData.governmentId} onChange={e => setMandiReqData({...mandiReqData, governmentId: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50" />
                </div>
                <button type="submit" disabled={submittingReq} className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg text-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50">
                  {submittingReq ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Submit Application
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
