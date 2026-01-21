import jsPDF from "jspdf";
import { Client, Lead, CLIENT_GOALS } from "@/contexts/DataContext";

// ========================================
// GERADOR DE PDF - FICHA DO CLIENTE
// ========================================

interface GeneratePDFOptions {
  client: Client;
  lead?: Lead | null;
  companyName?: string;
}

// Labels de tradução
const statusLabels: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  inactive: "Inativo",
};

const originLabels: Record<string, string> = {
  site: "Site",
  instagram: "Instagram",
  facebook: "Facebook",
  indicacao: "Indicação",
  google: "Google",
  outro: "Outro",
};

const leadStatusLabels: Record<string, string> = {
  novo: "Novo",
  contato: "Em Contato",
  proposta: "Proposta Enviada",
  fechado: "Fechado",
};

/**
 * Gera PDF individual de um cliente
 */
export function generateClientPDF({
  client,
  lead,
  companyName = "Turbine App",
}: GeneratePDFOptions): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Cores do tema
  const primaryColor: [number, number, number] = [139, 92, 246]; // Roxo primário
  const textColor: [number, number, number] = [30, 30, 30];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const lineColor: [number, number, number] = [220, 220, 220];

  // ========================================
  // CABEÇALHO
  // ========================================
  const drawHeader = () => {
    // Barra superior colorida
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Nome da empresa
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, margin, 15);

    // Título do documento
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("FICHA DO CLIENTE", margin, 24);

    // Data de geração
    const dataGeracao = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.setFontSize(9);
    doc.text(`Gerado em: ${dataGeracao}`, pageWidth - margin, 15, {
      align: "right",
    });

    // ID do cliente
    doc.text(`ID: #${client.id}`, pageWidth - margin, 24, { align: "right" });

    currentY = 45;
  };

  // ========================================
  // SEÇÃO - IDENTIFICAÇÃO DO CLIENTE
  // ========================================
  const drawClientIdentification = () => {
    drawSectionTitle("IDENTIFICAÇÃO DO CLIENTE");

    const fields = [
      { label: "Nome/Razão Social", value: client.name },
      { label: "E-mail", value: client.email },
      { label: "Telefone", value: client.phone },
      {
        label: "Status",
        value: statusLabels[client.status] || client.status,
      },
      {
        label: "Valor Total",
        value: `R$ ${client.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      },
      { label: "Projetos", value: String(client.projects) },
    ];

    drawFieldsGrid(fields);

    // Redes Sociais
    if (
      client.socialMedia &&
      Object.values(client.socialMedia).some((v) => v)
    ) {
      currentY += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text("Redes Sociais:", margin, currentY);
      currentY += 5;

      const socialFields: Array<{ label: string; value: string }> = [];
      if (client.socialMedia.instagram)
        socialFields.push({
          label: "Instagram",
          value: client.socialMedia.instagram,
        });
      if (client.socialMedia.facebook)
        socialFields.push({
          label: "Facebook",
          value: client.socialMedia.facebook,
        });
      if (client.socialMedia.linkedin)
        socialFields.push({
          label: "LinkedIn",
          value: client.socialMedia.linkedin,
        });
      if (client.socialMedia.twitter)
        socialFields.push({
          label: "Twitter/X",
          value: client.socialMedia.twitter,
        });

      drawFieldsGrid(socialFields);
    }
  };

  // ========================================
  // SEÇÃO - CONTATO/RESPONSÁVEL
  // ========================================
  const drawContactSection = () => {
    drawSectionTitle("CONTATO / RESPONSÁVEL");

    const fields = [
      {
        label: "Responsável",
        value: client.responsible || "Não informado",
      },
      { label: "Canal Preferido", value: "E-mail / Telefone" },
    ];

    drawFieldsGrid(fields);
  };

  // ========================================
  // SEÇÃO - INFORMAÇÕES COMERCIAIS
  // ========================================
  const drawCommercialInfo = () => {
    drawSectionTitle("INFORMAÇÕES COMERCIAIS");

    const fields: Array<{ label: string; value: string }> = [];

    // Origem do Lead
    if (client.leadId && lead) {
      fields.push({
        label: "Origem do Lead",
        value: originLabels[lead.origin] || lead.origin,
      });
      fields.push({
        label: "Status do Lead",
        value: leadStatusLabels[lead.status] || lead.status,
      });
      fields.push({
        label: "Data de Cadastro (Lead)",
        value: new Date(lead.createdAt).toLocaleDateString("pt-BR"),
      });
      if (lead.company) {
        fields.push({ label: "Empresa (Lead)", value: lead.company });
      }
      if (lead.value) {
        fields.push({
          label: "Valor Estimado (Lead)",
          value: `R$ ${lead.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        });
      }
    } else {
      fields.push({ label: "Origem", value: "Cadastro Direto" });
    }

    drawFieldsGrid(fields);

    // Dados de Tráfego (do Lead)
    if (lead && (lead.followers || lead.posts || lead.monthlyBudget)) {
      currentY += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text("Dados de Tráfego:", margin, currentY);
      currentY += 5;

      const trafficFields: Array<{ label: string; value: string }> = [];
      if (lead.followers)
        trafficFields.push({
          label: "Seguidores",
          value: lead.followers.toLocaleString("pt-BR"),
        });
      if (lead.posts)
        trafficFields.push({
          label: "Posts",
          value: lead.posts.toLocaleString("pt-BR"),
        });
      if (lead.monthlyBudget)
        trafficFields.push({
          label: "Orçamento Mensal",
          value: `R$ ${lead.monthlyBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        });

      drawFieldsGrid(trafficFields);
    }
  };

  // ========================================
  // SEÇÃO - ANÁLISE DE PERFIL
  // ========================================
  const drawProfileAnalysis = () => {
    if (!client.profileAnalysis) return;

    drawSectionTitle("ANÁLISE DE PERFIL");

    const fields = [
      { label: "Segmento", value: client.profileAnalysis.segment },
      {
        label: "Objetivo Principal",
        value: CLIENT_GOALS[client.profileAnalysis.mainGoal],
      },
      {
        label: "Público-Alvo",
        value: client.profileAnalysis.targetAudience || "Não informado",
      },
      {
        label: "Score Geral",
        value: `${client.profileAnalysis.overallScore}/10`,
      },
    ];

    drawFieldsGrid(fields);
  };

  // ========================================
  // SEÇÃO - OBSERVAÇÕES INTERNAS
  // ========================================
  const drawNotes = () => {
    const hasClientNotes = client.profileAnalysis?.notes;
    const hasLeadNotes = lead?.notes;

    if (!hasClientNotes && !hasLeadNotes) return;

    drawSectionTitle("OBSERVAÇÕES INTERNAS");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);

    if (hasClientNotes) {
      doc.setFont("helvetica", "bold");
      doc.text("Análise do Cliente:", margin, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(
        client.profileAnalysis!.notes,
        contentWidth,
      );
      doc.text(lines, margin, currentY);
      currentY += lines.length * 4 + 5;
    }

    if (hasLeadNotes) {
      doc.setFont("helvetica", "bold");
      doc.text("Observações do Lead:", margin, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(lead!.notes!, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 4 + 5;
    }
  };

  // ========================================
  // RODAPÉ
  // ========================================
  const drawFooter = (pageNumber: number, totalPages: number) => {
    const footerY = pageHeight - 15;

    // Linha separadora
    doc.setDrawColor(...lineColor);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    // Texto do rodapé
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      "Documento gerado automaticamente pelo sistema. As informações são de uso interno.",
      margin,
      footerY,
    );
    doc.text(
      `Página ${pageNumber} de ${totalPages}`,
      pageWidth - margin,
      footerY,
      {
        align: "right",
      },
    );
  };

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================
  const drawSectionTitle = (title: string) => {
    // Verifica se precisa de nova página
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    currentY += 8;

    // Linha decorativa
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY - 3, 3, 10, "F");

    // Título
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(title, margin + 6, currentY + 4);

    currentY += 12;

    // Linha abaixo do título
    doc.setDrawColor(...lineColor);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;
  };

  const drawFieldsGrid = (fields: Array<{ label: string; value: string }>) => {
    const colWidth = contentWidth / 2;

    for (let i = 0; i < fields.length; i += 2) {
      // Verifica se precisa de nova página
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin;
      }

      // Primeira coluna
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedColor);
      doc.text(fields[i].label.toUpperCase(), margin, currentY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text(fields[i].value || "-", margin, currentY + 5);

      // Segunda coluna (se existir)
      if (fields[i + 1]) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...mutedColor);
        doc.text(
          fields[i + 1].label.toUpperCase(),
          margin + colWidth,
          currentY,
        );

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text(fields[i + 1].value || "-", margin + colWidth, currentY + 5);
      }

      currentY += 12;
    }
  };

  // ========================================
  // RENDERIZAÇÃO DO PDF
  // ========================================
  drawHeader();
  drawClientIdentification();
  drawContactSection();
  drawCommercialInfo();
  drawProfileAnalysis();
  drawNotes();

  // Adiciona rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  // Salva o PDF
  const fileName = `ficha_cliente_${client.name.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Gera PDF em lote de múltiplos clientes
 */
export function generateBatchClientPDF(
  clients: Array<{ client: Client; lead?: Lead | null }>,
  companyName?: string,
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  clients.forEach((item, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // Gera cada cliente em uma nova página
    generateClientPageInDoc(doc, item.client, item.lead || null, companyName);
  });

  // Salva o PDF em lote
  const fileName = `fichas_clientes_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Função interna para gerar página de cliente dentro de um documento existente
 */
function generateClientPageInDoc(
  doc: jsPDF,
  client: Client,
  lead: Lead | null,
  companyName = "Turbine App",
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let currentY = margin;

  // Cores
  const primaryColor: [number, number, number] = [139, 92, 246];
  const textColor: [number, number, number] = [30, 30, 30];
  const mutedColor: [number, number, number] = [100, 100, 100];

  // Cabeçalho simplificado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, margin, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Ficha: ${client.name}`, margin, 19);

  doc.setFontSize(8);
  doc.text(
    `ID: #${client.id} | ${new Date().toLocaleDateString("pt-BR")}`,
    pageWidth - margin,
    15,
    { align: "right" },
  );

  currentY = 35;

  // Informações básicas compactas
  doc.setFontSize(9);
  doc.setTextColor(...textColor);

  const info = [
    `E-mail: ${client.email}`,
    `Telefone: ${client.phone}`,
    `Status: ${statusLabels[client.status]}`,
    `Valor: R$ ${client.value.toLocaleString("pt-BR")}`,
    `Responsável: ${client.responsible || "N/A"}`,
  ];

  if (lead) {
    info.push(`Origem: ${originLabels[lead.origin]}`);
    info.push(
      `Cadastro: ${new Date(lead.createdAt).toLocaleDateString("pt-BR")}`,
    );
  }

  info.forEach((text) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedColor);
    doc.text(text, margin, currentY);
    currentY += 5;
  });
}
