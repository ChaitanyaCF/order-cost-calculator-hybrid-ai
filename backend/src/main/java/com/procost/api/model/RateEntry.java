package com.procost.api.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RateEntry {
    private String product;
    private String trimType;
    private String rmSpec;
    private Double ratePerKg;
}