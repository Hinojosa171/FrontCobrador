import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../api';

function AdminDashboard({ onicinaId }) {
  const [stats, setStats] = useState({
    totalCobradores: 0,
    totalClientes: 0,
    totalCreditos: 0,
    creditosPendientes: 0,
    creditosRealizados: 0,
    totalPrestado: 0,
    totalPorPagar: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cargarEstadisticas();
  }, [onicinaId]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Intentar cargar datos con timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      let cobradores = { data: [] };
      let clientes = { data: [] };
      let creditos = { data: [] };

      try {
        [cobradores, clientes, creditos] = await Promise.race([
          Promise.all([
            api.get(`/oficinas/${onicinaId}/cobradores`).catch(() => ({ data: [] })),
            api.get(`/oficinas/${onicinaId}/clientes`).catch(() => ({ data: [] })),
            api.get(`/oficinas/${onicinaId}/creditos`).catch(() => ({ data: [] })),
          ]),
          timeoutPromise,
        ]);
      } catch (e) {
        console.warn('Error cargando datos:', e.message);
      }

      const creditosPendientes = (creditos.data || []).filter(c => c.estado === 'Pendiente').length;
      const creditosRealizados = (creditos.data || []).filter(c => c.estado === 'Realizado').length;

      const totalPrestado = (creditos.data || []).reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
      const totalPorPagar = (creditos.data || []).reduce((sum, c) => sum + (c.monto_por_pagar || 0), 0);

      setStats({
        totalCobradores: (cobradores.data || []).length,
        totalClientes: (clientes.data || []).length,
        totalCreditos: (creditos.data || []).length,
        creditosPendientes,
        creditosRealizados,
        totalPrestado,
        totalPorPagar,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">📊 Dashboard</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800 font-semibold">⚠️ {error}</p>
          <button 
            onClick={cargarEstadisticas}
            className="mt-2 px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin text-5xl mb-4">⏳</div>
            <p className="text-gray-600 font-bold">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Cobradores" 
              value={stats.totalCobradores} 
              icon={<Users size={32} />}
              color="bg-blue-500"
            />
            <StatCard 
              title="Clientes" 
              value={stats.totalClientes} 
              icon={<Users size={32} />}
              color="bg-green-500"
            />
            <StatCard 
              title="Total Créditos" 
              value={stats.totalCreditos} 
              icon={<TrendingUp size={32} />}
              color="bg-orange-500"
            />
            <StatCard 
              title="Dinero por Cobrar" 
              value={`$${stats.totalPorPagar.toLocaleString('es-CO')}`} 
              icon={<DollarSign size={32} />}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle size={24} className="text-orange-500" />
                Estado de Créditos
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Pendientes:</span>
                  <span className="text-orange-500 font-bold text-lg">{stats.creditosPendientes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Realizados:</span>
                  <span className="text-green-500 font-bold text-lg">{stats.creditosRealizados}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={24} className="text-purple-500" />
                Resumen Financiero
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Prestado:</span>
                  <span className="text-blue-600 font-bold">
                    ${stats.totalPrestado.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total por Pagar:</span>
                  <span className="text-purple-600 font-bold">
                    ${stats.totalPorPagar.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ganancia (Interés):</span>
                    <span className="text-green-600 font-bold">
                      ${(stats.totalPorPagar - stats.totalPrestado).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
