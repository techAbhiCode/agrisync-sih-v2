import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingMandiRequests, approveMandiRequest, rejectMandiRequest } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ShieldAlert, CheckCircle2, XCircle, ShieldCheck, Loader2, Building, MapPin, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdmin() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await getPendingMandiRequests();
      console.log('Fetched requests:', data);
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error('Fetch requests error:', err.response?.data || err);
      toast.error('Error', { description: err.response?.data?.error || 'Failed to load requests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'system_admin') {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveMandiRequest(id);
      toast.success('Request Approved', { description: 'User has been granted Mandi Admin access.' });
      setRequests(reqs => reqs.filter(r => r._id !== id));
    } catch (err: any) {
      toast.error('Error', { description: err.response?.data?.error || 'Failed to approve.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return; // cancelled

    setProcessingId(id);
    try {
      await rejectMandiRequest(id, reason);
      toast.success('Request Rejected', { description: 'User has been notified.' });
      setRequests(reqs => reqs.filter(r => r._id !== id));
    } catch (err: any) {
      toast.error('Error', { description: err.response?.data?.error || 'Failed to reject.' });
    } finally {
      setProcessingId(null);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (user?.role !== 'system_admin') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-950 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">You do not have permission to view this page. It is restricted to System Administrators.</p>
        
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-black text-green-950 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and manage Mandi Admin registration requests.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white/60 border border-green-200 rounded-2xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-green-950 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">There are no pending Mandi registration requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-green-200 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="p-5 border-b border-green-200/50 bg-green-50/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-green-950 mb-1 flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-400" /> {req.mandiName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {req.location}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Applicant</p>
                    <p className="text-sm text-green-900 font-medium">{req.applicantName}</p>
                    <p className="text-xs text-gray-600">{req.applicantEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> License / Registration</p>
                    <p className="text-sm text-green-900 font-mono bg-green-50 p-2 rounded border border-green-200">{req.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Govt ID</p>
                    <p className="text-sm text-green-900 font-mono bg-green-50 p-2 rounded border border-green-200">{req.governmentId}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-1">Applied On</p>
                    <p className="text-sm text-green-800">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-5 border-t border-green-200/50 bg-green-50/50 flex gap-3">
                  <button
                    onClick={() => handleReject(req._id)}
                    disabled={processingId !== null}
                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req._id)}
                    disabled={processingId !== null}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-zinc-950 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(132,204,22,0.2)]"
                  >
                    {processingId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
