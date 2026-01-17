import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', receita: 4000, despesas: 2400 },
  { name: 'Fev', receita: 3000, despesas: 1398 },
  { name: 'Mar', receita: 5000, despesas: 3800 },
  { name: 'Abr', receita: 2780, despesas: 3908 },
  { name: 'Mai', receita: 5890, despesas: 4800 },
  { name: 'Jun', receita: 6390, despesas: 3800 },
  { name: 'Jul', receita: 7490, despesas: 4300 },
];

export function RevenueChart() {
  return (
    <div className="glass rounded-xl p-6 card-shadow">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">Receita vs Despesas</h3>
        <p className="text-sm text-muted-foreground">Últimos 7 meses</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(180, 70%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(180, 70%, 50%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis 
              dataKey="name" 
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
              tickFormatter={(value) => `R$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(217, 33%, 17%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
            />
            <Area 
              type="monotone" 
              dataKey="receita" 
              stroke="hsl(262, 83%, 58%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorReceita)" 
              name="Receita"
            />
            <Area 
              type="monotone" 
              dataKey="despesas" 
              stroke="hsl(180, 70%, 50%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorDespesas)" 
              name="Despesas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Receita</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(180, 70%, 50%)' }} />
          <span className="text-sm text-muted-foreground">Despesas</span>
        </div>
      </div>
    </div>
  );
}
