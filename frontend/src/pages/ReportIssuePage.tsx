import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Upload, X, Sparkles, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import { useCreateIssue } from '@/hooks/useIssues';
import { toast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import 'leaflet/dist/leaflet.css';

const CATEGORIES = ['Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Road Damage', 'Fallen Tree', 'Broken Footpath', 'Traffic Signal', 'Encroachment', 'Other'];

// Fix Map Center dynamically
function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <CircleMarker center={position} radius={8} fillColor="#2563eb" color="#ffffff" weight={2} opacity={1} fillOpacity={1} /> : null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const createIssue = useCreateIssue();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', category: '', address: '',
    lat: 13.0827, lng: 80.2707, // Default to Chennai
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - images.length);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages(imgs => imgs.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const detectGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        update('lat', pos.coords.latitude);
        update('lng', pos.coords.longitude);
        setGpsLoading(false);
        // Reverse geocoding for address (basic fallback)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          if (data.display_name) update('address', data.display_name);
        } catch {
          update('address', 'Current Location');
        }
      },
      () => { setGpsLoading(false); toast.error('Location access denied. Please click on the map.'); }
    );
  };

  const searchAddress = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.address.trim()) return;
    setGpsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        update('lat', parseFloat(data[0].lat));
        update('lng', parseFloat(data[0].lon));
        update('address', data[0].display_name);
      } else {
        toast.error('Location not found', 'Try being more specific or click directly on the map.');
      }
    } catch {
      toast.error('Search failed', 'Could not search for this location right now.');
    } finally {
      setGpsLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!form.title || !form.description) { toast.warning('Fill in title and description first'); return; }
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze-text', {
        title: form.title, description: form.description,
        category: form.category || 'Other', location: 'Unknown',
      });
      if (data.data.detected_category) {
        update('category', data.data.detected_category);
        toast.success('AI Analysis applied', `Suggested category: ${data.data.detected_category}`);
      } else {
        toast.error('AI suggestion unavailable', 'Please select a category manually.');
      }
    } catch {
      toast.error('AI analysis unavailable');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!form.title || !form.description || !form.category)) {
      toast.warning('Please fill all required fields to continue.');
      return;
    }
    if (step === 2 && !form.address) {
      toast.warning('Please provide an address or select a location on the map.');
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('location', JSON.stringify({
      address: form.address,
      lat: form.lat,
      lng: form.lng,
    }));
    images.forEach(img => fd.append('images', img));

    createIssue.mutate(fd, { 
      onSuccess: (data) => {
        setSubmittedId(data?.data?._id || 'CP-NEW');
        setStep(5);
      },
      onError: () => {
        toast.error('Failed to submit report. Please try again.');
      }
    });
  };

  // Step Nav
  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8 text-[13px] font-medium text-slate-400">
      <span className={step >= 1 ? 'text-blue-600 dark:text-blue-500' : ''}>1. Details</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className={step >= 2 ? 'text-blue-600 dark:text-blue-500' : ''}>2. Location</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className={step >= 3 ? 'text-blue-600 dark:text-blue-500' : ''}>3. Evidence</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className={step >= 4 ? 'text-blue-600 dark:text-blue-500' : ''}>4. Review</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen text-foreground font-sans">
      
      {step < 5 && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">
              Report an issue
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
              Help improve your neighborhood by reporting something that needs attention.
            </p>
          </div>
          <Link to="/issues" className="text-[14px] font-medium text-blue-600 dark:text-primary hover:underline">
            View my reports &rarr;
          </Link>
        </div>
      )}

      {step < 5 && <StepIndicator />}

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 bg-white dark:bg-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm">
                <h2 className="text-[18px] font-semibold mb-6 border-b border-slate-100 dark:border-border/50 pb-4">Issue Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">What needs attention?</label>
                    <input 
                      value={form.title} onChange={e => update('title', e.target.value)}
                      placeholder="e.g. Broken streetlight near the bus stop"
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[14px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tell us what happened</label>
                    <textarea 
                      value={form.description} onChange={e => update('description', e.target.value)}
                      rows={5}
                      placeholder="Describe the issue, where you noticed it, and anything that may help the city team understand it."
                      className="w-full px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[14px] resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                      <select 
                        value={form.category} onChange={e => update('category', e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[14px]"
                      >
                        <option value="" disabled>Select category...</option>
                        {CATEGORIES.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                      </select>
                    </div>
                    <button 
                      type="button" onClick={analyzeWithAI} disabled={analyzing}
                      className="h-11 px-4 flex items-center justify-center gap-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                    >
                      <Sparkles className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Auto-suggest category'}
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border/50 flex justify-end">
                  <button onClick={handleNext} className="h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[14px] shadow-sm transition-colors">
                    Continue to Location
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 bg-white dark:bg-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm">
                <h2 className="text-[18px] font-semibold mb-6 border-b border-slate-100 dark:border-border/50 pb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Location
                </h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <form onSubmit={searchAddress} className="w-full sm:flex-1 flex gap-2">
                      <input 
                        value={form.address} onChange={e => update('address', e.target.value)}
                        placeholder="Search address or landmark..."
                        className="flex-1 h-11 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[14px]"
                      />
                      <button 
                        type="submit" 
                        disabled={gpsLoading || !form.address.trim()}
                        className="h-11 px-5 shrink-0 flex items-center justify-center text-[13px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        Search
                      </button>
                    </form>
                    <button 
                      type="button" onClick={detectGPS} disabled={gpsLoading}
                      className="w-full sm:w-auto h-11 px-5 shrink-0 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-muted border border-slate-200 dark:border-border rounded-lg hover:bg-slate-200 dark:hover:bg-muted/80 transition-all whitespace-nowrap"
                    >
                      <MapPin className="w-4 h-4" /> {gpsLoading ? 'Locating...' : 'Use current location'}
                    </button>
                  </div>

                  <div className="h-[300px] sm:h-[400px] w-full bg-slate-100 dark:bg-muted/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                    <MapContainer center={[form.lat, form.lng]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                      <TileLayer 
                        className="map-tiles" 
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                      />
                      <LocationMarker position={[form.lat, form.lng]} setPosition={(pos) => { update('lat', pos[0]); update('lng', pos[1]); update('address', `${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}`); }} />
                      <MapUpdater center={[form.lat, form.lng]} />
                    </MapContainer>
                    <style>{`
                      .dark .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
                      .leaflet-container { font-family: inherit; }
                    `}</style>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[12px] text-slate-500 text-center">Click on the map to place the marker exactly where the issue is.</p>
                    <p className="text-[11px] text-slate-400 text-center mt-1 max-w-[400px]">
                      Your location is used to identify where the civic issue occurred. We only access your location when you choose to share it.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border/50 flex justify-between">
                  <button onClick={() => setStep(1)} className="h-11 px-6 rounded-lg font-medium text-[14px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted transition-colors">Back</button>
                  <button onClick={handleNext} className="h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[14px] shadow-sm transition-colors">Continue to Evidence</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 bg-white dark:bg-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm">
                <h2 className="text-[18px] font-semibold mb-6 border-b border-slate-100 dark:border-border/50 pb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" /> Evidence
                </h2>
                
                <div className="space-y-4">
                  <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-4">Photos help departments understand the issue and resolve it faster. (Optional)</p>
                  
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-muted/30 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
                    <p className="text-[15px] font-medium text-slate-700 dark:text-slate-300">Click to upload photos</p>
                    <p className="text-[13px] text-slate-500 mt-1">JPG, PNG up to 5MB (Max 5 photos)</p>
                    <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square">
                          <img src={src} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border/50 flex justify-between">
                  <button onClick={() => setStep(2)} className="h-11 px-6 rounded-lg font-medium text-[14px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted transition-colors">Back</button>
                  <button onClick={handleNext} className="h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[14px] shadow-sm transition-colors">Review Report</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 bg-white dark:bg-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm">
                <h2 className="text-[18px] font-semibold mb-6 border-b border-slate-100 dark:border-border/50 pb-4">Review Report</h2>
                
                <div className="space-y-6">
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Issue</p>
                      <p className="text-[15px] font-medium">{form.title}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                      <p className="text-[15px] font-medium">{form.category}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-muted/50 p-4 rounded-lg">{form.description}</p>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <div className="flex items-center gap-2 text-[14px] font-medium bg-slate-50 dark:bg-muted/50 p-4 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {form.address}
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Evidence</p>
                    <p className="text-[14px] text-slate-600 dark:text-slate-300">{images.length > 0 ? `${images.length} photos attached` : 'No photos provided'}</p>
                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border/50 flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                  <button onClick={() => setStep(3)} disabled={createIssue.isPending} className="h-11 px-6 rounded-lg font-medium text-[14px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted transition-colors">Back to Edit</button>
                  <button onClick={handleSubmit} disabled={createIssue.isPending} className="h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[14px] shadow-sm transition-colors flex items-center justify-center gap-2">
                    {createIssue.isPending ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center bg-white dark:bg-card p-10 sm:p-16 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-[24px] font-bold mb-2">Report Submitted</h2>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8 max-w-[300px]">
                  Your civic issue has been successfully received and routed to the appropriate department.
                </p>
                
                <div className="bg-slate-50 dark:bg-muted/50 w-full max-w-[280px] p-4 rounded-xl border border-slate-100 dark:border-border/50 mb-8">
                  <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Report ID</p>
                  <p className="text-[16px] font-bold tracking-wide">{submittedId}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
                  <Link to="/" className="flex-1 h-11 flex items-center justify-center rounded-lg font-medium text-[14px] bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-muted/80 transition-colors">
                    Return to dashboard
                  </Link>
                  <Link to={`/issues/${submittedId}`} className="flex-1 h-11 flex items-center justify-center rounded-lg font-medium text-[14px] bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                    View report
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 5 && (
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-sm">
              <h3 className="text-[12px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-4">Report Guidance</h3>
              <ul className="space-y-4 text-[13px] text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">Clear Details</strong>
                    Provide a concise title and enough description for responders to understand the scope.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">Accurate Location</strong>
                    Drop the pin exactly where the issue is. Use landmarks in the address.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">Visual Evidence</strong>
                    Photos speed up resolution significantly by allowing teams to assess priority remotely.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
