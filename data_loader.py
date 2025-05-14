import pandas as pd
import os

def load_csv_data():
    """
    Load the CSV data files for rate and packaging tables
    """
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the paths to the CSV files
    rate_table_path = os.path.join(current_dir, "attached_assets", "rate_table.csv")
    pack_table_path = os.path.join(current_dir, "attached_assets", "pack_table.csv")
    
    # Load the CSV files
    try:
        rate_df = pd.read_csv(rate_table_path)
        pack_df = pd.read_csv(pack_table_path)
        return rate_df, pack_df
    except Exception as e:
        print(f"Error loading CSV data: {e}")
        # Create empty DataFrames with the expected columns if files are not found
        rate_columns = ["product", "trim_type", "rm_spec", "rate_per_kg"]
        pack_columns = ["prod_type", "product", "box_qty", "pack", "transport_mode", "packaging_rate"]
        return pd.DataFrame(columns=rate_columns), pd.DataFrame(columns=pack_columns)

def get_product_options():
    """
    Get unique product options from the rate table
    """
    rate_df, _ = load_csv_data()
    return rate_df['product'].unique().tolist() if not rate_df.empty else []

def get_trim_types(product):
    """
    Get trim types for the selected product
    """
    rate_df, _ = load_csv_data()
    if not rate_df.empty:
        return rate_df[rate_df['product'] == product]['trim_type'].unique().tolist()
    return []

def get_rm_specs():
    """
    Get all RM spec options
    """
    rate_df, _ = load_csv_data()
    if not rate_df.empty:
        return rate_df['rm_spec'].unique().tolist()
    return []

def get_prod_types():
    """
    Get product types from the packaging table
    """
    _, pack_df = load_csv_data()
    if not pack_df.empty:
        return pack_df['prod_type'].unique().tolist()
    return []

def get_packaging_types(product, prod_type):
    """
    Get packaging types based on product and product type
    """
    _, pack_df = load_csv_data()
    if not pack_df.empty:
        filtered = pack_df[(pack_df['product'] == product) & (pack_df['prod_type'] == prod_type)]
        return filtered['pack'].unique().tolist()
    return []

def get_packaging_sizes(product, prod_type):
    """
    Get packaging sizes based on product and product type
    """
    _, pack_df = load_csv_data()
    if not pack_df.empty:
        filtered = pack_df[(pack_df['product'] == product) & (pack_df['prod_type'] == prod_type)]
        return filtered['box_qty'].unique().tolist()
    return []

def get_transport_modes():
    """
    Get all transport modes from the packaging table
    """
    _, pack_df = load_csv_data()
    if not pack_df.empty:
        return pack_df['transport_mode'].unique().tolist()
    return []
