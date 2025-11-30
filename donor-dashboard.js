document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addDonationBtn = document.getElementById('addDonationBtn');
    const donationForm = document.getElementById('donation-form');
    const closeFormBtn = document.getElementById('close-form');
    const cancelDonationBtn = document.getElementById('cancelDonation');
    const newDonationForm = document.getElementById('newDonationForm');
    const imageInput = document.getElementById('itemImages');
    const imagePreview = document.getElementById('image-preview');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Toggle Donation Form
    function toggleDonationForm() {
        donationForm.classList.toggle('hidden');
        if (!donationForm.classList.contains('hidden')) {
            donationForm.classList.add('fade-in');
            setTimeout(() => {
                donationForm.classList.remove('fade-in');
            }, 300);
        }
    }
    
    // Event Listeners
    if (addDonationBtn) {
        addDonationBtn.addEventListener('click', toggleDonationForm);
    }
    
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', toggleDonationForm);
    }
    
    if (cancelDonationBtn) {
        cancelDonationBtn.addEventListener('click', toggleDonationForm);
    }
    
    // Handle Image Upload Preview
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            // Clear previous previews
            imagePreview.innerHTML = '';
            
            // Check if files are selected
            if (this.files.length > 0) {
                // Limit to 5 images
                const files = Array.from(this.files).slice(0, 5);
                
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            const imgContainer = document.createElement('div');
                            imgContainer.className = 'image-container';
                            imgContainer.style.position = 'relative';
                            imgContainer.style.display = 'inline-block';
                            imgContainer.style.marginRight = '10px';
                            
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.className = 'preview-image';
                            img.style.width = '80px';
                            img.style.height = '80px';
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = '6px';
                            img.style.border = '1px solid #eee';
                            
                            const removeBtn = document.createElement('button');
                            removeBtn.className = 'remove-image';
                            removeBtn.innerHTML = '&times;';
                            removeBtn.style.position = 'absolute';
                            removeBtn.style.top = '-8px';
                            removeBtn.style.right = '-8px';
                            removeBtn.style.background = '#ff6b6b';
                            removeBtn.style.color = 'white';
                            removeBtn.style.border = 'none';
                            removeBtn.style.borderRadius = '50%';
                            removeBtn.style.width = '24px';
                            removeBtn.style.height = '24px';
                            removeBtn.style.display = 'flex';
                            removeBtn.style.alignItems = 'center';
                            removeBtn.style.justifyContent = 'center';
                            removeBtn.style.cursor = 'pointer';
                            removeBtn.style.fontSize = '14px';
                            removeBtn.style.lineHeight = '1';
                            
                            removeBtn.addEventListener('click', function() {
                                imgContainer.remove();
                                // Remove the file from the input
                                const dt = new DataTransfer();
                                const { files } = imageInput;
                                
                                for (let i = 0; i < files.length; i++) {
                                    const file = files[i];
                                    if (file !== file) {
                                        dt.items.add(file);
                                    }
                                }
                                
                                imageInput.files = dt.files;
                            });
                            
                            imgContainer.appendChild(img);
                            imgContainer.appendChild(removeBtn);
                            imagePreview.appendChild(imgContainer);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }
    
    // Handle Form Submission
    if (newDonationForm) {
        newDonationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formValues = {};
            
            // Convert FormData to object
            formData.forEach((value, key) => {
                formValues[key] = value;
            });
            
            // Get image files
            const imageFiles = imageInput.files;
            
            // Here you would typically send the data to your server
            console.log('Form submitted:', formValues);
            console.log('Images:', imageFiles);
            
            // Show success message
            alert('Donation submitted successfully!');
            
            // Reset form
            this.reset();
            imagePreview.innerHTML = '';
            
            // Hide form
            toggleDonationForm();
            
            // In a real app, you would update the UI or redirect
        });
    }
    
    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
    
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('title');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + (this.offsetWidth - tooltip.offsetWidth) / 2}px`;
            
            this._tooltip = tooltip;
            
            // Remove title to prevent default tooltip
            this.setAttribute('data-title', this.getAttribute('title'));
            this.removeAttribute('title');
        });
        
        el.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                document.body.removeChild(this._tooltip);
                this._tooltip = null;
            }
            
            // Restore title
            if (this.hasAttribute('data-title')) {
                this.setAttribute('title', this.getAttribute('data-title'));
                this.removeAttribute('data-title');
            }
        });
    });
    
    // Add style for tooltips
    const style = document.createElement('style');
    style.textContent = `
        .tooltip {
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
            transform: translateY(-5px);
            opacity: 0;
            transition: all 0.2s ease;
        }
        
        .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
        }
        
        [title]:hover .tooltip {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // Sample data for the dashboard (in a real app, this would come from an API)
    const statsData = [
        { id: 1, icon: 'utensils', title: 'Meals Donated', value: '1,245', trend: 'up', change: '12%' },
        { id: 2, icon: 'map-marker-alt', title: 'Active Locations', value: '8', trend: 'up', change: '2 new' },
        { id: 3, icon: 'check-circle', title: 'Completed Donations', value: '87', trend: 'up', change: '5%' }
    ];
    
    // Render stats cards
    function renderStatsCards() {
        const statsContainer = document.querySelector('.stats-cards');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = statsData.map(stat => `
            <div class="card">
                <div class="card-icon"><i class="fas fa-${stat.icon}"></i></div>
                <div class="card-info">
                    <h3>${stat.title}</h3>
                    <p class="number">${stat.value}</p>
                    <p class="trend ${stat.trend}">
                        <i class="fas fa-arrow-${stat.trend}"></i> ${stat.change} ${stat.trend === 'up' ? 'from last month' : 'from last month'}
                    </p>
                </div>
            </div>
        `).join('');
    }
    
    // Sample data for recent donations
    const donationsData = [
        {
            id: 1,
            item: 'Fresh Baguettes',
            image: 'https://via.placeholder.com/40',
            quantity: '20 pieces',
            status: 'completed',
            date: 'Nov 20, 2023',
            location: 'Downtown Bakery'
        },
        {
            id: 2,
            item: 'Assorted Fruits',
            image: 'https://via.placeholder.com/40',
            quantity: '15 kg',
            status: 'in-progress',
            date: 'Nov 18, 2023',
            location: 'Green Valley Farm'
        },
        {
            id: 3,
            item: 'Fresh Vegetables',
            image: 'https://via.placeholder.com/40',
            quantity: '25 kg',
            status: 'pending',
            date: 'Nov 15, 2023',
            location: 'Sunshine Market'
        }
    ];
    
    // Render recent donations table
    function renderRecentDonations() {
        const tableBody = document.querySelector('.recent-donations tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = donationsData.map(donation => `
            <tr>
                <td>
                    <img src="${donation.image}" alt="${donation.item}">
                    <span>${donation.item}</span>
                </td>
                <td>${donation.quantity}</td>
                <td><span class="status ${donation.status}">${formatStatus(donation.status)}</span></td>
                <td>${donation.date}</td>
                <td>${donation.location}</td>
                <td class="actions">
                    <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                    ${donation.status === 'completed' ? 
                        '<button class="btn-icon" title="Print Receipt"><i class="fas fa-print"></i></button>' : 
                        donation.status === 'in-progress' ? 
                        '<button class="btn-icon" title="Track"><i class="fas fa-map-marker-alt"></i></button>' : 
                        '<button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>'
                    }
                </td>
            </tr>
        `).join('');
    }
    
    // Format status text
    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Initialize the dashboard
    function initDashboard() {
        renderStatsCards();
        renderRecentDonations();
    }
    
    // Run initialization when DOM is fully loaded
    initDashboard();
});
