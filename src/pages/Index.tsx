import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentClients } from '@/components/dashboard/RecentClients';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PendingTasks } from '@/components/dashboard/PendingTasks';

const stats = [
  {
    title: 'Receita Mensal',
    value: 'R$ 45.231',
    change: '+12.5% desde o último mês',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Total de Clientes',
    value: '127',
    change: '+8 novos este mês',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Orçamentos Pendentes',
    value: '23',
    change: '5 aguardando aprovação',
    changeType: 'neutral' as const,
    icon: FileText,
  },
  {
    title: 'Taxa de Conversão',
    value: '68%',
    change: '+5.2% desde o último mês',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta! Aqui está uma visão geral do seu negócio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        
        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentClients />
        <PendingTasks />
      </div>
    </div>
  );
}
