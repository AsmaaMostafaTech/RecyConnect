document.addEventListener('DOMContentLoaded', function () {
  var buttons = Array.from(document.querySelectorAll('.filter-btn'));
  var cards = Array.from(document.querySelectorAll('.farmer-card'));
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function showAll() {
    buttons.forEach(function(b){ b.classList.remove('active'); });
    var allBtn = document.querySelector('.filter-btn[data-waste="all"]');
    if (allBtn) allBtn.classList.add('active');
    cards.forEach(function(c){ c.classList.remove('hidden'); });
  }

  function applyFilters() {
    var active = buttons.filter(function(b){ return b.classList.contains('active'); }).map(function(b){ return b.dataset.waste; });
    if (active.length === 0 || active.indexOf('all') !== -1) {
      showAll();
      return;
    }
    var types = active.filter(function(a){ return a !== 'all'; });
    cards.forEach(function(card){
      var t = card.dataset.waste;
      if (types.indexOf(t) !== -1) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  buttons.forEach(function(btn){
    btn.addEventListener('click', function(e){
      var type = btn.dataset.waste;
      if (type === 'all') {
        showAll();
        return;
      }
      // toggle this filter
      btn.classList.toggle('active');
      // ensure 'all' is not active
      var allBtn = document.querySelector('.filter-btn[data-waste="all"]');
      if (allBtn) allBtn.classList.remove('active');
      // if none active, revert to all
      var anyActive = buttons.some(function(b){ return b.classList.contains('active'); });
      if (!anyActive) {
        showAll();
        return;
      }
      applyFilters();
    });
  });
});
