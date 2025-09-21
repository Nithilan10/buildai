// Test script for LangFlow connection
require('dotenv').config();

// Get API key from environment variable
if (!process.env.LANGFLOW_API_KEY) {
    throw new Error('LANGFLOW_API_KEY environment variable not found. Please set your API key in the environment variables.');
}

const payload = {
    "output_type": "text",
    "input_type": "text",
    "input_value": "hello world!",
    "session_id": "user_1"
};

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        "x-api-key": process.env.LANGFLOW_API_KEY
    },
    body: JSON.stringify(payload)
};

fetch('http://localhost:7860/api/v1/run/ab140c7b-dc85-4a7d-afd5-307f7371a79e', options)
    .then(response => response.json())
    .then(response => console.log('LangFlow Response:', response))
    .catch(err => console.error('LangFlow Error:', err));
