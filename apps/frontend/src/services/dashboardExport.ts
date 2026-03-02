export function buildDashboardFinanceiroCsvUrl(ano: number, mes?: number): string {
  const params = new URLSearchParams({ ano: String(ano) });

  if (mes !== undefined) {
    params.append('mes', String(mes));
  }

  return `/dashboard/financeiro/export/csv?${params.toString()}`;
}

export function buildDashboardFinanceiroCsvFilename(ano: number, mes?: number): string {
  const mesPart = mes !== undefined ? `-mes-${String(mes).padStart(2, '0')}` : '';
  return `dashboard-financeiro-ano-${ano}${mesPart}.csv`;
}

export function downloadTextFile(content: string, fileName: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
}
