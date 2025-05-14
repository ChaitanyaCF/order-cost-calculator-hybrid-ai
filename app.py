import streamlit as st
import pandas as pd
import os
import json
from datetime import datetime
from calculator import CostCalculator
from data_loader import (
    load_csv_data, get_product_options, get_trim_types, 
    get_rm_specs, get_prod_types, get_packaging_types,
    get_packaging_sizes, get_transport_modes
)
from auth import Auth
from db import Database

# Initialize database
Database.initialize()

# Initialize the session state
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
    
if 'user' not in st.session_state:
    st.session_state.user = None
    
if 'calculator' not in st.session_state:
    st.session_state.calculator = CostCalculator()

# Set page configuration
st.set_page_config(
    page_title="ProCost - Order Inquiry System",
    page_icon="🐟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Helper function to display the login form
def show_login_form():
    with st.form("login_form"):
        st.subheader("Login")
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        
        col1, col2 = st.columns([1, 3])
        with col1:
            login_button = st.form_submit_button("Login")
        
        if login_button:
            if username and password:
                success, message, user_data = Auth.login(username, password)
                if success:
                    st.session_state.logged_in = True
                    st.session_state.user = user_data
                    st.success(message)
                    st.rerun()
                else:
                    st.error(message)
            else:
                st.error("Please enter both username and password")

# Helper function to display the registration form
def show_registration_form():
    with st.form("registration_form"):
        st.subheader("Register New User")
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        confirm_password = st.text_input("Confirm Password", type="password")
        email = st.text_input("Email (optional)")
        
        col1, col2 = st.columns([1, 3])
        with col1:
            register_button = st.form_submit_button("Register")
        
        if register_button:
            if username and password and confirm_password:
                if password != confirm_password:
                    st.error("Passwords do not match")
                else:
                    success, message = Auth.register_user(username, password, email)
                    if success:
                        st.success(message)
                        st.info("Please login with your new credentials")
                    else:
                        st.error(message)
            else:
                st.error("Please fill in all required fields")

# Helper function for the sidebar
def render_sidebar():
    with st.sidebar:
        # Display logo
        st.image("assets/logo.svg", width=200)
        
        st.title("User Links")
        
        # Navigation Links
        if st.button("User Dashboard", use_container_width=True):
            st.session_state.current_page = "dashboard"
            st.rerun()
            
        if st.button("Enquiries", use_container_width=True):
            st.session_state.current_page = "enquiries"
            st.rerun()
            
        if st.button("Logout", use_container_width=True):
            st.session_state.logged_in = False
            st.session_state.user = None
            st.rerun()

# Helper function to display the inquiry form
def show_inquiry_form():
    # Get the calculator instance
    calculator = st.session_state.calculator
    
    # Welcome message
    st.write(f"Welcome, {st.session_state.user['username']}!")
    
    # Dashboard title
    st.title("User Dashboard")
    
    # Create two columns for the form and results
    form_col, results_col = st.columns([2, 1])
    
    with form_col:
        st.header("Enquiry Form")
        
        # Load data for form options
        product_options = get_product_options()
        rm_specs = get_rm_specs()
        prod_types = get_prod_types()
        transport_modes = get_transport_modes()
        
        # Product selection
        product = st.selectbox("Product", options=product_options)
        
        # Trim Type selection (depends on product)
        trim_types = get_trim_types(product)
        trim_type = st.selectbox("Trim Type", options=trim_types)
        
        # RM Spec selection
        rm_spec = st.selectbox("RM Spec", options=rm_specs)
        
        # Yield input
        yield_value = st.number_input("Yield", min_value=0.0, value=33.0, step=0.1)
        
        # Product Type selection
        product_type = st.selectbox("Product Type", options=prod_types)
        
        # Packaging Type selection (depends on product and product type)
        packaging_types = get_packaging_types(product, product_type)
        packaging_type = st.selectbox("Packaging Type", options=packaging_types if packaging_types else [""])
        
        # Packaging Size selection (depends on product and product type)
        packaging_sizes = get_packaging_sizes(product, product_type)
        packaging_size = st.selectbox("Packaging Size", options=packaging_sizes if packaging_sizes else [""])
        
        # Transport Mode selection
        transport_mode = st.selectbox("Mode of Transport", options=transport_modes)
        
        # Calculate rates
        filing_rate = calculator.calculate_filing_rate(product, trim_type, rm_spec)
        packaging_rate = calculator.calculate_packaging_rate(product_type, product, packaging_type, transport_mode)
        
        # Display filing rate
        st.text(f"Filing Rate per kg: {filing_rate if filing_rate is not None else 'N/A'}")
        
        # Display packaging rate
        st.text(f"Packaging Rate per kg: {packaging_rate if packaging_rate is not None else 'Select valid packaging options'}")
        
        # Calculate charges
        weight = 0.0
        try:
            weight = float(rm_spec.split(' ')[0])
        except:
            weight = 0.0
        
        # Optional charges
        st.subheader("Optional Charges")
        proda_b = st.checkbox("ProdA/B (1.00 per kg/RM)")
        encoding = st.checkbox("Encoding (1.50 per kg/RM)")
        
        options = {
            'proda_b': proda_b,
            'encoding': encoding
        }
        
        # Calculate all charges
        charges = calculator.calculate_charges(yield_value, weight, options)
        
        # Submit button
        if st.button("Submit Enquiry"):
            # Prepare inquiry data
            inquiry_data = {
                'product': product,
                'trim_type': trim_type,
                'rm_spec': rm_spec,
                'yield_value': yield_value,
                'product_type': product_type,
                'packaging_type': packaging_type,
                'packaging_size': packaging_size,
                'transport_mode': transport_mode,
                'filing_rate': filing_rate,
                'packaging_rate': packaging_rate,
                'pallet_charge': charges['pallet_charge'],
                'terminal_charge': charges['terminal_charge'],
                'optional_charges': charges['optional_charges'],
                'total_charges': charges['total_charges']
            }
            
            # Save the inquiry
            success, message = Auth.save_inquiry(st.session_state.user['id'], inquiry_data)
            if success:
                st.success(message)
            else:
                st.error(message)
    
    with results_col:
        st.header("Compulsory Charges")
        
        # Toggle for Compulsory Charges
        compulsory_charges = True
        st.toggle("Compulsory Charges", value=compulsory_charges, disabled=True)
        
        # Pallet Charge
        st.text(f"Pallet Charge: ${charges['pallet_charge']:.2f} per kg")
        
        # Terminal Charge
        st.text(f"Seagrass Terminal Charge: ${charges['terminal_charge']:.2f} per kg")
        
        # Yield Value
        st.text(f"Yield Value: {yield_value:.1f}")
        
        st.header("Optional Charges")
        
        # Optional Charges
        for name, value in charges['optional_charges'].items():
            st.text(f"{name.capitalize()}: ${value:.2f} per kg")
            
        # Total Charges
        st.subheader(f"Total Charges: ${charges['total_charges']:.2f}")

# Main app flow
def main():
    # Initialize session state for current page if not already set
    if 'current_page' not in st.session_state:
        st.session_state.current_page = "dashboard"
    
    # Display login or main app based on authentication
    if not st.session_state.logged_in:
        # Title
        st.title("ProCost - Order Inquiry System")
        
        # Create two columns for login and registration
        col1, col2 = st.columns(2)
        
        with col1:
            show_login_form()
            
        with col2:
            show_registration_form()
            
        # Display sample images
        st.subheader("Welcome to ProCost")
        
        # Create two columns for the images
        img_col1, img_col2 = st.columns(2)
        
        with img_col1:
            st.image("https://pixabay.com/get/gd63ece589405079dc9190379fbbf8e055e578e9729abd134a92db9998735278ae0af9733e337f490c4e841c52981e3c01a8b3e33248d7c2cdd5f829054969261_1280.jpg", 
                     caption="Seafood Processing Facility", use_container_width=True)
        
        with img_col2:
            st.image("https://pixabay.com/get/gef16ba3bb8e0b6514b99e68d7553367b391da62ea9b1043fd0ddb9cc1adbd439ab97be3f764d57d217926c44ae5fba1e611aedead4ff1b1ca649aeed3c08f511_1280.jpg", 
                     caption="Fish Fillet Packaging", use_container_width=True)
    else:
        # Render sidebar
        render_sidebar()
        
        # Render current page
        if st.session_state.current_page == "dashboard":
            show_inquiry_form()
        elif st.session_state.current_page == "enquiries":
            st.title("Enquiries")
            st.info("This page will display your past enquiries.")
            
            # Here we could potentially query the database for past inquiries
            # and display them in a table or other format

if __name__ == "__main__":
    main()
