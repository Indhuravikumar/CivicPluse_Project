import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Share2, AlertTriangle, ShieldCheck, FileText, Activity, MessageSquare, CheckCircle, Search, ThumbsUp, Check, Play, User, ExternalLink, X, Building2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { useIssue, useUpvoteIssue } from '@/hooks/useIssues';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { AdminAssignmentPanel } from '@/components/issues/AdminAssignmentPanel';
import { OfficerResolutionPanel } from '@/components/issues/OfficerResolutionPanel';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading } = useIssue(id!);
  const upvote = useUpvoteIssue();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const issue = data?.data;

  // Status mappings for semantic styling
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved':
      case 'closed': return 'text-emerald-700 dark:text-emerald-400';
      case 'in_progress': return 'text-blue-700 dark:text-blue-400';
      case 'rejected': return 'text-red-700 dark:text-red-400';
      default: return 'text-amber-700 dark:text-amber-400'; // pending, assigned
    }
  };

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'resolved':
      case 'closed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  const getStatusExplanation = (status: string) => {
    switch(status) {
      case 'pending': return 'Your report has been received and is awaiting review.';
      case 'assigned': return 'This issue has been routed to the appropriate department.';
      case 'in_progress': return 'The responsible department is currently working on this issue.';
      case 'resolved': return 'Work has been completed and the issue is resolved.';
      case 'closed': return 'This case is now officially closed.';
      case 'rejected': return 'This report was reviewed but could not be processed.';
      default: return 'Awaiting further updates.';
    }
  };

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 dark:bg-muted rounded mb-8" />
      <div className="h-8 w-2/3 bg-slate-200 dark:bg-muted rounded mb-3" />
      <div className="h-4 w-1/3 bg-slate-200 dark:bg-muted rounded mb-10" />
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[400px] bg-slate-200 dark:bg-muted rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-muted rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-muted rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-muted rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-muted rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (!issue) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-[20px] font-bold text-slate-900 dark:text-foreground mb-2">Issue not found</h2>
      <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
        This civic report is no longer available or the link may be incorrect.
      </p>
      <button onClick={() => navigate('/issues')} className="h-11 px-6 rounded-lg bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-[14px] transition-colors">
        Back to Issues
      </button>
    </div>
  );

  const hasUpvoted = issue.upvotes.includes(user?._id || '');
  const departmentName = typeof issue.department === 'object' ? issue.department?.name : 'Awaiting assignment';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Back Navigation */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors mb-8 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Issues
        </button>

        {/* Issue Header */}
        <div className="mb-10">
          <h1 className="text-[28px] sm:text-[36px] font-bold text-slate-900 dark:text-slate-50 leading-tight mb-3">
            {issue.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-800 dark:text-slate-200">{issue.category}</span>
            {(issue.severity === 'high' || issue.severity === 'critical') && (
              <span className={`flex items-center gap-1.5 font-medium ${issue.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> {issue.severity} Priority
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Reported {timeAgo(issue.createdAt)}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Description & Evidence */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl overflow-hidden shadow-sm">
              {issue.images && issue.images.length > 0 && (
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-muted cursor-pointer group" onClick={() => setGalleryOpen(true)}>
                  <img src={issue.images[0]} alt="Primary evidence" className="w-full h-full object-cover" />
                  {issue.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 group-hover:bg-black/90 transition-colors">
                      <ImageIcon className="w-4 h-4" /> +{issue.images.length - 1} photos
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6 sm:p-8">
                <h2 className="text-[13px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-4">About this issue</h2>
                <p className="text-[16px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {issue.description}
                </p>
                
                {issue.images && issue.images.length > 1 && (
                  <div className="mt-8">
                    <h3 className="text-[13px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-3">Evidence Gallery</h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      {issue.images.map((img: any, i: number) => (
                        <div key={i} onClick={() => { setCurrentImageIndex(i); setGalleryOpen(true); }} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-border/50">
                <h2 className="text-[13px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-2">Location</h2>
                <div className="flex items-start gap-2 text-[15px] font-medium text-slate-900 dark:text-slate-100">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p>{issue.location.address}</p>
                </div>
              </div>
              <div className="h-[280px] w-full bg-slate-100 dark:bg-muted relative">
                <MapContainer center={[issue.location.lat, issue.location.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                  <TileLayer 
                    className="map-tiles" 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  />
                  <CircleMarker center={[issue.location.lat, issue.location.lng]} radius={8} fillColor="#2563eb" color="#ffffff" weight={2} opacity={1} fillOpacity={1} />
                </MapContainer>
                <style>{`
                  .dark .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
                  .leaflet-container { font-family: inherit; }
                `}</style>
              </div>
            </div>

            {/* Resolution Timeline */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-[13px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-5">Issue Progress</h2>
              
              <div className="mb-8">
                <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Current status: <span className="capitalize text-blue-600 dark:text-blue-400">{issue.status.replace('_', ' ')}</span>
                </p>
                <p className="text-[14px] text-slate-600 dark:text-slate-400">
                  {getStatusExplanation(issue.status)}
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-200/80 dark:bg-slate-700" />
                
                {/* Initial Submit Event */}
                <div className="relative flex items-start mb-6 last:mb-0">
                  <div className="w-6 shrink-0 flex justify-center mt-1">
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 border-[2px] border-white dark:border-card z-10" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300">Report submitted</p>
                    <p className="text-[12px] text-slate-500 mt-0.5 mb-1">{formatDateTime(issue.createdAt)}</p>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400">Your report was received by CivicPulse.</p>
                  </div>
                </div>

                {issue.timeline.map((entry: any, i: number) => {
                  const isCurrent = i === issue.timeline.length - 1;
                  
                  return (
                    <div key={i} className="relative flex items-start mb-6 last:mb-0">
                      <div className="w-6 shrink-0 flex justify-center mt-1">
                        <div className={`rounded-full border-[2px] border-white dark:border-card z-10 ${isCurrent ? 'bg-blue-500 w-3.5 h-3.5' : 'bg-slate-300 dark:bg-slate-600 w-3 h-3'}`} />
                      </div>
                      <div className={`ml-4 flex-1 ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg p-3 -mt-2' : ''}`}>
                        <p className={`text-[14px] capitalize ${isCurrent ? 'font-semibold text-blue-900 dark:text-blue-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {entry.status.replace('_', ' ')}
                        </p>
                        <p className={`text-[12px] mt-0.5 mb-1 ${isCurrent ? 'text-blue-600/70 dark:text-blue-300/70' : 'text-slate-500'}`}>
                          {formatDateTime(entry.timestamp)}
                        </p>
                        <p className={`text-[13px] ${isCurrent ? 'text-blue-800 dark:text-blue-200/90' : 'text-slate-600 dark:text-slate-400'}`}>
                          {entry.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Status Panel */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Current Status</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-3 rounded-full ${getStatusIndicator(issue.status)} animate-pulse`} />
                <span className={`text-[20px] font-bold capitalize tracking-tight ${getStatusColor(issue.status)}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {getStatusExplanation(issue.status)}
              </p>
              
              {issue.status !== 'resolved' && issue.status !== 'closed' && issue.status !== 'rejected' && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-border/50">
                  <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-2">What happens next</h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    The department will update this report when the issue progresses. You can track all changes in the timeline.
                  </p>
                </div>
              )}
            </div>

            {issue.status === 'resolved' && issue.resolutionNotes && (
              <div className="bg-white dark:bg-card border border-green-200/80 dark:border-green-900/30 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[11px] font-bold tracking-[0.15em] text-green-600 dark:text-green-500 uppercase mb-4">Resolution Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{issue.resolutionNotes}</p>
                  </div>
                  {issue.resolutionEvidence && issue.resolutionEvidence.length > 0 && (
                    <div>
                      <p className="text-[12px] font-medium text-slate-500 mb-2">Resolution Evidence</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {issue.resolutionEvidence.map((img, i) => (
                          <div key={i} onClick={() => { setCurrentImageIndex(i); setGalleryOpen(true); }} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition-opacity">
                            <img src={img} alt={`Resolution Evidence ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {issue.resolvedAt && (
                    <div>
                      <p className="text-[12px] font-medium text-slate-500 mb-0.5">Resolved on</p>
                      <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(issue.resolvedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <OfficerResolutionPanel issue={issue} />

            {/* Report Details */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-5">Report Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Category</p>
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{issue.category}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Priority</p>
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 capitalize">{issue.severity}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Reported By</p>
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{issue.reportedBy.name}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Report ID</p>
                  <p className="text-[14px] font-mono font-medium text-slate-600 dark:text-slate-400">{issue._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Department</h2>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-tight">{departmentName}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Responsible for this issue</p>
                </div>
              </div>

              {issue.assignedTo && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border/50">
                  <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-3">Assigned Officer</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{typeof issue.assignedTo === 'object' ? issue.assignedTo.name : 'Assigned'}</p>
                      <p className="text-[12px] text-slate-500">Automatically assigned</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <AdminAssignmentPanel 
                issueId={issue._id} 
                currentDepartmentId={typeof issue.department === 'object' ? issue.department?._id : issue.department} 
                currentOfficerId={typeof issue.assignedTo === 'object' ? issue.assignedTo?._id : issue.assignedTo} 
              />
            )}

            {/* Support/Action */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm">
              <button 
                onClick={() => upvote.mutate(issue._id)} 
                disabled={upvote.isPending}
                aria-pressed={hasUpvoted}
                className={`w-full h-11 rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium transition-all ${
                  hasUpvoted 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' 
                    : 'bg-slate-50 dark:bg-muted border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/80'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} /> 
                {hasUpvoted ? '✓ Supported' : 'Support this issue'}
                <span className="ml-1 opacity-60">({issue.upvotes.length})</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Lightbox Modal (Simple) */}
      {galleryOpen && issue.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 backdrop-blur-sm">
          <button onClick={() => setGalleryOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
          
          <img 
            src={issue.images[currentImageIndex]} 
            alt="Evidence" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
          />
          
          {issue.images.length > 1 && (
            <div className="flex gap-4 mt-8 items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <button 
                onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))}
                disabled={currentImageIndex === 0}
                className="text-white disabled:opacity-30"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-white text-sm font-medium">{currentImageIndex + 1} / {issue.images.length}</span>
              <button 
                onClick={() => setCurrentImageIndex(i => Math.min(issue.images.length - 1, i + 1))}
                disabled={currentImageIndex === issue.images.length - 1}
                className="text-white disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
