// Test script for Products API LangFlow connection
require('dotenv').config();

const payload = {
    "output_type": "text",
    "input_type": "text",
    "input_value": `Find products for query: "floor tile", category: "tile", style: "modern", maxPrice: "100"`,
    "session_id": "user_1",
};

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        "x-api-key": process.env.LANGFLOW_API_KEY
    },
    body: JSON.stringify(payload)
};

console.log('Testing Products API LangFlow connection...');
console.log('Payload:', JSON.stringify(payload, null, 2));

fetch('http://localhost:7860/api/v1/run/ab140c7b-dc85-4a7d-afd5-307f7371a79e', options)
    .then(response => {
        console.log('Response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Raw response:', text);
        
        // Parse the raw text as JSON (the nested object)
        let rawData;
        try {
            rawData = JSON.parse(text);
            console.log('Parsed response:', JSON.stringify(rawData, null, 2));
        } catch (e) {
            console.error("Failed to parse LangFlow response:", text);
            return;
        }

        // Navigate to the nested message string
        let nestedMessage = rawData?.outputs?.message?.message || rawData?.messages?.[0]?.message;
        if (!nestedMessage) {
            console.log('No nested message found, checking outputs structure...');
            console.log('Available keys in outputs:', Object.keys(rawData?.outputs || {}));
            return;
        }
        
        console.log('Nested message:', nestedMessage);

        // Parse the nested JSON string
        let nestedData;
        try {
            nestedData = JSON.parse(nestedMessage);
            console.log('Parsed nested data:', JSON.stringify(nestedData, null, 2));
        } catch (e) {
            console.error("Failed to parse nested LangFlow message:", nestedMessage);
            return;
        }

        // Extract products array
        const products = Array.isArray(nestedData.products) ? nestedData.products : [];
        console.log('Final products:', products);
    })
    .catch(err => console.error('LangFlow Error:', err));
