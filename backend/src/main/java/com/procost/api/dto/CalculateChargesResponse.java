package com.procost.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculateChargesResponse {
    private Double palletCharge;
    private Double terminalCharge;
    private Map<String, Double> optionalCharges = new HashMap<>();
    private Double totalCompulsory;
    private Double totalOptional;
    private Double totalCharges;
}