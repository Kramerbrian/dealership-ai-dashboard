import axios from 'axios';

export async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DealershipAI/1.0)',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw new Error(`Failed to fetch website: ${url}`);
  }
}
