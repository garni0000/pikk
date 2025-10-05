# Configuration Firebase pour la production

## 🔑 Obtenir les credentials Firebase Admin SDK

### 1. Aller dans Firebase Console
- Allez sur [Firebase Console](https://console.firebase.google.com)
- Sélectionnez votre projet `chatt-3f532`

### 2. Générer une clé de service
- Allez dans **Project Settings** (icône d'engrenage)
- Cliquez sur l'onglet **Service accounts**
- Cliquez sur **Generate new private key**
- Téléchargez le fichier JSON

### 3. Configurer sur Render
- Allez sur votre dashboard Render
- Sélectionnez votre service PicknMat
- Allez dans **Environment**
- Ajoutez une nouvelle variable d'environnement :

**Nom**: `FIREBASE_SERVICE_ACCOUNT_KEY`
**Valeur**: Copiez tout le contenu du fichier JSON téléchargé (en une seule ligne)

### 4. Configurer les domaines autorisés
- Dans Firebase Console, allez dans **Authentication** → **Settings**
- Dans l'onglet **Authorized domains**, ajoutez :
  - `pikk.onrender.com` (votre domaine Render)
  - `localhost` (pour le développement local)

### 5. Vérifier la configuration
- Redéployez votre application sur Render
- Testez la connexion Google

## 🔧 Variables d'environnement complètes sur Render

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_pl5z8kaGIUEf@ep-ancient-boat-ade7hmpk-pooler.c-2.us-east-1.aws.neon.tech/chatt?sslmode=require&channel_binding=require
VITE_FIREBASE_API_KEY=AIzaSyCioo-wvVjNdvjZyvnLjLL-0MH-bjmXhFg
VITE_FIREBASE_PROJECT_ID=chatt-3f532
VITE_FIREBASE_APP_ID=1:914545949633:web:d189481c81af0037830d40
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"chatt-3f532",...}
```

## 🚨 Important
- Ne partagez jamais votre clé de service publiquement
- Gardez-la sécurisée dans les variables d'environnement
- Ne la commitez pas dans votre code
