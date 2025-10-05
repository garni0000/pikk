# Déploiement de PicknMat sur Render

## 🚀 Instructions de déploiement

### 1. Préparer le repository
- Poussez votre code sur GitHub
- Assurez-vous que tous les fichiers sont commités

### 2. Créer un compte Render
- Allez sur [render.com](https://render.com)
- Créez un compte ou connectez-vous
- Connectez votre compte GitHub

### 3. Créer une nouvelle Web Service
- Cliquez sur "New +" puis "Web Service"
- Connectez votre repository GitHub
- Sélectionnez le repository PicknMat

### 4. Configuration du service
- **Name**: `picknmat` (ou le nom de votre choix)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (pour commencer)

### 5. Variables d'environnement
Ajoutez ces variables dans la section "Environment Variables" :

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_pl5z8kaGIUEf@ep-ancient-boat-ade7hmpk-pooler.c-2.us-east-1.aws.neon.tech/chatt?sslmode=require&channel_binding=require
VITE_FIREBASE_API_KEY=AIzaSyCioo-wvVjNdvjZyvnLjLL-0MH-bjmXhFg
VITE_FIREBASE_PROJECT_ID=chatt-3f532
VITE_FIREBASE_APP_ID=1:914545949633:web:d189481c81af0037830d40
```

### 6. Déployer
- Cliquez sur "Create Web Service"
- Render va automatiquement :
  - Installer les dépendances
  - Builder l'application
  - Déployer sur une URL publique

### 7. Configurer la base de données
Une fois déployé, vous devrez pousser le schéma de base de données :
- Connectez-vous à votre instance Render
- Utilisez la console ou ajoutez un script de migration

## 🔧 Configuration Firebase pour la production

### Mise à jour des domaines autorisés
1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet `chatt-3f532`
3. Allez dans "Authentication" > "Settings" > "Authorized domains"
4. Ajoutez le domaine Render (ex: `picknmat.onrender.com`)

### Mise à jour des règles de stockage
1. Dans Firebase Console, allez dans "Storage" > "Rules"
2. Assurez-vous que les règles permettent l'upload depuis votre domaine

## 📱 URL finale
Votre application sera disponible sur : `https://picknmat.onrender.com` (ou le nom que vous avez choisi)

## 🆘 Dépannage
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que toutes les variables d'environnement sont correctes
- Vérifiez que Firebase est configuré pour accepter votre domaine Render
