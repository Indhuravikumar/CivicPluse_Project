import { motion } from 'framer-motion';
import { Users, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import { Select } from '@/components/ui/Select';

const ROLE_COLOR: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  officer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  citizen: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function UsersPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}`, { role }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const users: User[] = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm">{users.length} registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase">
                    <th className="text-left py-2 px-3">User</th>
                    <th className="text-left py-2 px-3">Role</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-right py-2 px-3 hidden md:table-cell">Trust Score</th>
                    <th className="text-right py-2 px-3 hidden md:table-cell">Reports</th>
                    <th className="text-right py-2 px-3 hidden lg:table-cell">Joined</th>
                    <th className="text-left py-2 px-3">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-accent transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium leading-none">{u.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={ROLE_COLOR[u.role]}>
                          <Shield className="w-3 h-3 mr-1 inline" />{u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right hidden md:table-cell">
                        <span className="flex items-center justify-end gap-1 text-amber-500 font-semibold">
                          <Star className="w-3 h-3" />{u.trustScore}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right hidden md:table-cell font-semibold">{u.reportsCount}</td>
                      <td className="py-3 px-3 text-right hidden lg:table-cell text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-3">
                        <Select
                          options={[
                            { value: 'citizen', label: 'Citizen' },
                            { value: 'officer', label: 'Officer' },
                            { value: 'admin', label: 'Admin' },
                          ]}
                          value={u.role}
                          onChange={e => updateRole.mutate({ id: u._id, role: e.target.value })}
                          className="h-8 py-1 text-xs w-[100px]"
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
