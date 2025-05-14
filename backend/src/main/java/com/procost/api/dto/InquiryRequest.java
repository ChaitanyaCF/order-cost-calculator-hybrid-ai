package com.procost.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryRequest {
    
    @NotBlank(message = "Product is required")
    private String product;
    
    @NotBlank(message = "Trim type is required")
    private String trimType;
    
    @NotBlank(message = "RM spec is required")
    private String rmSpec;
    
    @NotNull(message = "Yield value is required")
    @Positive(message = "Yield value must be positive")
    private Double yieldValue;
    
    @NotBlank(message = "Product type is required")
    private String productType;
    
    @NotBlank(message = "Packaging type is required")
    private String packagingType;
    
    @NotBlank(message = "Packaging size is required")
    private String packagingSize;
    
    @NotBlank(message = "Transport mode is required")
    private String transportMode;
    
    private Double filingRate;
    
    private Double packagingRate;
    
    @NotNull(message = "Pallet charge is required")
    private Double palletCharge;
    
    @NotNull(message = "Terminal charge is required")
    private Double terminalCharge;
    
    private Map<String, Double> optionalCharges = new HashMap<>();
    
    @NotNull(message = "Total charges is required")
    private Double totalCharges;
}