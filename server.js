// Imports des modules Node.js essentiels 
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware de base
app.use(cors());  // Permet les requêtes depuis d'autres domaines
app.use(express.json());  // Pour traiter les données JSON
app.use(express.static('build'));

// Stockage des données utilisateurs dans un CSV
const CSV_FILE = path.join(__dirname, 'users.csv');

// Création du fichier CSV si nécessaire
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'username,password\n');
}

// Fonction pour lire les utilisateurs du CSV
// Important: Cette fonction synchrone bloque le thread principal
function readUsers() {
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  return content.split('\n')
    .slice(1)  // Ignore l'en-tête du CSV
    .filter(line => line.trim())
    .map(line => {
      const [username, password] = line.split(',');
      return { username, password };
    });
}

// Fonction pour sauvegarder les utilisateurs
// À améliorer: Utiliser une base de données pour la production
function writeUsers(users) {
  const content = 'username,password\n' +
    users.map(user => `${user.username},${user.password}`).join('\n');
  fs.writeFileSync(CSV_FILE, content);
}

// Route de login - POST /login
// Vérifie les credentials de l'utilisateur
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  
  // Recherche l'utilisateur et vérifie le mot de passe
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });
  }
  
  res.json({ message: 'Connexion réussie' });
});

// Route d'inscription - POST /register
// Crée un nouvel utilisateur si le username est disponible
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  // Vérifie si l'utilisateur existe déjà
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Cet identifiant existe déjà' });
  }

  // Hash le mot de passe avant de le stocker
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword });
  writeUsers(users);
  
  res.json({ message: 'Compte créé avec succès' });
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});