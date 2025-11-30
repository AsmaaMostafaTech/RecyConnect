document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('fs-search');
  const filterSelect = document.getElementById('fs-filter');
  const distanceSelect = document.getElementById('fs-distance');
  const clearBtn = document.getElementById('fs-clear');
  const listingsWrap = document.getElementById('listings');

  // Fetch and display surplus items when page loads
  fetchSurplusItems();

  // Fetch surplus items from the server
  async function fetchSurplusItems() {
    try {
      const response = await fetch('/api/surplus');
      const data = await response.json();
      if (data && data.success) {
        displaySurplusItems(data.data || []);
      } else {
        console.error('Error fetching surplus items:', data?.message || 'Unknown error');
        displayNoItems();
      }
    } catch (error) {
      console.error('Error:', error);
      displayNoItems();
    }
  }

  // Display message when no items are available
  function displayNoItems() {
    listingsWrap.innerHTML = '<div class="col-12 text-center py-5"><p>لا توجد عناصر متاحة حاليًا</p></div>';
  }

  // Display surplus items in the UI
  function displaySurplusItems(items) {
    if (!items || items.length === 0) {
      displayNoItems();
      return;
    }

    try {
      listingsWrap.innerHTML = items.map(item => {
        // Safely handle potentially undefined values
        const title = item.title || 'عنصر بدون عنوان';
        const location = item.location || 'غير محدد';
        const description = item.description || 'لا يوجد وصف';
        const category = item.category || 'أخرى';
        const contact = item.contact || '';
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '';
        
        // Handle images safely
        let imageHtml = '';
        if (item.images && item.images.length > 0 && item.images[0]) {
          imageHtml = `<img src="${item.images[0]}" class="card-img-top" alt="${title}" style="height: 200px; object-fit: cover;">`;
        } else {
          imageHtml = `
            <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
              <i class="fas fa-image fa-4x text-muted"></i>
            </div>`;
        }
        
        return `
          <div class="col-sm-6 col-lg-4 mb-4">
            <div class="card h-100">
              ${imageHtml}
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text text-muted">
                  <i class="fas fa-map-marker-alt me-1"></i> ${location}
                </p>
                <p class="card-text">${description}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-primary">${category}</span>
                  ${date ? `<small class="text-muted">${date}</small>` : ''}
                </div>
              </div>
              <div class="card-footer bg-transparent">
                <button class="btn btn-primary w-100 contact-seller" 
                        data-contact="${contact}"
                        onclick="contactSeller('${contact.replace(/'/g, "\'")}')">
                  <i class="fas fa-phone-alt me-1"></i> اتصل بالبائع
                </button>
              </div>
            </div>
          </div>`;
      }).join('');
    } catch (error) {
      console.error('Error displaying items:', error);
      displayNoItems();
    }
  }

  // Contact seller function
  window.contactSeller = function(phoneNumber) {
    try {
      if (phoneNumber && phoneNumber.trim() !== '') {
        window.location.href = `tel:${phoneNumber.trim()}`;
      } else {
        alert('عذرًا، رقم الاتصال غير متوفر حاليًا');
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
      alert('حدث خطأ أثناء محاولة الاتصال');
    }
  };

  // Filter functions
  function matches(listingEl, q, type) {
    try {
      q = (q || '').trim().toLowerCase();
      if (!q && !type) return true;
      
      const titleEl = listingEl.querySelector('.card-title');
      const descEl = listingEl.querySelector('.card-text');
      const categoryEl = listingEl.querySelector('.badge');
      
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const desc = descEl ? descEl.textContent.toLowerCase() : '';
      const category = categoryEl ? categoryEl.textContent.toLowerCase() : '';
      
      if (q && !(title.includes(q) || desc.includes(q))) return false;
      if (type && category !== type.toLowerCase()) return false;
      return true;
    } catch (error) {
      console.error('Error in filter function:', error);
      return true; // Show item if there's an error in filtering
    }
  }

  function applyFilters() {
    const q = searchInput.value || '';
    const type = filterSelect.value || '';
    Array.from(listingsWrap.querySelectorAll('.col-sm-6')).forEach(col => {
      if (matches(col, q, type)) {
        col.style.display = '';
      } else {
        col.style.display = 'none';
      }
    });

    const anyVisible = listingsWrap.querySelectorAll('.col-sm-6:not([style*="display: none"])').length > 0;
    if (!anyVisible) {
      if (!document.querySelector('.no-results')) {
        const no = document.createElement('div');
        no.className = 'no-results col-12 text-center py-5';
        no.textContent = 'لا توجد نتائج — حاول تغيير عوامل التصفية';
        listingsWrap.appendChild(no);
      }
    } else {
      const nr = document.querySelector('.no-results');
      if (nr) nr.remove();
    }
  }

  // Event listeners
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyFilters);
  if (distanceSelect) distanceSelect.addEventListener('change', applyFilters);
  
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (searchInput) searchInput.value = '';
      if (filterSelect) filterSelect.value = '';
      if (distanceSelect) distanceSelect.value = '';
      applyFilters();
    });
  }

  // Handle view post buttons if they exist
  if (listingsWrap) {
    listingsWrap.addEventListener('click', function(e) {
      const viewBtn = e.target.closest('.view-post');
      if (viewBtn) {
        const postId = viewBtn.getAttribute('data-id');
        if (postId) {
          // You can implement a modal or redirect to a details page here
          console.log('Viewing post:', postId);
          // Example: window.location.href = `post-details.html?id=${postId}`;
          alert('عرض التفاصيل للعنصر: ' + postId);
        }
        return;
      }

      // Handle contact seller button
      const contactBtn = e.target.closest('.contact-seller');
      if (contactBtn) {
        const contact = contactBtn.getAttribute('data-contact') || '';
        if (contact) {
          window.location.href = `tel:${contact}`;
        } else {
          alert('عذرًا، رقم الاتصال غير متوفر حاليًا');
        }
      }
    });
  }

  // Initialize filters once
  applyFilters();
});
