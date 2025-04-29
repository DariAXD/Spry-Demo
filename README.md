# AI Chat Interface

A modern chat interface that uses OpenAI's GPT-4o model through the Responses API, with support for text messages, image uploads, and camera capture. The application features robust conversation state management for maintaining context and history.

## Latest Updates

- Migrated from Chat Completion API to Responses API
- Implemented comprehensive conversation state management
- Upgraded to GPT-4o model for enhanced performance
- Added persistent conversation history
- Improved context handling and memory management

## Features

- Text chat with AI responses
- Image upload and analysis
- Camera capture and analysis
- Real-time typing indicators
- Mobile-responsive design
- Modern UI with animations

## Technologies

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Vite (Build tool)
  - State Management System

- Backend:
  - Node.js
  - Express.js
  - OpenAI Responses API
  - CORS
  - Conversation State Management

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Usage

1. Text Chat:
   - Type your message in the input field
   - Press Enter or click the send button
   - Wait for AI response

2. Image Upload:
   - Click the image icon
   - Select an image from your device
   - Wait for AI analysis

3. Camera Capture:
   - Click the camera icon
   - Allow camera access if prompted
   - Take a photo
   - Wait for AI analysis

## Development

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Backend server port (default: 3001)

## Notes

- Maximum image size: 5MB
- Supported image formats: JPEG, PNG
- The application uses the GPT-4o model
- Conversations are maintained with full context and history
- State management ensures consistent conversation flow

## License

MIT License 
