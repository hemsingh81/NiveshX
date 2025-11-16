import axiosInstance from './axiosInstance';
import { withToast } from '../utils/toastUtils';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/motivationquote`;

export interface MotivationQuote {
     id: string;
     quote: string;
     author: string;
     isActive: boolean;
}

export interface AddMotivationQuoteRequest {
     quote: string;
     author: string;
}

export interface EditMotivationQuoteRequest {
     id: string;
     quote: string;
     author: string;
     isActive: boolean;
}

export const getAllQuotes = async (): Promise<MotivationQuote[]> => {
     const response = await withToast(
          () => axiosInstance.get<MotivationQuote[]>(`${API_URL}/all`),
          {
               loading: 'Fetching quotes...',
               success: 'Quotes loaded!',
          }
     );
     return response.data;
};

export const getQuoteById = async (id: string): Promise<MotivationQuote> => {
     const response = await withToast(
          () => axiosInstance.get<MotivationQuote>(`${API_URL}/${id}`),
          {
               loading: 'Fetching quote...',
               success: 'Quote loaded!',
          }
     );
     return response.data;
};

export const addQuote = async (request: AddMotivationQuoteRequest): Promise<void> => {
     await withToast(
          () => axiosInstance.post(`${API_URL}/add`, request),
          {
               loading: 'Adding quote...',
               success: 'Quote added!',
          }
     );
};

export const editQuote = async (request: EditMotivationQuoteRequest): Promise<void> => {
     await withToast(
          () => axiosInstance.put(`${API_URL}/edit`, request),
          {
               loading: 'Updating quote...',
               success: 'Quote updated!',
          }
     );
};

export const deleteQuote = async (id: string): Promise<void> => {
     await withToast(
          () => axiosInstance.delete(`${API_URL}/delete/${id}`),
          {
               loading: 'Deleting quote...',
               success: 'Quote deleted!',
          }
     );
};

export const getAllActivesQuotes = async (): Promise<MotivationQuote[]> => {
     const response = await withToast(
          () => axiosInstance.get<MotivationQuote[]>(`${API_URL}/all-active`),
          {
               loading: 'Fetching quotes...',
               success: 'Quotes loaded!',
          }
     );
     return response.data;
};