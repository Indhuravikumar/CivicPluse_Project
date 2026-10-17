import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toaster';
import api from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', ward: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.token);
      toast.success('Account created!', 'Welcome to CivicPulse AI');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-1">Join CivicPulse AI as a citizen</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Arjun Kumar"
              icon={<User className="w-4 h-4" />} required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')}
              placeholder="you@gmail.com" icon={<Mail className="w-4 h-4" />} required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')}
              placeholder="Min 6 characters" icon={<Lock className="w-4 h-4" />} required />
            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+91 98765 43210" icon={<Phone className="w-4 h-4" />} />
            <Input label="Address" value={form.address} onChange={set('address')}
              placeholder="Your residential area" icon={<MapPin className="w-4 h-4" />} />
            <Input label="Ward / Zone" value={form.ward} onChange={set('ward')}
              placeholder="e.g. Ward 10" />
            <Button type="submit" className="w-full mt-2" loading={loading}>
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-white/40 mt-4">
          <Link to="/" className="hover:text-white/70">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
