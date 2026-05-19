import React, { useState, useEffect } from 'react';
import { Plus, Eye, Lock, Unlock } from 'lucide-react';
import api from '../../api';

function AdminCobradorList({ onicinaId, onSelectCobrador }) {
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    direccion: '',
    usuario: '',
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cargarCobradores();
  }, [onicinaId]);

  const cargarCobradores = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/oficinas/${onicinaId}/cobradores`);
      setCobradores(response.data);
    } catch (error) {
      console.error('Error cargando cobradores:', error);
      setError('Error al cargar cobradores');
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

    if (!formData.nombre || !formData.cedula || !formData.usuario || !formData.password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      await api.post('/cobradores', formData);
      setSuccess('Cobrador creado exitosamente');
      setFormData({
        nombre: '',
        cedula: '',
        celular: '',
        direccion: '',
        usuario: '',
        password: '',
      });
      setShowModal(false);
      cargarCobradores();
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Error al crear cobrador');
      }
    }
  };

  const toggleCobradorActivo = async (cobradorId) => {
    try {
      const response = await api.put(`/cobradores/${cobradorId}/toggle-activo`);
      setSuccess(response.data.mensaje);
      cargarCobradores();
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Error al actualizar cobrador');
      }
    }
  };

  const filteredCobradores = cobradores.filter(cobrador =>
    cobrador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cobrador.cedula.includes(searchTerm) ||
    cobrador.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Cargando cobradores...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Gestionar Cobradores</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Crear Cobrador
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

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Nombre</th>
                <th className="text-left p-4 font-semibold">Cédula</th>
                <th className="text-left p-4 font-semibold">Usuario</th>
                <th className="text-left p-4 font-semibold">Celular</th>
                <th className="text-left p-4 font-semibold">Estado</th>
                <th className="text-left p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCobradores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    No hay cobradores
                  </td>
                </tr>
              ) : (
                filteredCobradores.map(cobrador => (
                  <tr key={cobrador._id} className={`border-b hover:bg-gray-50 ${!cobrador.activo ? 'bg-red-50' : ''}`}>
                    <td className="p-4">{cobrador.nombre}</td>
                    <td className="p-4">{cobrador.cedula}</td>
                    <td className="p-4">{cobrador.usuario}</td>
                    <td className="p-4">{cobrador.celular}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cobrador.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cobrador.activo ? '✅ Activo' : '❌ Desactivado'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => onSelectCobrador(cobrador._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-600 transition text-sm"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                      <button
                        onClick={() => toggleCobradorActivo(cobrador._id)}
                        className={`text-white px-3 py-1 rounded flex items-center gap-1 transition text-sm ${cobrador.activo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {cobrador.activo ? (
                          <>
                            <Lock size={16} />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Unlock size={16} />
                            Activar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">Crear Nuevo Cobrador</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              <input
                type="text"
                name="cedula"
                placeholder="Cédula"
                value={formData.cedula}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              <input
                type="text"
                name="celular"
                placeholder="Celular"
                value={formData.celular}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              <input
                type="text"
                name="usuario"
                placeholder="Usuario"
                value={formData.usuario}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />

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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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

export default AdminCobradorList;
