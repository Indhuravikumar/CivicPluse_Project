import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, BarChart3, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  { icon: Zap, title: 'AI-Powered Analysis', desc: 'Automatically categorize, score, and route civic issues using intelligent AI.' },
  { icon: Shield, title: 'Duplicate Detection', desc: 'Smart deduplication prevents redundant reports and improves efficiency.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Executive dashboards with live KPIs, trends, and department performance.' },
  { icon: MapPin, title: 'Live Issue Map', desc: 'Interactive heatmap showing all civic issues with severity indicators.' },
];

const stats = [
  { label: 'Issues Resolved', value: '12,847' },
  { label: 'Cities Served', value: '24' },
  { label: 'Avg Resolution', value: '48h' },
  { label: 'Citizen Trust', value: '94%' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">CivicPulse AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-blue-500 hover:bg-blue-600">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-500/30">
            <Zap className="w-3.5 h-3.5" /> Smart India Hackathon 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            AI-Powered Civic<br />Intelligence Platform
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Report civic issues, get AI analysis, track resolutions in real-time. Built for smarter cities and empowered citizens.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 gap-2">
                Start Reporting <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-6 mb-24">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
            className="glass rounded-2xl p-5 text-center"
          >
            <p className="text-3xl font-bold text-blue-300">{s.value}</p>
            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need for smarter governance</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo credentials */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-center">Demo Credentials</h3>
          <div className="space-y-2 text-sm">
            {[
              { role: 'Admin', email: 'admin@civicpulse.gov', pw: 'Admin@123' },
              { role: 'Officer', email: 'officer.roads@civicpulse.gov', pw: 'Officer@123' },
              { role: 'Citizen', email: 'citizen1@gmail.com', pw: 'Citizen@123' },
            ].map(c => (
              <div key={c.role} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 w-16 font-medium">{c.role}</span>
                <span className="text-slate-400 flex-1">{c.email}</span>
                <span className="text-blue-300 font-mono">{c.pw}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center pb-8 text-slate-500 text-sm">
        © 2024 CivicPulse AI — Smart India Hackathon Edition
      </footer>
    </div>
  );
}
