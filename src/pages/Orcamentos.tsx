import { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const quotes = [
  { id: 'ORC-001', client: 'Tech Solutions Ltda', title: 'Desenvolvimento de E-commerce', value: 45000, status: 'approved', date: '15 Jan 2024', validUntil: '15 Fev 2024' },
  { id: 'ORC-002', client: 'Marketing Digital Pro', title: 'Campanha de Marketing Digital', value: 12000, status: 'pending', date: '12 Jan 2024', validUntil: '12 Fev 2024' },
  { id: 'ORC-003', client: 'E-commerce Master', title: 'Redesign de Website', value: 28000, status: 'sent', date: '10 Jan 2024', validUntil: '10 Fev 2024' },
  { id: 'ORC-004', client: 'Startup Innovation', title: 'App Mobile iOS/Android', value: 85000, status: 'draft', date: '08 Jan 2024', validUntil: '08 Fev 2024' },
  { id: 'ORC-005', client: 'Digital Agency Co', title: 'Sistema de Gestão', value: 55000, status: 'rejected', date: '05 Jan 2024', validUntil: '05 Fev 2024' },
];

const statusConfig = {
  approved: { label: 'Aprovado', className: 'bg-success/20 text-success border-success/30' },
  pending: { label: 'Pendente', className: 'bg-warning/20 text-warning border-warning/30' },
  sent: { label: 'Enviado', className: 'bg-primary/20 text-primary border-primary/30' },
  draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground border-muted' },
  rejected: { label: 'Rejeitado', className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

export default function Orcamentos() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredQuotes = quotes.filter(quote => 
    quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie propostas comerciais</p>
        </div>
        <Button className="gradient-primary text-white shadow-lg glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar orçamentos..." 
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

        <div className="grid gap-4">
          {filteredQuotes.map((quote) => {
            const status = statusConfig[quote.status as keyof typeof statusConfig];
            return (
              <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors border border-white/5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary">{quote.id}</span>
                    <Badge variant="outline" className={status.className}>{status.label}</Badge>
                  </div>
                  <h4 className="font-medium text-foreground">{quote.title}</h4>
                  <p className="text-sm text-muted-foreground">{quote.client}</p>
                </div>
                
                <div className="flex flex-col sm:items-end gap-1">
                  <p className="text-lg font-semibold text-foreground">R$ {quote.value.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-muted-foreground">Válido até {quote.validUntil}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {quote.status === 'draft' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Enviar">
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
