document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initSurplusChart();
    initDistributionChart();
    
    // Add animation classes to cards
    animateCards();
    
    // Setup event listeners
    setupEventListeners();
});

// Initialize Surplus Prediction Chart
function initSurplusChart() {
    const ctx = document.getElementById('surplusChart').getContext('2d');
    
    // Sample data - in a real app, this would come from an API
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Predicted Surplus',
                data: [65, 59, 80, 81, 76, 55, 40],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            },
            {
                label: 'Actual Surplus',
                data: [45, 49, 60, 71, 56, 45, 35],
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.3,
                fill: false
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#111827',
                    bodyColor: '#4B5563',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} items`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' items';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    };

    new Chart(ctx, config);
}

// Initialize Distribution Pie Chart
function initDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    const data = {
        labels: ['Food Banks', 'Shelters', 'Schools', 'Community Centers'],
        datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(139, 92, 246, 1)'
            ],
            borderWidth: 1,
            hoverOffset: 10
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#111827',
                    bodyColor: '#4B5563',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    new Chart(ctx, config);
}

// Add animation to cards
function animateCards() {
    const cards = document.querySelectorAll('.ai-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate__animated', 'animate__fadeInUp');
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add click effect to suggestion cards
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    suggestionCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('bg-blue-50');
            this.classList.toggle('border-blue-500');
        });
    });

    // Add smooth scrolling to top when clicking on logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Handle window resize for responsive adjustments
    window.addEventListener('resize', function() {
        // You can add responsive adjustments here if needed
    });
}

// Simulate loading data (for demo purposes)
function simulateDataLoading() {
    const loadingElements = document.querySelectorAll('.loading');
    
    loadingElements.forEach(element => {
        element.innerHTML = '<div class="animate-pulse flex space-x-4">' +
            '<div class="flex-1 space-y-4 py-1">' +
            '<div class="h-4 bg-gray-200 rounded w-3/4"></div>' +
            '<div class="space-y-2">' +
            '<div class="h-4 bg-gray-200 rounded"></div>' +
            '<div class="h-4 bg-gray-200 rounded w-5/6"></div>' +
            '</div>' +
            '</div>' +
            '</div>';
            
        // Simulate API call delay
        setTimeout(() => {
            element.innerHTML = '<p>Data loaded successfully!</p>';
        }, 1500);
    });
}

// Initialize tooltips
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Call this when the page is fully loaded
window.addEventListener('load', function() {
    // Initialize any additional components here
    initTooltips();
    
    // Simulate data loading for demo purposes
    setTimeout(simulateDataLoading, 1000);
});
