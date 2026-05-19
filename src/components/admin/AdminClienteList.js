import React, { useState, useEffect } from 'react';
import { Plus, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../api';

function AdminClienteList({ onicinaId }) {
  const [clientes, setClientes] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCobradorID, setFiltroCobradorID] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    direccion: '',
    cobradorID: '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cargarDatos();
  }, [onicinaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [clientesRes, cobradoresRes] = await Promise.all([
        api.get(`/oficinas/${onicinaId}/clientes`),
        api.get(`/oficinas/${onicinaId}/cobradores`),
      ]);
      setClientes(clientesRes.data);
      setCobradores(cobradoresRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre || !formData.cedula || !formData.cobradorID) {
      setError('Nombre, cédula y cobrador son obligatorios');
      return;
    }

    try {
      await api.post('/clientes', formData);
      setSuccess('Cliente creado exitosamente');
      setFormData({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        direccion: '',
        cobradorID: '',
      });
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear cliente');
    }
  };

  const getNombreCobrador = (cobradorID) => {
    const cobrador = cobradores.find(c => c._id === cobradorID);
    return cobrador ? cobrador.nombre : 'Desconocido';
  };

  const filteredClientes = clientes.filter(cliente => {
    const cumpleBusqueda = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cliente.cedula.includes(searchTerm) ||
                          cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const cumpleFiltro = !filtroCobradorID || cliente.cobradorID === filtroCobradorID;
    return cumpleBusqueda && cumpleFiltro;
  });

  if (loading) {
    return <div className="text-center py-12">Cargando clientes...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Gestionar Clientes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Crear Cliente
        </button>
      </div>

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

      <div className="bg-white rounded-lg shadow mb-6 p-6 space-y-4">
        <input
          type="text"
          placeholder="Buscar por nombre, cédula o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />

        <select
          value={filtroCobradorID}
          onChange={(e) => setFiltroCobradorID(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        >
          <option value="">Filtrar por Cobrador...</option>
          {cobradores.map(cobrador => (
            <option key={cobrador._id} value={cobrador._id}>
              {cobrador.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No hay clientes que coincidan con tu búsqueda</p>
          </div>
        ) : (
          filteredClientes.map(cliente => (
            <div key={cliente._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-3">{cliente.nombre}</h3>
              
              <div className="space-y-2 text-gray-700 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 w-16">Cédula:</span>
                  <span>{cliente.cedula}</span>
                </div>
                
                {cliente.telefono && (
                  <div className="flex items-start gap-2">
                    <Phone size={16} className="text-blue-500 mt-0.5" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                
                {cliente.email && (
                  <div className="flex items-start gap-2">
                    <Mail size={16} className="text-blue-500 mt-0.5" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                
                {cliente.direccion && (
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-500 mt-0.5" />
                    <span>{cliente.direccion}</span>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    👤 Cobrador: <span className="font-semibold text-gray-700">{getNombreCobrador(cliente.cobradorID)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    🏢 Oficina: <span className="font-semibold text-gray-700">{cliente.oficinaID ? '(De tu oficina actual)' : 'No asignada'}</span>
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">
                Creado: {new Date(cliente.fecha_creacion).toLocaleDateString('es-CO')}
              </p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">Crear Nuevo Cliente</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              
              <input
                type="text"
                name="cedula"
                placeholder="Cédula"
                value={formData.cedula}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />

              <select
                name="cobradorID"
                value={formData.cobradorID}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              >
                <option value="">Selecciona un cobrador</option>
                {cobradores.map(cobrador => (
                  <option key={cobrador._id} value={cobrador._id}>
                    {cobrador.nombre}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminClienteList;
