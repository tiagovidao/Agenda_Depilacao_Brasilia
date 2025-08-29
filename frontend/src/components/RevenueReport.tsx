import { DollarSign, Calendar } from "lucide-react";

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
  revenueData: { total: number; laser: number; cera: number; count: number };
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
        <h2 className="text-2xl font-bold">Receitas</h2>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Total Geral", value: revenueData.total, bg: "from-gray-600 to-gray-800", count: revenueData.count },
          { title: "Laser", value: revenueData.laser, bg: "from-pink-400 to-pink-600" },
          { title: "Cera", value: revenueData.cera, bg: "from-purple-500 to-purple-700" }
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-r ${item.bg} rounded-lg p-4 text-white shadow-md`}>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-2xl font-bold">R$ {item.value.toFixed(2)}</p>
            {item.count !== undefined && <p className="text-sm opacity-90">{item.count} atendimentos</p>}
          </div>
        ))}
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