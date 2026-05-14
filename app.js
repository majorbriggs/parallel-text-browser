const langs = ['de', 'pl', 'fr'];
const contents = {};
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
            html += `<p data-para-id="${id}" class="para">${renderedText}</p>`;
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
        syncParagraphs(id);
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        langs.forEach(lang => {
            renderColumn(lang, contents[lang], term);
        });
    });

    // Visibility toggles
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const lang = e.target.getAttribute('data-lang');
            const col = document.getElementById(`col-${lang}`);
            if (e.target.checked) {
                col.classList.remove('hidden');
            } else {
                col.classList.add('hidden');
            }
        });
    });
}

function syncParagraphs(id) {
    document.querySelectorAll('.para').forEach(p => p.classList.remove('active'));
    
    const matching = document.querySelectorAll(`.para[data-para-id="${id}"]`);
    
    matching.forEach(p => {
        p.classList.add('active');
        
        // Only scroll if the column is visible
        const col = p.closest('.column');
        if (col && !col.classList.contains('hidden')) {
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

init();
