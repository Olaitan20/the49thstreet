const API_BASE_URL = 'https://shop.the49thstreet.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET;

// Basic authentication for WooCommerce REST API
const getAuth = () => {
  return btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
};

export const api = {
  // Get all products
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams({
      per_page: '100',
      ...params
    }).toString();

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  },

  // Get product categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/products/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  },

  // Create an order
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return response.json();
  },

  // Create a customer
  async createCustomer(customerData) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    return response.json();
  },
};