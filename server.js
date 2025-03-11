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

        let formattedMessages = messages;

        // If there's image data, format it according to the OpenAI specification
        if (imageData) {
            console.log('Processing image data');
            const base64Image = imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            
            formattedMessages = [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "What is in this image?",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            },
                        },
                    ],
                }
            ];
        }

        console.log('Sending request to OpenAI with model: gpt-4o-mini');
        const chatCompletion = await client.chat.completions.create({
            messages: formattedMessages,
            model: 'gpt-4o-mini'
        });

        console.log('Received response from OpenAI');
        if (chatCompletion.choices && chatCompletion.choices[0]) {
            res.json({ response: chatCompletion.choices[0].message.content });
        } else {
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
        } else if (error.response?.status === 429) {
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
    console.log('Using OpenAI Model: gpt-4o-mini');
}); 