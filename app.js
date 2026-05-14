const langs = ['de', 'pl', 'fr'];
const contents = {};
let currentActiveId = null;
const searchInput = document.getElementById('search-input');
const toggles = document.querySelectorAll('.view-toggles input');

// Initialize the app
async function init() {
    for (const lang of langs) {
        try {
            const response = await fetch(`${lang}.md`);
            const text = await response.text();
            contents[lang] = text;
            renderColumn(lang, text);
        } catch (error) {
            console.error(`Error loading ${lang}.md:`, error);
            document.getElementById(`content-${lang}`).innerHTML = `<p style="color:red">Error loading file.</p>`;
        }
    }

    setupEventListeners();
    updateLayout();
}

function renderColumn(lang, markdown, searchTerm = '') {
    const container = document.getElementById(`content-${lang}`);
    
    const lines = markdown.split('\n');
    let html = '';
    
    lines.forEach(line => {
        if (line.trim() === '') return;
        
        const markerMatch = line.match(/^\[(\d+)\]\s*(.*)/);
        
        if (markerMatch) {
            const id = markerMatch[1];
            let text = markerMatch[2];
            
            if (searchTerm) {
                const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                text = text.replace(regex, '<span class="search-match">$1</span>');
            }
            
            const renderedText = marked.parseInline(text);
            html += `<p data-para-id="${id}" class="para ${id === currentActiveId ? 'active' : ''}">${renderedText}</p>`;
        } else if (line.startsWith('#')) {
            html += marked.parse(line);
        }
    });
    
    container.innerHTML = html;
}

function setupEventListeners() {
    // Click synchronization
    document.addEventListener('click', (e) => {
        const para = e.target.closest('.para');
        if (!para) return;
        
        const id = para.getAttribute('data-para-id');
        currentActiveId = id;
        syncParagraphs(id);
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        langs.forEach(lang => {
            renderColumn(lang, contents[lang], term);
        });
    });

    // Visibility toggles / Tabs
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Force radio behavior: uncheck others
                toggles.forEach(t => {
                    if (t !== toggle) t.checked = false;
                });
                // Ensure at least one is checked
                if (!toggle.checked) toggle.checked = true;
            }
            
            updateLayout();
            if (currentActiveId) {
                syncParagraphs(currentActiveId);
            }
        });
    });

    window.addEventListener('resize', updateLayout);
}

function updateLayout() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Ensure at least one is checked on mobile
        const anyChecked = Array.from(toggles).some(t => t.checked);
        if (!anyChecked) toggles[0].checked = true;
    }

    toggles.forEach(t => {
        const lang = t.getAttribute('data-lang');
        const col = document.getElementById(`col-${lang}`);
        
        if (isMobile) {
            col.classList.remove('hidden'); // Clear desktop hidden
            if (t.checked) {
                col.classList.remove('mobile-hidden');
            } else {
                col.classList.add('mobile-hidden');
            }
        } else {
            col.classList.remove('mobile-hidden'); // Clear mobile hidden
            if (t.checked) {
                col.classList.remove('hidden');
            } else {
                col.classList.add('hidden');
            }
        }
    });
}

function syncParagraphs(id) {
    document.querySelectorAll('.para').forEach(p => p.classList.remove('active'));
    
    const matching = document.querySelectorAll(`.para[data-para-id="${id}"]`);
    
    matching.forEach(p => {
        p.classList.add('active');
        
        const col = p.closest('.column');
        const isMobile = window.innerWidth <= 768;
        
        // Scroll if it's the visible column
        if (col && !col.classList.contains('hidden') && !col.classList.contains('mobile-hidden')) {
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

init();
