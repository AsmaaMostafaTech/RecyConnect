// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date inputs with today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('wasteDate').value = today;
    document.getElementById('pickupDate').min = today;

    // Initialize charts
    initWasteTypeChart();
    initWasteTrendChart();

    // Form submissions
    document.getElementById('wasteForm')?.addEventListener('submit', handleWasteSubmit);
    document.getElementById('pickupForm')?.addEventListener('submit', handlePickupSubmit);

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Update active nav item
                document.querySelectorAll('.sidebar nav ul li').forEach(li => {
                    li.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                
                // Scroll to section
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Set current year in footer
    document.getElementById('currentYear')?.textContent = new Date().getFullYear();
});

// Add waste item to pickup form
function addWasteItem() {
    const wasteItemsContainer = document.getElementById('wasteItems');
    const wasteItem = document.createElement('div');
    wasteItem.className = 'waste-item';
    wasteItem.innerHTML = `
        <select class="waste-type" required>
            <option value="">Select waste type</option>
            <option value="crop_residue">Crop Residue</option>
            <option value="manure">Manure</option>
            <option value="plant_trimmings">Plant Trimmings</option>
        </select>
        <input type="number" class="waste-amount" placeholder="kg" required>
        <button type="button" class="btn-remove" onclick="removeWasteItem(this)">×</button>
    `;
    wasteItemsContainer.appendChild(wasteItem);
    
    // Add animation
    wasteItem.style.opacity = '0';
    wasteItem.style.transform = 'translateY(10px)';
    setTimeout(() => {
        wasteItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        wasteItem.style.opacity = '1';
        wasteItem.style.transform = 'translateY(0)';
    }, 10);
}

// Remove waste item from pickup form
function removeWasteItem(button) {
    const wasteItem = button.closest('.waste-item');
    wasteItem.style.opacity = '0';
    wasteItem.style.transform = 'translateY(-10px)';
    wasteItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
        wasteItem.remove();
    }, 300);
}

// Handle waste form submission
function handleWasteSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const wasteData = {
        type: formData.get('wasteType'),
        amount: formData.get('wasteAmount'),
        date: formData.get('wasteDate')
    };
    
    // Here you would typically send this data to your backend
    console.log('Waste logged:', wasteData);
    
    // Show success message
    showNotification('Waste logged successfully!', 'success');
    
    // Reset form
    form.reset();
    document.getElementById('wasteDate').value = new Date().toISOString().split('T')[0];
    
    // Update charts (in a real app, this would be done after API response)
    updateCharts();
}

// Handle pickup form submission
function handlePickupSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const wasteItems = [];
    
    // Collect waste items
    document.querySelectorAll('.waste-item').forEach(item => {
        wasteItems.push({
            type: item.querySelector('.waste-type').value,
            amount: item.querySelector('.waste-amount').value
        });
    });
    
    const pickupData = {
        date: formData.get('pickupDate'),
        time: formData.get('pickupTime'),
        items: wasteItems
    };
    
    // Here you would typically send this data to your backend
    console.log('Pickup scheduled:', pickupData);
    
    // Show success message
    showNotification('Pickup scheduled successfully!', 'success');
    
    // Reset form
    form.reset();
    document.getElementById('pickupDate').value = '';
    
    // Clear waste items and add one empty one
    const wasteItemsContainer = document.getElementById('wasteItems');
    wasteItemsContainer.innerHTML = '';
    addWasteItem();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add show class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Initialize waste type chart
function initWasteTypeChart() {
    const ctx = document.getElementById('wasteTypeChart')?.getContext('2d');
    if (!ctx) return;
    
    window.wasteTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Crop Residue', 'Manure', 'Plant Trimmings', 'Other'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [
                    '#89CFF0',
                    '#5FB0E4',
                    '#4CAF50',
                    '#F39C12'
                ],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '70%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Initialize waste trend chart
function initWasteTrendChart() {
    const ctx = document.getElementById('wasteTrendChart')?.getContext('2d');
    if (!ctx) return;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(137, 207, 240, 0.3)');
    gradient.addColorStop(1, 'rgba(137, 207, 240, 0)');
    
    window.wasteTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [{
                label: 'Waste (kg)',
                data: [120, 150, 180, 200, 170, 220, 250, 230, 280, 300, 320],
                fill: true,
                backgroundColor: gradient,
                borderColor: '#89CFF0',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#89CFF0',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 12 },
                    bodyFont: { size: 14, weight: 'bold' },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} kg`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        callback: function(value) {
                            return value + ' kg';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Update charts with new data
function updateCharts() {
    // In a real app, this would fetch new data from the server
    // and update the charts accordingly
    if (window.wasteTypeChart) {
        // Simulate data update
        const newData = [
            Math.floor(Math.random() * 50) + 20,
            Math.floor(Math.random() * 40) + 10,
            Math.floor(Math.random() * 30) + 10,
            Math.floor(Math.random() * 20) + 5
        ];
        
        window.wasteTypeChart.data.datasets[0].data = newData;
        window.wasteTypeChart.update();
    }
    
    if (window.wasteTrendChart) {
        // Simulate data update
        const lastData = window.wasteTrendChart.data.datasets[0].data;
        const newValue = Math.max(0, lastData[lastData.length - 1] + (Math.random() * 60 - 20));
        
        // Shift data left and add new value
        const newData = [...lastData.slice(1), Math.round(newValue)];
        window.wasteTrendChart.data.datasets[0].data = newData;
        window.wasteTrendChart.update();
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 1000;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification.success {
        background: #28a745;
    }
    
    .notification.error {
        background: #dc3545;
    }
    
    .notification.warning {
        background: #ffc107;
        color: #212529;
    }
`;
document.head.appendChild(notificationStyles);
