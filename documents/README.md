# Base documentaire AQCS

Placez ici les procédures AQCS approuvées, un dossier par méthode :

```
documents/
├── PT/   MT/   UT/   RT/   VT/
├── APL/  APE/  APVG/
└── OTH/
```

## Format d'un document (fichier `.json`)

Voir `PT/_EXAMPLE-AQCS-PT.json`. Champs :

| Champ | Rôle |
|---|---|
| `id` | Numéro du document, ex. `AQCS-PT-001` |
| `title` | Titre |
| `method` | PT, MT, UT, RT, VT, APL, APE, APVG ou OTH |
| `version`, `revision`, `effectiveDate` | Affichés dans les sources de chaque réponse |
| `status` | `approved` → étiqueté « Procédure AQCS ». Toute autre valeur → « projet, non approuvé » |
| `lang` | `fr` ou `en` |
| `sections` | Liste de `{ id, title, content }`. Séparez les paragraphes par une ligne vide : chaque paragraphe devient un passage citable |

Règles :

- Les fichiers dont le nom commence par `_` sont ignorés (modèles, exemples).
- Après ajout ou modification, redémarrez le serveur, ou un compte **admin** peut appeler `POST /api/kb/reload`.
- La version de la base (`/api/kb`) change automatiquement quand le contenu change ; elle est enregistrée dans le journal d'audit avec chaque question.
- Ne mettez pas ici le texte complet de normes payantes (ASME, ISO…) sauf si la licence AQCS l'autorise.
