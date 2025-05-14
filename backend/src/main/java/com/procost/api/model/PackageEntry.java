package com.procost.api.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageEntry {
    private String prodType;
    private String product;
    private String boxQty;
    private String pack;
    private String transportMode;
    private Double packagingRate;
}