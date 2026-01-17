import { useState } from 'react';
import { Users, Plus, Search, Filter, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const clients = [
  { id: 1, name: 'Tech Solutions Ltda', email: 'contato@techsolutions.com.br', phone: '(11) 99999-1234', status: 'active', projects: 5, value: 75000, avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop' },
  { id: 2, name: 'Marketing Digital Pro', email: 'admin@mdpro.com', phone: '(21) 98888-5678', status: 'active', projects: 3, value: 42000, avatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop' },
  { id: 3, name: 'E-commerce Master', email: 'suporte@emaster.com.br', phone: '(31) 97777-9012', status: 'pending', projects: 2, value: 28000, avatar: '' },
  { id: 4, name: 'Startup Innovation', email: 'hello@startupinno.io', phone: '(41) 96666-3456', status: 'inactive', projects: 1, value: 15000, avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop' },
  { id: 5, name: 'Digital Agency Co', email: 'contact@dagency.com', phone: '(51) 95555-7890', status: 'active', projects: 8, value: 120000, avatar: '' },
];

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-success/20 text-success border-success/30' },
  pending: { label: 'Pendente', className: 'bg-warning/20 text-warning border-warning/30' },
  inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground border-muted' },
};

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e contratos</p>
        </div>
        <Button className="gradient-primary text-white shadow-lg glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar clientes..." 
              className="pl-9 bg-sidebar-accent/50 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sidebar-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Projetos</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const status = statusConfig[client.status as keyof typeof statusConfig];
                return (
                  <tr key={client.id} className="border-b border-sidebar-border/50 hover:bg-sidebar-accent/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className="text-sm text-foreground">{client.projects}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-medium text-foreground">R$ {client.value.toLocaleString('pt-BR')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
