import hashlib
import os
import secrets
from db import Database

class Auth:
    @staticmethod
    def hash_password(password):
        """Hash a password with salt"""
        salt = secrets.token_hex(16)
        pw_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}${pw_hash}"
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify a password against its hash"""
        salt, hash_value = stored_password.split('$')
        pw_hash = hashlib.sha256((provided_password + salt).encode()).hexdigest()
        return pw_hash == hash_value
    
    @staticmethod
    def register_user(username, password, email=None, is_admin=False):
        """Register a new user"""
        try:
            # Check if username already exists
            result = Database.execute_query(
                "SELECT id FROM users WHERE username = %s",
                (username,)
            )
            
            if result and len(result) > 0:
                return False, "Username already exists"
            
            # Hash the password
            password_hash = Auth.hash_password(password)
            
            # Insert the new user
            Database.execute_query(
                "INSERT INTO users (username, password_hash, email, is_admin) VALUES (%s, %s, %s, %s)",
                (username, password_hash, email, is_admin)
            )
            
            return True, "User registered successfully"
        except Exception as e:
            print(f"Registration error: {e}")
            return False, f"Registration failed: {str(e)}"
    
    @staticmethod
    def login(username, password):
        """Login a user"""
        try:
            # Get the user
            result = Database.execute_query(
                "SELECT id, username, password_hash, is_admin FROM users WHERE username = %s",
                (username,)
            )
            
            if not result or len(result) == 0:
                return False, "Invalid username or password", None
            
            user_id, username, password_hash, is_admin = result[0]
            
            # Verify the password
            if not Auth.verify_password(password_hash, password):
                return False, "Invalid username or password", None
            
            # Create user data
            user_data = {
                "id": user_id,
                "username": username,
                "is_admin": is_admin
            }
            
            return True, "Login successful", user_data
        except Exception as e:
            print(f"Login error: {e}")
            return False, f"Login failed: {str(e)}", None
    
    @staticmethod
    def save_inquiry(user_id, inquiry_data):
        """Save an inquiry to the database"""
        try:
            # Extract data from inquiry_data
            product = inquiry_data.get('product')
            trim_type = inquiry_data.get('trim_type')
            rm_spec = inquiry_data.get('rm_spec')
            yield_value = inquiry_data.get('yield_value')
            product_type = inquiry_data.get('product_type')
            packaging_type = inquiry_data.get('packaging_type')
            packaging_size = inquiry_data.get('packaging_size')
            transport_mode = inquiry_data.get('transport_mode')
            filing_rate = inquiry_data.get('filing_rate')
            packaging_rate = inquiry_data.get('packaging_rate')
            pallet_charge = inquiry_data.get('pallet_charge')
            terminal_charge = inquiry_data.get('terminal_charge')
            optional_charges = inquiry_data.get('optional_charges', {})
            total_charges = inquiry_data.get('total_charges')
            
            # Insert the inquiry
            Database.execute_query(
                """
                INSERT INTO inquiries 
                (user_id, product, trim_type, rm_spec, yield_value, product_type, 
                packaging_type, packaging_size, transport_mode, filing_rate, 
                packaging_rate, pallet_charge, terminal_charge, optional_charges, total_charges)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (user_id, product, trim_type, rm_spec, yield_value, product_type, 
                packaging_type, packaging_size, transport_mode, filing_rate, 
                packaging_rate, pallet_charge, terminal_charge, 
                psycopg2.extras.Json(optional_charges) if optional_charges else None, 
                total_charges)
            )
            
            return True, "Inquiry saved successfully"
        except Exception as e:
            print(f"Save inquiry error: {e}")
            return False, f"Failed to save inquiry: {str(e)}"
