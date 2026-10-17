import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useIssues } from '@/hooks/useIssues';
import { timeAgo } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export function RecentReports() {
  const { data: issuesData, isLoading, isError, refetch } = useIssues({ limit: 4 });
  
  const reports = issuesData?.data || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          📄 MY RECENT REPORTS
        </CardTitle>
        <p className="text-xs text-muted-foreground">Track the progress of your reports</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="font-medium text-sm mb-1">Unable to load your reports</p>
            <p className="text-xs text-muted-foreground mb-4">Please try again.</p>
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
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((issue) => (
              <Link key={issue._id} to={`/issues/${issue._id}`} className="block group">
                <div className="pb-4 border-b border-border last:border-0 last:pb-0 group-hover:bg-accent/50 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Reported {timeAgo(issue.createdAt)}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${issue.status === 'resolved' || issue.status === 'closed' ? 'bg-green-500' : issue.status === 'in_progress' ? 'bg-blue-500' : issue.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span className="text-xs font-medium capitalize text-muted-foreground">{issue.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                  </div>
                </div>
              </Link>
            ))}
            <div className="pt-1 flex justify-end">
              <Link to="/issues" className="text-xs font-medium text-primary hover:underline">View all reports →</Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="font-medium text-sm mb-1">No reports yet</p>
            <p className="text-xs text-muted-foreground mb-4 max-w-[220px]">
              When you report a civic issue, you'll be able to track its progress here.
            </p>
            <Link to="/report">
              <Button size="sm">Report Your First Issue</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
