# 🎓 Guide de Démarrage Rapide

## 🚀 Tester le Système Maintenant

### Option 1: Ouvrir directement dans le navigateur
1. Double-cliquez sur `index.html` pour voir l'écran d'affichage
2. Double-cliquez sur `add.html` pour accéder au panneau d'administration

### Option 2: Utiliser un serveur local (recommandé)
Ouvrez PowerShell dans ce dossier et exécutez:
```powershell
python -m http.server 8000
```

Puis ouvrez dans votre navigateur:
- Écran d'affichage: http://localhost:8000/index.html
- Administration: http://localhost:8000/add.html

## 📝 Créer votre première annonce

1. Ouvrez `add.html`
2. Choisissez un type d'annonce (3 boutons en haut)
3. Remplissez le formulaire
4. Cliquez sur "Publier l'Annonce"
5. Retournez sur `index.html` pour voir l'annonce affichée

## 🎯 Exemples d'Utilisation

### Exemple 1: Professeur Absent
- **Professeur**: M. Alami
- **Matière**: Mathématiques
- **Date début**: 22/12/2025
- **Date fin**: 24/12/2025
- **Classes**: 1ère A, 1ère B
- ✅ La période sera calculée automatiquement: "Du 22 décembre au 24 décembre (3 jours)"

### Exemple 2: Devoir
- **Type**: Examen
- **Matière**: Physique-Chimie
- **Classe**: 3ème A
- **Salle**: B12
- **Date**: 23/12/2025
- **Heure début**: 08:00
- **Heure fin**: 10:00
- ✅ La durée sera calculée automatiquement: "2h"

### Exemple 3: Autre Annonce
- **Titre**: Réunion Parents-Professeurs
- **Catégorie**: Événement
- **Description**: Réunion trimestrielle pour discuter des résultats scolaires
- **Date**: 25/12/2025
- **Heure**: 14:00
- **Lieu**: Amphithéâtre

## 🎨 Fonctionnalités Automatiques

### ✅ Calculs Automatiques
- **Période d'absence**: Calcule automatiquement le nombre de jours entre deux dates
- **Durée du devoir**: Calcule automatiquement la durée entre deux heures

### 🔄 Actualisation Automatique
- L'écran d'affichage se rafraîchit automatiquement toutes les 30 secondes
- L'horloge se met à jour en temps réel

### 🎭 Animations
- Cartes animées au chargement
- Effets de survol interactifs
- Indicateur "EN DIRECT" pulsant

## 📱 Accès à l'Administration

### Depuis l'écran d'affichage:
Cliquez 3 fois rapidement sur le coin inférieur droit (zone invisible)

### Directement:
Ouvrez `add.html` dans votre navigateur

## 🔧 Personnalisation Rapide

### Changer le nom de l'école:
Ouvrez `index.html` et modifiez la ligne 12:
```html
<div class="school-name">🎓 Votre École</div>
```

### Changer les couleurs:
Ouvrez `style.css` et modifiez les variables CSS (lignes 9-24)

## 📦 Prêt pour Raspberry Pi

Tous les fichiers sont prêts à être transférés sur votre Raspberry Pi!

Suivez les instructions dans `README.md` pour:
- Configurer le mode kiosque
- Démarrage automatique au boot
- Accès à distance depuis un autre appareil

## ⚡ Démarrage Ultra-Rapide

Copiez ce code dans PowerShell pour tout tester:

```powershell
# Ouvrir l'écran d'affichage
Start-Process "c:\Users\fedih\OneDrive\Bureau\ras\index.html"

# Attendre 2 secondes
Start-Sleep -Seconds 2

# Ouvrir le panneau d'administration
Start-Process "c:\Users\fedih\OneDrive\Bureau\ras\add.html"
```

---

**Bon affichage! 🎉**
