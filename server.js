import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables
dotenv.config();

// Setup Express
const app = express();
const port = 3001;

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

// Store conversation state
let previousResponseId = null;

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received chat request');
        const { messages, imageData } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is missing');
        }

        // Prepare the input content
        let inputContent = [];
        
        if (imageData) {
            console.log('Processing image data');
            const base64Image = imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            inputContent.push({
                role: "user",
                content: [
                    {
                        type: "input_image",
                        image_url: `data:image/jpeg;base64,${base64Image}`
                    }
                ]
            });
        }

        // Add text message if present
        if (messages.length > 0 && messages[0].content) {
            if (inputContent.length === 0) {
                inputContent.push({
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: messages[0].content
                        }
                    ]
                });
            } else {
                // If we already have an image input, add the text to the same message
                inputContent[0].content.push({
                    type: "input_text",
                    text: messages[0].content
                });
            }
        }

        // Create the response using the Responses API
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                input: inputContent,
                previous_response_id: previousResponseId,
                store: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error Details:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Received response from OpenAI');

        // Update the previous response ID for the next request
        if (responseData.output && responseData.output[0] && responseData.output[0].content && responseData.output[0].content[0]) {
            previousResponseId = responseData.id;
            res.json({ response: responseData.output[0].content[0].text });
        } else {
            console.error('Invalid response format:', responseData);
            throw new Error('Invalid response from OpenAI');
        }
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Send more specific error messages
        if (error.message.includes('API key')) {
            res.status(500).json({ 
                error: 'Configuration error',
                details: 'API key is missing or invalid'
            });
        } else if (error.message.includes('429')) {
            res.status(429).json({ 
                error: 'Rate limit exceeded',
                details: 'Please try again in a few moments'
            });
        } else if (error.message.includes('model')) {
            res.status(400).json({
                error: 'Model error',
                details: 'The specified model is not available. Please check your OpenAI account access.'
            });
        } else {
            res.status(500).json({ 
                error: 'Error processing your request',
                details: error.message 
            });
        }
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        details: err.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    console.log('Using OpenAI Responses API');
}); 