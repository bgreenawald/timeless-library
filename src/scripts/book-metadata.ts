import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

// Type definitions
declare global {
  interface Window {
    markdownit: typeof MarkdownIt;
    DOMPurify: typeof DOMPurify;
    currentRawPrompt?: string;
    currentMetadataText?: string;
    toggleMetadata: (button: HTMLElement) => void;
    showPromptFromData: (button: HTMLElement) => void;
    showPrompt: (phaseName: string, prompt: string) => void;
    closePromptModal: () => void;
    toggleRawPrompt: () => void;
    copyPromptToClipboard: () => void;
    showRawMetadataFromData: (button: HTMLElement) => void;
    showRawMetadata: (metadata: any) => void;
    copyMetadataToClipboard: () => void;
    closeRawMetadataModal: () => void;
  }
}

function initialize() {
    // Initialize markdown-it and DOMPurify globally
    window.markdownit = MarkdownIt;
    window.DOMPurify = DOMPurify;

    window.toggleMetadata = function(button) {
        const content = document.getElementById('metadata-content');
        const icon = button.querySelector('svg');
        if (!content || !icon) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            // Collapse
            content.classList.remove('grid-rows-[1fr]', 'opacity-100');
            content.classList.add('grid-rows-[0fr]', 'opacity-0');
            content.setAttribute('aria-hidden', 'true');
            button.setAttribute('aria-expanded', 'false');
            icon.classList.remove('rotate-180');
        } else {
            // Expand
            content.classList.remove('grid-rows-[0fr]', 'opacity-0');
            content.classList.add('grid-rows-[1fr]', 'opacity-100');
            content.setAttribute('aria-hidden', 'false');
            button.setAttribute('aria-expanded', 'true');
            icon.classList.add('rotate-180');
        }
    };

    window.showPromptFromData = function(button) {
        const phaseName = button.getAttribute('data-phase-name');
        const promptData = button.getAttribute('data-prompt');
        if (!phaseName || !promptData) return;

        try {
            const prompt = JSON.parse(promptData);
            window.showPrompt(phaseName, prompt);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse prompt data:', error);
        }
    };

    window.showPrompt = function(phaseName, prompt) {
        const modal = document.getElementById('prompt-modal') as HTMLElement;
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        const rawContent = document.getElementById('modal-raw-content');
        if (!modal || !title || !content || !rawContent) return;

        title.textContent = `${phaseName} - System Prompt`;
        window.currentRawPrompt = prompt;
        rawContent.textContent = prompt;

        const md = new (window.markdownit)();
        const rendered = md.render(prompt);
        content.innerHTML = window.DOMPurify.sanitize(rendered);

        modal.classList.remove('hidden');
    };

    window.closePromptModal = function() {
        const modal = document.getElementById('prompt-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        // Reset to formatted view
        document.getElementById('modal-content')?.classList.remove('hidden');
        document.getElementById('modal-raw-content')?.classList.add('hidden');
        const toggleBtn = document.getElementById('toggle-raw-btn');
        if(toggleBtn) toggleBtn.textContent = 'Show Raw';
    };

    window.toggleRawPrompt = function() {
        const content = document.getElementById('modal-content');
        const rawContent = document.getElementById('modal-raw-content');
        const toggleBtn = document.getElementById('toggle-raw-btn');
        if (!content || !rawContent || !toggleBtn) return;

        const isRawVisible = !rawContent.classList.contains('hidden');
        content.classList.toggle('hidden', !isRawVisible);
        rawContent.classList.toggle('hidden', isRawVisible);
        toggleBtn.textContent = isRawVisible ? 'Show Raw' : 'Show Formatted';
    };

    window.copyPromptToClipboard = function() {
        if (!window.currentRawPrompt) return;
        navigator.clipboard.writeText(window.currentRawPrompt).then(() => {
            const copyBtn = document.getElementById('copy-btn');
            if (!copyBtn) return;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
            // eslint-disable-next-line no-console
        }).catch(err => console.error('Failed to copy: ', err));
    };

    window.showRawMetadataFromData = function(button) {
        const metadataData = button.getAttribute('data-metadata');
        if (!metadataData) return;
        try {
            const metadata = JSON.parse(metadataData);
            window.showRawMetadata(metadata);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse metadata data:', error);
        }
    };

    window.showRawMetadata = function(metadata) {
        const modal = document.getElementById('raw-metadata-modal');
        const content = document.getElementById('raw-metadata-content');
        if (!modal || !content) return;

        const metadataText = JSON.stringify(metadata, null, 2);
        content.textContent = metadataText;
        window.currentMetadataText = metadataText;
        modal.classList.remove('hidden');
    };

    window.copyMetadataToClipboard = function() {
        if (!window.currentMetadataText) return;
        navigator.clipboard.writeText(window.currentMetadataText).then(() => {
            const copyBtn = document.getElementById('copy-metadata-btn');
            if (!copyBtn) return;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
            // eslint-disable-next-line no-console
        }).catch(err => console.error('Failed to copy: ', err));
    };

    window.closeRawMetadataModal = function() {
        const modal = document.getElementById('raw-metadata-modal');
        if (modal) modal.classList.add('hidden');
    };

    // Event listeners
    // Remove existing listener to prevent duplicates
    document.removeEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleEscapeKey);

    function handleEscapeKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            window.closePromptModal();
            window.closeRawMetadataModal();
        }
    }

    // Attach event listeners to buttons once the DOM is loaded
    const metadataButton = document.querySelector('button[aria-controls="metadata-content"]');
    if (metadataButton) {
        metadataButton.addEventListener('click', () => window.toggleMetadata(metadataButton as HTMLElement));
    }

    document.querySelectorAll('button[data-prompt]').forEach(button => {
        button.addEventListener('click', () => window.showPromptFromData(button as HTMLElement));
    });

    document.querySelectorAll('button[data-metadata]').forEach(button => {
        button.addEventListener('click', () => window.showRawMetadataFromData(button as HTMLElement));
    });

    const promptModal = document.getElementById('prompt-modal');
    if(promptModal) {
        document.getElementById('toggle-raw-btn')?.addEventListener('click', window.toggleRawPrompt);
        document.getElementById('copy-btn')?.addEventListener('click', window.copyPromptToClipboard);
        promptModal.querySelector('button.text-gray-400')?.addEventListener('click', window.closePromptModal);
        promptModal.addEventListener('click', (event) => {
            if (event.target === promptModal) {
                window.closePromptModal();
            }
        });
    }

    const rawMetadataModal = document.getElementById('raw-metadata-modal');
    if(rawMetadataModal) {
        document.getElementById('copy-metadata-btn')?.addEventListener('click', window.copyMetadataToClipboard);
        rawMetadataModal.querySelector('button.text-gray-400')?.addEventListener('click', window.closeRawMetadataModal);
        rawMetadataModal.addEventListener('click', (event) => {
            if (event.target === rawMetadataModal) {
                window.closeRawMetadataModal();
            }
        });
    }
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Re-initialize on Astro view transitions
document.addEventListener('astro:page-load', initialize);
