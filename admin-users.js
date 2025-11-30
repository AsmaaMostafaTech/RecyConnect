// Sample user data
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'donor', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'upcycler', status: 'inactive' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'farmer', status: 'pending' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'donor', status: 'active' },
];

// DOM Elements
const userTableBody = document.getElementById('userTableBody');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const editUserModal = document.getElementById('editUserModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');
const editUserForm = document.getElementById('editUserForm');

// Pagination
let currentPage = 1;
const usersPerPage = 10;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderUsers();
    setupEventListeners();
});

// Render users in the table
function renderUsers() {
    userTableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    if (paginatedUsers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="py-8 text-center text-gray-500">
                No users found
            </td>
        `;
        userTableBody.appendChild(row);
        return;
    }
    
    paginatedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="py-4 px-4">
                <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        ${user.name.charAt(0)}
                    </div>
                    <div class="ml-4">
                        <div class="font-medium text-gray-900">${user.name}</div>
                        <div class="text-sm text-gray-500">ID: ${user.id}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4 text-gray-600">${user.email}</td>
            <td class="py-4 px-4">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td class="py-4 px-4">
                <span class="status-badge status-${user.status}">
                    ${user.status}
                </span>
            </td>
            <td class="py-4 px-4 text-right">
                <div class="flex justify-end space-x-2">
                    <button class="action-btn edit-btn" onclick="openEditModal(${user.id})">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="confirmDelete(${user.id})">
                        <i class="fas fa-trash-alt mr-1"></i> Delete
                    </button>
                </div>
            </td>
        `;
        userTableBody.appendChild(row);
    });
    
    updatePagination();
}

// Update pagination info and buttons
function updatePagination() {
    const totalPages = Math.ceil(users.length / usersPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Setup event listeners
function setupEventListeners() {
    // Pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderUsers();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(users.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderUsers();
        }
    });
    
    // Modal close buttons
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editUserModal) {
            closeEditModal();
        }
    });
    
    // Form submission
    editUserForm.addEventListener('submit', handleEditSubmit);
}

// Open edit modal with user data
function openEditModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editName').value = user.name;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editStatus').value = user.status;
    
    editUserModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close edit modal
function closeEditModal() {
    editUserModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    editUserForm.reset();
}

// Handle form submission
function handleEditSubmit(e) {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('editUserId').value);
    const name = document.getElementById('editName').value.trim();
    const role = document.getElementById('editRole').value;
    const status = document.getElementById('editStatus').value;
    
    // Update user in the array
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            name,
            role,
            status
        };
        
        // Show success message
        showNotification('User updated successfully!', 'success');
        
        // Re-render the table
        renderUsers();
        
        // Close the modal
        closeEditModal();
    }
}

// Confirm before deleting a user
function confirmDelete(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        deleteUser(userId);
    }
}

// Delete a user
function deleteUser(userId) {
    users = users.filter(user => user.id !== userId);
    
    // Reset to first page if current page is empty
    const totalPages = Math.ceil(users.length / usersPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    // Show success message
    showNotification('User deleted successfully!', 'success');
    
    // Re-render the table
    renderUsers();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Make functions available globally
window.openEditModal = openEditModal;
window.confirmDelete = confirmDelete;
