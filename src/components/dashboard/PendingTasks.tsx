import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tasks = [
  {
    id: 1,
    title: 'Finalizar proposta Tech Solutions',
    dueDate: 'Hoje, 18:00',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 2,
    title: 'Reunião com Marketing Digital Pro',
    dueDate: 'Amanhã, 10:00',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 3,
    title: 'Enviar relatório mensal',
    dueDate: 'Em 2 dias',
    priority: 'low',
    status: 'pending'
  },
  {
    id: 4,
    title: 'Atualizar contrato E-commerce',
    dueDate: 'Concluído',
    priority: 'medium',
    status: 'completed'
  },
];

const priorityConfig = {
  high: { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertCircle },
  medium: { color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  low: { color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock },
};

export function PendingTasks() {
  return (
    <div className="glass rounded-xl p-6 card-shadow">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Tarefas Pendentes</h3>
          <p className="text-sm text-muted-foreground">Próximas atividades</p>
        </div>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
          {tasks.filter(t => t.status === 'pending').length} pendentes
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => {
          const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
          const PriorityIcon = priority.icon;
          const isCompleted = task.status === 'completed';
          
          return (
            <div 
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                isCompleted ? "opacity-60" : "hover:bg-sidebar-accent/50"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isCompleted ? "bg-success/10" : priority.bg
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <PriorityIcon className={cn("h-4 w-4", priority.color)} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{task.dueDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
