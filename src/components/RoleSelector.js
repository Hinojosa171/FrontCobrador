import React from 'react';
import PropTypes from 'prop-types';
import SubirDocumento from './SubirDocumento';

// ================================================================
// PANTALLA DE INICIO: Selector de Rol + Panel de Documentos
// ================================================================
// LADO IZQUIERDO: el usuario elige su tipo de acceso
// LADO DERECHO:   sube PDFs para que el bot de Telegram los use
//
// En móvil ambas columnas se apilan verticalmente.
// En pantallas grandes (lg:) se muestran lado a lado.
// ================================================================

function RoleSelector({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">

      {/* Contenedor principal: dos columnas en desktop, una en móvil */}
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-start justify-center">

        {/* ── COLUMNA IZQUIERDA: Tarjetas de rol ── */}
        <div className="flex flex-col items-center w-full lg:max-w-md">

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">TU COBRADOR</h1>
            <p className="text-blue-100 font-semibold">Sistema de Gestión de Préstamos</p>
          </div>

          {/* Tarjetas de selección de rol */}
          <div className="w-full space-y-4">

            <button
              onClick={() => onSelectRole('gerente')}
              className="w-full p-8 bg-white rounded-2xl shadow-2xl flex flex-col items-center hover:shadow-xl transition transform hover:scale-105 active:scale-95 border-b-4 border-green-500"
            >
              <span className="text-6xl mb-4">👑</span>
              <span className="font-black text-gray-800 text-2xl">GERENTE</span>
              <span className="text-gray-500 text-sm mt-2 font-semibold">Administrador Superior</span>
            </button>

            <button
              onClick={() => onSelectRole('oficina')}
              className="w-full p-8 bg-white rounded-2xl shadow-2xl flex flex-col items-center hover:shadow-xl transition transform hover:scale-105 active:scale-95 border-b-4 border-orange-500"
            >
              <span className="text-6xl mb-4">🏢</span>
              <span className="font-black text-gray-800 text-2xl">OFICINA</span>
              <span className="text-gray-500 text-sm mt-2 font-semibold">Panel de Administrador</span>
            </button>

            <button
              onClick={() => onSelectRole('cobrador')}
              className="w-full p-8 bg-white rounded-2xl shadow-2xl flex flex-col items-center hover:shadow-xl transition transform hover:scale-105 active:scale-95 border-b-4 border-blue-500"
            >
              <span className="text-6xl mb-4">👤</span>
              <span className="font-black text-gray-800 text-2xl">COBRADOR</span>
              <span className="text-gray-500 text-sm mt-2 font-semibold">App Móvil del Cobrador</span>
            </button>

          </div>

          <p className="mt-8 text-blue-100 text-xs text-center">
            Selecciona tu tipo de acceso para iniciar sesión
          </p>
        </div>

        {/* ── COLUMNA DERECHA: Panel de documentos para el bot ── */}
        {/* lg:mt-20 para alinear visualmente con las tarjetas (debajo del título) */}
        <div className="w-full lg:max-w-sm lg:mt-20">
          <SubirDocumento />
        </div>

      </div>
    </div>
  );
}

RoleSelector.propTypes = {
  onSelectRole: PropTypes.func.isRequired
};

export default RoleSelector;
