document.addEventListener('DOMContentLoaded', function () {
  const includes = document.querySelectorAll('[data-include]');
  includes.forEach(async (el) => {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('Failed to load ' + path + ' (' + res.status + ')');
      const html = await res.text();
      el.innerHTML = html;
      // Notify that an include was loaded (useful for auth/navbar initialization)
      document.dispatchEvent(new CustomEvent('recy:include-loaded', { detail: { path, element: el } }));
      // If Bootstrap's JS exists and collapse toggler needs reflow, nothing extra needed
    } catch (err) {
      console.warn(err);
    }
  });
});
