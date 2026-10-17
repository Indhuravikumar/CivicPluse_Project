import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { CATEGORY_ICON, STATUS_COLOR } from '@/lib/utils';
import { Link } from 'react-router-dom';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export function NearbyIssues() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Use useIssues to get full issue objects (title, status, etc)
  const { data: issuesData, isLoading, isError, refetch } = useIssues({ limit: 50 });

  useEffect(() => {
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        requestLocation();
      }
    });
  }, []);

  const requestLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const issues = issuesData?.data || [];
  
  const nearbyIssues = location 
    ? issues
        .filter((issue: any) => issue.location?.lat && issue.location?.lng)
        .map((issue: any) => ({
          ...issue,
          distance: calculateDistance(location.lat, location.lng, issue.location.lat, issue.location.lng)
        }))
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 4)
    : [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          📍 NEARBY ISSUES
        </CardTitle>
        <p className="text-xs text-muted-foreground">Issues reported around your area</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!location ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="font-medium text-sm mb-1">No location available</p>
            <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
              Enable location to discover civic issues reported around you.
            </p>
            <Button size="sm" variant="outline" onClick={requestLocation} disabled={isLocating}>
              {isLocating ? 'Locating...' : 'Enable Location'}
            </Button>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="font-medium text-sm mb-1">Unable to load nearby issues</p>
            <p className="text-xs text-muted-foreground mb-4">Try again to retrieve the latest reports.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : nearbyIssues.length > 0 ? (
          <div className="space-y-4">
            {nearbyIssues.map((issue: any) => (
              <div key={issue._id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="text-2xl mt-0.5">{CATEGORY_ICON[issue.category] || '📋'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{issue.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-between">
                    <span>
                      {issue.distance < 1 ? `${Math.round(issue.distance * 1000)} m` : `${issue.distance.toFixed(1)} km`}
                      {' · '}
                      <span className="capitalize">{issue.severity} priority</span>
                    </span>
                    <span className="flex items-center gap-1.5 ml-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${issue.status === 'resolved' || issue.status === 'closed' ? 'bg-green-500' : issue.status === 'in_progress' ? 'bg-blue-500' : issue.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="capitalize font-medium text-[10px]">{issue.status.replace('_', ' ')}</span>
                    </span>
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-1 flex justify-end">
              <Link to="/map" className="text-xs font-medium text-primary hover:underline">View on map →</Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="font-medium text-sm mb-1">No issues nearby</p>
            <p className="text-xs text-muted-foreground mb-4">Your immediate area looks clear of reported civic issues.</p>
            <Link to="/map">
              <Button size="sm" variant="outline">
                View Live Map
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
