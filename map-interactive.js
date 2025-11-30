document.addEventListener('DOMContentLoaded', function () {
  var buttons = Array.from(document.querySelectorAll('.filter-btn'));
  var pins = Array.from(document.querySelectorAll('.map-pin'));
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function showAll() {
    buttons.forEach(function(b){ b.classList.remove('active'); });
    var allBtn = document.querySelector('.filter-btn[data-type="all"]');
    if (allBtn) allBtn.classList.add('active');
    pins.forEach(function(p){ p.classList.remove('hidden'); });
  }

  function applyFilters() {
    var active = buttons.filter(function(b){ return b.classList.contains('active'); }).map(function(b){ return b.dataset.type; });
    if (active.length === 0 || active.indexOf('all') !== -1) { showAll(); return; }
    var types = active.filter(function(a){ return a !== 'all'; });
    pins.forEach(function(pin){
      var t = pin.dataset.type;
      if (types.indexOf(t) !== -1) pin.classList.remove('hidden'); else pin.classList.add('hidden');
    });
  }

  // Filter button behaviors (multi-toggle with All)
  buttons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var type = btn.dataset.type;
      if (type === 'all') { showAll(); return; }
      btn.classList.toggle('active');
      var allBtn = document.querySelector('.filter-btn[data-type="all"]');
      if (allBtn) allBtn.classList.remove('active');
      var anyActive = buttons.some(function(b){ return b.classList.contains('active'); });
      if (!anyActive) { showAll(); return; }
      applyFilters();
    });
  });

  // Pin click: toggle popup / show class
  pins.forEach(function(pin){
    pin.addEventListener('click', function(e){
      // Toggle show class; clicking anywhere toggles
      pin.classList.toggle('show');
      // optionally close others
      pins.forEach(function(p){ if (p !== pin) p.classList.remove('show'); });
      e.stopPropagation();
    });
  });

  // Close popups when clicking outside
  document.addEventListener('click', function(){ pins.forEach(function(p){ p.classList.remove('show'); }); });

});
