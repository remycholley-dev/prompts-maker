class PromptGenerator {
    constructor() {
        this.elements = {
            role: document.getElementById('role'),
            context: document.getElementById('context'),
            task: document.getElementById('task'),
            constraints: document.getElementById('constraints'),
            examples: document.getElementById('examples'),
            previewContent: document.getElementById('previewContent'),
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
        this.updatePreview();
        this.updateScore();
    }

    attachEventListeners() {
        // Mise à jour en temps réel
        Object.values(this.elements).forEach(element => {
            if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                element.addEventListener('input', () => {
                    this.updatePreview();
                    this.updateScore();
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

    applyTemplate(template) {
        this.elements.role.value = template.role;
        this.elements.context.value = template.context;
        this.elements.task.value = template.task;
        this.elements.constraints.value = template.constraints;
        this.elements.examples.value = template.examples;
        
        this.updatePreview();
        this.updateScore();
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
        const data = this.getPromptData();
        
        if (!data.task) {
            return '';
        }

        switch (format) {
            case 'text':
                return this.generateTextPrompt(data);
            case 'markdown':
                return this.generateMarkdownPrompt(data);
            case 'xml':
                return this.generateXmlPrompt(data);
            default:
                return this.generateTextPrompt(data);
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
            this.elements.previewContent.innerHTML = '<p class="empty-state">Commencez à remplir les champs pour voir votre prompt...</p>';
        }
    }

    calculateScore() {
        const data = this.getPromptData();
        const scores = {
            clarity: 0,
            specificity: 0,
            context: 0,
            structure: 0
        };

        // Score de clarté (0-25)
        if (data.task) {
            const taskWords = data.task.split(' ').length;
            scores.clarity = Math.min(25, (taskWords / 20) * 25);
            
            // Bonus pour mots clés de clarté
            const clarityKeywords = ['précisément', 'spécifiquement', 'exactement', 'clairement'];
            if (clarityKeywords.some(keyword => data.task.toLowerCase().includes(keyword))) {
                scores.clarity = Math.min(25, scores.clarity + 5);
            }
        }

        // Score de spécificité (0-25)
        if (data.role) {
            scores.specificity += 10;
        }
        if (data.constraints) {
            const constraintWords = data.constraints.split(' ').length;
            scores.specificity += Math.min(15, (constraintWords / 15) * 15);
        }

        // Score de contexte (0-25)
        if (data.context) {
            const contextWords = data.context.split(' ').length;
            scores.context = Math.min(25, (contextWords / 15) * 25);
        }

        // Score de structure (0-25)
        let filledFields = 0;
        if (data.role) filledFields++;
        if (data.context) filledFields++;
        if (data.task) filledFields++;
        if (data.constraints) filledFields++;
        if (data.examples) filledFields++;
        
        scores.structure = (filledFields / 5) * 25;

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
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
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
document.addEventListener('DOMContentLoaded', () => {
    new PromptGenerator();
});