'use client';

import { useRouter } from 'next/navigation';

export default function ConfigPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Calendários, sindicatos e índices financeiros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
