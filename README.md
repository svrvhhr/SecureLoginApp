# Application de Login Sécurisé

## Description
Cette application est un système de login sécurisé développé avec React.js pour le frontend et Express.js pour le backend. Elle permet la gestion des utilisateurs avec un stockage local dans un fichier CSV et implémente plusieurs mesures de sécurité.

## Fonctionnalités
- Authentification des utilisateurs (login)
- Création de nouveaux comptes
- Stockage sécurisé des mots de passe
- Interface utilisateur intuitive
- Gestion des messages d'erreur et de succès

## Technologies Utilisées
- Frontend : React.js
- Backend : Express.js
- Stockage : Fichier CSV local
- Sécurité : bcryptjs pour le hashage des mots de passe

## Mesures de Sécurité Implémentées

### 1. Hashage des Mots de Passe
- Utilisation de bcrypt pour le hashage des mots de passe
- Coût de hashage défini à 10 rounds pour un bon compromis sécurité/performance
- Les mots de passe ne sont jamais stockés en clair
```javascript
const hashedPassword = bcrypt.hashSync(password, 10);
```

### 2. Stockage Sécurisé
- Séparation du stockage des identifiants et des mots de passe hashés
- Format CSV sécurisé : username,hashedPassword
- Validation des données avant stockage
```javascript
// Exemple de ligne dans users.csv
"john.doe,$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 3. Validation des Entrées
- Vérification de l'existence des champs requis
- Contrôle de l'unicité des identifiants
- Messages d'erreur génériques pour éviter la divulgation d'informations
```javascript
if (!username || !password) {
  return res.status(400).json({ message: 'Tous les champs sont requis' });
}
```

## Installation

1. Cloner le dépôt :
```bash
git clone [url-du-repo]
cd secure-login
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer le fichier `.env` :
```env
PORT=3000
```

4. Lancer l'application :
```bash
npm run build
npm start
```

## Structure du Projet
```
secure-login/
├── public/
│   └── index.html
├── src/
│   ├── App.js        # Composant principal React
│   ├── App.css       # Styles de l'application
│   └── index.js      # Point d'entrée React
├── server.js         # Serveur Express et logique backend
├── users.csv         # Fichier de stockage (créé automatiquement)
└── package.json      # Dépendances et scripts
```

## Bonnes Pratiques de Sécurité
1. **Hashage Sécurisé**
   - Utilisation de bcrypt avec un coût adapté
   - Sel unique généré automatiquement pour chaque mot de passe
   - Protection contre les attaques par rainbow tables

2. **Gestion des Sessions**
   - Validation côté serveur de chaque requête
   - Messages d'erreur génériques pour éviter la divulgation d'informations

3. **Protection des Données**
   - Validation des entrées
   - Échappement des caractères spéciaux
   - Vérification des doublons avant création de compte

## API Endpoints

### POST /login
- Authentification d'un utilisateur
- Corps de la requête : `{ username, password }`
- Réponses :
  - 200 : Connexion réussie
  - 401 : Identifiants incorrects
  - 500 : Erreur serveur

### POST /register
- Création d'un nouveau compte
- Corps de la requête : `{ username, password }`
- Réponses :
  - 200 : Compte créé
  - 400 : Identifiant déjà utilisé
  - 500 : Erreur serveur


## Notes de Sécurité
- Cette application est une démonstration et nécessiterait des mesures supplémentaires pour un environnement de production
- Le stockage CSV est utilisé à des fins pédagogiques, une base de données sécurisée serait préférable en production
- Les tokens de session et la gestion des cookies ne sont pas implémentés dans cette version basique

