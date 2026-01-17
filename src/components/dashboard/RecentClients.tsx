import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const clients = [
  {
    id: 1,
    name: 'Tech Solutions Ltda',
    email: 'contato@techsolutions.com.br',
    status: 'active',
    value: 'R$ 15.000',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Marketing Digital Pro',
    email: 'admin@mdpro.com',
    status: 'pending',
    value: 'R$ 8.500',
    avatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'E-commerce Master',
    email: 'suporte@emaster.com.br',
    status: 'active',
    value: 'R$ 22.000',
    avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17ber?w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: 'Startup Innovation',
    email: 'hello@startupinno.io',
    status: 'inactive',
    value: 'R$ 5.000',
    avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop'
  },
];

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-success/20 text-success border-success/30' },
  pending: { label: 'Pendente', className: 'bg-warning/20 text-warning border-warning/30' },
  inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground border-muted' },
};

export function RecentClients() {
  return (
    <div className="glass rounded-xl p-6 card-shadow">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Clientes Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas adições</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          Ver todos
        </button>
      </div>
      
      <div className="space-y-4">
        {clients.map((client) => {
          const status = statusConfig[client.status as keyof typeof statusConfig];
          
          return (
            <div 
              key={client.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
            >
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {client.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {client.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{client.email}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{client.value}</p>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
