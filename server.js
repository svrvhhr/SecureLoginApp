const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const app = express();

// Protection basique avec helmet
app.use(helmet());

// Limiteur de taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use(limiter);

// Options CORS restrictives
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' })); // Limite la taille des requêtes
app.use(express.static('build', {
  maxAge: '1h',
  setHeaders: (res, path) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));

const CSV_FILE = path.join(__dirname, 'users.csv');

// Validation des entrées
function validateInput(input) {
  return validator.isAlphanumeric(input) && 
         validator.isLength(input, { min: 4, max: 30 }) &&
         !validator.contains(input, ','); // Prévention injection CSV
}

// Lecture sécurisée du CSV
function readUsers() {
  try {
    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    return content.split('\n')
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const [username, password] = line.split(',').map(field => field.trim());
        return { username, password };
      });
  } catch (error) {
    console.error('Erreur de lecture:', error);
    return [];
  }
}

// Écriture sécurisée dans le CSV
function writeUsers(users) {
  try {
    const content = 'username,password\n' + 
      users.map(user => `${validator.escape(user.username)},${user.password}`).join('\n');
    fs.writeFileSync(CSV_FILE, content, { encoding: 'utf-8', flag: 'w' });
  } catch (error) {
    console.error('Erreur d\'écriture:', error);
    throw new Error('Erreur lors de l\'enregistrement');
  }
}

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation des entrées
    if (!username || !password || !validateInput(username)) {
      return res.status(400).json({ message: 'Données invalides' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === validator.escape(username));
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        message: 'Identifiant ou mot de passe incorrect',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      message: 'Connexion réussie',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation renforcée
    if (!username || !password || !validateInput(username)) {
      return res.status(400).json({ message: 'Données invalides' });
    }

    // Validation du mot de passe
    if (password.length < 8 || !(/[A-Z]/.test(password) && /[0-9]/.test(password))) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre' 
      });
    }

    const users = readUsers();
    
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'Cet identifiant existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Augmentation du coût
    users.push({ 
      username: validator.escape(username), 
      password: hashedPassword 
    });
    
    writeUsers(users);
    
    res.json({ message: 'Compte créé avec succès' });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur inattendue' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Ne pas exposer les détails de version en production
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});