const express = require('express');
const { Pool } = require('pg');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Reemplaza esto con tu URI de conexión de Supabase
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint para buscar un empleado por ID (Lo usará Spring Boot más adelante)
app.get('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM rrhh.empleados WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para registrar un nuevo empleado (Para la evidencia E2E)
app.post('/api/empleados', async (req, res) => {
  try {
    const { nombre, cargo, salario_base } = req.body;
    const result = await pool.query(
      'INSERT INTO rrhh.empleados (nombre, cargo, salario_base) VALUES ($1, $2, $3) RETURNING *',
      [nombre, cargo, salario_base]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar empleado' });
  }
});

// Nuevo endpoint para listar TODOS los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rrhh.empleados ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Microservicio de Empleados corriendo en el puerto ${PORT}`);
});