package com.procost.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculateRatesResponse {
    private Double filingRate;
    private Double packagingRate;
}