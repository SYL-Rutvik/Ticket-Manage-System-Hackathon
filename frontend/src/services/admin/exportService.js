import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PERIOD_CONFIG = {
  monthly: { label: 'Monthly' },
  'all-time': { label: 'All Time' },
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPeriodTickets = (period, tickets = []) => {
  if (period === 'all-time') return tickets;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return tickets.filter((ticket) => {
    const createdAt = toDate(ticket.createdAt);
    return createdAt && createdAt >= monthStart && createdAt <= now;
  });
};

const computeSummaryFromTickets = (tickets = []) => {
  const status = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
  const byPriority = { low: 0, medium: 0, high: 0, critical: 0 };
  const now = new Date();

  let slaBreached = 0;

  tickets.forEach((ticket) => {
    if (status[ticket.status] !== undefined) status[ticket.status] += 1;
    if (byPriority[ticket.priority] !== undefined) byPriority[ticket.priority] += 1;

    const dueAt = toDate(ticket.sla_due_at);
    if (dueAt && dueAt < now && !['resolved', 'closed'].includes(ticket.status)) {
      slaBreached += 1;
    }
  });

  return {
    total: tickets.length,
    open: status.open,
    inProgress: status['in-progress'],
    resolved: status.resolved,
    closed: status.closed,
    slaBreached,
    byPriority,
  };
};

const buildSummary = (period, periodTickets, stats) => {
  if (period === 'all-time' && stats) {
    return {
      total: stats.total || 0,
      open: stats.open || 0,
      inProgress: stats.inProgress || 0,
      resolved: stats.resolved || 0,
      closed: stats.closed || 0,
      slaBreached: stats.slaBreached || 0,
      byPriority: {
        low: stats.byPriority?.low || 0,
        medium: stats.byPriority?.medium || 0,
        high: stats.byPriority?.high || 0,
        critical: stats.byPriority?.critical || 0,
      },
    };
  }

  return computeSummaryFromTickets(periodTickets);
};

const getTicketDisplayValue = (ticket, key) => {
  if (key === 'createdBy') return typeof ticket.createdBy === 'object' ? ticket.createdBy?.name : 'Unknown';
  if (key === 'assignedTo') {
    if (!ticket.assignedTo) return 'Unassigned';
    return typeof ticket.assignedTo === 'object' ? ticket.assignedTo?.name : 'Assigned';
  }
  if (key === 'createdAt') {
    const date = toDate(ticket.createdAt);
    return date ? date.toLocaleString() : '-';
  }
  return ticket[key] || '-';
};

const getExportModel = (period, tickets, stats) => {
  const periodTickets = getPeriodTickets(period, tickets);
  const summary = buildSummary(period, periodTickets, stats);
  const periodLabel = PERIOD_CONFIG[period]?.label || 'Custom';
  const generatedAt = new Date();

  const ticketColumns = [
    { key: 'id', label: 'Ticket ID' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'createdAt', label: 'Created At' },
  ];

  const ticketRows = periodTickets.map((ticket) =>
    ticketColumns.map((column) => getTicketDisplayValue(ticket, column.key))
  );

  return {
    period,
    periodLabel,
    generatedAt,
    summary,
    periodTickets,
    ticketColumns,
    ticketRows,
  };
};

const getFilename = (period, extension) => {
  const stamp = new Date().toISOString().slice(0, 10);
  return `admin-report-${period}-${stamp}.${extension}`;
};

export const exportTicketsReportPDF = ({ period, tickets, stats }) => {
  const model = getExportModel(period, tickets, stats);
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.text(`Admin Ticket Report - ${model.periodLabel}`, 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${model.generatedAt.toLocaleString()}`, 14, 25);
  doc.text(`Exported ticket rows: ${model.periodTickets.length}`, 14, 31);

  const summaryRows = [
    ['Total Tickets', model.summary.total],
    ['Open', model.summary.open],
    ['In Progress', model.summary.inProgress],
    ['Resolved', model.summary.resolved],
    ['Closed', model.summary.closed],
    ['SLA Breached', model.summary.slaBreached],
    ['Priority: Low', model.summary.byPriority.low],
    ['Priority: Medium', model.summary.byPriority.medium],
    ['Priority: High', model.summary.byPriority.high],
    ['Priority: Critical', model.summary.byPriority.critical],
  ];

  autoTable(doc, {
    startY: 36,
    head: [['Metric', 'Value']],
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [31, 41, 55] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [model.ticketColumns.map((column) => column.label)],
    body: model.ticketRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [55, 65, 81] },
  });

  doc.save(getFilename(period, 'pdf'));
};

export const exportTicketsReportExcel = ({ period, tickets, stats }) => {
  const model = getExportModel(period, tickets, stats);

  const summarySheetData = [
    { Metric: 'Report Period', Value: model.periodLabel },
    { Metric: 'Generated At', Value: model.generatedAt.toLocaleString() },
    { Metric: 'Exported Ticket Rows', Value: model.periodTickets.length },
    { Metric: 'Total Tickets', Value: model.summary.total },
    { Metric: 'Open', Value: model.summary.open },
    { Metric: 'In Progress', Value: model.summary.inProgress },
    { Metric: 'Resolved', Value: model.summary.resolved },
    { Metric: 'Closed', Value: model.summary.closed },
    { Metric: 'SLA Breached', Value: model.summary.slaBreached },
    { Metric: 'Priority Low', Value: model.summary.byPriority.low },
    { Metric: 'Priority Medium', Value: model.summary.byPriority.medium },
    { Metric: 'Priority High', Value: model.summary.byPriority.high },
    { Metric: 'Priority Critical', Value: model.summary.byPriority.critical },
  ];

  const ticketSheetData = model.periodTickets.map((ticket) => ({
    ticketId: ticket.id || ticket._id || '-',
    title: ticket.title || '-',
    status: ticket.status || '-',
    priority: ticket.priority || '-',
    createdBy: getTicketDisplayValue(ticket, 'createdBy'),
    assignedTo: getTicketDisplayValue(ticket, 'assignedTo'),
    createdAt: getTicketDisplayValue(ticket, 'createdAt'),
    category: ticket.category || '-',
  }));

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summarySheetData);
  const ticketsSheet = XLSX.utils.json_to_sheet(ticketSheetData);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, ticketsSheet, 'Tickets');

  XLSX.writeFile(workbook, getFilename(period, 'xlsx'));
};