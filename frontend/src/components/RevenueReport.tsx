import { DollarSign, Calendar, Users, Zap, Droplet } from "lucide-react";

interface RevenueReportProps {
  revenueFilter: { 
    period: string;
    customStartDate?: string;
    customEndDate?: string;
  };
  onFilterChange: (filter: { 
    period: string;
    customStartDate?: string;
    customEndDate?: string;
  }) => void;
  revenueData: { 
    total: number; 
    laser: number; 
    cera: number; 
    count: number;
    laserCount?: number;
    ceraCount?: number;
  };
}

const RevenueReport = ({ 
  revenueFilter, 
  onFilterChange, 
  revenueData 
}: RevenueReportProps) => {
  
  // Função helper para formatar data no padrão brasileiro
  const formatDateToBR = (dateString: string) => {
    return dateString.split('-').reverse().join('/');
  };
  
  const handlePeriodChange = (period: string) => {
    if (period !== 'Personalizado') {
      onFilterChange({ period });
    } else {
      onFilterChange({ 
        period, 
        customStartDate: revenueFilter.customStartDate || '',
        customEndDate: revenueFilter.customEndDate || ''
      });
    }
  };

  const handleDateChange = (field: 'customStartDate' | 'customEndDate', value: string) => {
    const updatedFilter = {
      ...revenueFilter,
      [field]: value
    };
    
    // Se ambas as datas estão preenchidas, garantir que a data final não seja anterior à inicial
    if (updatedFilter.customStartDate && updatedFilter.customEndDate) {
      if (field === 'customStartDate' && value > updatedFilter.customEndDate) {
        updatedFilter.customEndDate = value;
      } else if (field === 'customEndDate' && value < updatedFilter.customStartDate) {
        updatedFilter.customStartDate = value;
      }
    }
    
    onFilterChange(updatedFilter);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="text-blue-500" size={24} />
        <h2 className="text-2xl font-bold">Receitas e Atendimentos</h2>
      </div>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
          <select 
            value={revenueFilter.period} 
            onChange={e => handlePeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {["Dia","Semana","Mês","Personalizado"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {revenueFilter.period === 'Personalizado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Data Inicial
              </label>
              <input
                type="date"
                value={revenueFilter.customStartDate || ''}
                onChange={(e) => handleDateChange('customStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Data Final
              </label>
              <input
                type="date"
                value={revenueFilter.customEndDate || ''}
                onChange={(e) => handleDateChange('customEndDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {revenueFilter.customStartDate && revenueFilter.customEndDate && (
              <div className="col-span-full">
                <p className="text-sm text-gray-600">
                  Período selecionado: {formatDateToBR(revenueFilter.customStartDate)} até {formatDateToBR(revenueFilter.customEndDate)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Cards de Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Total Geral</h3>
            <DollarSign size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">R$ {revenueData.total.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <Users size={14} />
            <span>{revenueData.count} atendimento{revenueData.count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Laser</h3>
            <Zap size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">R$ {revenueData.laser.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <Users size={14} />
            <span>{revenueData.laserCount || 0} atendimento{revenueData.laserCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Cera</h3>
            <Droplet size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">R$ {revenueData.cera.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <Users size={14} />
            <span>{revenueData.ceraCount || 0} atendimento{revenueData.ceraCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      {revenueFilter.period === 'Personalizado' && revenueFilter.customStartDate && revenueFilter.customEndDate && revenueData.count === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Nenhum agendamento encontrado no período de {formatDateToBR(revenueFilter.customStartDate)} até {formatDateToBR(revenueFilter.customEndDate)}.
          </p>
        </div>
      )}
    </div>
  );
};

export default RevenueReport;