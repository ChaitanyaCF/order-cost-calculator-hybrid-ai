package com.procost.api.service;

import com.procost.api.dto.CalculateChargesRequest;
import com.procost.api.dto.CalculateChargesResponse;
import com.procost.api.dto.CalculateRatesResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CalculatorService {
    
    @Autowired
    private DataLoaderService dataLoaderService;
    
    public CalculateRatesResponse calculateRates(String product, String trimType, String rmSpec,
                                               String prodType, String packType, String transportMode) {
        Double filingRate = dataLoaderService.calculateFilingRate(product, trimType, rmSpec);
        Double packagingRate = dataLoaderService.calculatePackagingRate(prodType, product, packType, transportMode);
        
        return new CalculateRatesResponse(filingRate, packagingRate);
    }
    
    public CalculateChargesResponse calculateCharges(CalculateChargesRequest request) {
        Double yieldValue = request.getYieldValue();
        Double weight = request.getWeight();
        CalculateChargesRequest.OptionsDto options = request.getOptions();
        
        // Calculate compulsory charges
        Double palletCharge = 2.0 * weight;
        Double terminalCharge = 0.25 * weight;
        
        // Calculate optional charges
        Map<String, Double> optionalCharges = new HashMap<>();
        if (options.isProdaB()) {
            optionalCharges.put("prodaB", 1.0 * weight);
        }
        if (options.isEncoding()) {
            optionalCharges.put("encoding", 1.5 * weight);
        }
        
        // Calculate totals
        Double totalCompulsory = palletCharge + terminalCharge;
        Double totalOptional = optionalCharges.values().stream().mapToDouble(Double::doubleValue).sum();
        Double totalCharges = totalCompulsory + totalOptional;
        
        return new CalculateChargesResponse(
                palletCharge,
                terminalCharge,
                optionalCharges,
                totalCompulsory,
                totalOptional,
                totalCharges
        );
    }
}