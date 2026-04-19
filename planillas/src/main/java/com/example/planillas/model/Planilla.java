package com.example.planillas.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "planillas")
public class Planilla {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    public Long empleado_id;
    public String mes_anio;
    public BigDecimal monto_final;
    public LocalDateTime fecha_calculo = LocalDateTime.now();
}
