export function initMobileMenu(): void {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuButton || !mobileMenu) return;

  // Remove any existing event listeners by cloning the button
  const newButton = mobileMenuButton.cloneNode(true) as HTMLElement;
  mobileMenuButton.parentNode?.replaceChild(newButton, mobileMenuButton);

  // Get the new button reference
  const button = document.getElementById('mobile-menu-button');
  if (!button) return;

  button.addEventListener('click', function (e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    // Toggle menu visibility
    if (isExpanded) {
      // Close menu
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      // Open menu
      mobileMenu.style.display = 'block';
      mobileMenu.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  // Close menu when clicking outside
  const outsideClickHandler = function (event: Event) {
    const target = event.target as HTMLElement;

    // Check if click is on the overlay background (not the nav menu)
    const isClickOnOverlay =
      target === mobileMenu || (target.classList && target.classList.contains('bg-black'));

    // Check if click is on the actual navigation menu
    const isClickOnNav = target.closest('nav');

    if (!button.contains(target) && !isClickOnNav && isClickOnOverlay) {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  // Use capture phase to ensure this runs before other handlers
  document.addEventListener('click', outsideClickHandler, true);

  // Close menu on escape key
  const escapeKeyHandler = function (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  document.addEventListener('keydown', escapeKeyHandler);

  // Clean up function for Astro view transitions
  window.cleanupMobileMenu = function () {
    document.removeEventListener('click', outsideClickHandler, true);
    document.removeEventListener('keydown', escapeKeyHandler);
  };
}

// Type declaration for the cleanup function
declare global {
  interface Window {
    cleanupMobileMenu?: () => void;
  }
}
