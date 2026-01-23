import jsPDF from "jspdf";
import { Budget, Client, BUDGET_STATUS_CONFIG } from "@/contexts/DataContext";

// ========================================
// GERADOR DE PDF - ORÇAMENTO
// ========================================

interface GenerateBudgetPDFOptions {
  budget: Budget;
  client: Client;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
}

/**
 * Gera PDF de um orçamento
 */
export function generateBudgetPDF({
  budget,
  client,
  companyName = "TurbineApp",
  companyEmail = "contato@turbineapp.com",
  companyPhone = "(11) 99999-9999",
}: GenerateBudgetPDFOptions): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Cores do tema
  const primaryColor: [number, number, number] = [139, 92, 246]; // Roxo primário
  const textColor: [number, number, number] = [30, 30, 30];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const lineColor: [number, number, number] = [220, 220, 220];
  const successColor: [number, number, number] = [34, 197, 94];

  // ========================================
  // CABEÇALHO
  // ========================================
  // Barra superior colorida
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Nome da empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, margin, 18);

  // Contato da empresa
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(companyEmail, margin, 26);
  doc.text(companyPhone, margin, 32);

  // Código do orçamento
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(budget.code, pageWidth - margin, 18, { align: "right" });

  // Status
  const statusLabel = BUDGET_STATUS_CONFIG[budget.status].label;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${statusLabel}`, pageWidth - margin, 26, {
    align: "right",
  });

  // Data
  doc.setFontSize(9);
  doc.text(
    `Emitido em: ${formatDate(budget.createdAt)}`,
    pageWidth - margin,
    32,
    {
      align: "right",
    },
  );

  currentY = 50;

  // ========================================
  // TÍTULO DO DOCUMENTO
  // ========================================
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA COMERCIAL", pageWidth / 2, currentY, { align: "center" });
  currentY += 12;

  // ========================================
  // DADOS DO CLIENTE
  // ========================================
  doc.setFillColor(248, 248, 248);
  doc.rect(margin, currentY, contentWidth, 28, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("CLIENTE", margin + 5, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.text(client.name, margin + 5, currentY + 14);

  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(client.email, margin + 5, currentY + 20);
  doc.text(client.phone, margin + 5, currentY + 25);

  // Validade
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.text(
    `Válido até: ${formatDate(budget.validUntil)}`,
    pageWidth - margin - 5,
    currentY + 14,
    {
      align: "right",
    },
  );

  currentY += 35;

  // ========================================
  // TÍTULO DO ORÇAMENTO
  // ========================================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textColor);
  doc.text(budget.title, margin, currentY);
  currentY += 8;

  // Descrição
  if (budget.description) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedColor);
    const descriptionLines = doc.splitTextToSize(
      budget.description,
      contentWidth,
    );
    doc.text(descriptionLines, margin, currentY);
    currentY += descriptionLines.length * 5 + 5;
  }

  currentY += 5;

  // ========================================
  // TABELA DE ITENS
  // ========================================
  // Cabeçalho da tabela
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIÇÃO", margin + 3, currentY + 5.5);
  doc.text("QTD", margin + 105, currentY + 5.5);
  doc.text("UNIT.", margin + 125, currentY + 5.5);
  doc.text("TOTAL", margin + 155, currentY + 5.5);

  currentY += 8;

  // Linhas de itens
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");

  budget.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    const rowY = currentY + index * 10;

    // Fundo alternado
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, rowY, contentWidth, 10, "F");
    }

    // Borda inferior
    doc.setDrawColor(...lineColor);
    doc.line(margin, rowY + 10, margin + contentWidth, rowY + 10);

    doc.setFontSize(9);
    // Descrição (limitada para caber)
    const descText =
      item.description.length > 50
        ? item.description.substring(0, 47) + "..."
        : item.description;
    doc.text(descText, margin + 3, rowY + 6);

    // Quantidade
    doc.text(String(item.quantity), margin + 105, rowY + 6);

    // Preço unitário
    doc.text(formatCurrency(item.unitPrice), margin + 125, rowY + 6);

    // Total do item
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(itemTotal), margin + 155, rowY + 6);
    doc.setFont("helvetica", "normal");
  });

  currentY += budget.items.length * 10 + 5;

  // ========================================
  // TOTAL
  // ========================================
  doc.setFillColor(...successColor);
  doc.rect(margin + 100, currentY, contentWidth - 100, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("VALOR TOTAL:", margin + 105, currentY + 8);
  doc.setFontSize(12);
  doc.text(
    formatCurrency(budget.totalValue),
    pageWidth - margin - 5,
    currentY + 8,
    {
      align: "right",
    },
  );

  currentY += 20;

  // ========================================
  // OBSERVAÇÕES
  // ========================================
  if (budget.notes) {
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES", margin, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    const notesLines = doc.splitTextToSize(budget.notes, contentWidth);
    doc.text(notesLines, margin, currentY);
    currentY += notesLines.length * 5 + 10;
  }

  // ========================================
  // RODAPÉ
  // ========================================
  const footerY = 280;
  doc.setDrawColor(...lineColor);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(
    "Este orçamento é válido pelo período indicado. Preços sujeitos a alteração após a validade.",
    pageWidth / 2,
    footerY,
    { align: "center" },
  );
  doc.text(
    `${companyName} - Gerado automaticamente`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );

  // Salvar o PDF
  doc.save(`${budget.code}_${client.name.replace(/\s+/g, "_")}.pdf`);
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Gera múltiplos PDFs de orçamentos (em batch)
 */
export function generateBatchBudgetPDF(
  budgetsWithClients: Array<{ budget: Budget; client: Client }>,
): void {
  budgetsWithClients.forEach(({ budget, client }) => {
    generateBudgetPDF({ budget, client });
  });
}
