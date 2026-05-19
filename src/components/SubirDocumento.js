import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// URL del backend (misma que usa el resto de la app)
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// ================================================================
// COMPONENTE: SUBIR DOCUMENTO AL BOT
// ================================================================
// Permite subir un PDF para que el bot de Telegram pueda usarlo.
//
// DOS MODOS según el contenido del PDF (el backend decide):
//   1. PDF con preguntas numeradas → el bot las responde automáticamente
//   2. PDF de conocimiento         → se indexa para responder consultas futuras
// ================================================================

function SubirDocumento() {
  const [archivo, setArchivo]       = useState(null);       // Archivo seleccionado
  const [subiendo, setSubiendo]     = useState(false);      // Cargando
  const [mensaje, setMensaje]       = useState('');         // Mensaje de resultado
  const [tipoMensaje, setTipoMensaje] = useState('');       // 'exito' | 'error'
  const [documentos, setDocumentos] = useState([]);         // Documentos indexados
  const inputRef = useRef();                                 // Referencia al input file

  // Al montar el componente, cargar los documentos ya indexados
  useEffect(() => {
    cargarDocumentos();
  }, []);

  // Obtiene del backend cuántos documentos hay indexados por categoría
  const cargarDocumentos = async () => {
    try {
      const res = await axios.get(`${API}/rag/documentos`);
      setDocumentos(res.data.documentos || []);
    } catch {
      // Si falla (backend apagado, etc.) simplemente mostramos vacío
    }
  };

  // Sube el PDF al backend y actualiza el estado según la respuesta
  const handleSubir = async () => {
    if (!archivo) return;

    setSubiendo(true);
    setMensaje('Procesando PDF...');
    setTipoMensaje('');

    try {
      const formData = new FormData();
      formData.append('pdf', archivo);

      const res = await axios.post(`${API}/rag/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 60 segundos (PDFs grandes pueden tardar)
      });

      const secciones = res.data.chunksCreados || 0;
      setMensaje(`✅ PDF indexado: ${secciones} secciones guardadas. El bot ya puede responder preguntas sobre él.`);
      setTipoMensaje('exito');
      setArchivo(null);
      inputRef.current.value = '';
      cargarDocumentos(); // Refrescar la lista
    } catch (e) {
      setMensaje(`❌ Error: ${e.response?.data?.error || e.message}`);
      setTipoMensaje('error');
    } finally {
      setSubiendo(false);
    }
  };

  // Elimina todos los documentos indexados del bot
  const handleLimpiar = async () => {
    if (!window.confirm('¿Seguro que quieres borrar todos los documentos indexados?')) return;
    try {
      await axios.delete(`${API}/rag/limpiar`);
      setDocumentos([]);
      setMensaje('🗑️ Documentos eliminados correctamente.');
      setTipoMensaje('exito');
    } catch {
      setMensaje('❌ No se pudieron eliminar los documentos.');
      setTipoMensaje('error');
    }
  };

  // Agrupar los documentos por categoría para mostrarlos ordenados
  const porCategoria = documentos.reduce((acc, doc) => {
    const cat = doc.category || 'general';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const hayDocumentos = Object.keys(porCategoria).length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full">

      {/* Encabezado */}
      <div className="text-center mb-5">
        <span className="text-5xl">📚</span>
        <h2 className="font-black text-gray-800 text-lg mt-2">BASE DE CONOCIMIENTO</h2>
        <p className="text-gray-400 text-xs mt-1 font-semibold">BOT DE TELEGRAM</p>
      </div>

      {/* Descripción */}
      <p className="text-gray-500 text-sm text-center mb-5 leading-relaxed">
        Sube un PDF y el bot responderá preguntas por Telegram sobre su contenido.
      </p>

      {/* Zona de selección de archivo */}
      <div
        className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition mb-4"
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setArchivo(e.target.files[0] || null)}
        />
        {archivo
          ? <p className="text-blue-600 font-semibold text-sm">📄 {archivo.name}</p>
          : <p className="text-gray-400 text-sm">📎 Haz clic para seleccionar un PDF</p>
        }
      </div>

      {/* Botón de subir */}
      <button
        onClick={handleSubir}
        disabled={!archivo || subiendo}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition mb-3 text-sm"
      >
        {subiendo ? '⏳ Procesando...' : '⬆️ Subir al Bot'}
      </button>

      {/* Mensaje de estado (éxito o error) */}
      {mensaje && (
        <div className={`p-3 rounded-lg text-xs mb-4 leading-relaxed ${
          tipoMensaje === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' :
          tipoMensaje === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Lista de documentos indexados */}
      <div className="border-t pt-4">
        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
          Documentos Indexados
        </p>

        {hayDocumentos ? (
          <>
            {Object.entries(porCategoria).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">📂 {cat}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {count} sección{count !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
            <button
              onClick={handleLimpiar}
              className="w-full mt-4 py-2 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition font-semibold"
            >
              🗑️ Limpiar todo
            </button>
          </>
        ) : (
          <p className="text-xs text-center text-gray-300 py-3">
            Aún no hay documentos indexados
          </p>
        )}
      </div>

    </div>
  );
}

export default SubirDocumento;
