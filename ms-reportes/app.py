from flask import Flask, send_file
from flask_cors import CORS
import pandas as pd
from openpyxl.utils import get_column_letter
import psycopg2
import os

app = Flask(__name__)
CORS(app)

# Tu misma cadena de conexión (apuntando al pooler correcto aws-1)
DB_URL = os.environ.get("DATABASE_URL")

@app.route('/api/reportes/planillas', methods=['GET'])
def generar_reporte():
    try:
        # 1. Nos conectamos a la nube
        conn = psycopg2.connect(DB_URL)
        
        # 2. Hacemos la consulta cruzando ambos dominios (rrhh y finanzas)
        query = """
            SELECT 
                e.nombre AS "Empleado",
                e.cargo AS "Cargo",
                e.salario_base AS "Salario Base",
                p.mes_anio AS "Periodo",
                p.monto_final AS "Sueldo Neto Pagado",
                p.fecha_calculo AS "Fecha de Proceso"
            FROM finanzas.planillas p
            JOIN rrhh.empleados e ON p.empleado_id = e.id
        """
        
        # 3. Pandas convierte la consulta en una tabla de datos (Dataframe)
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # 4. Generamos el archivo Excel con auto-ajuste de columnas
        file_path = "Reporte_Planillas_CMMI.xlsx"
        
        # Usamos ExcelWriter para poder modificar el diseño
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Reporte_CMMI')
            worksheet = writer.sheets['Reporte_CMMI']
            
            # Recorremos cada columna para ajustar su ancho
            for i, col in enumerate(df.columns, 1):
                col_letter = get_column_letter(i)
                # Calculamos el tamaño del texto más largo (o el título) y le sumamos 2 de margen
                max_len = max(df[col].astype(str).apply(len).max(), len(str(col))) + 2
                worksheet.column_dimensions[col_letter].width = max_len
        
        # 5. Forzamos la descarga del archivo
        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    print("Microservicio de Reportes corriendo en el puerto 5000...")
    app.run(port=5000)