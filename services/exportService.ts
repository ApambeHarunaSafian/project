
import * as XLSX from 'xlsx';
import { Transaction, Product, Expense, Purchase } from '../types';

export const exportReportsToExcel = (
  transactions: Transaction[], 
  stats: any, 
  dateRange: { start: string, end: string }
) => {
  const summaryData = [
    { 'Metric': 'Report Start Date', 'Value': dateRange.start },
    { 'Metric': 'Report End Date', 'Value': dateRange.end },
    { 'Metric': 'Total Revenue (GHS)', 'Value': stats.totalRevenue.toFixed(2) },
    { 'Metric': 'Total Orders', 'Value': stats.orderCount },
    { 'Metric': 'Average Order Value (GHS)', 'Value': stats.avgOrder.toFixed(2) },
    { 'Metric': 'Export Date', 'Value': new Date().toLocaleString() }
  ];

  const transactionData = transactions.map(t => ({
    'ID': t.id,
    'Date': new Date(t.timestamp).toLocaleDateString(),
    'Time': new Date(t.timestamp).toLocaleTimeString(),
    'Total (GHS)': t.total.toFixed(2),
    'Tax (GHS)': t.tax.toFixed(2),
    'Discount (GHS)': t.discount.toFixed(2),
    'Payment Method': t.paymentMethod,
    'Items Count': t.items.reduce((sum, i) => sum + i.quantity, 0)
  }));

  const categoryData = stats.pieData.map((cat: any) => ({
    'Category': cat.name,
    'Revenue (GHS)': cat.value.toFixed(2),
    'Share (%)': ((cat.value / (stats.totalRevenue || 1)) * 100).toFixed(1) + '%'
  }));

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
  const wsCategories = XLSX.utils.json_to_sheet(categoryData);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'All Transactions');
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Category Analytics');

  XLSX.writeFile(wb, `GeminiPOS_Report_${dateRange.start}_to_${dateRange.end}.xlsx`);
};

export const exportPnLToExcel = (pnlData: any, transactions: Transaction[], expenses: Expense[], purchases: Purchase[]) => {
  const wb = XLSX.utils.book_new();

  const summary = [
    { 'Financial Metric': 'Gross Revenue', 'Value': `GH₵${pnlData.totalRevenue.toFixed(2)}` },
    { 'Financial Metric': 'Total Expenses & COGS', 'Value': `GH₵${pnlData.totalExpenses.toFixed(2)}` },
    { 'Financial Metric': 'Net Profit', 'Value': `GH₵${pnlData.netProfit.toFixed(2)}` },
    { 'Financial Metric': 'Profit Margin', 'Value': `${((pnlData.netProfit / (pnlData.totalRevenue || 1)) * 100).toFixed(2)}%` }
  ];

  const formattedExpenses = expenses.map(e => ({
    'Date': new Date(e.date).toLocaleDateString(),
    'Title': e.title,
    'Category': e.category,
    'Amount (GHS)': e.amount.toFixed(2),
    'Type': e.isRecurring ? 'Recurring' : 'One-time',
    'Notes': e.note
  }));

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Financial Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedExpenses), 'Operational Expenses');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purchases), 'Inventory Purchases');

  XLSX.writeFile(wb, `GeminiPOS_PnL_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportInventoryToExcel = (products: Product[]) => {
  const inventoryData = products.map(p => ({
    'SKU': p.sku,
    'Name': p.name,
    'Category': p.category,
    'Brand': p.brand,
    'Price (GHS)': p.price.toFixed(2),
    'Stock': p.stock,
    'Status': p.stock <= 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory List');
  XLSX.writeFile(wb, `GeminiPOS_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
};
