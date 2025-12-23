# 🗄️ Installation du Backend SQLite (Option Finale)

C'est la solution la **plus robuste** et la **moins risquée** pour votre Raspberry Pi.

## ✅ Avantages

- **Robuste**: Pas de corruption de données (fichiers JSON = risque si coupure de courant)
- **Rapide**: SQLite est optimisé pour les lectures/écritures
- **Centralisé**: Tous les appareils voient EXACTEMENT la même chose
- **Léger**: Parfait pour Raspberry Pi 3

---

## 🚀 Étape 1: Installer SQLite sur Raspberry Pi

Connectez-vous à votre Raspberry Pi et lancez ces commandes:

```bash
# 1. Mettre à jour
sudo apt-get update

# 2. Installer PHP-SQLite
sudo apt-get install php-sqlite3 sqlite3 -y

# 3. Redémarrer le serveur web
sudo systemctl restart lighttpd
```

C'est tout! Le reste est géré par le code PHP que j'ai créé.

---

## 📂 Étape 2: Mise à jour des fichiers

```bash
cd ~/ras
git pull
sudo cp -r * /var/www/html/

# Créer le dossier de données avec les bonnes permissions
sudo mkdir -p /var/www/html/data
sudo chown -R www-data:www-data /var/www/html/data
sudo chmod -R 777 /var/www/html/data
```

---

## 💾 Emplacement de la Base de Données

Votre base de données sera ici:
```
/var/www/html/data/announcements.db
```

### Pour faire un backup:
```bash
cp /var/www/html/data/announcements.db ~/backup.db
```

### Pour voir le contenu (mode expert):
```bash
sqlite3 /var/www/html/data/announcements.db "SELECT * FROM announcements;"
```

---

## ⚠️ Important: Migration des Données

Au passage à SQLite, **les anciennes annonces (localStorage) seront cachées** (mais pas supprimées de votre navigateur). 
Le système repartira sur une base vide et propre.

Si vous voulez garder vos anciennes annonces, il faudra les recréer une fois via le nouveau formulaire.

---

## 🧪 Test

1. Allez sur `http://[IP_RASPBERRY]/login.html`
2. Ajoutez une annonce test
3. Vérifiez si elle apparaît sur l'écran
4. Si vous voyez une erreur, vérifiez les permissions:
   ```bash
   sudo chmod 777 /var/www/html/data
   ```

---

**Tout est prêt pour la production!** 🚀
