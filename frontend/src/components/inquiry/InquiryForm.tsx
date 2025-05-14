import React, { useState, useEffect, FormEvent } from 'react';
import InquiryService from '../../services/InquiryService';
import { InquiryFormData } from '../../types/types';
import './InquiryForm.css';

const InquiryForm: React.FC = () => {
  // Form data
  const [product, setProduct] = useState<string>('');
  const [trimType, setTrimType] = useState<string>('');
  const [rmSpec, setRmSpec] = useState<string>('');
  const [yieldValue, setYieldValue] = useState<number>(33.0);
  const [productType, setProductType] = useState<string>('');
  const [packagingType, setPackagingType] = useState<string>('');
  const [packagingSize, setPackagingSize] = useState<string>('');
  const [transportMode, setTransportMode] = useState<string>('');
  
  // Optional charges
  const [prodaB, setProdaB] = useState<boolean>(false);
  const [encoding, setEncoding] = useState<boolean>(false);
  
  // Calculated rates
  const [filingRate, setFilingRate] = useState<number | null>(null);
  const [packagingRate, setPackagingRate] = useState<number | null>(null);
  
  // Form options from API
  const [products, setProducts] = useState<string[]>([]);
  const [trimTypes, setTrimTypes] = useState<string[]>([]);
  const [rmSpecs, setRmSpecs] = useState<string[]>([]);
  const [prodTypes, setProdTypes] = useState<string[]>([]);
  const [packagingTypes, setPackagingTypes] = useState<string[]>([]);
  const [packagingSizes, setPackagingSizes] = useState<string[]>([]);
  const [transportModes, setTransportModes] = useState<string[]>([]);
  
  // Charges calculation
  const [charges, setCharges] = useState<{
    palletCharge: number;
    terminalCharge: number;
    optionalCharges: Record<string, number>;
    totalCompulsory: number;
    totalOptional: number;
    totalCharges: number;
  } | null>(null);
  
  // Form state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  
  // Load initial options when component mounts
  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        setLoading(true);
        
        const productOptions = await InquiryService.getProductOptions();
        setProducts(productOptions);
        
        const rmSpecOptions = await InquiryService.getRmSpecs();
        setRmSpecs(rmSpecOptions);
        
        const prodTypeOptions = await InquiryService.getProdTypes();
        setProdTypes(prodTypeOptions);
        
        const transportModeOptions = await InquiryService.getTransportModes();
        setTransportModes(transportModeOptions);
        
        setError(null);
      } catch (err) {
        console.error('Failed to load form options:', err);
        setError('Failed to load form options. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialOptions();
  }, []);
  
  // Load trim types when product changes
  useEffect(() => {
    if (!product) return;
    
    const loadTrimTypes = async () => {
      try {
        const trimTypeOptions = await InquiryService.getTrimTypes(product);
        setTrimTypes(trimTypeOptions);
        
        // Reset trim type when product changes
        setTrimType('');
      } catch (err) {
        console.error('Failed to load trim types:', err);
      }
    };
    
    loadTrimTypes();
  }, [product]);
  
  // Load packaging options when product and product type change
  useEffect(() => {
    if (!product || !productType) return;
    
    const loadPackagingOptions = async () => {
      try {
        const packTypes = await InquiryService.getPackagingTypes(product, productType);
        setPackagingTypes(packTypes);
        
        const packSizes = await InquiryService.getPackagingSizes(product, productType);
        setPackagingSizes(packSizes);
        
        // Reset packaging options when product or type changes
        setPackagingType('');
        setPackagingSize('');
      } catch (err) {
        console.error('Failed to load packaging options:', err);
      }
    };
    
    loadPackagingOptions();
  }, [product, productType]);
  
  // Calculate rates when relevant fields change
  useEffect(() => {
    if (!product || !trimType || !rmSpec || !productType || !packagingType || !transportMode) {
      setFilingRate(null);
      setPackagingRate(null);
      return;
    }
    
    const calculateRates = async () => {
      try {
        const rates = await InquiryService.calculateRates(
          product, 
          trimType, 
          rmSpec, 
          productType, 
          packagingType, 
          transportMode
        );
        
        setFilingRate(rates.filingRate);
        setPackagingRate(rates.packagingRate);
      } catch (err) {
        console.error('Failed to calculate rates:', err);
      }
    };
    
    calculateRates();
  }, [product, trimType, rmSpec, productType, packagingType, transportMode]);
  
  // Calculate charges when relevant fields change
  useEffect(() => {
    if (!rmSpec) return;
    
    const calculateCharges = async () => {
      try {
        // Extract weight from RM spec (e.g., "1-2 kg" -> 1)
        let weight = 0;
        try {
          weight = parseFloat(rmSpec.split(' ')[0]);
        } catch {
          weight = 0;
        }
        
        const chargesData = await InquiryService.calculateCharges(
          yieldValue,
          weight,
          {
            prodaB,
            encoding
          }
        );
        
        setCharges(chargesData);
      } catch (err) {
        console.error('Failed to calculate charges:', err);
      }
    };
    
    calculateCharges();
  }, [rmSpec, yieldValue, prodaB, encoding]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!product || !trimType || !rmSpec || !productType || !packagingType || !transportMode) {
      setMessage('Please fill in all required fields');
      return;
    }
    
    if (!charges) {
      setMessage('Unable to calculate charges. Please check your inputs and try again.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setMessage('');
      
      // Prepare inquiry data
      const inquiryData: InquiryFormData = {
        product,
        trimType,
        rmSpec,
        yieldValue,
        productType,
        packagingType,
        packagingSize,
        transportMode,
        filingRate,
        packagingRate,
        palletCharge: charges.palletCharge,
        terminalCharge: charges.terminalCharge,
        optionalCharges: charges.optionalCharges,
        totalCharges: charges.totalCharges
      };
      
      // Save the inquiry
      const result = await InquiryService.saveInquiry(inquiryData);
      setSuccess(true);
      setMessage(result.message);
      
      // Reset form after successful submission (optional)
      // resetForm();
    } catch (err) {
      console.error('Failed to save inquiry:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving your inquiry');
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="inquiry-form-container">
      <h1>New Order Inquiry</h1>
      
      {message && <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading && <div className="loading">Processing your request...</div>}
      
      <div className="grid">
        {/* Form section */}
        <div className="card inquiry-form">
          <h2>Order Details</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="product">Product*</label>
              <select
                id="product"
                className="form-control"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              >
                <option value="">Select Product</option>
                {products.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="trim-type">Trim Type*</label>
              <select
                id="trim-type"
                className="form-control"
                value={trimType}
                onChange={(e) => setTrimType(e.target.value)}
                required
                disabled={!product}
              >
                <option value="">Select Trim Type</option>
                {trimTypes.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="rm-spec">RM Spec*</label>
              <select
                id="rm-spec"
                className="form-control"
                value={rmSpec}
                onChange={(e) => setRmSpec(e.target.value)}
                required
              >
                <option value="">Select RM Spec</option>
                {rmSpecs.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="yield-value">Yield*</label>
              <input
                type="number"
                id="yield-value"
                className="form-control"
                value={yieldValue}
                onChange={(e) => setYieldValue(parseFloat(e.target.value))}
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="product-type">Product Type*</label>
              <select
                id="product-type"
                className="form-control"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
              >
                <option value="">Select Product Type</option>
                {prodTypes.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="packaging-type">Packaging Type*</label>
              <select
                id="packaging-type"
                className="form-control"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                required
                disabled={!product || !productType}
              >
                <option value="">Select Packaging Type</option>
                {packagingTypes.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="packaging-size">Packaging Size*</label>
              <select
                id="packaging-size"
                className="form-control"
                value={packagingSize}
                onChange={(e) => setPackagingSize(e.target.value)}
                required
                disabled={!product || !productType}
              >
                <option value="">Select Packaging Size</option>
                {packagingSizes.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="transport-mode">Transport Mode*</label>
              <select
                id="transport-mode"
                className="form-control"
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                required
              >
                <option value="">Select Transport Mode</option>
                {transportModes.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="calculated-rates">
              <p className="rate-display">
                Filing Rate per kg: {filingRate !== null ? `$${filingRate.toFixed(2)}` : 'N/A'}
              </p>
              <p className="rate-display">
                Packaging Rate per kg: {packagingRate !== null ? `$${packagingRate.toFixed(2)}` : 'N/A'}
              </p>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Submit Inquiry
            </button>
          </form>
        </div>
        
        {/* Charges section */}
        <div className="charges-section">
          <div className="card compulsory-charges">
            <h2>Compulsory Charges</h2>
            
            <div className="charge-item">
              <span className="charge-label">Pallet Charge:</span>
              <span className="charge-value">
                ${charges ? charges.palletCharge.toFixed(2) : '0.00'} per kg
              </span>
            </div>
            
            <div className="charge-item">
              <span className="charge-label">Terminal Charge:</span>
              <span className="charge-value">
                ${charges ? charges.terminalCharge.toFixed(2) : '0.00'} per kg
              </span>
            </div>
            
            <div className="charge-item yield-value">
              <span className="charge-label">Yield Value:</span>
              <span className="charge-value">{yieldValue.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="card optional-charges">
            <h2>Optional Charges</h2>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={prodaB}
                  onChange={(e) => setProdaB(e.target.checked)}
                />
                ProdA/B (1.00 per kg/RM)
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={encoding}
                  onChange={(e) => setEncoding(e.target.checked)}
                />
                Encoding (1.50 per kg/RM)
              </label>
            </div>
            
            {charges && charges.optionalCharges && Object.keys(charges.optionalCharges).length > 0 && (
              <div className="optional-charges-list">
                {Object.entries(charges.optionalCharges).map(([key, value]) => (
                  <div className="charge-item" key={key}>
                    <span className="charge-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span className="charge-value">${value.toFixed(2)} per kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="card total-charges">
            <h2>Total Charges</h2>
            <div className="charge-item total">
              <span className="charge-label">Total Charges:</span>
              <span className="charge-value total-value">
                ${charges ? charges.totalCharges.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;