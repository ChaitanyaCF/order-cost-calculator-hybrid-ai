package com.procost.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryResponse {
    private Long id;
    private Long userId;
    private String product;
    private String trimType;
    private String rmSpec;
    private Double yieldValue;
    private String productType;
    private String packagingType;
    private String packagingSize;
    private String transportMode;
    private Double filingRate;
    private Double packagingRate;
    private Double palletCharge;
    private Double terminalCharge;
    private Map<String, Double> optionalCharges;
    private Double totalCharges;
    private LocalDateTime createdAt;
}