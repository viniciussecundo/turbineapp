import { BarChart3, Download, Calendar, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const pieData = [
  { name: 'Desenvolvimento Web', value: 45, color: 'hsl(262, 83%, 58%)' },
  { name: 'Marketing Digital', value: 25, color: 'hsl(180, 70%, 50%)' },
  { name: 'Design', value: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Consultoria', value: 10, color: 'hsl(142, 76%, 36%)' },
];

const barData = [
  { month: 'Jan', projetos: 12, receita: 45000 },
  { month: 'Fev', projetos: 8, receita: 32000 },
  { month: 'Mar', projetos: 15, receita: 58000 },
  { month: 'Abr', projetos: 10, receita: 41000 },
  { month: 'Mai', projetos: 18, receita: 72000 },
  { month: 'Jun', projetos: 14, receita: 55000 },
];

const reports = [
  { title: 'Relatório Mensal', description: 'Resumo completo do mês', icon: Calendar, date: 'Janeiro 2024' },
  { title: 'Análise de Clientes', description: 'Performance por cliente', icon: Users, date: 'Atualizado hoje' },
  { title: 'Orçamentos', description: 'Taxa de conversão', icon: FileText, date: 'Últimos 30 dias' },
  { title: 'Financeiro', description: 'Fluxo de caixa detalhado', icon: DollarSign, date: 'Q1 2024' },
];

export default function Relatorios() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análises e insights do seu negócio</p>
        </div>
        <Button className="gradient-primary text-white shadow-lg glow-primary">
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Quick Reports */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.title} className="glass rounded-xl p-5 card-shadow hover-elevate cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{report.date}</span>
              </div>
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{report.title}</h4>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="glass rounded-xl p-6 card-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-display font-semibold text-foreground">Distribuição por Serviço</h3>
            <p className="text-sm text-muted-foreground">Receita por categoria</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(217, 33%, 17%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass rounded-xl p-6 card-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-display font-semibold text-foreground">Projetos por Mês</h3>
            <p className="text-sm text-muted-foreground">Quantidade de projetos entregues</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(215, 20%, 65%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(215, 20%, 65%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(217, 33%, 17%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }}
                />
                <Bar dataKey="projetos" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">Resumo do Período</h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-foreground">77</p>
            <p className="text-sm text-muted-foreground">Projetos Concluídos</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-foreground">R$ 303k</p>
            <p className="text-sm text-muted-foreground">Receita Total</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-foreground">68%</p>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-foreground">4.8</p>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
          </div>
        </div>
      </div>
    </div>
  );
}
