import pandas as pd
from data_loader import load_csv_data

class CostCalculator:
    def __init__(self):
        """Initialize the cost calculator with rate and package data"""
        self.rate_df, self.pack_df = load_csv_data()
        
    def calculate_filing_rate(self, product, trim_type, rm_spec):
        """
        Calculate the filing rate based on product, trim type, and RM spec
        
        Args:
            product (str): Product type (e.g., "Fillet", "Portions")
            trim_type (str): Trim type (e.g., "Trim A", "Trim B")
            rm_spec (str): RM specification (e.g., "1-2 kg", "2-3 kg")
            
        Returns:
            float: The filing rate per kg, or None if not found
        """
        if self.rate_df.empty:
            return None
            
        # Filter the rate dataframe
        filtered = self.rate_df[(self.rate_df['product'] == product) & 
                              (self.rate_df['trim_type'] == trim_type) & 
                              (self.rate_df['rm_spec'] == rm_spec)]
        
        if not filtered.empty:
            return filtered.iloc[0]['rate_per_kg']
        return None
    
    def calculate_packaging_rate(self, prod_type, product, pack_type, transport_mode):
        """
        Calculate the packaging rate based on product type, product, packaging type, and transport mode
        
        Args:
            prod_type (str): Product type (e.g., "Fresh", "Frozen")
            product (str): Product (e.g., "Fillet", "Portions")
            pack_type (str): Packaging type
            transport_mode (str): Mode of transport
            
        Returns:
            float: The packaging rate per kg, or None if not found
        """
        if self.pack_df.empty:
            return None
            
        # Filter the package dataframe
        filtered = self.pack_df[(self.pack_df['prod_type'] == prod_type) & 
                               (self.pack_df['product'] == product) & 
                               (self.pack_df['pack'] == pack_type) & 
                               (self.pack_df['transport_mode'] == transport_mode)]
        
        if not filtered.empty:
            return filtered.iloc[0]['packaging_rate']
        return None
    
    def calculate_charges(self, yield_value, weight, options=None):
        """
        Calculate all charges based on yield value, weight, and selected options
        
        Args:
            yield_value (float): Yield value
            weight (float): Weight in kg
            options (dict): Selected optional charges
            
        Returns:
            dict: Dictionary containing all calculated charges
        """
        # Default option values
        if options is None:
            options = {
                'proda_b': False,
                'encoding': False,
            }
        
        # Calculate compulsory charges
        pallet_charge = 2.0 * weight
        terminal_charge = 0.25 * weight
        
        # Calculate optional charges
        optional_charges = {}
        if options.get('proda_b', False):
            optional_charges['proda_b'] = 1.0 * weight
        if options.get('encoding', False):
            optional_charges['encoding'] = 1.50 * weight
        
        # Total charges
        total_compulsory = pallet_charge + terminal_charge
        total_optional = sum(optional_charges.values())
        total_charges = total_compulsory + total_optional
        
        return {
            'pallet_charge': pallet_charge,
            'terminal_charge': terminal_charge,
            'optional_charges': optional_charges,
            'total_compulsory': total_compulsory,
            'total_optional': total_optional,
            'total_charges': total_charges
        }
