function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuButton || !mobileMenu) {
    return;
  }

  const openMenu = () => {
    mobileMenu.style.display = 'block';
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.style.display = 'none';
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggleMenu = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const outsideClickHandler = (event: MouseEvent) => {
    if (!mobileMenuButton.contains(event.target as Node) && !mobileMenu.contains(event.target as Node)) {
      closeMenu();
    }
  };

  const escapeKeyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  };

  mobileMenuButton.addEventListener('click', toggleMenu);
  document.addEventListener('click', outsideClickHandler);
  document.addEventListener('keydown', escapeKeyHandler);

  // Clean up function for Astro view transitions
  window.cleanupMobileMenu = () => {
    mobileMenuButton.removeEventListener('click', toggleMenu);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escapeKeyHandler);
  };
}

// Initialize on every page load/navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}

// Re-initialize on Astro view transitions
document.addEventListener('astro:page-load', () => {
  if (window.cleanupMobileMenu) {
    window.cleanupMobileMenu();
  }
  initMobileMenu();
});