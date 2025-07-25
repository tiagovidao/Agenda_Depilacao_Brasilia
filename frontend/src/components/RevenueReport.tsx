import { DollarSign } from "lucide-react";

interface RevenueReportProps {
  show: boolean;
  revenueFilter: { period: string };
  onFilterChange: (filter: { period: string }) => void;
  revenueData: { total: number; laser: number; cera: number; count: number };
}

const RevenueReport = ({ 
  show, 
  revenueFilter, 
  onFilterChange, 
  revenueData 
}: RevenueReportProps) => {
  if (!show) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="text-blue-500" size={24} />
        <h2 className="text-2xl font-bold">Receitas</h2>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
        <select 
          value={revenueFilter.period} 
          onChange={e => onFilterChange({ period: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
        >
          {["Dia","Semana","Mês"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
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
    </div>
  );
};

export default RevenueReport;