document.addEventListener('DOMContentLoaded', function() {
    // Set user type (this would come from authentication in a real app)
    // For demo purposes, we'll use a URL parameter or default to 'donor'
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type') || 'donor';
    
    // Set the body class to show relevant sections
    document.body.classList.add(userType);
    
    // Load dashboard content based on user type
    loadDashboardContent(userType);
    
    // Handle navigation
    setupNavigation();
    
    // Initialize any dashboard widgets
    initializeDashboardWidgets();
});

function loadDashboardContent(userType) {
    const dashboardContent = document.getElementById('dashboardContent');
    let content = '';
    
    switch(userType) {
        case 'donor':
            content = `
                <h1>Welcome, Food Donor</h1>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Total Donations</span>
                            <i class="fas fa-utensils"></i>
                        </div>
                        <div class="card-value">47</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 12% from last month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Meals Provided</span>
                            <i class="fas fa-hamburger"></i>
                        </div>
                        <div class="card-value">1,250</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 8% from last month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">CO₂ Saved</span>
                            <i class="fas fa-leaf"></i>
                        </div>
                        <div class="card-value">850 kg</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 15% from last month
                        </div>
                    </div>
                </div>
                
                <div class="recent-activity card">
                    <div class="card-header">
                        <h2>Recent Activity</h2>
                        <button class="btn btn-outline">View All</button>
                    </div>
                    <div class="activity-list">
                        <!-- Activity items will be populated here -->
                    </div>
                </div>
            `;
            break;
            
        case 'upcycler':
            content = `
                <h1>Welcome, Upcycler</h1>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Products Listed</span>
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="card-value">24</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 4 new this month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Total Sales</span>
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="card-value">$1,850</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 22% from last month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Waste Diverted</span>
                            <i class="fas fa-recycle"></i>
                        </div>
                        <div class="card-value">320 kg</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 15% from last month
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'farmer':
            content = `
                <h1>Welcome, Farmer</h1>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Waste Diverted</span>
                            <i class="fas fa-recycle"></i>
                        </div>
                        <div class="card-value">2.5 tons</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 18% from last month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Compost Created</span>
                            <i class="fas fa-leaf"></i>
                        </div>
                        <div class="card-value">1.8 tons</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 12% from last month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">CO₂ Saved</span>
                            <i class="fas fa-cloud"></i>
                        </div>
                        <div class="card-value">1.2 tons</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 15% from last month
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'admin':
            content = `
                <h1>Admin Dashboard</h1>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Total Users</span>
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="card-value">1,248</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 12% from last month
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Active Listings</span>
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="card-value">347</div>
                        <div class="card-change positive">
                            <i class="fas fa-arrow-up"></i> 8% from last week
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Reports</span>
                            <i class="fas fa-flag"></i>
                        </div>
                        <div class="card-value">12</div>
                        <div class="card-change negative">
                            <i class="fas fa-arrow-down"></i> 3 new today
                        </div>
                    </div>
                </div>
                
                <div class="recent-activity card">
                    <div class="card-header">
                        <h2>System Status</h2>
                        <span class="status-badge online">All Systems Operational</span>
                    </div>
                    <div class="status-list">
                        <!-- Status items will be populated here -->
                    </div>
                </div>
            `;
            break;
    }
    
    dashboardContent.innerHTML = content;
}

function setupNavigation() {
    // Toggle mobile menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-active');
        });
    }
    
    // Handle navigation item clicks
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Here you would typically load the appropriate content
            // For now, we'll just prevent the default link behavior
            e.preventDefault();
        });
    });
}

function initializeDashboardWidgets() {
    // Initialize any charts or other widgets here
    // This is a placeholder for actual implementation
    console.log('Initializing dashboard widgets...');
    
    // Example: Initialize a chart if we have one
    if (typeof Chart !== 'undefined') {
        // Initialize charts here
    }
}

// Utility function to load content dynamically
function loadContent(url, targetElementId) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(targetElementId).innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });
}

// Export functions that might be used elsewhere
window.dashboard = {
    loadContent: loadContent,
    initialize: initializeDashboardWidgets
};
