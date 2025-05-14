import axios from 'axios';
import { Inquiry, InquiryFormData } from '../types/types';

const API_URL = '/api/inquiries';

// Add token to requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

class InquiryService {
  async getProductOptions(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  }

  async getTrimTypes(product: string): Promise<string[]> {
    const response = await axios.get(`${API_URL}/trimTypes`, { params: { product } });
    return response.data;
  }

  async getRmSpecs(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/rmSpecs`);
    return response.data;
  }

  async getProdTypes(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/prodTypes`);
    return response.data;
  }

  async getPackagingTypes(product: string, prodType: string): Promise<string[]> {
    const response = await axios.get(`${API_URL}/packagingTypes`, { 
      params: { product, prodType } 
    });
    return response.data;
  }

  async getPackagingSizes(product: string, prodType: string): Promise<string[]> {
    const response = await axios.get(`${API_URL}/packagingSizes`, { 
      params: { product, prodType } 
    });
    return response.data;
  }

  async getTransportModes(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/transportModes`);
    return response.data;
  }

  async calculateRates(product: string, trimType: string, rmSpec: string, 
                      prodType: string, packType: string, transportMode: string): Promise<{
                          filingRate: number | null,
                          packagingRate: number | null
                      }> {
    const response = await axios.get(`${API_URL}/calculateRates`, {
      params: {
        product,
        trimType,
        rmSpec,
        prodType,
        packType,
        transportMode
      }
    });
    return response.data;
  }

  async calculateCharges(yieldValue: number, weight: number, options: {
    prodaB: boolean,
    encoding: boolean
  }): Promise<{
    palletCharge: number,
    terminalCharge: number,
    optionalCharges: Record<string, number>,
    totalCompulsory: number,
    totalOptional: number,
    totalCharges: number
  }> {
    const response = await axios.post(`${API_URL}/calculateCharges`, {
      yieldValue,
      weight,
      options
    });
    return response.data;
  }

  async saveInquiry(inquiryData: InquiryFormData): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}`, inquiryData);
    return response.data;
  }

  async getUserInquiries(): Promise<Inquiry[]> {
    const response = await axios.get(`${API_URL}/user`);
    return response.data;
  }
}

export default new InquiryService();