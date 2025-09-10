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
        
        this.predefinedRoles = {
            'expert-dev': 'Expert en développement logiciel avec 10 ans d\'expérience en architecture et bonnes pratiques',
            'redacteur': 'Rédacteur professionnel spécialisé en contenu marketing et communication digitale',
            'analyste': 'Analyste de données senior avec expertise en Python, machine learning et visualisation',
            'designer': 'Designer UX/UI créatif avec expertise en design systems et accessibilité',
            'marketing': 'Expert marketing digital spécialisé en stratégie de contenu et growth hacking',
            'consultant': 'Consultant business avec 15 ans d\'expérience en transformation digitale'
        };
        
        this.fieldPlaceholders = {
            role: 'Ex: Expert en développement web...',
            context: 'Décrivez le contexte ou la situation...',
            task: 'Décrivez précisément ce que vous attendez...',
            constraints: 'Limitations, format souhaité, ton...',
            examples: 'Donnez des exemples de résultats attendus...',
            format: 'Ex: Liste à puces, tableau, 500 mots, format JSON...',
            audience: 'Ex: Débutants, experts, grand public, étudiants...',
            methodology: 'Ex: Méthode SMART, framework Agile, analyse SWOT...',
            sources: 'Ex: Études récentes, sources académiques, données officielles...',
            exclusions: 'Ex: Ne pas mentionner X, éviter les sujets Y...',
            success: 'Ex: Actionnable, mesurable, comprend des métriques...',
            urgency: 'Ex: Priorité 1: qualité, Priorité 2: rapidité...',
            tone: 'Ex: Professionnel, décontracté, technique, pédagogique...'
        };

        this.fieldLabels = {
            role: '🎭 Rôle / Persona',
            context: '📋 Contexte',
            task: '🎯 Tâche principale',
            constraints: '⚙️ Contraintes & Spécifications',
            examples: '💡 Exemples',
            format: '🎨 Format de sortie',
            audience: '📊 Audience cible',
            methodology: '🔧 Méthodologie',
            sources: '📋 Sources & Références',
            exclusions: '🚫 Exclusions',
            success: '✅ Critères de succès',
            urgency: '⏰ Urgence/Priorités',
            tone: '🎭 Ton & Style'
        };

        this.templates = {
            code: {
                role: "Expert en développement logiciel avec 10 ans d'expérience",
                context: "Je travaille sur un projet d'application web moderne utilisant React et TypeScript",
                task: "Aide-moi à créer un composant React réutilisable pour gérer l'authentification des utilisateurs",
                constraints: "Le code doit être typé avec TypeScript, suivre les best practices React, et inclure des tests unitaires",
                examples: "Le composant doit gérer la connexion, la déconnexion et la vérification du statut d'authentification",
                format: "Code commenté avec documentation JSDoc et exemples d'utilisation",
                audience: "Développeurs React niveau intermédiaire à avancé",
                methodology: "Test-Driven Development (TDD) avec Jest et React Testing Library",
                tone: "Technique et précis, avec explications pédagogiques"
            },
            writing: {
                role: "Rédacteur professionnel spécialisé en contenu marketing",
                context: "Notre entreprise lance un nouveau produit SaaS pour la gestion de projet",
                task: "Rédige un article de blog de 800 mots sur les bénéfices de notre solution",
                constraints: "Ton professionnel mais accessible, optimisé SEO, avec 3 sections principales",
                examples: "Inclure des statistiques sur la productivité et des témoignages clients",
                format: "Article structuré avec introduction, 3 sections développées, conclusion et call-to-action",
                audience: "Chefs de projet et managers d'équipes tech",
                sources: "Études récentes sur la productivité, données internes, témoignages clients vérifiés",
                tone: "Professionnel mais engageant, accessible sans être simpliste"
            },
            analysis: {
                role: "Analyste de données senior avec expertise en Python et machine learning",
                context: "J'ai un dataset de ventes e-commerce avec 100k lignes",
                task: "Analyse les tendances de vente et identifie les facteurs clés de succès",
                constraints: "Utilise pandas et scikit-learn, fournis des visualisations claires",
                examples: "Graphiques de tendances mensuelles, corrélations entre variables, prédictions",
                format: "Rapport d'analyse avec code Python commenté et visualisations interprétées",
                audience: "Direction commerciale et équipe marketing",
                methodology: "Analyse exploratoire des données (EDA) suivie de modélisation prédictive",
                success: "Insights actionnables avec recommandations chiffrées et ROI estimé"
            },
            creative: {
                role: "Designer UX/UI créatif avec expertise en design systems",
                context: "Application mobile de fitness pour jeunes adultes",
                task: "Conçois une interface utilisateur moderne et engageante",
                constraints: "Design minimaliste, palette de couleurs énergique, accessible WCAG AA",
                examples: "Dashboard de progression, écrans d'exercices, système de gamification",
                format: "Maquettes haute-fidélité avec prototype interactif et guide de style",
                audience: "Utilisateurs 18-35 ans, actifs numériquement, motivés par la performance",
                methodology: "Design Thinking avec tests utilisateurs itératifs",
                tone: "Moderne, énergique et motivant sans être agressif"
            },
            education: {
                role: "Expert pédagogique avec 15 ans d'expérience en formation",
                context: "Je dois créer un module de formation sur la cybersécurité pour des employés non-techniques",
                task: "Développe un cours interactif de 2 heures avec exercices pratiques",
                constraints: "Langage accessible, exemples concrets, évaluations intégrées",
                examples: "Cas d'usage réels, quiz interactifs, simulations d'attaques",
                format: "Module e-learning avec vidéos, quiz interactifs et certification finale",
                audience: "Employés de bureau sans background technique, tous niveaux hiérarchiques",
                methodology: "Pédagogie active avec méthode du storytelling et apprentissage par l'exemple",
                success: "85% de réussite au quiz final et application immédiate des bonnes pratiques"
            },
            research: {
                role: "Chercheur senior spécialisé en intelligence économique",
                context: "Étude de marché pour le lancement d'une startup dans la fintech",
                task: "Analyse approfondie du secteur des paiements mobiles en Europe",
                constraints: "Sources fiables, données chiffrées récentes, analyse SWOT complète",
                examples: "Étude concurrentielle, taille de marché, tendances réglementaires",
                format: "Rapport exécutif 20 pages + annexes détaillées avec tableaux et graphiques",
                audience: "Investisseurs potentiels et équipe dirigeante de la startup",
                sources: "Rapports BCE, études PwC/McKinsey, données publiques des fintechs européennes",
                methodology: "Analyse Porter des 5 forces + étude quantitative et qualitative"
            },
            business: {
                role: "Consultant en stratégie d'entreprise avec expertise startup",
                context: "Startup B2B SaaS en recherche de financement série A",
                task: "Création d'un business plan complet pour lever 5M€",
                constraints: "Format investisseur, projections financières 5 ans, go-to-market détaillé",
                examples: "Modèle économique, stratégie d'acquisition client, roadmap produit",
                format: "Pitch deck 15 slides + business plan détaillé 30 pages",
                audience: "Fonds de venture capital et business angels spécialisés SaaS B2B",
                methodology: "Framework Lean Canvas + modèle financier bottom-up",
                success: "Valorisation claire, traction démontrée, roadmap réaliste avec milestones"
            },
            content: {
                role: "Content manager expert en social media et storytelling",
                context: "Campagne de lancement produit pour une marque lifestyle",
                task: "Stratégie de contenu multi-plateforme pour 3 mois",
                constraints: "Calendrier éditorial, formats adaptés par plateforme, engagement communauté",
                examples: "Posts Instagram, threads Twitter, vidéos TikTok, newsletter",
                format: "Calendrier éditorial détaillé + templates de contenu par plateforme",
                audience: "Millennials et Gen Z intéressés par le lifestyle et le bien-être",
                urgency: "Priorité 1: engagement authentique, Priorité 2: reach, Priorité 3: conversion",
                tone: "Authentique, inspirant et proche de la communauté"
            },
            legal: {
                role: "Juriste spécialisé en droit numérique et RGPD",
                context: "Application mobile collectant des données utilisateurs en Europe",
                task: "Rédaction d'une politique de confidentialité conforme RGPD",
                constraints: "Langage clair, conformité légale, transparence maximale",
                examples: "Gestion cookies, droits utilisateurs, transferts internationaux",
                format: "Document légal structuré avec FAQ utilisateurs en annexe",
                audience: "Utilisateurs finaux et autorités de protection des données",
                exclusions: "Éviter le jargon juridique complexe, pas de clauses abusives",
                methodology: "Audit RGPD complet selon la méthodologie CNIL"
            },
            health: {
                role: "Nutritionniste certifiée avec expertise en nutrition sportive",
                context: "Accompagnement d'un athlète amateur préparant un marathon",
                task: "Plan nutritionnel personnalisé pour optimiser les performances",
                constraints: "Scientifiquement fondé, pratique au quotidien, budget raisonnable",
                examples: "Planification repas, suppléments, hydratation, récupération",
                format: "Plan alimentaire détaillé avec menus hebdomadaires et recettes",
                audience: "Coureur amateur, homme 35 ans, objectif sub 3h30",
                exclusions: "Pas de suppléments non testés, éviter les régimes restrictifs",
                success: "Performance optimisée, récupération améliorée, poids de forme maintenu"
            },
            environment: {
                role: "Expert en développement durable et RSE",
                context: "PME industrielle souhaitant réduire son impact environnemental",
                task: "Audit environnemental et plan d'action sur 3 ans",
                constraints: "ROI démontré, conformité réglementaire, mesures concrètes",
                examples: "Réduction CO2, gestion déchets, économies d'énergie, certifications",
                format: "Rapport d'audit + roadmap avec indicateurs KPI et budget prévisionnel",
                audience: "Direction générale et responsables opérationnels",
                methodology: "Bilan carbone selon GHG Protocol + analyse cycle de vie",
                success: "Réduction 30% émissions CO2, certification ISO 14001, ROI positif an 2"
            },
            tech: {
                role: "Architecte solution cloud avec expertise DevOps",
                context: "Migration d'une application legacy vers une architecture microservices",
                task: "Conception de l'architecture cible et plan de migration",
                constraints: "Zero downtime, scalabilité, sécurité, coûts optimisés",
                examples: "Choix technologies, CI/CD, monitoring, stratégie de déploiement",
                format: "Schémas d'architecture + documentation technique + plan de migration détaillé",
                audience: "Équipe de développement et direction technique",
                methodology: "Domain-Driven Design avec approche Strangler Fig Pattern",
                urgency: "Priorité 1: sécurité, Priorité 2: disponibilité, Priorité 3: performance"
            }
        };

        this.currentPage = 'home';
        this.init();
    }

    init() {
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
                const template = this.templates[e.target.dataset.template];
                if (template) {
                    this.applyTemplate(template);
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
                if (this.predefinedRoles[selectedValue]) {
                    item.value = this.predefinedRoles[selectedValue];
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
            label: this.fieldLabels[fieldType],
            value: '', // Commencer avec une valeur vide
            id: Date.now() + Math.random(), // ID unique même pour les doublons
            placeholder: this.fieldPlaceholders[fieldType]
        };

        this.promptItems.push(promptItem);
        this.renderPromptStructure();
        this.updatePreview();
        this.updateScore();
        this.showNotification('Élément ajouté au prompt', 'success');
        
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
            return `
                <div class="field-input-group">
                    <select class="role-selector" onchange="promptGenerator.updateItemFromSelect('${item.id}', this.value)">
                        <option value="">Sélectionner un rôle prédéfini...</option>
                        <option value="expert-dev" ${item.value === this.predefinedRoles['expert-dev'] ? 'selected' : ''}>Expert en développement logiciel</option>
                        <option value="redacteur" ${item.value === this.predefinedRoles['redacteur'] ? 'selected' : ''}>Rédacteur professionnel</option>
                        <option value="analyste" ${item.value === this.predefinedRoles['analyste'] ? 'selected' : ''}>Analyste de données</option>
                        <option value="designer" ${item.value === this.predefinedRoles['designer'] ? 'selected' : ''}>Designer UX/UI</option>
                        <option value="marketing" ${item.value === this.predefinedRoles['marketing'] ? 'selected' : ''}>Expert marketing</option>
                        <option value="consultant" ${item.value === this.predefinedRoles['consultant'] ? 'selected' : ''}>Consultant business</option>
                        <option value="custom">Personnalisé...</option>
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

    applyTemplate(template) {
        // Les templates n'ont plus d'effet car il n'y a plus de champs fixes
        // On peut les utiliser pour créer des structures prédéfinies
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
            label: this.fieldLabels[fieldType],
            value: value,
            id: Date.now() + Math.random(),
            placeholder: this.fieldPlaceholders[fieldType]
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

    // Méthodes de sauvegarde et chargement
    savePrompt() {
        if (this.promptItems.length === 0) {
            this.showNotification('Aucun prompt à sauvegarder !', 'error');
            return;
        }

        const promptName = prompt('Nom de la sauvegarde:', `Prompt ${new Date().toLocaleDateString()}`);
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
        
        this.showNotification(`Prompt "${promptName}" sauvegardé !`, 'success');
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
            this.showNotification(`Prompt "${prompt.name}" chargé !`, 'success');
        }
    }

    deleteSavedPrompt(promptId) {
        const savedPrompts = this.getSavedPrompts();
        const updatedPrompts = savedPrompts.filter(p => p.id !== promptId);
        localStorage.setItem('prompt-generator-saves', JSON.stringify(updatedPrompts));
        
        if (this.currentPage === 'saves') {
            this.showSavesPage();
        }
        this.showNotification('Prompt supprimé !', 'success');
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
                    ← Retour
                </button>
                <h1>📂 Mes Sauvegardes</h1>
            </header>
            <main class="saves-content">
                <div id="savesList" class="saves-list"></div>
            </main>
        `;
        
        document.querySelector('.container').appendChild(savesPage);
    }

    renderSavesPage() {
        const savesList = document.getElementById('savesList');
        const savedPrompts = this.getSavedPrompts();
        
        if (savedPrompts.length === 0) {
            savesList.innerHTML = `
                <div class="empty-saves">
                    <p>🗂️ Aucun prompt sauvegardé</p>
                    <p class="empty-hint">Créez un prompt et sauvegardez-le pour le retrouver ici</p>
                    <button class="btn btn-primary" onclick="promptGenerator.showHomePage()">
                        Créer un prompt
                    </button>
                </div>
            `;
            return;
        }

        savesList.innerHTML = savedPrompts.map(prompt => `
            <div class="save-item">
                <div class="save-info">
                    <h3>${prompt.name}</h3>
                    <p class="save-date">Créé le ${new Date(prompt.createdAt).toLocaleString()}</p>
                    <p class="save-preview">${prompt.previewText}</p>
                </div>
                <div class="save-actions">
                    <button class="btn btn-secondary" onclick="promptGenerator.loadSavedPrompt(${prompt.id})">
                        ✏️ Éditer
                    </button>
                    <button class="btn btn-secondary" onclick="promptGenerator.exportSavedPrompt(${prompt.id}, 'txt')">
                        📄 .txt
                    </button>
                    <button class="btn btn-secondary" onclick="promptGenerator.exportSavedPrompt(${prompt.id}, 'md')">
                        📝 .md
                    </button>
                    <button class="btn btn-danger" onclick="promptGenerator.deleteSavedPrompt(${prompt.id})">
                        🗑️
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
        
        this.showNotification(`"${prompt.name}" exporté en ${format.toUpperCase()} !`, 'success');
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