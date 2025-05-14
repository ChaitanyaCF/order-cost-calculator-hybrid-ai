package com.procost.api.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inquiries")
public class Inquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String product;
    
    @Column(name = "trim_type", nullable = false)
    private String trimType;
    
    @Column(name = "rm_spec", nullable = false)
    private String rmSpec;
    
    @Column(name = "yield_value", nullable = false)
    private Double yieldValue;
    
    @Column(name = "product_type", nullable = false)
    private String productType;
    
    @Column(name = "packaging_type", nullable = false)
    private String packagingType;
    
    @Column(name = "packaging_size", nullable = false)
    private String packagingSize;
    
    @Column(name = "transport_mode", nullable = false)
    private String transportMode;
    
    @Column(name = "filing_rate")
    private Double filingRate;
    
    @Column(name = "packaging_rate")
    private Double packagingRate;
    
    @Column(name = "pallet_charge", nullable = false)
    private Double palletCharge;
    
    @Column(name = "terminal_charge", nullable = false)
    private Double terminalCharge;
    
    @Type(type = "jsonb")
    @Column(name = "optional_charges", columnDefinition = "jsonb")
    private Map<String, Double> optionalCharges = new HashMap<>();
    
    @Column(name = "total_charges", nullable = false)
    private Double totalCharges;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}