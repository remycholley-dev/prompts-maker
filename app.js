class PromptGenerator {
    constructor() {
        this.elements = {
            role: document.getElementById('role'),
            roleSelect: document.getElementById('roleSelect'),
            context: document.getElementById('context'),
            task: document.getElementById('task'),
            constraints: document.getElementById('constraints'),
            examples: document.getElementById('examples'),
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
        this.predefinedRoles = {
            'expert-dev': 'Expert en développement logiciel avec 10 ans d\'expérience en architecture et bonnes pratiques',
            'redacteur': 'Rédacteur professionnel spécialisé en contenu marketing et communication digitale',
            'analyste': 'Analyste de données senior avec expertise en Python, machine learning et visualisation',
            'designer': 'Designer UX/UI créatif avec expertise en design systems et accessibilité',
            'marketing': 'Expert marketing digital spécialisé en stratégie de contenu et growth hacking',
            'consultant': 'Consultant business avec 15 ans d\'expérience en transformation digitale'
        };

        this.fieldLabels = {
            role: '🎭 Rôle / Persona',
            context: '📋 Contexte',
            task: '🎯 Tâche principale',
            constraints: '⚙️ Contraintes & Spécifications',
            examples: '💡 Exemples'
        };

        this.templates = {
            code: {
                role: "Expert en développement logiciel avec 10 ans d'expérience",
                context: "Je travaille sur un projet d'application web moderne utilisant React et TypeScript",
                task: "Aide-moi à créer un composant React réutilisable pour gérer l'authentification des utilisateurs",
                constraints: "Le code doit être typé avec TypeScript, suivre les best practices React, et inclure des tests unitaires",
                examples: "Le composant doit gérer la connexion, la déconnexion et la vérification du statut d'authentification"
            },
            writing: {
                role: "Rédacteur professionnel spécialisé en contenu marketing",
                context: "Notre entreprise lance un nouveau produit SaaS pour la gestion de projet",
                task: "Rédige un article de blog de 800 mots sur les bénéfices de notre solution",
                constraints: "Ton professionnel mais accessible, optimisé SEO, avec 3 sections principales",
                examples: "Inclure des statistiques sur la productivité et des témoignages clients"
            },
            analysis: {
                role: "Analyste de données senior avec expertise en Python et machine learning",
                context: "J'ai un dataset de ventes e-commerce avec 100k lignes",
                task: "Analyse les tendances de vente et identifie les facteurs clés de succès",
                constraints: "Utilise pandas et scikit-learn, fournis des visualisations claires",
                examples: "Graphiques de tendances mensuelles, corrélations entre variables, prédictions"
            },
            creative: {
                role: "Designer UX/UI créatif avec expertise en design systems",
                context: "Application mobile de fitness pour jeunes adultes",
                task: "Conçois une interface utilisateur moderne et engageante",
                constraints: "Design minimaliste, palette de couleurs énergique, accessible WCAG AA",
                examples: "Dashboard de progression, écrans d'exercices, système de gamification"
            }
        };

        this.init();
    }

    init() {
        this.attachEventListeners();
        this.setupDragAndDrop();
        this.setupRoleSelector();
        this.updatePreview();
        this.updateScore();
    }

    attachEventListeners() {
        // Mise à jour en temps réel pour les éléments dans la structure uniquement
        Object.values(this.elements).forEach(element => {
            if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                element.addEventListener('input', () => {
                    // Seulement mettre à jour si on a des éléments dans la structure
                    if (this.promptItems.length > 0) {
                        this.updatePromptStructure();
                        this.updatePreview();
                        this.updateScore();
                    }
                });
            }
        });

        // Tabs de format
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFormat = e.target.dataset.format;
                this.updatePreview();
            });
        });

        // Boutons d'export
        document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('exportTxtBtn').addEventListener('click', () => this.exportAs('txt'));
        document.getElementById('exportMdBtn').addEventListener('click', () => this.exportAs('md'));
        document.getElementById('exportXmlBtn').addEventListener('click', () => this.exportAs('xml'));

        // Templates
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = this.templates[e.target.dataset.template];
                if (template) {
                    this.applyTemplate(template);
                }
            });
        });
    }

    setupRoleSelector() {
        this.elements.roleSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            if (selectedValue && selectedValue !== 'custom') {
                if (this.predefinedRoles[selectedValue]) {
                    this.elements.role.value = this.predefinedRoles[selectedValue];
                }
            } else if (selectedValue === 'custom') {
                this.elements.role.value = '';
                this.elements.role.focus();
            }
            // Seulement mettre à jour si le rôle est dans la structure
            if (this.promptItems.find(item => item.type === 'role')) {
                this.updatePromptStructure();
                this.updatePreview();
                this.updateScore();
            }
        });
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
        // Éviter les doublons
        if (this.promptItems.find(item => item.type === fieldType)) {
            this.showNotification('Ce champ est déjà dans le prompt', 'warning');
            return;
        }

        const fieldValue = this.elements[fieldType]?.value.trim();
        if (!fieldValue) {
            this.showNotification('Le champ est vide', 'warning');
            return;
        }

        const promptItem = {
            type: fieldType,
            label: this.fieldLabels[fieldType],
            value: fieldValue,
            id: Date.now()
        };

        this.promptItems.push(promptItem);
        this.renderPromptStructure();
        this.updatePreview();
        this.updateScore();
        this.showNotification('Champ ajouté au prompt', 'success');
    }

    removeFieldFromPrompt(itemId) {
        this.promptItems = this.promptItems.filter(item => item.id !== itemId);
        this.renderPromptStructure();
        this.updatePreview();
        this.updateScore();
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
            <div class="prompt-item" data-id="${item.id}">
                <div class="prompt-item-header">
                    <span class="prompt-item-title">${item.label}</span>
                    <div class="prompt-item-actions">
                        <button class="remove-btn" onclick="promptGenerator.removeFieldFromPrompt(${item.id})">
                            ✕
                        </button>
                    </div>
                </div>
                <div class="prompt-item-content">${item.value}</div>
            </div>
        `).join('') + `
            <div class="drop-placeholder-bottom">
                <p>🎯 Glissez et déposez d'autres éléments ici pour compléter votre prompt</p>
            </div>
        `;
    }

    updatePromptStructure() {
        // Mettre à jour les valeurs dans la structure existante
        let hasChanged = false;
        this.promptItems.forEach(item => {
            const currentValue = this.elements[item.type]?.value.trim() || '';
            if (currentValue !== item.value) {
                item.value = currentValue;
                hasChanged = true;
            }
        });
        
        if (hasChanged && this.promptItems.length > 0) {
            this.renderPromptStructure();
        }
    }

    applyTemplate(template) {
        this.elements.role.value = template.role;
        this.elements.context.value = template.context;
        this.elements.task.value = template.task;
        this.elements.constraints.value = template.constraints;
        this.elements.examples.value = template.examples;
        
        // Les templates ne mettent à jour la preview/score que si des éléments sont droppés
        if (this.promptItems.length > 0) {
            this.updatePromptStructure();
            this.updatePreview();
            this.updateScore();
        }
    }

    getPromptData() {
        return {
            role: this.elements.role.value.trim(),
            context: this.elements.context.value.trim(),
            task: this.elements.task.value.trim(),
            constraints: this.elements.constraints.value.trim(),
            examples: this.elements.examples.value.trim()
        };
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
        let prompt = '';
        
        if (data.role) {
            prompt += `Rôle: ${data.role}\n\n`;
        }
        
        if (data.context) {
            prompt += `Contexte: ${data.context}\n\n`;
        }
        
        prompt += `Tâche: ${data.task}\n\n`;
        
        if (data.constraints) {
            prompt += `Contraintes: ${data.constraints}\n\n`;
        }
        
        if (data.examples) {
            prompt += `Exemples: ${data.examples}`;
        }
        
        return prompt.trim();
    }

    generateMarkdownPrompt(data) {
        let prompt = '# Prompt IA\n\n';
        
        if (data.role) {
            prompt += `## 🎭 Rôle\n${data.role}\n\n`;
        }
        
        if (data.context) {
            prompt += `## 📋 Contexte\n${data.context}\n\n`;
        }
        
        prompt += `## 🎯 Tâche\n${data.task}\n\n`;
        
        if (data.constraints) {
            prompt += `## ⚙️ Contraintes\n${data.constraints}\n\n`;
        }
        
        if (data.examples) {
            prompt += `## 💡 Exemples\n${data.examples}`;
        }
        
        return prompt.trim();
    }

    generateXmlPrompt(data) {
        let prompt = '<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n';
        
        if (data.role) {
            prompt += `  <role>${this.escapeXml(data.role)}</role>\n`;
        }
        
        if (data.context) {
            prompt += `  <context>${this.escapeXml(data.context)}</context>\n`;
        }
        
        prompt += `  <task>${this.escapeXml(data.task)}</task>\n`;
        
        if (data.constraints) {
            prompt += `  <constraints>${this.escapeXml(data.constraints)}</constraints>\n`;
        }
        
        if (data.examples) {
            prompt += `  <examples>${this.escapeXml(data.examples)}</examples>\n`;
        }
        
        prompt += '</prompt>';
        
        return prompt;
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
            this.showNotification('Aucun prompt à copier !', 'error');
            return;
        }

        navigator.clipboard.writeText(prompt).then(() => {
            this.showNotification('Prompt copié dans le presse-papier !', 'success');
        }).catch(() => {
            this.showNotification('Erreur lors de la copie', 'error');
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
            this.showNotification('Aucun prompt à exporter !', 'error');
            return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`Prompt exporté en ${format.toUpperCase()} !`, 'success');
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