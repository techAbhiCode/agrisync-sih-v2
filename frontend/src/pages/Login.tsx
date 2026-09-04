import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Lock, Mail, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/store/authStore';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import api, { syncUserProfile } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  // Shared post-auth logic: verify token against backend, then update Zustand
  const handleSuccessfulAuth = async (user: any) => {
    try {
      // 1. Verify the Firebase ID token with our backend
      const response = await api.get('/auth/verify');
      console.log('✅ Backend Success:', response.data);

      // 1b. Sync user profile with MongoDB
      const syncResponse = await syncUserProfile({
        name: user.displayName || 'AgriSync User',
        email: user.email
      });
      console.log('✅ User Synced to MongoDB');

      const dbUser = syncResponse.user;
      const role: Role = dbUser.role === 'system_admin' ? 'system_admin' : (dbUser.role?.toUpperCase() || 'FARMER');

      // 3. Update Zustand store
      login({
        id: user.uid,
        name: dbUser.name || user.displayName || 'AgriSync User',
        email: dbUser.email || user.email,
        role: role,
        mandiId: dbUser.mandiId
      });

      const from = location.state?.from?.pathname || (role === 'ADMIN' ? '/admin' : '/');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('❌ Backend Verification Failed:', err);
      setError('Backend authorization failed. Is the server running?');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulAuth(userCredential.user);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Check your credentials.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleSuccessfulAuth(result.user);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image & Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/src/assets/auth_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-farm-pattern opacity-50 mix-blend-multiply" />

      {/* Background cinematic glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-600/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600/10 p-3 rounded-full mb-4 ring-1 ring-lime-500/30 shadow-[0_0_30px_rgba(132,204,22,0.2)]">
            <Sprout className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-green-950 tracking-tight">AgriSync.</h1>
          <p className="text-gray-600 mt-2 text-sm">Enterprise Agricultural Management</p>
        </div>

        <Card className="bg-white/60 backdrop-blur-xl border-green-200 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-green-950">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-800">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="farmer@agrisync.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-green-50/50 border-green-200 text-green-950 focus-visible:ring-lime-500 transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-green-800">Password</Label>
                  <a href="#" className="text-xs text-green-600 hover:text-lime-400 transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-green-50/50 border-green-200 text-green-950 focus-visible:ring-lime-500 transition-all" 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-zinc-950 font-bold h-11 transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 animate-pulse">Authenticating...</span>
                ) : (
                  <span className="flex items-center gap-2">Secure Login <ArrowRight className="h-4 w-4" /></span>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-green-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/60 px-2 text-gray-500">Or continue with</span></div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full bg-green-50 border-green-200 text-green-800 hover:bg-green-50 hover:text-green-950"
            >
              Google Account
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-lime-400 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
        
        {/* Pro-Tip for Hackathon presentation */}
        <p className="text-center text-xs text-zinc-600 mt-6 font-mono">
          Demo: Use any email with "admin" to access Control Panel.
        </p>
      </motion.div>
    </div>
  );
}