// Initialize Socket.IO connection
const socket = io('http://localhost:3000');

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const conversationItems = document.querySelectorAll('.conversation-item');
    const messageInput = document.querySelector('.message-input input');
    const sendButton = document.querySelector('.send-btn');
    const messagesContainer = document.querySelector('.messages-container');
    const userSidebar = document.querySelector('.user-sidebar');
    const closeSidebarButton = document.querySelector('.close-sidebar');
    const userProfileButton = document.querySelector('.chat-actions .btn-icon:last-child');
    const messageInputContainer = document.querySelector('.message-input');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Real-time message handling
    socket.on('message', (data) => {
        const conversation = conversations.find(conv => conv.id === data.conversationId);
        if (conversation) {
            conversation.messages.push({
                type: 'received',
                content: data.content,
                time: getCurrentTime(),
                date: 'Today',
                status: 'delivered'
            });
            
            if (activeConversation && activeConversation.id === conversation.id) {
                loadConversation(activeConversation);
            }
            updateUnreadCounts();
        }
    });

    // Message read receipt
    socket.on('message-read', (messageId) => {
        const message = activeConversation?.messages.find(m => m.id === messageId);
        if (message) {
            message.status = 'read';
            updateMessageStatus(messageId, 'read');
        }
    });

    // Sample data for demonstration
    const conversations = [
        {
            id: 1,
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
            status: 'online',
            lastMessage: 'Thanks for the update! I\'ll be there...',
            time: '2 min',
            unread: 3,
            messages: [
                {
                    type: 'received',
                    content: 'Hi there! I saw your food surplus listing. Is it still available?',
                    time: '10:30 AM',
                    date: 'Today'
                },
                {
                    type: 'sent',
                    content: 'Hello! Yes, it\'s still available. When would you like to pick it up?',
                    time: '10:32 AM',
                    date: 'Today'
                },
                {
                    type: 'received',
                    content: 'Would tomorrow at 2 PM work for you? Also, could you send me a photo of the items?',
                    time: '10:33 AM',
                    date: 'Today',
                    image: 'https://via.placeholder.com/200x150'
                },
                {
                    type: 'sent',
                    content: '2 PM works perfectly! Here are the items we have available.',
                    time: '10:35 AM',
                    date: 'Today',
                    image: 'https://via.placeholder.com/200x150'
                }
            ]
        },
        {
            id: 2,
            name: 'Sarah Smith',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith',
            status: 'offline',
            lastMessage: 'The food was delivered successfully!',
            time: '1h',
            unread: 0,
            messages: []
        },
        {
            id: 3,
            name: 'Mike Johnson',
            avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
            status: 'away',
            lastMessage: 'Can we schedule a pickup for tomorrow?',
            time: '5h',
            unread: 1,
            messages: []
        }
    ];

    // Current active conversation
    let activeConversation = conversations[0];

    // Create or open a conversation from URL query params (e.g. chat.html?with=Ahmed&post=surplus-001)
    function openConversationFromQuery() {
        try {
            const params = new URLSearchParams(window.location.search);
            const withName = params.get('with');
            const postId = params.get('post');
            const convId = params.get('conversation');

            if (convId) {
                const conv = conversations.find(c => String(c.id) === String(convId));
                if (conv) {
                    activeConversation = conv;
                    return;
                }
            }

            if (withName) {
                // Check if a conversation with that name exists
                let conv = conversations.find(c => c.name.toLowerCase() === withName.toLowerCase());
                if (!conv) {
                    // Create a new conversation object
                    const nextId = conversations.reduce((m, c) => Math.max(m, c.id), 0) + 1;
                    conv = {
                        id: nextId,
                        name: withName,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(withName)}`,
                        status: 'online',
                        lastMessage: postId ? `About ${postId}` : '',
                        time: 'now',
                        unread: 0,
                        messages: []
                    };
                    conversations.unshift(conv);
                }

                // Prepend a starter message if postId is provided
                if (postId && conv.messages.length === 0) {
                    conv.messages.push({ type: 'received', content: `Hi — I'm contacting you about post ${postId}.`, time: getCurrentTime(), date: 'Today' });
                }

                activeConversation = conv;
            }
        } catch (err) {
            console.error('Error parsing chat query params', err);
        }
    }

    // Initialize the chat
    function initChat() {
        // Load the first conversation by default
        loadConversation(activeConversation);
        
        // Set up event listeners
        setupEventListeners();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Conversation item click
        conversationItems.forEach(item => {
            item.addEventListener('click', function() {
                const conversationId = parseInt(this.getAttribute('data-conversation-id') || '1');
                const conversation = conversations.find(c => c.id === conversationId) || conversations[0];
                loadConversation(conversation);
                
                // Update active state
                conversationItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Send message on Enter key
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                sendMessage(this.value);
                this.value = '';
            }
        });

        // Send message on button click
        sendButton.addEventListener('click', function() {
            if (messageInput.value.trim() !== '') {
                sendMessage(messageInput.value);
                messageInput.value = '';
            }
        });

        // Toggle user profile sidebar
        if (userProfileButton) {
            userProfileButton.addEventListener('click', function() {
                userSidebar.classList.toggle('active');
            });
        }

        // Close sidebar
        if (closeSidebarButton) {
            closeSidebarButton.addEventListener('click', function() {
                userSidebar.classList.remove('active');
            });
        }

        // File upload
        const fileUploadButton = document.querySelector('.fa-paperclip').parentElement;
        if (fileUploadButton) {
            fileUploadButton.addEventListener('click', function(e) {
                e.preventDefault();
                fileInput.click();
            });
        }

        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                // In a real app, you would upload the file and get a URL
                const file = e.target.files[0];
                const fileUrl = URL.createObjectURL(file);
                
                // For demo, we'll just show a placeholder
                sendMessage('', fileUrl);
            }
        });
    }

    // Load a conversation into the chat area
    function loadConversation(conversation) {
        activeConversation = conversation;
        
        // Update header
        const chatHeader = document.querySelector('.chat-partner');
        if (chatHeader) {
            chatHeader.querySelector('img').src = conversation.avatar;
            chatHeader.querySelector('h3').textContent = conversation.name;
            chatHeader.querySelector('.status').textContent = 
                conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1);
            
            // Update online status
            const statusDot = chatHeader.querySelector('.online-status');
            statusDot.className = 'online-status ' + conversation.status;
        }
        
        // Clear and load messages
        messagesContainer.innerHTML = '';
        
        if (conversation.messages.length === 0) {
            if (message.content) {
                const textElement = document.createElement('p');
                textElement.className = 'message-text';
                textElement.textContent = message.content;
                messageContent.appendChild(textElement);
                
                // Add message status
                if (message.type === 'sent') {
                    const statusElement = document.createElement('div');
                    statusElement.className = 'message-status small text-muted';
                    statusElement.textContent = 'جاري الإرسال';
                    messageContent.appendChild(statusElement);
                }
            } else {
                // No messages yet
                const noMessages = document.createElement('div');
                noMessages.className = 'no-messages';
                noMessages.textContent = 'No messages yet. Start the conversation!';
                messagesContainer.appendChild(noMessages);
            }
        } else {
            // Group messages by date
            const messagesByDate = groupMessagesByDate(conversation.messages);
            
            // Render messages by date
            for (const [date, messages] of Object.entries(messagesByDate)) {
                // Add date separator
                const dateSeparator = document.createElement('div');
                dateSeparator.className = 'date-separator';
                dateSeparator.innerHTML = `<span>${formatDate(date)}</span>`;
                messagesContainer.appendChild(dateSeparator);
                
                // Add messages for this date
                messages.forEach(message => {
                    const messageElement = createMessageElement(message);
                    messagesContainer.appendChild(messageElement);
                });
            }
        }
        
        // Scroll to bottom
        scrollToBottom();
        
        // Mark as read
        markAsRead(conversation.id);
    }
    
    // Group messages by date
    function groupMessagesByDate(messages) {
        return messages.reduce((groups, message) => {
            const date = message.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
            return groups;
        }, {});
    }
    
    // Format date for display
    function formatDate(dateString) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const date = new Date(dateString);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }
    
    // Create a message element
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type} ${message.image ? 'has-image' : ''}`;
        messageDiv.setAttribute('data-message-id', message.id || '');
        
        let messageContent = `
            <div class="message-content">
                ${message.content ? `<p>${message.content}</p>` : ''}
        `;
        
        if (message.image) {
            messageContent += `
                <div class="message-image">
                    <img src="${message.image}" alt="Shared content">
                </div>
            `;
        }
        
        messageContent += `
                <span class="message-time">${message.time}</span>
            </div>
        `;
        
        messageDiv.innerHTML = messageContent;
        return messageDiv;
    }
    
    // Send a new message
    function sendMessage(content, imageUrl = null) {
        if (!content.trim() && !imageUrl) return;
        
        const messageId = 'msg-' + Date.now();
        const newMessage = {
            id: messageId,
            type: 'sent',
            content: content.trim(),
            time: getCurrentTime(),
            date: 'Today',
            status: 'sending',
            image: imageUrl || null
        };

        // Add to active conversation
        activeConversation.messages.push(newMessage);
        
        // Update UI
        const messageElement = createMessageElement(newMessage);
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
        
        // Simulate sending to server
        setTimeout(() => {
            // Update message status to sent
            const messageIndex = activeConversation.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
                activeConversation.messages[messageIndex].status = 'sent';
                updateMessageStatus(messageId, 'sent');
                
                // Simulate server response
                setTimeout(() => {
                    activeConversation.messages[messageIndex].status = 'delivered';
                    updateMessageStatus(messageId, 'delivered');
                    
                    // Simulate message read
                    setTimeout(() => {
                        activeConversation.messages[messageIndex].status = 'read';
                        updateMessageStatus(messageId, 'read');
                    }, 1000);
                }, 500);
            }
        }, 500);

        // Clear input
        messageInput.value = '';
        
        // If this is a new conversation, add it to the list
        if (!conversations.includes(activeConversation)) {
            conversations.unshift(activeConversation);
            renderConversationList();
        }
        
        // Simulate a reply after a short delay
        if (Math.random() > 0.5) {
            setTimeout(() => {
                simulateReply();
            }, 1000);
        }
    }
    
    // Simulate a reply from the other person
    function simulateReply() {
        const replies = [
            'Thanks for letting me know!',
            'That sounds great!',
            'I\'ll get back to you soon.',
            'Can you send me more details?',
            'Perfect, see you then!',
            'Thanks for the update!',
            'I appreciate your message!',
            'Let me check my schedule and get back to you.'
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        setTimeout(() => {
            const replyMessage = {
                type: 'received',
                content: randomReply,
                time: getCurrentTime(),
                date: 'Today'
            };
            
            activeConversation.messages.push(replyMessage);
            
            const messageElement = createMessageElement(replyMessage);
            messagesContainer.appendChild(messageElement);
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            messagesContainer.appendChild(typingIndicator);
            
            scrollToBottom();
            
            // Remove typing indicator after a delay
            setTimeout(() => {
                if (typingIndicator.parentNode) {
                    typingIndicator.remove();
                }
            }, 2000);
            
        }, 1000 + Math.random() * 2000);
    }
    
    // Mark messages as read
    function markAsRead(conversationId) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation && conversation.unread > 0) {
            conversation.unread = 0;
            
            // Update UI
            const conversationItem = document.querySelector(`.conversation-item[data-conversation-id="${conversationId}"]`);
            if (conversationItem) {
                const unreadBadge = conversationItem.querySelector('.unread-count');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
            }
        }
    }
    
    // Get current time in HH:MM AM/PM format
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes} ${ampm}`;
    }
    
    // Scroll to bottom of messages
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Initialize the chat
    // If the page was opened with query params, create/open that conversation first
    openConversationFromQuery();
    initChat();
});
