'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '@/services/api';

interface ContratoMetrica {
  contratoId: string;
  contratoNome: string;
  metricas: Array<{
    mes: number;
    receita: number;
    custoFixo: number;
    custoVariavel: number;
    imposto: number;
    custoTotal: number;
    margemBruta: number;
    margemLiquida: number;
    detalhamento?: Array<{
      id: string;
      nome: string;
      descricao: string;
      receita: number;
      linhas: Array<{
        id: string;
        descricaoItem: string;
        unidade: string;
        receita: number;
      }>;
    }>;
  }>;
  metricasAnterior: Array<{
    mes: number;
    receita: number;
    custoTotal: number;
    lucro: number;
  }>;
  totais: {
    receita: number;
    custoFixo: number;
    custoVariavel: number;
    custoTotal: number;
    imposto: number;
    lucro: number;
    margemBruta: number;
    margemLiquida: number;
  };
  comparacao: {
    receitaAnterior: number;
    custoAnterior: number;
    variacaoReceita: number;
    variacaoCusto: number;
  };
  objetos: Array<{
    id: string;
    nome: string;
    descricao: string;
    receita: number;
    custo: number;
    lucro: number;
    margem: number;
    linhas?: Array<{
      id: string;
      descricaoItem: string;
      unidade: string;
      valorTotalAnual: number;
      saldoValor: number;
      receita: number;
      custo: number;
      lucro: number;
      margem: number;
    }>;
  }>;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatPercent(valor: number): string {
  return `${(valor * 100).toFixed(2)}%`;
}

function formatPercentDelta(valor: number): string {
  const sinal = valor >= 0 ? '+' : '';
  return `${sinal}${(valor * 100).toFixed(1)}%`;
}

function getImpostoValor(item: any): number {
  return Number(item?.imposto ?? item?.impostos ?? 0);
}

export default function ContratosDashboard() {
  const [dados, setDados] = useState<ContratoMetrica[]>([]);
  const [ano, setAno] = useState(2026);
  const [carregando, setCarregando] = useState(true);
  const [contratoSelecionado, setContratoSelecionado] = useState<string | null>(null);
  const [chartTipo, setChartTipo] = useState('receita');
  const [mostrarComparacao, setMostrarComparacao] = useState(false);
  const [mostrarObjetos, setMostrarObjetos] = useState(false);
  const [objetoExpandido, setObjetoExpandido] = useState<string | null>(null);
  const [mesExpandido, setMesExpandido] = useState<number | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  async function loadDados() {
    try {
      setCarregando(true);
      const response = await api.get(`/relatorios/contratos-dashboard?ano=${ano}`);
      setDados(response.data);
      if (response.data.length > 0) {
        setContratoSelecionado(response.data[0].contratoId);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    loadDados();
  }, [ano]);

  const contratoAtual = dados.find(d => d.contratoId === contratoSelecionado);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Carregando dados...</div>
      </div>
    );
  }

  // Preparar dados para gráfico de tendências
  const dadosTendencia = contratoAtual?.metricas.map((m, idx) => ({
    mes: MESES[idx],
    receita: m.receita,
    custoTotal: m.custoTotal,
    lucro: Number(m.receita || 0) - Number(m.custoTotal || 0) - getImpostoValor(m),
    margemBruta: m.margemBruta * 100,
    margemLiquida: m.margemLiquida * 100,
  })) || [];

  // Preparar dados para comparação
  const dadosComparacao = contratoAtual?.metricas.map((m, idx) => {
    const anterior = contratoAtual.metricasAnterior[idx];
    return {
      mes: MESES[idx],
      [ano]: m.receita,
      [ano - 1]: anterior?.receita || 0,
    };
  }) || [];

  // Função para exportar Excel
  async function exportarExcel() {
    if (!contratoAtual) return;

    const ws = XLSX.utils.aoa_to_sheet([
      [`Dashboard Financeiro - ${contratoAtual.contratoNome} - ${ano}`],
      [],
      ['Mês', 'Receita', 'Custo Fixo', 'Custo Variável', 'Custo Total', 'Imposto', 'Margem Bruta %', 'Margem Líquida %'],
      ...contratoAtual.metricas.map(m => [
        MESES[m.mes - 1],
        m.receita,
        m.custoFixo,
        m.custoVariavel,
        m.custoTotal,
        getImpostoValor(m),
        (m.margemBruta * 100).toFixed(2),
        (m.margemLiquida * 100).toFixed(2),
      ]),
      [],
      ['TOTAL', contratoAtual.totais.receita, contratoAtual.totais.custoFixo, contratoAtual.totais.custoVariavel, contratoAtual.totais.custoTotal, getImpostoValor(contratoAtual.totais), (contratoAtual.totais.margemBruta * 100).toFixed(2), (contratoAtual.totais.margemLiquida * 100).toFixed(2)],
    ]);

    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
    XLSX.writeFile(wb, `dashboard-${contratoAtual.contratoNome}-${ano}.xlsx`);
  }

  // Função para exportar PDF
  async function exportarPDF() {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 10;
      const marginY = 14;
      const headerH = 12;
      const contentWidth = pageWidth - marginX * 2;
      const contentHeightPerPage = pageHeight - marginY * 2 - headerH;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      const drawHeader = () => {
        pdf.setFillColor(5, 4, 57);
        pdf.rect(marginX, marginY - 8, contentWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text('HW1', marginX + 3, marginY - 3);
        pdf.setFontSize(8);
        pdf.text(`Dashboard Financeiro - ${contratoAtual?.contratoNome || ''} - ${ano}`, marginX + 18, marginY - 3);
      };

      drawHeader();
      pdf.addImage(imgData, 'PNG', marginX, marginY, contentWidth, imgHeight);
      heightLeft -= contentHeightPerPage;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        drawHeader();
        pdf.addImage(imgData, 'PNG', marginX, marginY + position, contentWidth, imgHeight);
        heightLeft -= contentHeightPerPage;
      }

      pdf.save(`dashboard-${contratoAtual?.contratoNome}-${ano}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard Financeiro</h1>
          <p className="text-gray-600">Análise de performance de contratos por período</p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
              <select
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contrato</label>
              <select
                value={contratoSelecionado || ''}
                onChange={e => setContratoSelecionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dados.map(d => (
                  <option key={d.contratoId} value={d.contratoId}>
                    {d.contratoNome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gráfico</label>
              <select
                value={chartTipo}
                onChange={e => setChartTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="receita">Receita vs Custos</option>
                <option value="margens">Margens %</option>
                <option value="lucro">Lucro Mensal</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={exportarExcel}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                📥 Excel
              </button>
              <button
                onClick={exportarPDF}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                📄 PDF
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarComparacao}
                onChange={e => setMostrarComparacao(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Comparar com ano anterior</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarObjetos}
                onChange={e => setMostrarObjetos(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Mostrar Objetos Contratuais</span>
            </label>
          </div>
        </div>

        {/* Dashboard Container */}
        <div ref={dashboardRef} className="space-y-8">
          {contratoAtual && (
            <>
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
                  <div className="text-sm text-gray-600 mb-2">Receita Total</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatBRL(contratoAtual.totais.receita)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formatPercentDelta(contratoAtual.comparacao.variacaoReceita)} vs {ano - 1}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                  <div className="text-sm text-gray-600 mb-2">Custo Total</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatBRL(contratoAtual.totais.custoTotal)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formatPercentDelta(contratoAtual.comparacao.variacaoCusto)} vs {ano - 1}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="text-sm text-gray-600 mb-2">Lucro Líquido</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatBRL(contratoAtual.totais.lucro)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Margem: {formatPercent(contratoAtual.totais.margemLiquida)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                  <div className="text-sm text-gray-600 mb-2">Margem Bruta</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercent(contratoAtual.totais.margemBruta)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formatBRL(contratoAtual.totais.receita - contratoAtual.totais.custoTotal)}
                  </div>
                </div>
              </div>

              {/* Gráfico de Tendências */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Tendência Mensal</h2>
                <ResponsiveContainer width="100%" height={350}>
                  {chartTipo === 'receita' ? (
                    <BarChart data={dadosTendencia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatBRL(value)} />
                      <Legend />
                      <Bar dataKey="receita" fill="#10b981" name="Receita" />
                      <Bar dataKey="custoTotal" fill="#ef4444" name="Custo Total" />
                      <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
                    </BarChart>
                  ) : chartTipo === 'margens' ? (
                    <LineChart data={dadosTendencia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `${(value).toFixed(2)}%`} />
                      <Legend />
                      <Line type="monotone" dataKey="margemBruta" stroke="#10b981" name="Margem Bruta %" strokeWidth={2} />
                      <Line type="monotone" dataKey="margemLiquida" stroke="#3b82f6" name="Margem Líquida %" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <LineChart data={dadosTendencia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatBRL(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" strokeWidth={2} />
                      <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Comparação Período */}
              {mostrarComparacao && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Comparação {ano} vs {ano - 1}</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={dadosComparacao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatBRL(value)} />
                      <Legend />
                      <Bar dataKey={ano.toString()} fill="#3b82f6" />
                      <Bar dataKey={(ano - 1).toString()} fill="#9ca3af" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Objetos Contratuais */}
              {mostrarObjetos && contratoAtual.objetos.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Objetos Contratuais</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Nome</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Receita</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Custo</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Lucro</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Margem</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-700">Drill-down</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contratoAtual.objetos.map((obj, idx) => (
                          <Fragment key={obj.id}>
                            <tr className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-4 py-2 text-gray-900">{obj.nome}</td>
                              <td className="px-4 py-2 text-right text-emerald-600 font-medium">
                                {formatBRL(obj.receita)}
                              </td>
                              <td className="px-4 py-2 text-right text-red-600 font-medium">
                                {formatBRL(obj.custo)}
                              </td>
                              <td className="px-4 py-2 text-right text-blue-600 font-medium">
                                {formatBRL(obj.lucro)}
                              </td>
                              <td className="px-4 py-2 text-right text-purple-600 font-medium">
                                {formatPercent(obj.margem)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setObjetoExpandido(objetoExpandido === obj.id ? null : obj.id)}
                                  className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                                >
                                  {objetoExpandido === obj.id ? 'Ocultar' : 'Ver linhas'}
                                </button>
                              </td>
                            </tr>
                            {objetoExpandido === obj.id && (
                              <tr className="bg-white">
                                <td colSpan={6} className="px-4 py-3 border-t border-gray-200">
                                  {!obj.linhas || obj.linhas.length === 0 ? (
                                    <div className="text-xs text-gray-500">Sem linhas contratuais para este objeto.</div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-2 py-1 text-left">Linha Contratual</th>
                                            <th className="px-2 py-1 text-left">Unidade</th>
                                            <th className="px-2 py-1 text-right">Valor Contratado</th>
                                            <th className="px-2 py-1 text-right">Saldo</th>
                                            <th className="px-2 py-1 text-right">Receita</th>
                                            <th className="px-2 py-1 text-right">Custo</th>
                                            <th className="px-2 py-1 text-right">Lucro</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {obj.linhas.map((linha) => (
                                            <tr key={linha.id} className="border-t border-gray-100">
                                              <td className="px-2 py-1">{linha.descricaoItem}</td>
                                              <td className="px-2 py-1">{linha.unidade}</td>
                                              <td className="px-2 py-1 text-right">{formatBRL(Number(linha.valorTotalAnual || 0))}</td>
                                              <td className="px-2 py-1 text-right text-emerald-700">{formatBRL(Number(linha.saldoValor || 0))}</td>
                                              <td className="px-2 py-1 text-right">{formatBRL(Number(linha.receita || 0))}</td>
                                              <td className="px-2 py-1 text-right text-red-600">{formatBRL(Number(linha.custo || 0))}</td>
                                              <td className="px-2 py-1 text-right text-blue-600">{formatBRL(Number(linha.lucro || 0))}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tabela Detalhada */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Detalhamento Mensal</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-center font-semibold text-gray-700">Detalhe</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Mês</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Receita</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Custo Fixo</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Custo Variável</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Custo Total</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Imposto</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Margem Bruta</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Margem Líquida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratoAtual.metricas.map((m, idx) => (
                        <Fragment key={m.mes}>
                          <tr className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => setMesExpandido(mesExpandido === m.mes ? null : m.mes)}
                                className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                              >
                                {mesExpandido === m.mes ? 'Ocultar' : 'Ver'}
                              </button>
                            </td>
                            <td className="px-4 py-2 font-medium text-gray-900">{MESES[m.mes - 1]}</td>
                            <td className="px-4 py-2 text-right text-emerald-600 font-medium">{formatBRL(m.receita)}</td>
                            <td className="px-4 py-2 text-right text-red-600 font-medium">{formatBRL(m.custoFixo)}</td>
                            <td className="px-4 py-2 text-right text-orange-600 font-medium">{formatBRL(m.custoVariavel)}</td>
                            <td className="px-4 py-2 text-right text-red-700 font-medium">{formatBRL(m.custoTotal)}</td>
                            <td className="px-4 py-2 text-right text-gray-600 font-medium">{formatBRL(getImpostoValor(m))}</td>
                            <td className="px-4 py-2 text-right text-purple-600 font-medium">{formatPercent(m.margemBruta)}</td>
                            <td className="px-4 py-2 text-right text-blue-600 font-medium">{formatPercent(m.margemLiquida)}</td>
                          </tr>
                          {mesExpandido === m.mes && (
                            <tr className="bg-white">
                              <td colSpan={9} className="px-4 py-3 border-t border-gray-200">
                                {!m.detalhamento || m.detalhamento.length === 0 ? (
                                  <div className="text-xs text-gray-500">Sem detalhamento por objeto/linha para este mês.</div>
                                ) : (
                                  <div className="space-y-3">
                                    {m.detalhamento.map((obj) => (
                                      <div key={obj.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div>
                                            <p className="text-sm font-semibold text-hw1-navy">{obj.nome}</p>
                                            <p className="text-xs text-gray-500">{obj.descricao}</p>
                                          </div>
                                          <p className="text-sm font-semibold text-emerald-700">{formatBRL(Number(obj.receita || 0))}</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs">
                                            <thead className="bg-gray-100">
                                              <tr>
                                                <th className="px-2 py-1 text-left">Linha</th>
                                                <th className="px-2 py-1 text-left">Unidade</th>
                                                <th className="px-2 py-1 text-right">Receita</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {obj.linhas.map((linha) => (
                                                <tr key={linha.id} className="border-t border-gray-100">
                                                  <td className="px-2 py-1">{linha.descricaoItem}</td>
                                                  <td className="px-2 py-1">{linha.unidade}</td>
                                                  <td className="px-2 py-1 text-right">{formatBRL(Number(linha.receita || 0))}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                      <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                        <td className="px-4 py-2 text-gray-900">-</td>
                        <td className="px-4 py-2 text-gray-900">TOTAL</td>
                        <td className="px-4 py-2 text-right text-emerald-700">{formatBRL(contratoAtual.totais.receita)}</td>
                        <td className="px-4 py-2 text-right text-red-700">{formatBRL(contratoAtual.totais.custoFixo)}</td>
                        <td className="px-4 py-2 text-right text-orange-700">{formatBRL(contratoAtual.totais.custoVariavel)}</td>
                        <td className="px-4 py-2 text-right text-red-900">{formatBRL(contratoAtual.totais.custoTotal)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{formatBRL(getImpostoValor(contratoAtual.totais))}</td>
                        <td className="px-4 py-2 text-right text-purple-700">{formatPercent(contratoAtual.totais.margemBruta)}</td>
                        <td className="px-4 py-2 text-right text-blue-700">{formatPercent(contratoAtual.totais.margemLiquida)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
