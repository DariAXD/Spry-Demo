// Store conversation history
let conversationHistory = [
    { role: 'system', content: 'You are a helpful AI assistant.' }
];

// Backend API URL
const API_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const fileInput = document.getElementById('fileInput');
    const cameraButton = document.getElementById('cameraButton');
    const cameraModal = document.getElementById('cameraModal');
    const closeButton = document.querySelector('.close-button');
    const cameraFeed = document.getElementById('cameraFeed');
    const photoCanvas = document.getElementById('photoCanvas');
    const captureButton = document.getElementById('captureButton');

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });

    // Handle message submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            // Add user message to UI
            addMessage(message, 'user');
            messageInput.value = '';
            messageInput.style.height = 'auto';

            try {
                // Show typing indicator
                showTypingIndicator();

                // Get AI response from backend
                const response = await fetch(`${API_URL}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        messages: [{ role: 'user', content: message }]
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                removeTypingIndicator();

                // Add AI response to UI
                addMessage(data.response, 'ai');
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator();
                addMessage('I apologize, but I encountered an error. Please try again.', 'ai');
            }
        }
    });

    // Handle file upload
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Please select an image smaller than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(e) {
                const imageData = e.target.result;
                addImageMessage(imageData, 'user');

                try {
                    showTypingIndicator();
                    const response = await fetch(`${API_URL}/api/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            messages: [],
                            imageData: imageData
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    removeTypingIndicator();
                    addMessage(data.response, 'ai');
                } catch (error) {
                    console.error('Error:', error);
                    removeTypingIndicator();
                    addMessage('I apologize, but I encountered an error analyzing the image. Please try again.', 'ai');
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Camera functionality
    let stream = null;

    cameraButton.addEventListener('click', async function() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            cameraFeed.srcObject = stream;
            cameraModal.style.display = 'flex';
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera');
        }
    });

    closeButton.addEventListener('click', function() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraModal.style.display = 'none';
    });

    captureButton.addEventListener('click', async function() {
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = cameraFeed.videoWidth;
        photoCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
        
        const imageData = photoCanvas.toDataURL('image/jpeg', 0.8);
        addImageMessage(imageData, 'user');
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraModal.style.display = 'none';

        // Process captured image with AI
        try {
            showTypingIndicator();
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [],
                    imageData: imageData
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            removeTypingIndicator();
            addMessage(data.response, 'ai');
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('I apologize, but I encountered an error analyzing the captured image. Please try again.', 'ai');
        }
    });

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addImageMessage(imageUrl, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <img src="${imageUrl}" alt="Uploaded image" class="chat-image">
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}); 