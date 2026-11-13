# La Ligue

Application Vue 3 + Vite pour le projet **La Ligue** (module I426 / projet P_DEV-426).

## Démarrer

Installez Node.js 22.12 ou une version plus récente. Extrayez le ZIP, puis ouvrez
un terminal dans le dossier qui contient `package.json`.

```bash
npm ci
npm run dev
```

Ouvrez <http://127.0.0.1:5173>. La commande démarre Vite et l’API de
démonstration JSON Server. Les tournois, les équipes, les résultats et les
pronostics sont enregistrés dans `src/db.json`.

Pour vérifier la version compilée, arrêtez d’abord le serveur de développement,
puis lancez `npm run build` et `npm run preview`. L’adresse de prévisualisation
par défaut est <http://127.0.0.1:4173>.

## Tester les parcours

- **Administration**. Connectez-vous avec le compte de démonstration
  `admin@test.ch` et le mot de passe `test`. Vous pouvez créer un tournoi,
  accepter ou refuser les équipes et publier le résultat du match de démonstration.
- **Inscription**. Depuis un tournoi ouvert, inscrivez une équipe et renseignez
  les pseudos. Le capitaine compte parmi les joueurs. L’inscription et son
  statut restent accessibles depuis le même navigateur, qui permet aussi de la
  retirer. Les inscriptions ferment à la fin de la date affichée, en heure locale.
- **Pronostics**. Indiquez votre pseudo et choisissez le gagnant de NOVA–VORTEX.
  Vous pouvez modifier votre choix jusqu’à la publication du résultat. Un
  pronostic correct vaut un point. Rechargez la page pour voir les résultats et
  les points publiés depuis un autre navigateur.

Le compte administrateur et les vérifications d’accès côté navigateur sont
prévus pour la démonstration locale. Un déploiement public nécessite une API
qui contrôle les accès et les écritures côté serveur.

## Ce que dit le client

- Une user story ne part pas en développement si elle n'est pas dans le **Sprint Backlog** du board.
- Un écran n'est **terminé** que s'il passe la **Definition of Done** : le code est committé et poussé,
  l'écran fonctionne sans erreur, il est testé selon son cas de test, il est présentable en revue.
- La maquette montrée par le client en séance donne la **cible** ; ce n'est pas un code à recopier.
  Votre travail est de la reconstruire avec vos choix techniques.
- Les pronostics de La Ligue sont un **jeu à points** (classement public) : **aucun argent réel**.

## Règle de dépôt

Chaque tâche est committée **individuellement** et poussée sur votre dépôt — c'est ce qui rend le
travail de chacun visible en revue et dans la note de processus.
