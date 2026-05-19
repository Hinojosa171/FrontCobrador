import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import api from '../../api';

function AdminCreditoList({ onicinaId }) {
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCobradorID, setFiltroCobradorID] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cargarDatos();
  }, [onicinaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [creditosRes, clientesRes, cobradoresRes] = await Promise.all([
        api.get(`/oficinas/${onicinaId}/creditos`),
        api.get(`/oficinas/${onicinaId}/clientes`),
        api.get(`/oficinas/${onicinaId}/cobradores`),
      ]);
      setCreditos(creditosRes.data);
      setClientes(clientesRes.data);
      setCobradores(cobradoresRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar créditos');
    } finally {
      setLoading(false);
    }
  };

  const getNombreCliente = (clienteID) => {
    const cliente = clientes.find(c => c._id === clienteID);
    return cliente?.nombre || 'Desconocido';
  };

  const getCedulaCliente = (clienteID) => {
    const cliente = clientes.find(c => c._id === clienteID);
    return cliente?.cedula || '-';
  };

  const getNombreCobrador = (cobradorID) => {
    const cobrador = cobradores.find(c => c._id === cobradorID);
    return cobrador?.nombre || 'Desconocido';
  };

  const handleMarcarPagado = async (creditoID) => {
    try {
      setError('');
      await api.put(`/creditos/${creditoID}`, { estado: 'Realizado' });
      setSuccess('Crédito marcado como pagado');
      cargarDatos();
    } catch (error) {
      setError('Error al actualizar crédito');
      console.error(error);
    }
  };

  const filteredCreditos = creditos.filter(credito => {
    const cliente = clientes.find(c => c._id === credito.clienteID);
    const cumpleBusqueda = !searchTerm || 
                          cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cliente?.cedula.includes(searchTerm);
    const cumpleFiltroEstado = !filtroEstado || credito.estado === filtroEstado;
    const cumpleFiltroCobrador = !filtroCobradorID || credito.cobradorID === filtroCobradorID;
    return cumpleBusqueda && cumpleFiltroEstado && cumpleFiltroCobrador;
  });

  const totalPrestado = filteredCreditos.reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
  const totalPorPagar = filteredCreditos.reduce((sum, c) => sum + (c.monto_por_pagar || 0), 0);
  const creditosPendientes = filteredCreditos.filter(c => c.estado === 'Pendiente').length;
  const creditosRealizados = filteredCreditos.filter(c => c.estado === 'Realizado').length;

  if (loading) {
    return <div className="text-center py-12">Cargando créditos...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Gestionar Créditos</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatBox
          title="Total Créditos"
          value={filteredCreditos.length}
          icon={<DollarSign size={24} />}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatBox
          title="Pendientes"
          value={creditosPendientes}
          icon={<Clock size={24} />}
          bgColor="bg-orange-100"
          textColor="text-orange-600"
        />
        <StatBox
          title="Pagados"
          value={creditosRealizados}
          icon={<CheckCircle size={24} />}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatBox
          title="Por Cobrar"
          value={`$${totalPorPagar.toLocaleString('es-CO')}`}
          icon={<DollarSign size={24} />}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula del cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Realizado">Pagados</option>
          </select>

          <select
            value={filtroCobradorID}
            onChange={(e) => setFiltroCobradorID(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos los cobradores</option>
            {cobradores.map(cobrador => (
              <option key={cobrador._id} value={cobrador._id}>
                {cobrador.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4 font-semibold">Cliente</th>
              <th className="text-left p-4 font-semibold">Cédula</th>
              <th className="text-left p-4 font-semibold">Cobrador</th>
              <th className="text-left p-4 font-semibold">Monto Prestado</th>
              <th className="text-left p-4 font-semibold">Por Pagar</th>
              <th className="text-left p-4 font-semibold">Vencimiento</th>
              <th className="text-left p-4 font-semibold">Estado</th>
              <th className="text-left p-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreditos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500">
                  No hay créditos que coincidan con tu búsqueda
                </td>
              </tr>
            ) : (
              filteredCreditos.map(credito => (
                <tr key={credito._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{getNombreCliente(credito.clienteID)}</td>
                  <td className="p-4">{getCedulaCliente(credito.clienteID)}</td>
                  <td className="p-4">{getNombreCobrador(credito.cobradorID)}</td>
                  <td className="p-4">${credito.monto_prestado.toLocaleString('es-CO')}</td>
                  <td className="p-4 font-semibold text-purple-600">
                    ${credito.monto_por_pagar.toLocaleString('es-CO')}
                  </td>
                  <td className="p-4">
                    {new Date(credito.fecha_vencimiento).toLocaleDateString('es-CO')}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-white font-medium text-sm ${
                      credito.estado === 'Pendiente' 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}>
                      {credito.estado}
                    </span>
                  </td>
                  <td className="p-4">
                    {credito.estado === 'Pendiente' ? (
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Marcar crédito de ${getNombreCliente(credito.clienteID)} como pagado?`)) {
                            handleMarcarPagado(credito._id);
                          }
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm font-medium"
                      >
                        Marcar Pagado
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Pagado el {new Date(credito.fecha_pago).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredCreditos.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Resumen Financiero</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Prestado</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalPrestado.toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Total por Pagar (con interés 30%)</p>
              <p className="text-2xl font-bold text-purple-600">
                ${totalPorPagar.toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Ganancias por Interés</p>
              <p className="text-2xl font-bold text-green-600">
                ${(totalPorPagar - totalPrestado).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ title, value, icon, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${bgColor} ${textColor} p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default AdminCreditoList;
