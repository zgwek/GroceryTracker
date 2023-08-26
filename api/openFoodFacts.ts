import axios from 'axios';

const baseUrl = 'https://world.openfoodfacts.org/api/v0/product';

// Fetch product info by UPC code
export const getProductInfoByUPC = async (upc: string) => {
  try {
    const response = await axios.get(`${baseUrl}/${upc}.json`);
    return response.data.product; // Return the product info
  } catch (error) {
    console.error('Error fetching product information:', error);
    return null;
  }
};