# Compte à rebours — Congés

Extension Google Chrome (Manifest V3) qui affiche le temps restant avant tes
congés, sous forme de compte à rebours **jours / heures / minutes / secondes**,
avec une barre de progression qui passe **du rouge au vert** à mesure que
l'échéance approche. La date est paramétrable directement depuis l'interface.

---

## Fonctionnalités

- Compte à rebours en temps réel (mise à jour chaque seconde quand la popup est ouverte).
- Barre de progression dont la couleur évolue du rouge (loin) au vert (proche).
- Bascule automatique en mode « C'est les congés 🏖️ » une fois l'échéance passée.
- Panneau **Paramètres** (icône ⚙) pour changer la date/heure cible et le point de départ de la barre.
- Choix mémorisé via `chrome.storage.local` : il persiste après fermeture de Chrome.
- Thème sombre, chiffres en police à chasse fixe, accessible (focus clavier visible, `prefers-reduced-motion` respecté).

Valeurs par défaut : objectif au **vendredi 10 juillet 2026 à 17h01**, départ de la barre au **15 juin 2026**.

---

## Installation (mode développeur)

Pas besoin du Chrome Web Store.

1. Dézippe le dossier `conges-extension` à un emplacement stable (évite un dossier temporaire ou Téléchargements).
2. Ouvre `chrome://extensions` dans Chrome.
3. Active le **Mode développeur** (interrupteur en haut à droite).
4. Clique sur **Charger l'extension non empaquetée** et sélectionne le dossier `conges-extension`.
5. Épingle l'extension via l'icône puzzle de la barre d'outils pour la garder visible.

Après toute modification d'un fichier, recharge l'extension : sur `chrome://extensions`,
clique sur l'icône ↻ de sa tuile.

---

## Utilisation

Clique sur l'icône de l'extension (un petit soleil) pour ouvrir la popup.

Pour changer la date :

1. Clique sur l'icône ⚙ en haut à droite.
2. Renseigne la **date et l'heure des congés** et la **date de début de la barre**.
3. Clique sur **Enregistrer**. Le compte à rebours se recalcule aussitôt.

Le bouton **Réinitialiser** restaure les valeurs par défaut.

Deux garde-fous : les deux champs sont obligatoires, et la date de début doit être
antérieure à la date des congés (sinon un message d'avertissement s'affiche).

---

## Personnalisation dans le code (optionnel)

Tout se règle via le panneau ⚙, mais si tu veux changer les valeurs **par défaut**,
elles sont en haut de `popup.js` :

```js
const DEFAULT_TARGET = new Date(2026, 6, 10, 17, 1, 0); // ven. 10 juil. 2026, 17h01
const DEFAULT_START  = new Date(2026, 5, 15, 0, 0, 0);  // 15 juin 2026
```

> **Attention :** dans `new Date(...)`, le mois est compté à partir de 0
> (janvier = 0, juin = 5, juillet = 6, décembre = 11).

---

## Structure du projet

```
conges-extension/
├── manifest.json     # Déclaration de l'extension (Manifest V3, permission "storage")
├── popup.html        # Structure de la popup (vue compte à rebours + vue paramètres)
├── popup.css         # Styles (thème sombre, barre, panneau de réglages)
├── popup.js          # Logique : calcul du temps restant, barre, persistance des réglages
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Limites connues

- **Pas de décompte permanent sur l'icône.** Le compteur ne « tourne » que lorsque la
  popup est ouverte. Il se recalcule à chaque ouverture, donc il reste toujours exact,
  mais il n'y a pas de badge qui décompte en arrière-plan. (Ajout possible via un
  *service worker* — non inclus dans cette version.)
- **Heure locale de la machine.** Les calculs utilisent l'horloge et le fuseau du système.
- **Mémorisation locale au profil.** Les réglages sont stockés avec `chrome.storage.local`
  et ne se synchronisent pas entre plusieurs ordinateurs. Pour une synchronisation entre
  Chrome connectés au même compte Google, remplacer `chrome.storage.local` par
  `chrome.storage.sync` dans `popup.js`.

---

## Versions

- **1.1.0** — Ajout du panneau Paramètres (date/heure paramétrable) et persistance via `chrome.storage`.
- **1.0.0** — Version initiale : compte à rebours et barre de progression rouge → vert.
