package com.example.planillas.repository;
import com.example.planillas.model.Planilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanillaRepository extends JpaRepository<Planilla, Long> {
}
