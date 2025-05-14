package com.procost.api.service;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;
import com.procost.api.model.PackageEntry;
import com.procost.api.model.RateEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DataLoaderService {
    private static final Logger logger = LoggerFactory.getLogger(DataLoaderService.class);
    
    @Value("${app.data.rate-table}")
    private String rateTablePath;
    
    @Value("${app.data.pack-table}")
    private String packTablePath;
    
    private List<RateEntry> rateEntries = new ArrayList<>();
    private List<PackageEntry> packageEntries = new ArrayList<>();
    
    @PostConstruct
    public void init() {
        try {
            loadRateData();
            loadPackageData();
        } catch (Exception e) {
            logger.error("Error loading CSV data: {}", e.getMessage(), e);
        }
    }
    
    private void loadRateData() throws IOException, CsvException {
        logger.info("Loading rate data from {}", rateTablePath);
        
        try (CSVReader reader = new CSVReaderBuilder(new FileReader(Paths.get(rateTablePath).toFile()))
                .withSkipLines(1) // Skip header
                .build()) {
            
            List<String[]> rows = reader.readAll();
            
            rateEntries = rows.stream()
                    .map(row -> new RateEntry(
                            row[0], // product
                            row[1], // trim_type
                            row[2], // rm_spec
                            Double.parseDouble(row[3]) // rate_per_kg
                    ))
                    .collect(Collectors.toList());
            
            logger.info("Loaded {} rate entries", rateEntries.size());
        }
    }
    
    private void loadPackageData() throws IOException, CsvException {
        logger.info("Loading package data from {}", packTablePath);
        
        try (CSVReader reader = new CSVReaderBuilder(new FileReader(Paths.get(packTablePath).toFile()))
                .withSkipLines(1) // Skip header
                .build()) {
            
            List<String[]> rows = reader.readAll();
            
            packageEntries = rows.stream()
                    .map(row -> new PackageEntry(
                            row[0], // prod_type
                            row[1], // product
                            row[2], // box_qty
                            row[3], // pack
                            row[4], // transport_mode
                            Double.parseDouble(row[5]) // packaging_rate
                    ))
                    .collect(Collectors.toList());
            
            logger.info("Loaded {} package entries", packageEntries.size());
        }
    }
    
    public List<String> getProductOptions() {
        return rateEntries.stream()
                .map(RateEntry::getProduct)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public List<String> getTrimTypes(String product) {
        return rateEntries.stream()
                .filter(entry -> entry.getProduct().equals(product))
                .map(RateEntry::getTrimType)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public List<String> getRmSpecs() {
        return rateEntries.stream()
                .map(RateEntry::getRmSpec)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public List<String> getProdTypes() {
        return packageEntries.stream()
                .map(PackageEntry::getProdType)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public List<String> getPackagingTypes(String product, String prodType) {
        return packageEntries.stream()
                .filter(entry -> entry.getProduct().equals(product) && entry.getProdType().equals(prodType))
                .map(PackageEntry::getPack)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public List<String> getPackagingSizes(String product, String prodType) {
        return packageEntries.stream()
                .filter(entry -> entry.getProduct().equals(product) && entry.getProdType().equals(prodType))
                .map(PackageEntry::getBoxQty)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public List<String> getTransportModes() {
        return packageEntries.stream()
                .map(PackageEntry::getTransportMode)
                .distinct()
                .collect(Collectors.toList());
    }
    
    public Double calculateFilingRate(String product, String trimType, String rmSpec) {
        return rateEntries.stream()
                .filter(entry -> entry.getProduct().equals(product) &&
                        entry.getTrimType().equals(trimType) &&
                        entry.getRmSpec().equals(rmSpec))
                .map(RateEntry::getRatePerKg)
                .findFirst()
                .orElse(null);
    }
    
    public Double calculatePackagingRate(String prodType, String product, String packType, String transportMode) {
        return packageEntries.stream()
                .filter(entry -> entry.getProdType().equals(prodType) &&
                        entry.getProduct().equals(product) &&
                        entry.getPack().equals(packType) &&
                        entry.getTransportMode().equals(transportMode))
                .map(PackageEntry::getPackagingRate)
                .findFirst()
                .orElse(null);
    }
}