import os
import psycopg2
from psycopg2 import pool

class Database:
    _connection_pool = None
    
    @classmethod
    def initialize(cls):
        """Initialize the database connection pool"""
        try:
            # Get database connection details from environment variables
            db_host = os.getenv("PGHOST", "localhost")
            db_port = os.getenv("PGPORT", "5432")
            db_name = os.getenv("PGDATABASE", "postgres")
            db_user = os.getenv("PGUSER", "postgres")
            db_password = os.getenv("PGPASSWORD", "")

            cls._connection_pool = pool.ThreadedConnectionPool(
                1, 10,
                host=db_host,
                port=db_port,
                dbname=db_name,
                user=db_user,
                password=db_password
            )
            
            # Create tables if they don't exist
            with cls.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        CREATE TABLE IF NOT EXISTS users (
                            id SERIAL PRIMARY KEY,
                            username VARCHAR(100) UNIQUE NOT NULL,
                            password_hash VARCHAR(255) NOT NULL,
                            email VARCHAR(255) UNIQUE,
                            is_admin BOOLEAN DEFAULT FALSE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    ''')
                    
                    cursor.execute('''
                        CREATE TABLE IF NOT EXISTS inquiries (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER REFERENCES users(id),
                            product VARCHAR(100),
                            trim_type VARCHAR(100),
                            rm_spec VARCHAR(100),
                            yield_value FLOAT,
                            product_type VARCHAR(100),
                            packaging_type VARCHAR(100),
                            packaging_size VARCHAR(100),
                            transport_mode VARCHAR(100),
                            filing_rate FLOAT,
                            packaging_rate FLOAT,
                            pallet_charge FLOAT,
                            terminal_charge FLOAT,
                            optional_charges JSONB,
                            total_charges FLOAT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    ''')
                    conn.commit()
                    
            print("Database initialization successful")
            return True
        except Exception as e:
            print(f"Database initialization failed: {e}")
            return False

    @classmethod
    def get_connection(cls):
        """Get a connection from the connection pool"""
        if cls._connection_pool is None:
            cls.initialize()
        return cls._connection_pool.getconn()
    
    @classmethod
    def return_connection(cls, connection):
        """Return a connection to the connection pool"""
        if cls._connection_pool is not None:
            cls._connection_pool.putconn(connection)
    
    @classmethod
    def close_all_connections(cls):
        """Close all connections in the connection pool"""
        if cls._connection_pool is not None:
            cls._connection_pool.closeall()
            
    @classmethod
    def execute_query(cls, query, params=None):
        """Execute a query and return the result"""
        conn = None
        try:
            conn = cls.get_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                conn.commit()
                try:
                    return cursor.fetchall()
                except psycopg2.ProgrammingError:
                    return None
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"Database query error: {e}")
            raise
        finally:
            if conn:
                cls.return_connection(conn)
