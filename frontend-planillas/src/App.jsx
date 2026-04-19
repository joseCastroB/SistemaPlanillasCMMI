import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('landing');

  // Estados CRUD
  const [empNombre, setEmpNombre] = useState('');
  const [empCargo, setEmpCargo] = useState('');
  const [empSalario, setEmpSalario] = useState('');
  const [empMensaje, setEmpMensaje] = useState('');

  // Estados Dashboard
  const [searchId, setSearchId] = useState('1');
  const [planMensaje, setPlanMensaje] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingRep, setLoadingRep] = useState(false);

  // --- NUEVOS ESTADOS PARA VISTA DE DATOS ---
  const [listaEmpleados, setListaEmpleados] = useState([]);
  const [listaPlanillas, setListaPlanillas] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(false);

  // --- NUEVO: Función para cargar datos ---
  const cargarDatos = async () => {
    setLoadingDatos(true);
    try {
      const resEmp = await fetch('http://localhost:3001/api/empleados');
      if(resEmp.ok) setListaEmpleados(await resEmp.json());

      const resPlan = await fetch('http://localhost:8080/api/planillas/todas');
      if(resPlan.ok) setListaPlanillas(await resPlan.json());
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoadingDatos(false);
    }
  };

  // Cargar datos cuando se abre la pestaña 'datos'
  useEffect(() => {
    if (activeTab === 'datos') {
      cargarDatos();
    }
  }, [activeTab]);

  // Funciones previas...
  const handleGuardarEmpleado = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: empNombre, cargo: empCargo, salario_base: parseFloat(empSalario) })
      });
      if (response.ok) {
        setEmpMensaje('✅ Empleado registrado exitosamente.');
        setEmpNombre(''); setEmpCargo(''); setEmpSalario('');
      } else {
        setEmpMensaje('❌ Error al guardar el empleado.');
      }
    } catch (error) {
      setEmpMensaje('❌ Error de conexión.');
    }
  };

  const handleGenerarPlanilla = async () => {
    setLoadingPlan(true); setPlanMensaje('');
    try {
      const response = await fetch(`http://localhost:8080/api/planillas/calcular?empleadoId=${searchId}`, { method: 'POST' });
      const data = await response.text();
      setPlanMensaje(response.ok ? `✅ ${data}` : `❌ ${data}`);
    } catch (error) {
      setPlanMensaje('❌ Error de conexión.');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleDescargarReporte = () => {
    setLoadingRep(true);
    window.open('http://localhost:5000/api/reportes/planillas', '_blank');
    setLoadingRep(false);
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">⚙️ CMMI System</div>
        <button className={`nav-button ${activeTab === 'landing' ? 'active' : ''}`} onClick={() => setActiveTab('landing')}>🏠 Inicio</button>
        <button className={`nav-button ${activeTab === 'empleados' ? 'active' : ''}`} onClick={() => setActiveTab('empleados')}>👥 Registro</button>
        <button className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Procesos</button>
        <button className={`nav-button ${activeTab === 'datos' ? 'active' : ''}`} onClick={() => setActiveTab('datos')}>📁 Ver Datos</button>
      </nav>

      <main className="main-content">
        {/* Landing Page */}
        {activeTab === 'landing' && (
          <div className="card hero">
            <h1>Sistema Central de Recursos Humanos</h1>
            <p>Gestión eficiente, cálculo de planillas y control del talento corporativo</p>
            <hr style={{ margin: '30px 0', borderColor: '#e2e8f0' }} />
            <div style={{ textAlign: 'left', maxWidth: '650px', margin: '0 auto' }}>
              <h3>Capacidades Core del Sistema:</h3>
              <ul style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#475569' }}>
                <li>👥 <strong>Administración de Personal:</strong> Registro centralizado de colaboradores, estructuración de cargos y asignación de salarios base.</li>
                <li>⚙️ <strong>Cálculo Automatizado:</strong> Procesamiento exacto de planillas, cálculo de sueldos netos y aplicación automática de deducciones.</li>
                <li>📊 <strong>Inteligencia y Reportes:</strong> Generación instantánea de Kardex corporativos e historiales de pago exportables para auditoría.</li>
                <li>🔒 <strong>Trazabilidad Continua:</strong> Arquitectura validada para asegurar la integridad de los datos financieros en cada transacción.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Registro */}
        {activeTab === 'empleados' && (
          <div className="card">
            <h2>Registrar Nuevo Empleado</h2>
            <form onSubmit={handleGuardarEmpleado}>
              <div className="form-group"><label>Nombre Completo:</label><input type="text" value={empNombre} onChange={(e) => setEmpNombre(e.target.value)} required /></div>
              <div className="form-group"><label>Cargo:</label><input type="text" value={empCargo} onChange={(e) => setEmpCargo(e.target.value)} required /></div>
              <div className="form-group"><label>Salario Base (S/):</label><input type="number" step="0.01" value={empSalario} onChange={(e) => setEmpSalario(e.target.value)} required /></div>
              <button type="submit" className="btn btn-primary">Guardar Empleado</button>
            </form>
            {empMensaje && <div className="alert">{empMensaje}</div>}
          </div>
        )}

        {/* Procesos / Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="card">
              <h2>Generación de Planillas</h2>
              <div className="form-group" style={{ maxWidth: '300px' }}>
                <label>ID del Empleado:</label>
                <input type="number" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
              </div>
              <button onClick={handleGenerarPlanilla} disabled={loadingPlan} className="btn btn-primary">{loadingPlan ? 'Calculando...' : 'Ejecutar Cálculo'}</button>
              {planMensaje && <div className="alert">{planMensaje}</div>}
            </div>
            <div className="card">
              <h2>Reportes Consolidado</h2>
              <button onClick={handleDescargarReporte} disabled={loadingRep} className="btn btn-success">📥 Descargar Reporte Excel</button>
            </div>
          </div>
        )}

        {/* NUEVA VISTA: VER DATOS */}
        {activeTab === 'datos' && (
          <div>
            <div className="card">
              <h2>Base de Datos: Empleados</h2>
              <button onClick={cargarDatos} className="btn btn-primary" style={{marginBottom: '15px'}}>🔄 Refrescar Datos</button>
              {loadingDatos ? <p>Cargando...</p> : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Cargo</th><th>Salario Base</th></tr></thead>
                    <tbody>
                      {listaEmpleados.map(emp => (
                        <tr key={emp.id}>
                          <td><span className="badge">#{emp.id}</span></td>
                          <td>{emp.nombre}</td>
                          <td>{emp.cargo}</td>
                          <td>S/ {emp.salario_base}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h2>Base de Datos: Planillas</h2>
              {loadingDatos ? <p>Cargando...</p> : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead><tr><th>ID Planilla</th><th>ID Empleado</th><th>Periodo</th><th>Sueldo Neto Pagado</th></tr></thead>
                    <tbody>
                      {listaPlanillas.map(plan => (
                        <tr key={plan.id}>
                          <td><span className="badge">#{plan.id}</span></td>
                          <td>Emp. #{plan.empleado_id}</td>
                          <td>{plan.mes_anio}</td>
                          <td style={{color: 'green', fontWeight: 'bold'}}>S/ {plan.monto_final}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;