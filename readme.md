# PromptBuilder — Spécification et guide d'implémentation

> Fichier `.md` décrivant la création d'une application web pour composer des prompts, calculer un score (role, tâche, clarté, sécurité...), prévisualiser et exporter aux formats `.txt`, `.xml` et `.md`.

# Demo
demo : [https://remycholley-dev.github.io/prompts-maker/](https://remycholley-dev.github.io/prompts-maker/)

---

## 1. Objectif

Construire une application web simple et conviviale permettant à un utilisateur de :

- Composer un prompt (multi-parties : rôle, tâche, contraintes, examples...) ;
- Obtenir un **score** calculé automatiquement selon des critères configurables (p.ex. rôle, tâche, clarté, sécurité, concision) ;
- Voir une **prévisualisation** en temps réel du prompt final ;
- Exporter le prompt aux formats **.txt**, **.xml** et **.md** ;
- Sauvegarder/charger des prompts locaux (localStorage ou fichiers) ;
- Interface responsive et dynamique (drag/drop minimal, validation inline).


## 2. Public cible

Créateurs de contenu IA, prompt engineers, formateurs, développeurs souhaitant générer et partager des prompts réutilisables avec métriques de qualité.


## 3. Caractéristiques principales

- **Éditeur par sections** : Rôle, Contexte, Tâche, Contraintes (do / don't), Exemples, Sortie attendue.
- **Scoring** : calcul automatique sur 0–100 et ventilation par critère.
- **Prévisualisation** live** : affichage du prompt rendu (texte final) et un aperçu formaté Markdown.
- **Exports** : boutons d'export en TXT, XML, MD.
- **Templates & Presets** : modèles de prompts (assistant, instructeur, traducteur...).
- **Historique local** : sauvegarde automatique et récupération.
- **Accessibilité** : navigation clavier, labels explicites.


## 4. UX / UI — Wireframe & Comportement

- **Layout (desktop)** :
  - Colonne gauche : liste des templates / prompts sauvegardés.
  - Centre : éditeur par sections (champ par section, textarea enrichi simple).
  - Colonne droite : preview (Markdown rendu) et panneau score (diagramme simple / barres).
  - Barre supérieure : titre du prompt, boutons Sauvegarder / Exporter / Nouveau.

- **Interactions** :
  - Édition incrémentale → recalcul score debounce (300–600ms).
  - Survol d'un critère de score → tooltip expliquant comment améliorer.
  - Drag pour réordonner les sections (optionnel) ; petite animation d'apparition.


## 5. Modèle de données (exemple JSON)

```json
{
  "id": "uuid-v4",
  "title": "Résumé Persuasif",
  "sections": {
    "role": "Tu es un assistant expert en marketing.",
    "context": "Produit X, cible jeunes adultes...",
    "task": "Rédige un résumé persuasive de 3 lignes",
    "constraints": "pas plus de 3 phrases, ton amical, pas de mentions juridiques",
    "examples": [
      {"input": "Produit A", "output": "Texte exemple..."}
    ]
  },
  "metadata": {
    "created_at": "2025-09-10T10:00:00+02:00",
    "updated_at": "2025-09-10T10:05:00+02:00",
    "tags": ["marketing","short"]
  }
}
```


## 6. Algorithme de scoring (proposition)

Chaque section reçoit un sous-score (0–100) puis un score final pondéré.

**Critères suggérés et poids (configurables)** :

- Rôle (weight: 20) — présence & spécificité (assistant vs. vague).
- Tâche (weight: 30) — clarté de l'objectif, verbes d'action.
- Contraintes / Safety (weight: 20) — présence de limites et filtres.
- Concision / Longueur (weight: 10) — longueur adaptée à l'objectif.
- Exemples (weight: 10) — qualité et pertinence d'exemples.
- Format / Output (weight: 10) — précision du format attendu.

**Exemple de calcul (pseudocode)** :

```js
function scorePrompt(prompt){
  const scores = {
    role: scoreRole(prompt.sections.role),
    task: scoreTask(prompt.sections.task),
    constraints: scoreConstraints(prompt.sections.constraints),
    concision: scoreConcision(prompt),
    examples: scoreExamples(prompt.sections.examples),
    output: scoreOutput(prompt.sections.output)
  }

  const weights = {role:20, task:30, constraints:20, concision:10, examples:10, output:10}
  let total = 0; let max = 0
  for (k in scores){ total += scores[k]*weights[k]; max += 100*weights[k] }
  return Math.round((total/max)*100)
}
```

**Idées pour scoreRole / scoreTask** :
- Detecter la présence de verbes d'action (regex: `\b(create|generate|summarize|translate|classify)\b`).
- Bonus si des paramètres précis sont fournis (ex. ton, longueur, audience).
- Pénalité si contradictions apparentes dans les sections.


## 7. Exports (implémentation pratique)

- **TXT** : simple `join` des sections avec en-têtes.
- **MD** : exporter une structure Markdown (titres H1/H2 pour sections, code-block pour examples).
- **XML** : sérialisation XML propre (attention à l'échappement des caractères spéciaux).

**Exemple d'export Markdown** :

```md
# {{title}}

## Role
{{role}}

## Context
{{context}}

## Task
{{task}}

## Constraints
{{constraints}}

## Examples
- Input: ...\n  Output: ...
```

**Fonction d'export JS (simplifiée)**

```js
function exportAsTxt(prompt){
  return [prompt.title, 'Role:', prompt.sections.role, 'Task:', prompt.sections.task].join('\n\n')
}

function exportAsXml(prompt){
  // utiliser une petite fonction d'échappement
}

function exportAsMd(prompt){
  // template string markdown
}
```


## 8. Tech stack recommandé

- Frontend : **React** (ou Vue) + TypeScript, Vite ; éditeur avec `textarea` amélioré ou `react-quill` (lite).
- UI : Tailwind CSS pour styles rapides + animations légères.
- Stockage : localStorage pour version initiale ; possibilité d'export/import JSON.
- Backend (optionnel) : Node/Express + SQLite ou Firebase si besoin de partage multi-utilisateur.
- Tests : Jest + Testing Library (frontend).


## 9. Composants UI principaux

- `PromptEditor` — gère les sections et la validation.
- `ScorePanel` — affiche score global et barres par critère.
- `Preview` — rend Markdown (p.ex. `marked` ou `remark`) et un rendu texte final.
- `ExportButtons` — dropdown pour exporter en TXT/MD/XML + bouton copier.
- `TemplateList` — sélectionner / dupliquer / supprimer templates.


## 10. Accessibilité & i18n

- Labels explicites pour chaque champ.
- Contrastes suffisants, focus visible au clavier.
- Texte d'aide / tooltips localisables (i18n) — commencer par FR/EN.


## 11. Sécurité & limites

- Ne pas envoyer de données sensibles à des services externes sans avertir l'utilisateur.
- Pour exports XML, échapper `& < > " '`.


## 12. Tests et métriques

- Cas de test pour scoring (prompts très vagues / très précis / contradictions).
- Tests d'export (comparaison byte à byte d'un export généré attendu).
- Tests d'accessibilité (axe, contraste, navigation clavier).


## 13. Tâches de développement (roadmap courte)

1. Setup projet (React + Vite + Tailwind).
2. Implémenter l'éditeur par sections + stockage local.
3. Calcul basique du score (pseudocode ci-dessus) + affichage.
4. Preview Markdown live.
5. Fonction export TXT/MD/XML + tests.
6. Ajouter templates et presets.
7. Améliorations UX (drag/drop, reorder, partage via JSON).


## 14. Exemples d'améliorations futures

- Intégration d'un linter sémantique de prompt (ML-based) pour suggestions.
- Collaboration en temps réel (WebSocket + backend).
- Import/Export vers/des formats de prompt d'autres plateformes.


---

### Annexe — Template de prompt final (exemple)

```
You are an expert copywriter specialized in mobile apps for young adults.
Context: Product X targets university students aged 18-24, feature Y ...
Task: Write a 3-line persuasive summary in friendly tone. Do not mention pricing.
Constraints: Max 3 sentences, each sentence < 120 characters.
Examples:
  Input: Product A -> Output: "An intuitive app that..."
```


---

*Fin du document — PromptBuilder spec.*

