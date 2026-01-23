import { useMemo } from "react";
import jsPDF from "jspdf";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useData } from "@/contexts/DataContext";

export default function Relatorios() {
  const {
    transactions,
    budgets,
    leads,
    clients,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
  } = useData();

  // ========================================
  // CÁLCULOS COM DADOS REAIS
  // ========================================

  // Receita total (transações concluídas)
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();

  // Estatísticas de Orçamentos
  const budgetStats = useMemo(() => {
    const approved = budgets.filter((b) => b.status === "approved");
    const sent = budgets.filter((b) => b.status === "sent");
    const rejected = budgets.filter((b) => b.status === "rejected");
    const draft = budgets.filter((b) => b.status === "draft");

    const totalApprovedValue = approved.reduce(
      (sum, b) => sum + b.totalValue,
      0,
    );
    const totalSentValue = sent.reduce((sum, b) => sum + b.totalValue, 0);

    // Taxa de aprovação (aprovados / (aprovados + recusados))
    const totalDecided = approved.length + rejected.length;
    const approvalRate =
      totalDecided > 0 ? (approved.length / totalDecided) * 100 : 0;

    return {
      total: budgets.length,
      approved: approved.length,
      sent: sent.length,
      rejected: rejected.length,
      draft: draft.length,
      totalApprovedValue,
      totalSentValue,
      approvalRate,
    };
  }, [budgets]);

  // Estatísticas de Leads
  const leadStats = useMemo(() => {
    const converted = leads.filter((l) => l.convertedToClientId);
    const conversionRate =
      leads.length > 0 ? (converted.length / leads.length) * 100 : 0;

    const byStatus = {
      novo: leads.filter((l) => l.status === "novo").length,
      contato: leads.filter((l) => l.status === "contato").length,
      proposta: leads.filter((l) => l.status === "proposta").length,
      fechado: leads.filter((l) => l.status === "fechado").length,
    };

    return {
      total: leads.length,
      converted: converted.length,
      conversionRate,
      byStatus,
    };
  }, [leads]);

  // Dados para o gráfico de pizza - Status dos Orçamentos
  const budgetPieData = useMemo(() => {
    const data = [];
    if (budgetStats.approved > 0) {
      data.push({
        name: "Aprovados",
        value: budgetStats.approved,
        color: "hsl(142, 76%, 36%)",
      });
    }
    if (budgetStats.sent > 0) {
      data.push({
        name: "Enviados",
        value: budgetStats.sent,
        color: "hsl(262, 83%, 58%)",
      });
    }
    if (budgetStats.rejected > 0) {
      data.push({
        name: "Recusados",
        value: budgetStats.rejected,
        color: "hsl(0, 84%, 60%)",
      });
    }
    if (budgetStats.draft > 0) {
      data.push({
        name: "Rascunhos",
        value: budgetStats.draft,
        color: "hsl(215, 20%, 65%)",
      });
    }
    return data.length > 0
      ? data
      : [{ name: "Sem dados", value: 1, color: "hsl(215, 20%, 45%)" }];
  }, [budgetStats]);

  // Dados para o gráfico de barras - Entradas x Saídas por mês
  const monthlyData = useMemo(() => {
    const months: Record<
      string,
      { month: string; entradas: number; saidas: number }
    > = {};
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Inicializar últimos 6 meses
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = {
        month: monthNames[d.getMonth()],
        entradas: 0,
        saidas: 0,
      };
    }

    // Preencher com transações reais
    transactions.forEach((tx) => {
      if (tx.status !== "completed") return;
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (months[key]) {
        if (tx.type === "income") {
          months[key].entradas += tx.value;
        } else {
          months[key].saidas += tx.value;
        }
      }
    });

    return Object.values(months);
  }, [transactions]);

  // Cards de relatórios rápidos com dados reais
  const reports = [
    {
      title: "Receita Total",
      description: `R$ ${totalIncome.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      date: "Transações concluídas",
      color: "text-success",
    },
    {
      title: "Leads Convertidos",
      description: `${leadStats.converted} de ${leadStats.total}`,
      icon: Target,
      date: `${leadStats.conversionRate.toFixed(1)}% de conversão`,
      color: "text-primary",
    },
    {
      title: "Orçamentos Aprovados",
      description: `${budgetStats.approved} de ${budgetStats.total}`,
      icon: FileText,
      date: `R$ ${budgetStats.totalApprovedValue.toLocaleString("pt-BR")}`,
      color: "text-primary",
    },
    {
      title: "Clientes Ativos",
      description: `${clients.filter((c) => c.status === "active").length}`,
      icon: Users,
      date: `${clients.length} total`,
      color: "text-cyan-400",
    },
  ];

  // Formatador de moeda para tooltip
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  // Função para gerar PDF do relatório
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString("pt-BR");
    let y = 20;

    // Cabeçalho
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório Gerencial", pageWidth / 2, y, { align: "center" });
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${today}`, pageWidth / 2, y, { align: "center" });
    y += 15;

    // Linha separadora
    doc.setDrawColor(100, 100, 100);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Resumo Financeiro
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Receita Total: R$ ${totalIncome.toLocaleString("pt-BR")}`, 25, y);
    y += 6;
    doc.text(
      `Despesas Totais: R$ ${totalExpenses.toLocaleString("pt-BR")}`,
      25,
      y,
    );
    y += 6;
    doc.text(`Saldo: R$ ${balance.toLocaleString("pt-BR")}`, 25, y);
    y += 12;

    // Estatísticas de Orçamentos
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Orçamentos", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Orçamentos: ${budgetStats.total}`, 25, y);
    y += 6;
    doc.text(
      `Aprovados: ${budgetStats.approved} (R$ ${budgetStats.totalApprovedValue.toLocaleString("pt-BR")})`,
      25,
      y,
    );
    y += 6;
    doc.text(
      `Enviados: ${budgetStats.sent} (R$ ${budgetStats.totalSentValue.toLocaleString("pt-BR")})`,
      25,
      y,
    );
    y += 6;
    doc.text(`Recusados: ${budgetStats.rejected}`, 25, y);
    y += 6;
    doc.text(`Rascunhos: ${budgetStats.draft}`, 25, y);
    y += 6;
    doc.text(
      `Taxa de Aprovação: ${budgetStats.approvalRate.toFixed(1)}%`,
      25,
      y,
    );
    y += 12;

    // Estatísticas de Leads
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Leads", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Leads: ${leadStats.total}`, 25, y);
    y += 6;
    doc.text(`Convertidos em Cliente: ${leadStats.converted}`, 25, y);
    y += 6;
    doc.text(
      `Taxa de Conversão: ${leadStats.conversionRate.toFixed(1)}%`,
      25,
      y,
    );
    y += 6;
    doc.text(
      `Por Status: Novos (${leadStats.byStatus.novo}), Contato (${leadStats.byStatus.contato}), Proposta (${leadStats.byStatus.proposta}), Fechados (${leadStats.byStatus.fechado})`,
      25,
      y,
    );
    y += 12;

    // Clientes
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Clientes", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Clientes: ${clients.length}`, 25, y);
    y += 6;
    doc.text(
      `Clientes Ativos: ${clients.filter((c) => c.status === "active").length}`,
      25,
      y,
    );
    y += 12;

    // Comparativo Mensal
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Comparativo Mensal (Últimos 6 meses)", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Cabeçalho da tabela
    doc.setFont("helvetica", "bold");
    doc.text("Mês", 25, y);
    doc.text("Entradas", 60, y);
    doc.text("Saídas", 110, y);
    doc.text("Saldo", 155, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    monthlyData.forEach((m) => {
      const saldo = m.entradas - m.saidas;
      doc.text(m.month, 25, y);
      doc.text(`R$ ${m.entradas.toLocaleString("pt-BR")}`, 60, y);
      doc.text(`R$ ${m.saidas.toLocaleString("pt-BR")}`, 110, y);
      doc.text(`R$ ${saldo.toLocaleString("pt-BR")}`, 155, y);
      y += 5;
    });

    // Rodapé
    y = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("TurbineApp - Sistema de Gestão", pageWidth / 2, y, {
      align: "center",
    });

    // Salvar PDF
    doc.save(`relatorio-${today.replace(/\//g, "-")}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Análises e insights do seu negócio
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          className="gradient-primary text-white shadow-lg glow-primary"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Quick Reports */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.title}
              className="glass rounded-xl p-5 card-shadow hover-elevate cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className={`h-5 w-5 ${report.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {report.date}
                </span>
              </div>
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {report.title}
              </h4>
              <p className={`text-lg font-semibold ${report.color}`}>
                {report.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - Status dos Orçamentos */}
        <div className="glass rounded-xl p-6 card-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Status dos Orçamentos
            </h3>
            <p className="text-sm text-muted-foreground">
              Distribuição por status
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {budgetPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 8%)",
                    border: "1px solid hsl(217, 33%, 17%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {budgetPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Entradas x Saídas */}
        <div className="glass rounded-xl p-6 card-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Entradas x Saídas
            </h3>
            <p className="text-sm text-muted-foreground">
              Comparativo mensal (últimos 6 meses)
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(217, 33%, 17%)"
                />
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
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 8%)",
                    border: "1px solid hsl(217, 33%, 17%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill="hsl(142, 76%, 36%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="saidas"
                  name="Saídas"
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel de Leads */}
      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">
            Funil de Leads
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-3xl font-display font-bold text-blue-400">
              {leadStats.byStatus.novo}
            </p>
            <p className="text-sm text-muted-foreground">Novos</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-3xl font-display font-bold text-yellow-400">
              {leadStats.byStatus.contato}
            </p>
            <p className="text-sm text-muted-foreground">Em Contato</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-3xl font-display font-bold text-purple-400">
              {leadStats.byStatus.proposta}
            </p>
            <p className="text-sm text-muted-foreground">Proposta</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-3xl font-display font-bold text-success">
              {leadStats.byStatus.fechado}
            </p>
            <p className="text-sm text-muted-foreground">Fechados</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">
            Resumo Geral
          </h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-success">
              R$ {(totalIncome / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-muted-foreground">Receita Total</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-destructive">
              R$ {(totalExpenses / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-muted-foreground">Despesas</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-primary">
              {budgetStats.approvalRate.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa Aprovação</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-sidebar-accent/50">
            <p className="text-3xl font-display font-bold text-cyan-400">
              {leadStats.conversionRate.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">Conversão Leads</p>
          </div>
        </div>
      </div>

      {/* Detalhes de Orçamentos */}
      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">
            Performance de Orçamentos
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-sidebar-accent/30">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {budgetStats.draft}
              </p>
              <p className="text-sm text-muted-foreground">Rascunhos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-sidebar-accent/30">
            <div className="p-2 rounded-lg bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {budgetStats.sent}
              </p>
              <p className="text-sm text-muted-foreground">Enviados</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-sidebar-accent/30">
            <div className="p-2 rounded-lg bg-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {budgetStats.approved}
              </p>
              <p className="text-sm text-muted-foreground">Aprovados</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-sidebar-accent/30">
            <div className="p-2 rounded-lg bg-destructive/20">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {budgetStats.rejected}
              </p>
              <p className="text-sm text-muted-foreground">Recusados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
