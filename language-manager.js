class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('prompt-generator-lang') || 'fr';
        this.translations = {};
        this.callbacks = [];
    }

    async init() {
        try {
            const response = await fetch('translations.json');
            this.translations = await response.json();
            this.updateLanguage();
            return true;
        } catch (error) {
            console.error('Erreur lors du chargement des traductions:', error);
            return false;
        }
    }

    // S'abonner aux changements de langue
    subscribe(callback) {
        this.callbacks.push(callback);
    }

    // Notifier les abonnés
    notifyCallbacks() {
        this.callbacks.forEach(callback => callback(this.currentLanguage, this.translations[this.currentLanguage]));
    }

    // Changer de langue
    switchLanguage(lang) {
        if (lang !== this.currentLanguage && this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('prompt-generator-lang', lang);
            
            // Mettre à jour l'état des boutons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
            
            this.updateLanguage();
            this.notifyCallbacks();
            
            // Notification
            this.showNotification(
                this.t('languageChanged'),
                'success'
            );
        }
    }

    // Obtenir une traduction
    t(key, lang = null) {
        const language = lang || this.currentLanguage;
        const translations = this.translations[language];
        
        if (!translations) return key;
        
        // Support pour les clés imbriquées (ex: "fieldLabels.role")
        const keys = key.split('.');
        let result = translations;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key; // Retourner la clé si la traduction n'existe pas
            }
        }
        
        return result;
    }

    // Mettre à jour l'interface
    updateLanguage() {
        if (!this.translations[this.currentLanguage]) return;
        
        const t = this.translations[this.currentLanguage];
        
        // Mettre à jour tous les éléments avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.t(key);
            if (translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Mettre à jour l'état des boutons de langue
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
        
        // Mettre à jour les éléments spécifiques
        this.updateInterfaceTexts(t);
    }

    updateInterfaceTexts(t) {
        // Placeholder de la drop zone
        const dropPlaceholder = document.querySelector('.drop-placeholder p');
        if (dropPlaceholder) {
            dropPlaceholder.textContent = t.dropPlaceholder;
        }
        
        const dropHint = document.querySelector('.drop-hint');
        if (dropHint) {
            dropHint.textContent = t.dropHint;
        }
        
        const dropPlaceholderBottom = document.querySelector('.drop-placeholder-bottom p');
        if (dropPlaceholderBottom) {
            dropPlaceholderBottom.textContent = t.dropPlaceholderBottom;
        }
        
        // État vide de prévisualisation
        const emptyState = document.querySelector('.preview-content .empty-state');
        if (emptyState) {
            emptyState.textContent = t.emptyPreview;
        }
        
        // Footer
        const footer = document.querySelector('footer p');
        if (footer) {
            footer.textContent = t.footer;
        }

        // Mettre à jour les noms des templates
        document.querySelectorAll('.template-btn').forEach(btn => {
            const templateKey = btn.dataset.template;
            const templateName = this.t(`templateNames.${templateKey}`);
            if (templateName !== `templateNames.${templateKey}`) {
                btn.textContent = templateName;
            }
        });
    }

    // Afficher une notification
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

    // Initialiser les event listeners
    attachEventListeners() {
        // Sélecteur de langue
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                if (lang !== this.currentLanguage) {
                    this.switchLanguage(lang);
                }
            });
        });
    }
}

// Instance globale
const languageManager = new LanguageManager();