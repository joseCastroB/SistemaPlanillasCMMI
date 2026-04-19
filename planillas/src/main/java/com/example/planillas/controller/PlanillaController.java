package com.example.planillas.controller;
import com.example.planillas.dto.EmpleadoDTO;
import com.example.planillas.model.Planilla;
import com.example.planillas.repository.PlanillaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.YearMonth;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/planillas")
public class PlanillaController {

    @Autowired
    private PlanillaRepository planillaRepository;

    // Instanciamos RestTemplate para consumir el API de Node (La Integración)
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/calcular")
    public ResponseEntity<?> calcularPlanilla(@RequestParam("empleadoId") Long empleadoId) {
        try {
            // PASO A: Llamar al microservicio de Empleados (Node.js) en el puerto 3001
            String nodeJsUrl = "https://ms-empleados-production.up.railway.app/api/empleados/" + empleadoId;
            EmpleadoDTO empleado = restTemplate.getForObject(nodeJsUrl, EmpleadoDTO.class);

            if (empleado == null) {
                return ResponseEntity.status(404).body("Empleado no encontrado en el MS de Recursos Humanos");
            }

            // PASO B: Lógica de negocio (Ejemplo: Descuento del 10% de AFP/Impuestos)
            BigDecimal descuento = empleado.salario_base.multiply(new BigDecimal("0.10"));
            BigDecimal sueldoNeto = empleado.salario_base.subtract(descuento);

            // PASO C: Guardar la planilla en Supabase
            Planilla nuevaPlanilla = new Planilla();
            nuevaPlanilla.empleado_id = empleado.id;
            nuevaPlanilla.mes_anio = YearMonth.now().toString(); // ej. "2026-04"
            nuevaPlanilla.monto_final = sueldoNeto;
            
            planillaRepository.save(nuevaPlanilla);

            return ResponseEntity.ok("Planilla generada para " + empleado.nombre + " | Sueldo Neto: " + sueldoNeto);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en la integración: " + e.getMessage());
        }
    }

    // Nuevo endpoint para listar TODAS las planillas
    @GetMapping("/todas")
    public ResponseEntity<?> listarPlanillas() {
        try {
            return ResponseEntity.ok(planillaRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener planillas: " + e.getMessage());
        }
}
}
