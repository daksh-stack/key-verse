const axios = require('axios');

const MGT_URL = 'http://localhost:3000';
const PROVIDER_KEY = '8bf66531-c032-421f-aa89-2270b19abf80';

const axiosInstance = axios.create({
  headers: { 'x-api-key': PROVIDER_KEY }
});

const spec = {
  "openapi": "3.0.0",
  "info": { "title": "JSONPlaceholder Market Demo", "version": "1.0.0" },
  "paths": {
    "/posts": {
      "get": {
        "summary": "Retrieve all posts",
        "responses": { "200": { "description": "Success" } }
      }
    },
    "/posts/{id}": {
      "get": {
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "responses": { "200": { "description": "Success" } }
      }
    }
  }
};

async function register() {
  try {
    const apiName = "Real Market Demo (JSONPlaceholder)";
    
    // 1. Register API
    const reg = await axiosInstance.post(`${MGT_URL}/apis/register`, {
      name: apiName,
      base_url: "https://jsonplaceholder.typicode.com"
    });
    const apiId = reg.data.apiId;
    console.log(`Registered API: ${apiId}`);

    // 2. Update Metadata (Spec, Category, etc.)
    // Note: management/server.js expects specific fields for each tab
    await axiosInstance.patch(`${MGT_URL}/studio/${apiId}/general`, {
      name: apiName,
      category: "DATA",
      visibility: { status: "public" },
      logo_url: "https://jsonplaceholder.typicode.com/favicon.ico"
    });

    await axiosInstance.patch(`${MGT_URL}/studio/${apiId}/definitions`, {
      openapi_spec: spec
    });

    await axiosInstance.patch(`${MGT_URL}/studio/${apiId}/docs`, {
      readme_markdown: "# JSONPlaceholder Market Demo\nThis is a real-market API integrated into the KeyVerse ecosystem. It validates that our Proxy Fabric can handle high-traffic public endpoints with zero latency overhead."
    });

    // 3. Create Pricing Plans
    await axiosInstance.post(`${MGT_URL}/api/${apiId}/plans`, {
      name: "Free Tier", quota: 1000, price: 0, type: "standard"
    });

    console.log("Demo API Fully Configured!");
  } catch (e) {
    console.error("Error Detail:", e.response?.data || e.message);
  }
}

register();
