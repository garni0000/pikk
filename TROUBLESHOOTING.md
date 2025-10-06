# Guide de dépannage - Authentification PicknMat

## 🔍 Problèmes courants et solutions

### 1. La popup Google ne s'ouvre pas
**Symptômes :** Clic sur le bouton, rien ne se passe
**Solutions :**
- Vérifier les variables d'environnement sur Render
- Vérifier les domaines autorisés dans Firebase
- Vérifier la console pour les erreurs JavaScript

### 2. La popup s'ouvre mais échoue
**Symptômes :** Popup Google s'ouvre puis se ferme avec une erreur
**Solutions :**
- Ajouter `pikk.onrender.com` aux domaines autorisés Firebase
- Vérifier la configuration OAuth dans Firebase Console

### 3. Authentification réussie mais utilisateur pas connecté
**Symptômes :** Popup réussit mais reste sur la page Welcome
**Solutions :**
- Ajouter `FIREBASE_SERVICE_ACCOUNT_KEY` sur Render
- Vérifier les logs du serveur Render

### 4. Erreur "Firebase Config: Missing"
**Symptômes :** Message dans la console
**Solutions :**
- Vérifier que toutes les variables VITE_FIREBASE_* sont définies sur Render
- Redéployer l'application

## 🛠️ Configuration Firebase complète

### Variables d'environnement Render :
```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_pl5z8kaGIUEf@ep-ancient-boat-ade7hmpk-pooler.c-2.us-east-1.aws.neon.tech/chatt?sslmode=require&channel_binding=require
VITE_FIREBASE_API_KEY=AIzaSyCioo-wvVjNdvjZyvnLjLL-0MH-bjmXhFg
VITE_FIREBASE_PROJECT_ID=chatt-3f532
VITE_FIREBASE_APP_ID=1:914545949633:web:d189481c81af0037830d40
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Domaines autorisés Firebase :
- localhost
- pikk.onrender.com
- chatt-3f532.firebaseapp.com

## 🔧 Commandes de diagnostic

### Vérifier les logs Render :
1. Dashboard Render → Service → Logs
2. Chercher les erreurs liées à l'authentification

### Vérifier la console navigateur :
1. F12 → Console
2. Chercher les erreurs Firebase ou JavaScript

### Tester l'API d'authentification :
```bash
curl -X POST https://pikk.onrender.com/api/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

