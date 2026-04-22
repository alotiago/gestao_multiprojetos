'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface ProjectInfo {
  id: string;
  nome: string;
  codigo: string;
}

export default function ConfigPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoadingProjects(true);
    api.get('/projects')
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, []);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Calendários, sindicatos e índices financeiros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            title: 'Calendário de Feriados',
            description: 'Gerencie feriados nacionais, estaduais e municipais. Calcule dias úteis por região.',
            icon: '📅',
            color: '#1E16A0',
            href: '/config/calendarios',
          },
          {
            title: 'Sindicatos',
            description: 'Configure sindicatos, aplique dissídio e execute simulações trabalhistas.',
            icon: '🤝',
            color: '#00B3AD',
            href: '/config/sindicatos',
          },
          {
            title: 'Índices Financeiros',
            description: 'Registro mensal de IPCA, INPC e outros indicadores econômicos.',
            icon: '📊',
            color: '#35277D',
            href: '/config/indices',
          },
          {
            title: 'Usuários e Acessos',
            description: 'CRUD completo de usuários com níveis de acesso e status.',
            icon: '🔐',
            color: '#E52287',
            href: '/config/usuarios',
          },
          {
            title: 'Impostos',
            description: 'Cadastro e cálculo de tributos por projeto: ISS, PIS, COFINS, IRPJ, CSLL e mais.',
            icon: '🧾',
            color: '#F97316',
            href: '/config/impostos',
          },
          {
            title: 'Alíquotas por Regime',
            description: 'Configure alíquotas de PIS, COFINS, IRPJ, CSLL, ISS por regime tributário.',
            icon: '⚖️',
            color: '#8B5CF6',
            href: '/config/aliquotas',
          },
          {
            title: 'Unidades',
            description: 'Gestão de unidades organizacionais: DITIC, SEEC, SEAD e demais.',
            icon: '🏢',
            color: '#0891B2',
            href: '/config/unidades',
          },
          {
            title: 'Tipos de Despesa',
            description: 'Cadastre e gerencie categorias de despesa: facilities, software, fornecedor e mais.',
            icon: '📋',
            color: '#059669',
            href: '/config/tipos-despesa',
          },
          {
            title: 'Fornecedores',
            description: 'Cadastro de fornecedores com CNPJ, razão social e consulta automática.',
            icon: '🏭',
            color: '#D97706',
            href: '/config/fornecedores',
          },
        ].map((item) => (
          <button
            key={item.title}
            onClick={() => router.push(item.href)}
            className="hw1-card flex flex-col gap-4 text-left hover:shadow-hw1-lg transition-all duration-200 cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
              style={{ background: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <h3 className="font-heading font-semibold text-hw1-navy">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            </div>
            <div className="mt-auto flex items-center gap-2 text-hw1-blue text-sm font-medium">
              Acessar <span>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Consulta de IDs de Projetos */}
      <div className="hw1-card">
        <h2 className="font-heading font-semibold text-hw1-navy mb-1">Projetos Cadastrados</h2>
        <p className="text-sm text-gray-500 mb-4">Consulte o ID dos projetos para uso em importações e integrações.</p>
        {loadingProjects ? (
          <p className="text-sm text-gray-500">Carregando projetos...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum projeto cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">ID (projectId)</th>
                  <th className="py-2 w-20">Copiar</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-mono text-hw1-blue font-semibold">{p.codigo}</td>
                    <td className="py-2 pr-4 text-gray-700">{p.nome}</td>
                    <td className="py-2 pr-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded select-all">{p.id}</code>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => copyToClipboard(p.id)}
                        className="text-xs px-3 py-1 rounded-lg bg-hw1-blue text-white hover:bg-hw1-navy transition-colors"
                      >
                        {copiedId === p.id ? '✓ Copiado' : '📋 Copiar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="hw1-card">
        <h2 className="font-heading font-semibold text-hw1-navy mb-3">Endpoints disponíveis</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex gap-3 items-center">
            <span className="w-16 text-right text-xs font-mono text-hw1-teal font-semibold">GET</span>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded">/calendario?ano=2026</code>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-16 text-right text-xs font-mono text-hw1-teal font-semibold">GET</span>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded">/calendario/calcular/dias-uteis?mes=1&amp;ano=2026&amp;estado=SP</code>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-16 text-right text-xs font-mono text-hw1-pink font-semibold">POST</span>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded">/sindicato/dissidio/aplicar</code>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-16 text-right text-xs font-mono text-hw1-pink font-semibold">POST</span>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded">/sindicato/simulacao/impacto-financeiro</code>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-16 text-right text-xs font-mono text-hw1-pink font-semibold">POST</span>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded">/operations/recalculo-cascata</code>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-16 text-right text-xs font-mono text-hw1-teal font-semibold">GET</span>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded">/financial/provisoes?projectId=xxx</code>
          </div>
        </div>
      </div>
    </div>
  );
}
