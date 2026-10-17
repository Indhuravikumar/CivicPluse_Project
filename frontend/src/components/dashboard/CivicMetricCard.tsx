import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  context?: string;
  colorClass?: string;
  delay?: number;
}

export function CivicMetricCard({ label, value, icon: Icon, context, colorClass = 'text-primary', delay = 0 }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="h-full">
      <Card className="hover:shadow-sm transition-shadow h-full">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className={`p-1.5 rounded-md bg-muted/50`}>
              <Icon className={`w-4 h-4 ${colorClass}`} />
            </div>
          </div>
          <div>
            <p className={`text-3xl font-bold tracking-tight ${colorClass}`}>
              <AnimatedCounter value={value} />
            </p>
            {context && <p className="text-xs text-muted-foreground mt-1">{context}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
