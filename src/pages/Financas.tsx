import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const transactions = [
  { id: 1, description: 'Pagamento Tech Solutions', type: 'income', value: 15000, date: '15 Jan 2024', status: 'completed' },
  { id: 2, description: 'Hospedagem AWS', type: 'expense', value: 1200, date: '14 Jan 2024', status: 'completed' },
  { id: 3, description: 'Marketing Digital Pro', type: 'income', value: 8500, date: '12 Jan 2024', status: 'pending' },
  { id: 4, description: 'Licenças de Software', type: 'expense', value: 450, date: '10 Jan 2024', status: 'completed' },
  { id: 5, description: 'E-commerce Master', type: 'income', value: 22000, date: '08 Jan 2024', status: 'completed' },
];

export default function Financas() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Finanças</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas receitas e despesas</p>
        </div>
        <Button className="gradient-primary text-white shadow-lg glow-primary">
          <CreditCard className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Saldo Total" value="R$ 128.450" change="+15.3% desde o último mês" changeType="positive" icon={DollarSign} />
        <StatCard title="Receitas" value="R$ 45.500" change="+12.5% este mês" changeType="positive" icon={TrendingUp} />
        <StatCard title="Despesas" value="R$ 12.350" change="-8.2% este mês" changeType="negative" icon={TrendingDown} />
        <StatCard title="Lucro Líquido" value="R$ 33.150" change="+22.1% este mês" changeType="positive" icon={CreditCard} />
      </div>

      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">Transações Recentes</h3>
            <p className="text-sm text-muted-foreground">Últimas movimentações financeiras</p>
          </div>
          <Button variant="outline" size="sm" className="border-white/10">Ver todas</Button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5 text-success" /> : <ArrowDownRight className="h-5 w-5 text-destructive" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {tx.type === 'income' ? '+' : '-'}R$ {tx.value.toLocaleString('pt-BR')}
                </p>
                <Badge variant="outline" className={tx.status === 'completed' ? 'border-success/30 text-success' : 'border-warning/30 text-warning'}>
                  {tx.status === 'completed' ? 'Concluído' : 'Pendente'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
