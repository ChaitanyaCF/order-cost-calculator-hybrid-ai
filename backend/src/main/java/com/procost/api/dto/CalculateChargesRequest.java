package com.procost.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculateChargesRequest {
    
    @NotNull(message = "Yield value is required")
    @Positive(message = "Yield value must be positive")
    private Double yieldValue;
    
    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;
    
    private OptionsDto options = new OptionsDto();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionsDto {
        private boolean prodaB;
        private boolean encoding;
    }
}