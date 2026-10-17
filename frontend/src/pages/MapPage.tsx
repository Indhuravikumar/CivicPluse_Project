import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SEVERITY_COLOR, CATEGORY_ICON, timeAgo } from '@/lib/utils';
import { useIssues } from '@/hooks/useIssues';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const SEVERITY_MAP_COLOR: Record<string, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

export default function MapPage() {
  const { data, isLoading, isError } = useIssues({ limit: 200 });
  const issues = data?.data || [];
  const [selected, setSelected] = useState<string | null>(null);

  const selectedIssue = issues.find(i => i._id === selected);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl font-bold">Live Issue Map</h1>
        <p className="text-muted-foreground text-sm">Real-time heatmap of civic issues across the city.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden" style={{ height: '600px' }}>
            {isError ? (
              <div className="h-full w-full flex items-center justify-center p-6">
                <ErrorState 
                  title="Couldn't load map data"
                  description="We couldn't retrieve the civic issues to display on the map."
                  onRetry={() => window.location.reload()}
                />
              </div>
            ) : isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : issues.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center p-6">
                <EmptyState 
                  icon={AlertCircle}
                  title="No issues found"
                  description="There are currently no civic issues to display on the map."
                />
              </div>
            ) : (
              <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.filter(i => i.location?.lat && i.location?.lng).map(issue => (
                  <CircleMarker
                    key={issue._id}
                    center={[issue.location.lat, issue.location.lng]}
                    radius={issue.priorityScore >= 80 ? 12 : issue.priorityScore >= 60 ? 9 : 7}
                    fillColor={SEVERITY_MAP_COLOR[issue.severity]}
                    color={SEVERITY_MAP_COLOR[issue.severity]}
                    weight={1}
                    opacity={0.9}
                    fillOpacity={0.6}
                    eventHandlers={{ click: () => setSelected(issue._id) }}
                  >
                    <Popup>
                      <div className="text-xs min-w-40">
                        <p className="font-bold text-sm">{CATEGORY_ICON[issue.category]} {issue.title}</p>
                        <p className="text-gray-500 mt-1">{issue.location.address}</p>
                        <p className="mt-1">Severity: <strong>{issue.severity}</strong></p>
                        <p>Priority: <strong>{issue.priorityScore}/100</strong></p>
                        <Link to={`/issues/${issue._id}`} className="text-blue-600 hover:underline mt-1 block">View details →</Link>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Legend */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Legend</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              {Object.entries(SEVERITY_MAP_COLOR).map(([sev, color]) => (
                <div key={sev} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="capitalize">{sev}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Total on map</span><span className="font-semibold">{issues.length}</span></div>
              {(['critical', 'high', 'medium', 'low'] as const).map(sev => (
                <div key={sev} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{sev}</span>
                  <span className="font-semibold">{issues.filter(i => i.severity === sev).length}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected issue */}
          {selectedIssue && (
            <Card className="border-primary/40">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Selected Issue</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                <p className="font-semibold">{selectedIssue.title}</p>
                <p className="text-muted-foreground">{selectedIssue.location.address}</p>
                <div className="flex gap-1 flex-wrap">
                  <Badge className={SEVERITY_COLOR[selectedIssue.severity]}>{selectedIssue.severity}</Badge>
                </div>
                <p className="text-muted-foreground">{timeAgo(selectedIssue.createdAt)}</p>
                <Link to={`/issues/${selectedIssue._id}`} className="text-primary hover:underline block">View details →</Link>
              </CardContent>
            </Card>
          )}

          {/* Recent issues list */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Issues</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {issues.slice(0, 6).map(issue => (
                <div
                  key={issue._id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg p-1.5 transition-colors"
                  onClick={() => setSelected(issue._id)}
                >
                  <span className="text-base">{CATEGORY_ICON[issue.category] || '📋'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{issue.title}</p>
                    <p className="text-[10px] text-muted-foreground">{issue.severity} · {issue.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
