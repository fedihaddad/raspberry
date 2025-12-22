# 🗄️ Installation du Stockage JSON (Option A)

## 📋 Ce qui change

**AVANT:** Données dans localStorage (séparé par navigateur)  
**APRÈS:** Données dans un fichier JSON sur le serveur (partagé par tous)

## ✅ Avantages

- ✅ **Synchronisation automatique** entre tous les appareils
- ✅ **Sauvegarde permanente** sur le Raspberry Pi
- ✅ **Pas de perte de données** si le cache est vidé
- ✅ **Backup facile** (juste copier le fichier JSON)

---

## 🚀 Installation sur Raspberry Pi

### Étape 1: Installer PHP

```bash
# Se connecter au Raspberry Pi
ssh pi@raspberrypi.local

# Installer PHP
sudo apt-get update
sudo apt-get install php php-fpm -y

# Configurer lighttpd pour PHP
sudo lighty-enable-mod fastcgi
sudo lighty-enable-mod fastcgi-php
sudo systemctl restart lighttpd
```

### Étape 2: Copier les fichiers

```bash
# Aller dans votre dossier
cd ~/ras

# Faire git pull pour récupérer les nouveaux fichiers
git pull

# Copier vers le serveur web
sudo cp -r * /var/www/html/

# Créer le dossier data
sudo mkdir -p /var/www/html/data

# Donner les permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo chmod 777 /var/www/html/data
```

### Étape 3: Tester

```bash
# Tester PHP
php -v

# Tester l'API
curl http://localhost/api.php
# Devrait retourner: []
```

---

## 🔧 Configuration

### Activer le stockage serveur

Le fichier `storage.js` a une variable de configuration:

```javascript
const USE_SERVER_STORAGE = true;  // true = Fichier JSON, false = localStorage
```

**Par défaut: `true`** (recommandé)

---

## 📁 Structure des Fichiers

```
/var/www/html/
├── index.html
├── add.html
├── login.html
├── api.php           ← NOUVEAU: API pour lire/écrire
├── storage.js        ← NOUVEAU: Gestion du stockage
├── script.js
├── form.js
├── style.css
└── data/
    └── announcements.json  ← NOUVEAU: Fichier de données
```

---

## 💾 Emplacement des Données

```
/var/www/html/data/announcements.json
```

### Voir les données:

```bash
cat /var/www/html/data/announcements.json
```

### Backup manuel:

```bash
# Sauvegarder
cp /var/www/html/data/announcements.json ~/backup-$(date +%Y%m%d).json

# Restaurer
sudo cp ~/backup-20251222.json /var/www/html/data/announcements.json
sudo chown www-data:www-data /var/www/html/data/announcements.json
```

---

## 🔄 Migration des Données Existantes

Si vous avez déjà des annonces dans localStorage:

1. Ouvrez `http://localhost:8000/backup.html`
2. Cliquez sur "Télécharger Backup (JSON)"
3. Sur le Raspberry Pi, copiez ce fichier:
   ```bash
   sudo cp announcements-backup-*.json /var/www/html/data/announcements.json
   sudo chown www-data:www-data /var/www/html/data/announcements.json
   ```

---

## ✅ Vérification

### Test complet:

1. **Ajouter une annonce depuis votre PC:**
   - http://192.168.1.100/login.html
   - Ajouter une annonce

2. **Vérifier sur le Raspberry Pi:**
   ```bash
   cat /var/www/html/data/announcements.json
   ```

3. **Voir sur l'écran:**
   - http://192.168.1.100/index.html
   - L'annonce doit apparaître!

4. **Vérifier depuis mobile:**
   - http://192.168.1.100/login.html
   - Vous devez voir la même annonce!

---

## 🐛 Dépannage

### Erreur: "Failed to fetch"

```bash
# Vérifier les permissions
ls -la /var/www/html/data/

# Corriger si nécessaire
sudo chmod 777 /var/www/html/data
sudo chmod 666 /var/www/html/data/announcements.json
```

### Erreur: "PHP not working"

```bash
# Vérifier PHP
sudo systemctl status php*-fpm

# Redémarrer
sudo systemctl restart php*-fpm
sudo systemctl restart lighttpd
```

### Retour au localStorage

Si vous voulez revenir au localStorage temporairement:

Éditez `storage.js`:
```javascript
const USE_SERVER_STORAGE = false;  // Désactiver
```

---

## 📊 Avantages vs localStorage

| Fonctionnalité | localStorage | JSON File |
|----------------|--------------|-----------|
| Synchronisation multi-appareils | ❌ | ✅ |
| Sauvegarde permanente | ❌ | ✅ |
| Backup facile | ❌ | ✅ |
| Pas de serveur requis | ✅ | ❌ |
| Fonctionne hors ligne | ✅ | ❌ |

---

## 🎯 Résumé

**Avec cette solution:**
- ✅ Toutes les données sont dans `/var/www/html/data/announcements.json`
- ✅ Tous les appareils voient les mêmes données
- ✅ Changements instantanés partout
- ✅ Backup simple (copier le fichier)
- ✅ Pas de perte de données

**C'est la solution idéale pour votre cas d'usage!** 🎉
