export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface InquiryFormData {
  product: string;
  trimType: string;
  rmSpec: string;
  yieldValue: number;
  productType: string;
  packagingType: string;
  packagingSize: string;
  transportMode: string;
  filingRate: number | null;
  packagingRate: number | null;
  palletCharge: number;
  terminalCharge: number;
  optionalCharges: {
    prodaB?: number;
    encoding?: number;
  };
  totalCharges: number;
}

export interface Inquiry extends InquiryFormData {
  id: number;
  userId: number;
  createdAt: string;
}