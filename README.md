# 🎓 Système d'Annonces Professionnel - Guide Complet

## 🚀 Démarrage Rapide

### 1. Première Utilisation
1. Ouvrez `demo.html` pour charger des données de démonstration
2. Ouvrez `index.html` pour voir l'écran d'affichage
3. Ouvrez `login.html` pour accéder à l'administration

### 2. Connexion Administration
- **URL**: `login.html`
- **Utilisateur par défaut**: `admin`
- **Mot de passe par défaut**: `admin123`

⚠️ **IMPORTANT**: Changez ces identifiants dans `login.html` (lignes 233-236)

## 📋 Types d'Annonces

### 1. 👨‍🏫 Professeur Absent
- Nom du professeur
- Matière
- Date début / Date fin
- **Calcul automatique de la période**
- Classes concernées
- Notes supplémentaires

### 2. 📝 Devoir / Examen
- Type (Devoir, Examen, Contrôle, Test)
- Matière et Classe
- Numéro de salle
- Date et horaires
- **Calcul automatique de la durée**
- Instructions spéciales

### 3. ⚠️ Exclusion Élève
- Nom de l'élève
- Classe
- Motif de l'exclusion
- Type: **Temporaire** (avec dates) ou **Définitive** (permanente)
- **Calcul automatique de la période** (si temporaire)
- Notes additionnelles

### 4. 📢 Autre Annonce
- Titre personnalisé
- Catégories:
  - ℹ️ Information
  - 🎉 Événement
  - ⚠️ Urgent
  - 🏖️ Vacances
  - 🎨 Activité
  - 🔔 Rappel
  - 👔 **Message du Directeur**
- Description, date, heure, lieu

## 🔐 Sécurité

### Authentification
- **Page de connexion sécurisée** (`login.html`)
- **Session management** - déconnexion automatique après fermeture
- **Protection du dashboard** - redirection si non authentifié
- **Bouton de déconnexion** dans l'interface admin

### Changer les Identifiants
Ouvrez `login.html` et modifiez les lignes 233-236:
```javascript
const CREDENTIALS = {
    username: 'votre_nom_utilisateur',
    password: 'votre_mot_de_passe_securise'
};
```

## 📱 Utilisation Mobile/PC

### Accès depuis Mobile
1. Le Raspberry Pi affiche `index.html` en mode kiosque
2. Depuis votre PC/mobile, connectez-vous au même réseau WiFi
3. Accédez à `http://[IP_RASPBERRY]/login.html`
4. Gérez les annonces depuis n'importe où

### Auto-Actualisation
- L'écran principal vérifie les changements **toutes les 5 secondes**
- Quand vous ajoutez/modifiez/supprimez depuis votre mobile, le Raspberry Pi se met à jour automatiquement
- Pas besoin de rafraîchir manuellement!

## ✏️ Gestion des Annonces

### Ajouter
1. Connectez-vous via `login.html`
2. Sélectionnez le type d'annonce
3. Remplissez le formulaire
4. Cliquez sur "Publier l'Annonce"

### Modifier
1. Scrollez vers "Gérer les Annonces"
2. Cliquez sur "✏️ Modifier"
3. Le formulaire se remplit automatiquement
4. Modifiez les champs souhaités
5. Cliquez sur "💾 Enregistrer les Modifications"

### Supprimer
1. Scrollez vers "Gérer les Annonces"
2. Cliquez sur "🗑️ Supprimer"
3. Confirmez la suppression

## 🖥️ Installation Raspberry Pi

### Configuration Serveur Web
```bash
# Installer serveur web léger
sudo apt-get update
sudo apt-get install lighttpd

# Copier les fichiers
sudo cp -r /chemin/vers/ras/* /var/www/html/

# Redémarrer le serveur
sudo systemctl restart lighttpd

# Trouver l'IP du Raspberry Pi
hostname -I
```

### Mode Kiosque (Affichage Automatique)
```bash
# Installer Chromium
sudo apt-get install chromium-browser unclutter

# Créer script de démarrage
nano ~/start-display.sh
```

Contenu du script:
```bash
#!/bin/bash
xset s off
xset -dpms
xset s noblank
unclutter -idle 0 &
chromium-browser --kiosk --noerrdialogs --disable-infobars \
  file:///var/www/html/index.html
```

```bash
# Rendre exécutable
chmod +x ~/start-display.sh

# Démarrage automatique
nano ~/.config/lxsession/LXDE-pi/autostart
```

Ajouter:
```
@/home/pi/start-display.sh
```

### Accès Réseau
Depuis un autre appareil:
```
http://[IP_RASPBERRY]/login.html
```

## 🎨 Personnalisation

### Nom de l'École
`index.html` ligne 13:
```html
<div class="school-name">🎓 Votre École</div>
```

### Couleurs
`style.css` lignes 9-24 (variables CSS):
```css
--primary: #6366f1;
--danger: #ef4444;
/* etc. */
```

### Fréquence d'Actualisation
`script.js` ligne 285:
```javascript
setInterval(checkForUpdates, 5000); // 5000 = 5 secondes
```

## 📊 Structure des Fichiers

```
ras/
├── index.html          # Écran d'affichage (Raspberry Pi)
├── login.html          # Page de connexion sécurisée
├── add.html            # Dashboard administration
├── demo.html           # Chargeur de données de démonstration
├── style.css           # Styles professionnels
├── script.js           # Script affichage
├── form.js             # Script administration
├── README.md           # Documentation complète
└── QUICK_START.md      # Guide rapide
```

## 🔄 Workflow Typique

1. **Raspberry Pi** affiche `index.html` en plein écran
2. **Directeur/Admin** se connecte via mobile/PC à `login.html`
3. **Ajoute/Modifie** une annonce (ex: élève exclu, prof absent)
4. **Raspberry Pi** détecte le changement automatiquement (5 sec)
5. **Affichage mis à jour** sans intervention manuelle

## 💡 Cas d'Usage

### Exclusion d'Élève
```
Type: Exclusion Élève
Nom: Ahmed Bennani
Classe: 2ème B
Motif: Comportement inapproprié répété
Type: Temporaire
Du: 22/12/2025
Au: 27/12/2025
→ Période calculée: "Du 22 décembre au 27 décembre (6 jours)"
```

### Message du Directeur
```
Type: Autre Annonce
Titre: Message Important du Directeur
Catégorie: Message du Directeur
Description: Félicitations à tous les élèves pour leurs excellents résultats...
→ Affiché avec icône 👔 et style spécial
```

## 🐛 Dépannage

### L'écran ne se met pas à jour
- Vérifiez que JavaScript est activé
- Ouvrez la console (F12) pour voir les erreurs
- Vérifiez que localStorage n'est pas désactivé

### Impossible de se connecter
- Vérifiez les identifiants dans `login.html`
- Videz le cache du navigateur
- Essayez en navigation privée

### Les annonces ne s'affichent pas
- Ouvrez `demo.html` pour charger des données de test
- Vérifiez la console pour les erreurs JavaScript
- Assurez-vous que les fichiers sont tous dans le même dossier

## 📱 Responsive Design

- **Desktop**: Grille 2-3 colonnes
- **Tablet**: Grille 2 colonnes
- **Mobile**: 1 colonne, boutons pleine largeur
- **Touch-friendly**: Boutons et champs agrandis sur mobile

## 🔒 Bonnes Pratiques

1. **Changez les identifiants par défaut** immédiatement
2. **Sauvegardez** régulièrement le localStorage
3. **Utilisez HTTPS** si accessible depuis Internet
4. **Limitez l'accès WiFi** au réseau de l'école
5. **Formez** le personnel autorisé à utiliser le système

## 📞 Support

Pour toute question:
1. Consultez ce README
2. Vérifiez `QUICK_START.md` pour un guide rapide
3. Inspectez la console du navigateur (F12)

---

**Version**: 2.0  
**Dernière mise à jour**: Décembre 2025  
**Développé pour**: Collège Ibn Khaldoun  

🎓 **Bon affichage!**
