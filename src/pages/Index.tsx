import { useMemo } from "react";
import { DollarSign, TrendingDown, Wallet, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FeaturedClients } from "@/components/dashboard/FeaturedClients";
import { CommercialAlerts } from "@/components/dashboard/CommercialAlerts";
import { useData } from "@/contexts/DataContext";

export default function Dashboard() {
  const { transactions, leads, budgets } = useData();

  // ========================================
  // CÁLCULOS COM DADOS REAIS
  // ========================================
  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar transações do mês atual e anterior
    const currentMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Receita do mês (transações de entrada concluídas)
    const incomeThisMonth = currentMonthTx
      .filter((tx) => tx.type === "income" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.value, 0);

    const incomeLastMonth = lastMonthTx
      .filter((tx) => tx.type === "income" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.value, 0);

    const incomeChange =
      incomeLastMonth > 0
        ? ((incomeThisMonth - incomeLastMonth) / incomeLastMonth) * 100
        : incomeThisMonth > 0
          ? 100
          : 0;

    // Despesas do mês (transações de saída concluídas)
    const expensesThisMonth = currentMonthTx
      .filter((tx) => tx.type === "expense" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.value, 0);

    const expensesLastMonth = lastMonthTx
      .filter((tx) => tx.type === "expense" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.value, 0);

    const expensesChange =
      expensesLastMonth > 0
        ? ((expensesThisMonth - expensesLastMonth) / expensesLastMonth) * 100
        : expensesThisMonth > 0
          ? 100
          : 0;

    // Saldo atual (total geral)
    const totalIncome = transactions
      .filter((tx) => tx.type === "income" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.value, 0);

    const totalExpenses = transactions
      .filter((tx) => tx.type === "expense" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.value, 0);

    const balance = totalIncome - totalExpenses;
    const balanceThisMonth = incomeThisMonth - expensesThisMonth;

    // Taxa de conversão (leads convertidos / total de leads)
    const convertedLeads = leads.filter((l) => l.convertedToClientId).length;
    const totalLeads = leads.length;
    const leadConversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Taxa de aprovação de orçamentos
    const approvedBudgets = budgets.filter(
      (b) => b.status === "approved",
    ).length;
    const decidedBudgets = budgets.filter(
      (b) => b.status === "approved" || b.status === "rejected",
    ).length;
    const budgetApprovalRate =
      decidedBudgets > 0 ? (approvedBudgets / decidedBudgets) * 100 : 0;

    // Usar a melhor taxa disponível
    const conversionRate =
      totalLeads > 0 ? leadConversionRate : budgetApprovalRate;

    return {
      incomeThisMonth,
      incomeChange,
      expensesThisMonth,
      expensesChange,
      balance,
      balanceThisMonth,
      conversionRate,
      convertedLeads,
      totalLeads,
    };
  }, [transactions, leads, budgets]);

  // Formatar valores
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  const formatChange = (
    change: number,
    type: "income" | "expense" | "balance",
  ) => {
    const sign = change >= 0 ? "+" : "";
    if (type === "expense") {
      return change > 0
        ? `${sign}${change.toFixed(1)}% vs mês anterior`
        : `${change.toFixed(1)}% vs mês anterior`;
    }
    return `${sign}${change.toFixed(1)}% vs mês anterior`;
  };

  const stats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    icon: typeof DollarSign;
  }> = [
    {
      title: "Receita do Mês",
      value: formatCurrency(kpis.incomeThisMonth),
      change: formatChange(kpis.incomeChange, "income"),
      changeType: kpis.incomeChange >= 0 ? "positive" : "negative",
      icon: DollarSign,
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(kpis.expensesThisMonth),
      change: formatChange(kpis.expensesChange, "expense"),
      changeType: kpis.expensesChange <= 0 ? "positive" : "negative",
      icon: TrendingDown,
    },
    {
      title: "Saldo Atual",
      value: formatCurrency(kpis.balance),
      change: `${kpis.balanceThisMonth >= 0 ? "+" : ""}R$ ${kpis.balanceThisMonth.toLocaleString("pt-BR")} este mês`,
      changeType: kpis.balance >= 0 ? "positive" : "negative",
      icon: Wallet,
    },
    {
      title: "Taxa de Conversão",
      value: `${kpis.conversionRate.toFixed(0)}%`,
      change: `${kpis.convertedLeads} de ${kpis.totalLeads} leads convertidos`,
      changeType: kpis.conversionRate >= 50 ? "positive" : "neutral",
      icon: TrendingUp,
    },
  ];
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
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

        {/* Featured Clients */}
        <div>
          <FeaturedClients />
        </div>
      </div>

      {/* Commercial Alerts */}
      <CommercialAlerts />
    </div>
  );
}
