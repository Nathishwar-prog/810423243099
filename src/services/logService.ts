import axios from 'axios';
import getToken from './authService';

async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string
): Promise<void> {
  try {
    const token = await getToken();

    const response = await axios.post(
      'http://4.224.186.213/evaluation-service/logs',
      {
        stack,
        level,
        package: packageName,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('[LogResponse]', response.data);
  } catch (error: any) {
    console.error('[LogError]', error.response?.data || error.message);
  }
}

export default Log;
