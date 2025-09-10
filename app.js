class PromptGenerator {
    constructor() {
        this.elements = {
            previewContent: document.getElementById('previewContent'),
            dropZone: document.getElementById('dropZone'),
            promptStructure: document.getElementById('promptStructure'),
            totalScore: document.getElementById('totalScore'),
            clarityScore: document.getElementById('clarityScore'),
            clarityValue: document.getElementById('clarityValue'),
            specificityScore: document.getElementById('specificityScore'),
            specificityValue: document.getElementById('specificityValue'),
            contextScore: document.getElementById('contextScore'),
            contextValue: document.getElementById('contextValue'),
            structureScore: document.getElementById('structureScore'),
            structureValue: document.getElementById('structureValue')
        };

        this.currentFormat = 'text';
        this.promptItems = [];
        
        


        this.currentPage = 'home';
        this.init();
    }

    async init() {
        // Initialiser le gestionnaire de langue
        await languageManager.init();
        languageManager.attachEventListeners();
        
        // S'abonner aux changements de langue
        languageManager.subscribe((lang, translations) => {
            this.onLanguageChange(lang, translations);
        });
        
        this.attachEventListeners();
        this.setupDragAndDrop();
        this.updatePreview();
        this.updateScore();
    }

    attachEventListeners() {
        // Les event listeners pour les champs sont maintenant gérés dynamiquement
        // dans renderPromptStructure via les attributs onclick et oninput

        // Tabs de format
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFormat = e.target.dataset.format;
                this.updatePreview();
            });
        });

        // Boutons d'export et sauvegarde
        document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('saveBtn').addEventListener('click', () => this.savePrompt());
        document.getElementById('savesBtn').addEventListener('click', () => this.showSavesPage());
        document.getElementById('exportTxtBtn').addEventListener('click', () => this.exportAs('txt'));
        document.getElementById('exportMdBtn').addEventListener('click', () => this.exportAs('md'));
        document.getElementById('exportXmlBtn').addEventListener('click', () => this.exportAs('xml'));

        // Templates
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateType = e.target.dataset.template;
                if (templateType) {
                    this.applyTemplate(templateType);
                }
            });
        });

    }

    // Méthodes pour mettre à jour les valeurs des éléments dans la structure
    updateItemValue(itemId, value) {
        const item = this.promptItems.find(item => item.id == itemId);
        if (item) {
            item.value = value;
            this.updatePreview();
            this.updateScore();
        }
    }
    
    updateItemFromSelect(itemId, selectedValue) {
        const item = this.promptItems.find(item => item.id == itemId);
        if (item && item.type === 'role') {
            if (selectedValue && selectedValue !== 'custom') {
                const predefinedRoles = languageManager.t('predefinedRoles');
                if (predefinedRoles[selectedValue]) {
                    item.value = predefinedRoles[selectedValue];
                    // Mettre à jour aussi l'input text
                    const inputField = document.querySelector(`[data-prompt-id="${itemId}"] input`);
                    if (inputField) inputField.value = item.value;
                }
            } else if (selectedValue === 'custom') {
                item.value = '';
                const inputField = document.querySelector(`[data-prompt-id="${itemId}"] input`);
                if (inputField) {
                    inputField.value = '';
                    inputField.focus();
                }
            }
            this.updatePreview();
            this.updateScore();
        }
    }

    setupDragAndDrop() {
        const draggableFields = document.querySelectorAll('.draggable-field');
        const dropZone = this.elements.dropZone;

        draggableFields.forEach(field => {
            field.addEventListener('dragstart', (e) => {
                field.classList.add('dragging');
                e.dataTransfer.setData('text/plain', field.dataset.field);
                e.dataTransfer.effectAllowed = 'copy';
            });

            field.addEventListener('dragend', () => {
                field.classList.remove('dragging');
            });
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            dropZone.parentElement.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.parentElement.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.parentElement.classList.remove('drag-over');
            
            const fieldType = e.dataTransfer.getData('text/plain');
            this.addFieldToPrompt(fieldType);
        });
    }

    addFieldToPrompt(fieldType) {
        // Permettre les doublons - créer un nouvel élément vide
        const promptItem = {
            type: fieldType,
            label: languageManager.t(`fieldLabels.${fieldType}`),
            value: '', // Commencer avec une valeur vide
            id: Date.now() + Math.random(), // ID unique même pour les doublons
            placeholder: languageManager.t(`fieldPlaceholders.${fieldType}`)
        };

        this.promptItems.push(promptItem);
        this.renderPromptStructure();
        this.updatePreview();
        this.updateScore();
        languageManager.showNotification(languageManager.t('elementAdded'), 'success');
        
        // Focus sur le nouveau champ
        setTimeout(() => {
            const newField = document.querySelector(`[data-prompt-id="${promptItem.id}"] input, [data-prompt-id="${promptItem.id}"] textarea, [data-prompt-id="${promptItem.id}"] select`);
            if (newField) newField.focus();
        }, 100);
    }

    removeFieldFromPrompt(itemId) {
        this.promptItems = this.promptItems.filter(item => item.id != itemId);
        this.renderPromptStructure();
        this.updatePreview();
        this.updateScore();
    }

    generateFieldHTML(item) {
        if (item.type === 'role') {
            const predefinedRoles = languageManager.t('predefinedRoles');
            const roleOptions = languageManager.t('roleOptions');
            
            return `
                <div class="field-input-group">
                    <select class="role-selector" onchange="promptGenerator.updateItemFromSelect('${item.id}', this.value)">
                        <option value="">${roleOptions.selectRole}</option>
                        <option value="expert-dev" ${item.value === predefinedRoles['expert-dev'] ? 'selected' : ''}>${roleOptions['expert-dev']}</option>
                        <option value="redacteur" ${item.value === predefinedRoles['redacteur'] ? 'selected' : ''}>${roleOptions['redacteur']}</option>
                        <option value="analyste" ${item.value === predefinedRoles['analyste'] ? 'selected' : ''}>${roleOptions['analyste']}</option>
                        <option value="designer" ${item.value === predefinedRoles['designer'] ? 'selected' : ''}>${roleOptions['designer']}</option>
                        <option value="marketing" ${item.value === predefinedRoles['marketing'] ? 'selected' : ''}>${roleOptions['marketing']}</option>
                        <option value="consultant" ${item.value === predefinedRoles['consultant'] ? 'selected' : ''}>${roleOptions['consultant']}</option>
                        <option value="custom">${roleOptions.custom}</option>
                    </select>
                    <input type="text" value="${item.value || ''}" placeholder="${item.placeholder}" 
                           oninput="promptGenerator.updateItemValue('${item.id}', this.value)">
                </div>`;
        } else {
            let rows = 3;
            if (item.type === 'task') rows = 4;
            else if (item.type === 'methodology' || item.type === 'success') rows = 4;
            else if (item.type === 'sources' || item.type === 'exclusions') rows = 3;
            else if (item.type === 'format' || item.type === 'audience' || item.type === 'tone' || item.type === 'urgency') rows = 2;
            return `
                <div class="field-input-group">
                    <textarea rows="${rows}" placeholder="${item.placeholder}" 
                              oninput="promptGenerator.updateItemValue('${item.id}', this.value)">${item.value || ''}</textarea>
                </div>`;
        }
    }

    renderPromptStructure() {
        const structure = this.elements.promptStructure;
        
        if (this.promptItems.length === 0) {
            structure.className = 'prompt-structure';
            structure.innerHTML = '';
            return;
        }

        structure.className = 'prompt-structure has-items';
        structure.innerHTML = this.promptItems.map(item => `
            <div class="prompt-item" data-id="${item.id}" data-prompt-id="${item.id}">
                <div class="prompt-item-header">
                    <span class="prompt-item-title">${item.label}</span>
                    <div class="prompt-item-actions">
                        <button class="remove-btn" onclick="promptGenerator.removeFieldFromPrompt('${item.id}')">
                            ✕
                        </button>
                    </div>
                </div>
                <div class="prompt-item-content-editable">
                    ${this.generateFieldHTML(item)}
                </div>
            </div>
        `).join('') + `
            <div class="drop-placeholder-bottom">
                <p>🎯 Glissez et déposez d'autres éléments ici pour compléter votre prompt</p>
            </div>
        `;
    }

    updatePromptStructure() {
        // Cette fonction n'est plus nécessaire car les valeurs sont mises à jour directement
        // via updateItemValue() lors des changements d'input
    }

    applyTemplate(templateType) {
        // Récupérer le template traduit
        const template = languageManager.t(`templates.${templateType}`);
        if (typeof template !== 'object') return;
        
        // Vider les éléments existants
        this.promptItems = [];
        
        // Ajouter tous les champs définis dans le template dans un ordre logique
        const fieldOrder = ['role', 'context', 'task', 'constraints', 'examples', 'format', 'audience', 'methodology', 'sources', 'exclusions', 'success', 'urgency', 'tone'];
        
        fieldOrder.forEach(fieldType => {
            if (template[fieldType]) {
                this.addFieldToPromptWithValue(fieldType, template[fieldType]);
            }
        });
    }
    
    addFieldToPromptWithValue(fieldType, value) {
        const promptItem = {
            type: fieldType,
            label: languageManager.t(`fieldLabels.${fieldType}`),
            value: value,
            id: Date.now() + Math.random(),
            placeholder: languageManager.t(`fieldPlaceholders.${fieldType}`)
        };

        this.promptItems.push(promptItem);
        this.renderPromptStructure();
        this.updatePreview();
        this.updateScore();
    }

    getPromptData() {
        // Cette fonction n'est plus utilisée car on utilise directement promptItems
        return {};
    }

    generatePrompt(format = 'text') {
        // Utiliser UNIQUEMENT les éléments droppés dans la structure
        if (this.promptItems.length > 0) {
            return this.generatePromptFromStructure(format);
        }
        
        // Si aucun élément n'est droppé, retourner vide
        return '';
    }

    generatePromptFromStructure(format = 'text') {
        if (this.promptItems.length === 0) return '';
        
        switch (format) {
            case 'text':
                return this.promptItems.map(item => {
                    const label = item.label.replace(/[🎭📋🎯⚙️💡]/g, '').trim();
                    return `${label}: ${item.value}`;
                }).join('\n\n');
                
            case 'markdown':
                let markdown = '# Prompt IA\n\n';
                markdown += this.promptItems.map(item => {
                    return `## ${item.label}\n${item.value}`;
                }).join('\n\n');
                return markdown;
                
            case 'xml':
                let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n';
                xml += this.promptItems.map(item => {
                    const tag = item.type;
                    return `  <${tag}>${this.escapeXml(item.value)}</${tag}>`;
                }).join('\n');
                xml += '\n</prompt>';
                return xml;
                
            default:
                return this.generatePromptFromStructure('text');
        }
    }

    generateTextPrompt(data) {
        // Ancienne méthode - plus utilisée
        return '';
    }

    generateMarkdownPrompt(data) {
        // Ancienne méthode - plus utilisée
        return '';
    }

    generateXmlPrompt(data) {
        // Ancienne méthode - plus utilisée
        return '';
    }

    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    updatePreview() {
        const prompt = this.generatePrompt(this.currentFormat);
        
        if (prompt) {
            this.elements.previewContent.textContent = prompt;
        } else {
            this.elements.previewContent.innerHTML = '<p class="empty-state">Glissez et déposez des éléments dans la zone de composition pour voir votre prompt...</p>';
        }
    }

    calculateScore() {
        // Calculer le score UNIQUEMENT sur les éléments droppés
        if (this.promptItems.length === 0) {
            return {
                clarity: 0,
                specificity: 0,
                context: 0,
                structure: 0
            };
        }

        const scores = {
            clarity: 0,
            specificity: 0,
            context: 0,
            structure: 0
        };

        // Score de clarté (0-25) - basé sur la tâche si elle est présente
        const taskItem = this.promptItems.find(item => item.type === 'task');
        if (taskItem && taskItem.value) {
            const taskWords = taskItem.value.split(' ').length;
            scores.clarity = Math.min(25, (taskWords / 20) * 25);
            
            // Bonus pour mots clés de clarté
            const clarityKeywords = ['précisément', 'spécifiquement', 'exactement', 'clairement'];
            if (clarityKeywords.some(keyword => taskItem.value.toLowerCase().includes(keyword))) {
                scores.clarity = Math.min(25, scores.clarity + 5);
            }
        }

        // Score de spécificité (0-25)
        const roleItem = this.promptItems.find(item => item.type === 'role');
        if (roleItem && roleItem.value) {
            scores.specificity += 10;
        }
        
        const constraintsItem = this.promptItems.find(item => item.type === 'constraints');
        if (constraintsItem && constraintsItem.value) {
            const constraintWords = constraintsItem.value.split(' ').length;
            scores.specificity += Math.min(15, (constraintWords / 15) * 15);
        }

        // Score de contexte (0-25)
        const contextItem = this.promptItems.find(item => item.type === 'context');
        if (contextItem && contextItem.value) {
            const contextWords = contextItem.value.split(' ').length;
            scores.context = Math.min(25, (contextWords / 15) * 25);
        }

        // Score de structure (0-25) - basé sur le nombre d'éléments droppés
        scores.structure = (this.promptItems.length / 5) * 25;

        return scores;
    }

    updateScore() {
        const scores = this.calculateScore();
        const total = Math.round(scores.clarity + scores.specificity + scores.context + scores.structure);

        // Animation du score total
        this.animateValue(this.elements.totalScore, parseInt(this.elements.totalScore.textContent) || 0, total, 500);

        // Mise à jour des barres de score
        this.updateScoreBar('clarity', scores.clarity);
        this.updateScoreBar('specificity', scores.specificity);
        this.updateScoreBar('context', scores.context);
        this.updateScoreBar('structure', scores.structure);

        // Couleur du score total selon la valeur
        const scoreCircle = document.querySelector('.score-circle');
        if (total >= 80) {
            scoreCircle.style.color = 'var(--success)';
        } else if (total >= 60) {
            scoreCircle.style.color = 'var(--warning)';
        } else {
            scoreCircle.style.color = 'var(--danger)';
        }
    }

    updateScoreBar(type, value) {
        const bar = this.elements[`${type}Score`];
        const valueElement = this.elements[`${type}Value`];
        
        if (bar && valueElement) {
            bar.style.width = `${(value / 25) * 100}%`;
            valueElement.textContent = Math.round(value);
            
            // Couleur selon le score
            if (value >= 20) {
                bar.style.background = 'linear-gradient(90deg, var(--success) 0%, #34d399 100%)';
            } else if (value >= 15) {
                bar.style.background = 'linear-gradient(90deg, var(--warning) 0%, #fbbf24 100%)';
            } else {
                bar.style.background = 'linear-gradient(90deg, var(--danger) 0%, #f87171 100%)';
            }
        }
    }

    animateValue(element, start, end, duration) {
        // Arrêter l'animation précédente si elle existe
        if (element.animationTimer) {
            clearInterval(element.animationTimer);
        }
        
        const range = end - start;
        const increment = range / (duration / 10);
        let current = start;
        
        element.animationTimer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                clearInterval(element.animationTimer);
                delete element.animationTimer;
                element.textContent = Math.round(end);
            } else {
                element.textContent = Math.round(current);
            }
        }, 10);
    }

    copyToClipboard() {
        const prompt = this.generatePrompt(this.currentFormat);
        
        if (!prompt) {
            languageManager.showNotification(languageManager.t('noPromptToCopy'), 'error');
            return;
        }

        navigator.clipboard.writeText(prompt).then(() => {
            languageManager.showNotification(languageManager.t('promptCopied'), 'success');
        }).catch(() => {
            languageManager.showNotification(languageManager.t('copyError'), 'error');
        });
    }

    exportAs(format) {
        let content, filename, mimeType;
        
        switch (format) {
            case 'txt':
                content = this.generatePrompt('text');
                filename = 'prompt.txt';
                mimeType = 'text/plain';
                break;
            case 'md':
                content = this.generatePrompt('markdown');
                filename = 'prompt.md';
                mimeType = 'text/markdown';
                break;
            case 'xml':
                content = this.generatePrompt('xml');
                filename = 'prompt.xml';
                mimeType = 'application/xml';
                break;
        }
        
        if (!content) {
            languageManager.showNotification(languageManager.t('noPromptToExport'), 'error');
            return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        languageManager.showNotification(`${languageManager.t('promptExported')} ${format.toUpperCase()} !`, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const bgColor = type === 'success' ? 'var(--success)' : 
                       type === 'error' ? 'var(--danger)' : 
                       type === 'warning' ? 'var(--warning)' : 'var(--primary)';
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Méthodes de sauvegarde et chargement
    savePrompt() {
        if (this.promptItems.length === 0) {
            languageManager.showNotification(languageManager.t('noPromptToSave'), 'error');
            return;
        }

        const promptName = prompt(languageManager.t('saveNamePrompt'), `${languageManager.t('defaultSaveName')} ${new Date().toLocaleDateString()}`);
        if (!promptName) return;

        const savedPrompt = {
            id: Date.now(),
            name: promptName,
            items: this.promptItems,
            createdAt: new Date().toISOString(),
            previewText: this.generatePrompt('text').substring(0, 150) + '...'
        };

        const savedPrompts = this.getSavedPrompts();
        savedPrompts.push(savedPrompt);
        localStorage.setItem('prompt-generator-saves', JSON.stringify(savedPrompts));
        
        languageManager.showNotification(`${languageManager.t('promptSaved')} "${promptName}"`, 'success');
    }

    getSavedPrompts() {
        const saved = localStorage.getItem('prompt-generator-saves');
        return saved ? JSON.parse(saved) : [];
    }

    loadSavedPrompt(promptId) {
        const savedPrompts = this.getSavedPrompts();
        const prompt = savedPrompts.find(p => p.id === promptId);
        
        if (prompt) {
            this.promptItems = prompt.items;
            this.renderPromptStructure();
            this.updatePreview();
            this.updateScore();
            this.showHomePage();
            languageManager.showNotification(`${languageManager.t('promptLoaded')} "${prompt.name}"`, 'success');
        }
    }

    deleteSavedPrompt(promptId) {
        const savedPrompts = this.getSavedPrompts();
        const updatedPrompts = savedPrompts.filter(p => p.id !== promptId);
        localStorage.setItem('prompt-generator-saves', JSON.stringify(updatedPrompts));
        
        if (this.currentPage === 'saves') {
            this.showSavesPage();
        }
        languageManager.showNotification(languageManager.t('promptDeleted'), 'success');
    }

    // Navigation entre pages
    showHomePage() {
        this.currentPage = 'home';
        document.querySelector('.app-layout').style.display = 'flex';
        const savesPage = document.getElementById('savesPage');
        if (savesPage) savesPage.style.display = 'none';
    }

    showSavesPage() {
        this.currentPage = 'saves';
        document.querySelector('.app-layout').style.display = 'none';
        
        let savesPage = document.getElementById('savesPage');
        if (!savesPage) {
            this.createSavesPage();
            savesPage = document.getElementById('savesPage');
        }
        
        this.renderSavesPage();
        savesPage.style.display = 'block';
    }

    createSavesPage() {
        const savesPage = document.createElement('div');
        savesPage.id = 'savesPage';
        savesPage.className = 'saves-page';
        savesPage.innerHTML = `
            <header class="saves-header">
                <button class="back-btn" onclick="promptGenerator.showHomePage()">
                    ${languageManager.t('backBtn')}
                </button>
                <h1>${languageManager.t('mySaves')}</h1>
            </header>
            <main class="saves-content">
                <div id="savesList" class="saves-list"></div>
            </main>
        `;
        
        const footer = document.querySelector('footer');
        document.querySelector('.container').insertBefore(savesPage, footer);
    }

    renderSavesPage() {
        const savesList = document.getElementById('savesList');
        const savedPrompts = this.getSavedPrompts();
        
        if (savedPrompts.length === 0) {
            savesList.innerHTML = `
                <div class="empty-saves">
                    <p>${languageManager.t('noSaves')}</p>
                    <p class="empty-hint">${languageManager.t('noSavesHint')}</p>
                    <button class="btn btn-primary" onclick="promptGenerator.showHomePage()">
                        ${languageManager.t('createPrompt')}
                    </button>
                </div>
            `;
            return;
        }

        savesList.innerHTML = savedPrompts.map(prompt => `
            <div class="save-item">
                <div class="save-info">
                    <h3>${prompt.name}</h3>
                    <p class="save-date">${languageManager.t('createdOn')} ${new Date(prompt.createdAt).toLocaleString()}</p>
                    <p class="save-preview">${prompt.previewText}</p>
                </div>
                <div class="save-actions">
                    <button class="btn btn-secondary" onclick="promptGenerator.loadSavedPrompt(${prompt.id})">
                        ${languageManager.t('editBtn')}
                    </button>
                    <button class="btn btn-secondary" onclick="promptGenerator.exportSavedPrompt(${prompt.id}, 'txt')">
                        📄 .txt
                    </button>
                    <button class="btn btn-secondary" onclick="promptGenerator.exportSavedPrompt(${prompt.id}, 'md')">
                        📝 .md
                    </button>
                    <button class="btn btn-danger" onclick="promptGenerator.deleteSavedPrompt(${prompt.id})">
                        ${languageManager.t('deleteBtn')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    exportSavedPrompt(promptId, format) {
        const savedPrompts = this.getSavedPrompts();
        const prompt = savedPrompts.find(p => p.id === promptId);
        
        if (!prompt) return;

        // Temporairement charger le prompt pour l'export
        const currentItems = this.promptItems;
        this.promptItems = prompt.items;
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'txt':
                content = this.generatePrompt('text');
                filename = `${prompt.name}.txt`;
                mimeType = 'text/plain';
                break;
            case 'md':
                content = this.generatePrompt('markdown');
                filename = `${prompt.name}.md`;
                mimeType = 'text/markdown';
                break;
            case 'xml':
                content = this.generatePrompt('xml');
                filename = `${prompt.name}.xml`;
                mimeType = 'application/xml';
                break;
        }

        // Restaurer l'état précédent
        this.promptItems = currentItems;

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        languageManager.showNotification(`"${prompt.name}" ${languageManager.t('promptExported')} ${format.toUpperCase()} !`, 'success');
    }

    // Callback pour les changements de langue
    onLanguageChange(lang, translations) {
        // Mettre à jour les éléments de prompt existants
        this.promptItems.forEach(item => {
            item.label = languageManager.t(`fieldLabels.${item.type}`);
            item.placeholder = languageManager.t(`fieldPlaceholders.${item.type}`);
        });
        
        // Re-render la structure si nécessaire
        if (this.promptItems.length > 0) {
            this.renderPromptStructure();
        }
        
        // Re-render la page des sauvegardes si elle est active
        if (this.currentPage === 'saves') {
            const savesList = document.getElementById('savesList');
            if (savesList) {
                this.renderSavesPage();
            }
        }
        
        // Mettre à jour le preview vide si visible
        const emptyState = document.querySelector('.preview-content .empty-state');
        if (emptyState) {
            emptyState.textContent = translations.emptyPreview;
        }
    }
}

// Animations CSS supplémentaires
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialisation
let promptGenerator;
document.addEventListener('DOMContentLoaded', () => {
    promptGenerator = new PromptGenerator();
});