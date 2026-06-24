import axios from 'axios';

async function getToken(): Promise<string> {
  try {
    const response = await axios.post(
      'http://4.224.186.213/evaluation-service/auth',
      {
        email: import.meta.env.VITE_EMAIL || 'nathishwarc@gmail.com',
        name: import.meta.env.VITE_NAME || 'Nathishwar C',
        rollNo: import.meta.env.VITE_ROLL_NO || '810423243099',
        accessCode: import.meta.env.VITE_ACCESS_CODE || 'QWJuFf',
        clientID: import.meta.env.VITE_CLIENT_ID || '6a7ec12d-421e-46a8-b047-a834333a1c98',
        clientSecret: import.meta.env.VITE_CLIENT_SECRET || 'SWHvhXZtRVyssHKU'
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('Failed to get token:', error.response?.data || error.message);
    throw error;
  }
}

export default getToken;
