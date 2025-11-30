# Moniteur de Statut Google Workspace

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

Ce projet est un script automatisé pour Google Apps Script qui surveille le flux RSS officiel du Google Workspace Status Dashboard. Il détecte les nouveaux incidents et envoie instantanément une alerte par email à l'administrateur.

## Fonctionnalités Clés

* **Surveillance Active :** Analyse le flux Atom XML de Google.
* **Anti-Doublons :** Utilise `PropertiesService` pour stocker les IDs des incidents déjà traités et éviter le spam.
* **Syntaxe Moderne :** Code écrit en JavaScript ES6+ (V8 Runtime), optimisé et modulaire.
* **Alertes HTML :** Emails formatés proprement avec lien direct vers l'incident.
* **Robustesse :** Gestion des erreurs via `try...catch` et logging complet.

## Installation Manuelle

1.  Ouvrez [Google Apps Script](https://script.google.com/).
2.  Créez un nouveau projet nommé "Moniteur Workspace".
3.  Copiez le contenu fourni dans le fichier `Code.gs`.
4.  Sauvegardez le projet (`Ctrl + S`).
5.  Exécutez manuellement la fonction `verifierStatutGoogleWorkspace` une première fois pour accorder les permissions (Mail, UrlFetch, Properties).
6.  Configurez un déclencheur (Trigger) :
    * Allez dans le menu "Déclencheurs" (icône réveil).
    * Ajoutez un déclencheur pour `verifierStatutGoogleWorkspace`.
    * Source de l'événement : **Basé sur le temps**.
    * Type de minuteur : **Minuteur (minutes)**.
    * Intervalle : **Toutes les 10 ou 15 minutes**.

