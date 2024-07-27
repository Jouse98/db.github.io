let db;
const request = indexedDB.open('messengerDB', 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
  objectStore.createIndex('content', 'content', { unique: false });
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log('Database opened successfully');
  displayMessages();
};

request.onerror = (event) => {
  console.error('Database error:', event.target.errorCode);
};

function addMessage() {
  const messageInput = document.getElementById('messageInput');
  const content = messageInput.value;

  if (content) {
    const transaction = db.transaction(['messages'], 'readwrite');
    const objectStore = transaction.objectStore('messages');
    const request = objectStore.add({ content });

    request.onsuccess = () => {
      console.log('Message added successfully');
      messageInput.value = '';
      displayMessages();
    };

    request.onerror = (event) => {
      console.error('Add message error:', event.target.errorCode);
    };
  }
}

function displayMessages() {
  const transaction = db.transaction(['messages'], 'readonly');
  const objectStore = transaction.objectStore('messages');
  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const messages = event.target.result;
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    messages.forEach((message) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message';
      const truncatedContent = message.content.length > 20 ? message.content.substring(0, 20) + '...' : message.content;
      messageDiv.innerHTML = `
        <a onclick="viewMessage(${message.id})">${truncatedContent.replace(/\n/g, '<br>')}</a>
        <button onclick="deleteMessage(${message.id})">Delete</button>
      `;
      messagesDiv.appendChild(messageDiv);
    });
  };

  request.onerror = (event) => {
    console.error('Display messages error:', event.target.errorCode);
  };
}

function viewMessage(id) {
  const transaction = db.transaction(['messages'], 'readonly');
  const objectStore = transaction.objectStore('messages');
  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    const message = event.target.result;
    if (message) {
      const messageDetail = document.getElementById('messageDetail');
      const messageContent = document.getElementById('messageContent');
      messageContent.textContent = message.content;
      messageDetail.style.display = 'block';
    }
  };

  request.onerror = (event) => {
    console.error('View message error:', event.target.errorCode);
  };
}

function closeMessageDetail() {
  const messageDetail = document.getElementById('messageDetail');
  messageDetail.style.display = 'none';
}

function deleteMessage(id) {
  const transaction = db.transaction(['messages'], 'readwrite');
  const objectStore = transaction.objectStore('messages');
  const request = objectStore.delete(id);

  request.onsuccess = () => {
    console.log('Message deleted successfully');
    displayMessages();
  };

  request.onerror = (event) => {
    console.error('Delete message error:', event.target.errorCode);
  };
}
