import { Plus, FileText, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { label: 'Novo Cliente', icon: Users, color: 'from-primary to-purple-600' },
  { label: 'Novo Orçamento', icon: FileText, color: 'from-cyan-500 to-blue-600' },
  { label: 'Nova Transação', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
];

export function QuickActions() {
  return (
    <div className="glass rounded-xl p-6 card-shadow">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">Ações Rápidas</h3>
        <p className="text-sm text-muted-foreground">Acesse rapidamente</p>
      </div>
      
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white group"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                <Icon className="h-4 w-4" />
              </div>
              {action.label}
              <Plus className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
