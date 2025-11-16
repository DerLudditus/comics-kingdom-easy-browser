// Comics Kingdom Easy Browser - Main Application Logic

class ComicBrowser {
    constructor() {
        this.currentComic = null;
        this.currentDate = new Date();
        this.currentDate.setHours(0, 0, 0, 0);
        this.isLoading = false;
        this.maxRetries = 31; // Maximum days to search forward/backward
        
        this.init();
    }
    
    init() {
        this.populateComicList();
        this.setupEventListeners();
        this.initCalendar();
        
        // Select first comic by default
        if (COMICS_DATA.length > 0) {
            this.selectComic(COMICS_DATA[0].name);
        }
    }
    
    populateComicList() {
        const listContainer = document.getElementById('comic-list');
        listContainer.innerHTML = '';
        
        // Group comics by category
        const categories = {};
        COMICS_DATA.forEach(comic => {
            if (!categories[comic.category]) {
                categories[comic.category] = [];
            }
            categories[comic.category].push(comic);
        });
        
        // Display comics grouped by category
        Object.keys(categories).forEach(category => {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;
            listContainer.appendChild(categoryHeader);
            
            categories[category].forEach(comic => {
                const item = document.createElement('div');
                item.className = 'comic-item';
                item.dataset.comicName = comic.name;
                item.textContent = comic.displayName;
                item.onclick = () => this.selectComic(comic.name);
                listContainer.appendChild(item);
            });
        });
    }
    
    setupEventListeners() {
        document.getElementById('btn-first').onclick = () => this.goToFirst();
        document.getElementById('btn-prev').onclick = () => this.goToPrevious();
        document.getElementById('btn-next').onclick = () => this.goToNext();
        document.getElementById('btn-today').onclick = () => this.goToToday();
        document.getElementById('btn-random').onclick = () => this.goToRandom();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.goToPrevious();
                    break;
                case 'ArrowRight':
                    this.goToNext();
                    break;
                case 'Home':
                    this.goToFirst();
                    break;
                case 'End':
                    this.goToToday();
                    break;
            }
        });
        
        // Window resize listener for dynamic image sizing
        window.addEventListener('resize', () => {
            const img = document.querySelector('.comic-image-container img');
            if (img) {
                this.adjustImageSize(img);
            }
        });
    }
    
    selectComic(comicName) {
        const comic = COMICS_DATA.find(c => c.name === comicName);
        if (!comic) return;
        
        this.currentComic = comic;
        
        // Update UI
        document.querySelectorAll('.comic-item').forEach(item => {
            item.classList.toggle('active', item.dataset.comicName === comicName);
        });
        
        // Load comic for current date
        this.loadComic(this.currentDate);
    }
    
    initCalendar() {
        const calendar = document.getElementById('calendar');
        this.renderCalendar();
    }
    
    renderCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const day = this.currentDate.getDate();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        let html = `
            <div class="calendar-header">
                <button onclick="app.changeMonth(-1)" title="Previous Month">◀</button>
                <span>${monthNames[month]} ${year}</span>
                <button onclick="app.changeMonth(1)" title="Next Month">▶</button>
            </div>
            <div class="calendar-year-nav">
                <button onclick="app.changeYear(-1)" title="Previous Year">« ${year - 1}</button>
                <button onclick="app.changeYear(1)" title="Next Year">${year + 1} »</button>
            </div>
            <div class="calendar-date-input">
                <select id="year-select" onchange="app.updateDateFromSelects()">
                    ${this.generateYearOptions(year)}
                </select>
                <select id="month-select" onchange="app.updateDateFromSelects()">
                    ${this.generateMonthOptions(month)}
                </select>
                <select id="day-select" onchange="app.updateDateFromSelects()">
                    ${this.generateDayOptions(year, month, this.currentDate.getDate())}
                </select>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Su</div>
                <div class="calendar-day-header">Mo</div>
                <div class="calendar-day-header">Tu</div>
                <div class="calendar-day-header">We</div>
                <div class="calendar-day-header">Th</div>
                <div class="calendar-day-header">Fr</div>
                <div class="calendar-day-header">Sa</div>
        `;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of month
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isToday = date.getTime() === today.getTime();
            const isSelected = date.getTime() === this.currentDate.getTime();
            const isFuture = date > today;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (isFuture) classes += ' future';
            
            html += `<div class="${classes}" onclick="app.selectDate(${year}, ${month}, ${d})">${d}</div>`;
        }
        
        html += '</div>';
        calendar.innerHTML = html;
    }
    
    changeMonth(delta) {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
        this.renderCalendar();
    }
    
    changeYear(delta) {
        this.currentDate = new Date(this.currentDate.getFullYear() + delta, this.currentDate.getMonth(), 1);
        this.renderCalendar();
    }
    
    generateYearOptions(currentYear) {
        const today = new Date();
        const maxYear = today.getFullYear();
        const minYear = 1950; // Earliest comic start date
        
        let options = '';
        for (let y = maxYear; y >= minYear; y--) {
            const selected = y === currentYear ? 'selected' : '';
            options += `<option value="${y}" ${selected}>${y}</option>`;
        }
        return options;
    }
    
    generateMonthOptions(currentMonth) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let options = '';
        for (let m = 0; m < 12; m++) {
            const selected = m === currentMonth ? 'selected' : '';
            options += `<option value="${m}" ${selected}>${monthNames[m]}</option>`;
        }
        return options;
    }
    
    generateDayOptions(year, month, currentDay) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let options = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const selected = d === currentDay ? 'selected' : '';
            options += `<option value="${d}" ${selected}>${d}</option>`;
        }
        return options;
    }
    
    updateDateFromSelects() {
        const yearSelect = document.getElementById('year-select');
        const monthSelect = document.getElementById('month-select');
        const daySelect = document.getElementById('day-select');
        
        if (!yearSelect || !monthSelect || !daySelect) return;
        
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        let day = parseInt(daySelect.value);
        
        // Check if selected day is valid for the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (day > daysInMonth) {
            day = daysInMonth;
        }
        
        const selectedDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            this.showStatus('Cannot select future dates');
            return;
        }
        
        this.currentDate = selectedDate;
        this.renderCalendar();
        
        if (this.currentComic) {
            this.loadComic(selectedDate);
        }
    }
    
    selectDate(year, month, day) {
        const date = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) {
            this.showStatus('Cannot select future dates');
            return;
        }
        
        this.currentDate = date;
        this.renderCalendar();
        
        if (this.currentComic) {
            this.loadComic(date);
        }
    }
    
    async loadComic(date, retryCount = 0, searchDirection = null) {
        if (!this.currentComic || this.isLoading) return;
        
        // Check if date is before comic's earliest date
        const earliestDate = new Date(this.currentComic.earliestDate);
        if (date < earliestDate) {
            // Automatically go to the first available date instead of showing error
            this.currentDate = earliestDate;
            this.renderCalendar();
            date = earliestDate;
        }
        
        this.isLoading = true;
        this.showStatus(`Loading ${this.currentComic.displayName}...`);
        
        const dateStr = this.formatDateForUrl(date);
        const pageUrl = `${this.currentComic.baseUrl}/${dateStr}`;
        
        try {
            // Use PHP proxy
            const proxyUrl = `fetch-comic.php?url=${encodeURIComponent(pageUrl)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data.success && data.imageUrl) {
                // Use the actual comic date if provided, otherwise use requested date
                const actualDate = data.comicDate ? new Date(data.comicDate) : date;
                this.displayComic(data.imageUrl, actualDate);
                this.isLoading = false;
                // Re-render calendar to highlight the correct day
                this.renderCalendar();
                return true;
            }
            
            // Comic not available - if we're in auto-search mode, try next date
            if (searchDirection && retryCount < this.maxRetries) {
                this.isLoading = false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + searchDirection);
                
                // Check bounds
                if (searchDirection > 0 && nextDate > today) {
                    this.showStatus('Reached today - no comic available');
                    return false;
                }
                if (searchDirection < 0 && nextDate < earliestDate) {
                    this.showStatus('Reached comic start date - no comic available');
                    return false;
                }
                
                // Update calendar and try next date
                this.currentDate = nextDate;
                this.renderCalendar();
                return await this.loadComic(nextDate, retryCount + 1, searchDirection);
            }
            
            throw new Error(data.error || 'Failed to fetch comic');
            
        } catch (error) {
            console.error('Error loading comic:', error);
            this.isLoading = false;
            
            // If not in auto-search mode, show error
            if (!searchDirection) {
                this.showError(`Comic not available for ${this.formatDate(date)}`);
            }
            return false;
        }
    }
    
    displayComic(imageUrl, date) {
        // Ensure currentDate matches the comic being displayed
        this.currentDate = new Date(date);
        this.currentDate.setHours(0, 0, 0, 0);
        
        // Check if this comic has a custom scale factor
        const comic = COMICS_DATA.find(c => c.name === this.currentComic.name);
        const scaleStyle = (comic && comic.scale) ? `style="max-width: ${comic.scale * 100}%;"` : '';
        
        const viewer = document.getElementById('comic-viewer');
        viewer.innerHTML = `
            <div class="comic-info">
                <h2>${this.currentComic.displayName}</h2>
                <p>${this.formatDate(date)} - ${this.currentComic.author}</p>
            </div>
            <div class="comic-image-container">
                <img src="${imageUrl}" alt="${this.currentComic.displayName}" 
                     ${scaleStyle}
                     onload="app.adjustImageSize(this)"
                     onerror="app.handleImageError()">
            </div>
        `;
        this.showStatus(`${this.currentComic.displayName} - ${this.formatDate(date)}`);
    }
    
    adjustImageSize(img) {
        // Get the center panel width
        const centerPanel = document.getElementById('center-panel');
        const centerWidth = centerPanel.offsetWidth - 40; // Subtract padding
        
        // Get the natural image dimensions
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        // Check if this comic has a custom scale factor
        const comic = COMICS_DATA.find(c => c.name === this.currentComic.name);
        if (comic && comic.scale) {
            // Scale is already applied via inline style, just ensure it stays
            if (naturalWidth > 1500 && naturalHeight > 1800) {
                // Image is large, keep the scale
                return;
            } else {
                // Image is small, remove the scale restriction
                img.style.maxWidth = '100%';
                return;
            }
        }
        
        // If both dimensions are less than 500, scale up to at least 500 (preserving aspect ratio)
        if (naturalWidth < 500 && naturalHeight < 500 && naturalWidth > 0 && naturalHeight > 0) {
            const aspectRatio = naturalWidth / naturalHeight;
            if (aspectRatio >= 1) {
                // Landscape or square - scale based on width
                img.style.width = '500px';
                img.style.height = 'auto';
            } else {
                // Portrait - scale based on height
                img.style.width = 'auto';
                img.style.height = '500px';
            }
            img.style.maxWidth = '100%';
            img.style.maxHeight = 'none';
            return;
        }
        
        // Don't scale up if image is taller than it is wide (portrait orientation)
        if (naturalHeight > naturalWidth) {
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            img.style.maxHeight = 'none';
            return;
        }
        
        // Only apply min-width if:
        // 1. Center panel is wider than 900px
        // 2. Image natural width is less than 900px
        // 3. Image is landscape (width >= height)
        if (centerWidth > 900 && naturalWidth < 900 && naturalWidth > 0) {
            img.style.width = '900px';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            img.style.maxHeight = 'none';
        } else {
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            img.style.maxHeight = 'none';
        }
    }
    
    displayComicLink(pageUrl, date) {
        const viewer = document.getElementById('comic-viewer');
        viewer.innerHTML = `
            <div class="comic-info">
                <h2>${this.currentComic.displayName}</h2>
                <p>${this.formatDate(date)} - ${this.currentComic.author}</p>
            </div>
            <div class="comic-iframe-container">
                <iframe src="${pageUrl}" 
                        title="${this.currentComic.displayName}"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        onload="app.handleIframeLoad()"
                        onerror="app.handleIframeError()">
                </iframe>
                <div class="comic-link-fallback">
                    <p>If the comic doesn't load above, <a href="${pageUrl}" target="_blank">click here to open it in a new tab</a></p>
                </div>
            </div>
        `;
        this.showStatus(`${this.currentComic.displayName} - ${this.formatDate(date)}`);
    }
    
    handleIframeLoad() {
        this.showStatus('Comic loaded');
    }
    
    handleIframeError() {
        this.showError('Failed to load comic in frame. Click the link to open in a new tab.');
    }
    
    handleImageError() {
        this.showError('Failed to load comic image. The comic may not be available for this date.');
    }
    
    showError(message) {
        const viewer = document.getElementById('comic-viewer');
        viewer.innerHTML = `
            <div class="error-message">
                <h3>⚠️ ${message}</h3>
                <p>Try selecting a different date or comic.</p>
            </div>
        `;
        this.showStatus(message);
    }
    
    showStatus(message) {
        document.getElementById('status').textContent = message;
    }
    
    goToFirst() {
        if (!this.currentComic) return;
        const earliestDate = new Date(this.currentComic.earliestDate);
        this.currentDate = earliestDate;
        this.renderCalendar();
        this.loadComic(earliestDate);
    }
    
    async goToPrevious() {
        if (!this.currentComic) return;
        
        const earliestDate = new Date(this.currentComic.earliestDate);
        let searchDate = new Date(this.currentDate);
        searchDate.setDate(searchDate.getDate() - 1);
        
        if (searchDate < earliestDate) {
            this.showStatus('Reached comic start date');
            return;
        }
        
        this.currentDate = searchDate;
        this.renderCalendar();
        
        // Use auto-search with direction -1 (backward)
        const success = await this.loadComic(searchDate, 0, -1);
        if (!success) {
            this.showStatus('No comic found in previous 31 days');
        }
    }
    
    async goToNext() {
        if (!this.currentComic) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let searchDate = new Date(this.currentDate);
        searchDate.setDate(searchDate.getDate() + 1);
        
        if (searchDate > today) {
            this.showStatus('Reached today');
            return;
        }
        
        this.currentDate = searchDate;
        this.renderCalendar();
        
        // Use auto-search with direction +1 (forward)
        const success = await this.loadComic(searchDate, 0, 1);
        if (!success) {
            this.showStatus('No comic found in next 31 days');
        }
    }
    
    goToToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.currentDate = today;
        this.renderCalendar();
        
        if (this.currentComic) {
            this.loadComic(today);
        }
    }
    
    async goToRandom() {
        if (!this.currentComic) return;
        
        const earliestDate = new Date(this.currentComic.earliestDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - earliestDate) / (1000 * 60 * 60 * 24));
        const randomDays = Math.floor(Math.random() * daysDiff);
        
        const randomDate = new Date(earliestDate);
        randomDate.setDate(randomDate.getDate() + randomDays);
        
        this.currentDate = randomDate;
        this.renderCalendar();
        
        // Use auto-search with direction +1 (forward) for random
        const success = await this.loadComic(randomDate, 0, 1);
        if (!success) {
            this.showStatus('No comic found near random date');
        }
    }
    
    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    formatDateForUrl(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ComicBrowser();
});
