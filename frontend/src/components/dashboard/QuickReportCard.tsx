import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function QuickReportCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-border bg-card">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-lg font-bold mb-1.5 text-foreground">See something that needs attention?</h3>
            <p className="text-muted-foreground text-sm max-w-[500px]">
              Report a civic issue and help improve your neighborhood. Smart analysis helps categorize your report and route it to the appropriate department.
            </p>
          </div>
          <Link to="/report" className="shrink-0">
            <Button size="md" className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium transition-colors px-6 whitespace-nowrap">
              Report an Issue
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
