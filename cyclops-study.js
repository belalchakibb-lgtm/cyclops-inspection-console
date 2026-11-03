/* CYCLOPS: ASME & API study guide with an AI teacher.
   Content: "Simple ASME & API Study Guide" (plain-English summary of ASME B31.3, API 650, API 510,
   ASME B16.5, with general overviews of ASME BPVC Section V and Section IX), split into lessons (EN/FR).
   - window.CYSTUDY holds the lessons; kb.mjs also reads it so the AI assistant can cite the guide
     (source type "Study guide").
   - The teacher (3D instructor + chat) explains each lesson, gives calculators, asks a check question,
     answers free questions through /api/ask (teacher mode) or offline from the guide, and runs a final exam.
   A learning summary only: never a substitute for the code edition adopted by the project. */
(function () {
  'use strict';
  window.CYSTUDY = {
    title: ['Simple ASME & API Study Guide', 'Guide d’étude simple ASME & API'],
    source: 'Simple ASME & API Study Guide',
    lessons: [
      { id: 'intro', code: 'Guide', icon: '📘', title: ['Welcome: how to use this guide', 'Bienvenue : comment utiliser ce guide'],
        say: [
          ['Hello! I am your CYCLOPS teacher. Together we will revise the Simple ASME & API Study Guide: process piping, storage tanks, flanges, in-service pressure vessels, welding qualification and NDE.', 'Bonjour ! Je suis votre formateur CYCLOPS. Ensemble, nous allons réviser le Guide d’étude simple ASME & API : tuyauteries de procédé, réservoirs de stockage, brides, appareils à pression en service, qualification du soudage et CND.'],
          ['One rule before we start: this is a learning summary. It never replaces the applicable code, the project specification, the approved drawings, the WPS/PQR, or the decision of the inspector or engineer. Always check which code edition the project has adopted.', 'Une règle avant de commencer : c’est un résumé pédagogique. Il ne remplace jamais le code applicable, la spécification du projet, les plans approuvés, le DMOS/QMOS ni la décision de l’inspecteur ou de l’ingénieur. Vérifiez toujours l’édition du code retenue par le projet.'],
          ['The guide summarises ASME B31.3 (2014 and 2020 editions), API 650 (11th edition, June 2007, Addendum 1 of November 2008), API 510 (confirm the edition on the cover) and ASME B16.5 (2020). ASME Section V and Section IX are added as general study overviews, not page-by-page summaries of a supplied edition.', 'Le guide résume l’ASME B31.3 (éditions 2014 et 2020), l’API 650 (11e édition, juin 2007, addendum 1 de novembre 2008), l’API 510 (édition à confirmer sur la couverture) et l’ASME B16.5 (2020). Les sections V et IX de l’ASME sont ajoutées comme aperçus généraux, pas comme résumés page par page d’une édition fournie.']
        ],
        points: [['A learning summary, not the code.', 'Un résumé pédagogique, pas le code.'], ['Always verify the edition adopted by the project.', 'Toujours vérifier l’édition retenue par le projet.'], ['Covers B31.3, API 650, API 510, B16.5 + overviews of Section V and IX.', 'Couvre B31.3, API 650, API 510, B16.5 + aperçus des sections V et IX.']],
        check: { q: ['Before using a value from this guide on a real job, what must you do?', 'Avant d’utiliser une valeur de ce guide sur un vrai chantier, que devez-vous faire ?'],
          o: [['Nothing, the guide is enough', 'Rien, le guide suffit'], ['Verify it in the code edition and documents adopted by the project', 'La vérifier dans l’édition du code et les documents retenus par le projet'], ['Round it up for safety', 'L’arrondir par sécurité']], a: 1,
          why: ['The guide is for revision. Live decisions use the full applicable standard, its edition, approved procedures and authorised decisions.', 'Le guide sert à réviser. Les décisions réelles s’appuient sur la norme complète applicable, son édition, les procédures approuvées et les décisions autorisées.'] } },

      { id: 'map', code: 'Map', icon: '🧭', title: ['The big picture: which code do I use?', 'Vue d’ensemble : quel code utiliser ?'],
        say: [
          ['The first question on any job is: which code? Each standard has its own job, so identify the equipment and the activity first.', 'La première question sur tout chantier : quel code ? Chaque norme a son rôle, donc identifiez d’abord l’équipement et l’activité.'],
          ['ASME B31.3 is for process piping, from design through testing and records. API 650 is for welded, aboveground, vertical cylindrical storage tanks for near-atmospheric service. API 510 is for pressure vessels once they are in service: inspection, rating, repair, alteration and rerating.', 'L’ASME B31.3 concerne les tuyauteries de procédé, de la conception aux essais et aux enregistrements. L’API 650 concerne les réservoirs de stockage soudés, aériens, cylindriques verticaux, à pression proche de l’atmosphère. L’API 510 concerne les appareils à pression en service : inspection, classement, réparation, modification et reclassement.'],
          ['ASME B16.5 covers pipe flanges and flanged fittings: dimensions, ratings, materials and marking. Section V tells you how to carry out NDE. Section IX qualifies welding and brazing procedures and the people who weld.', 'L’ASME B16.5 couvre les brides et accessoires à brides : dimensions, classes, matériaux et marquage. La section V explique comment réaliser les CND. La section IX qualifie les modes opératoires de soudage et de brasage et le personnel.'],
          ['How they work together: the construction code or project specification decides what examination is required and the acceptance criteria. Section V tells you how to perform the method but does not automatically give acceptance criteria. Section IX qualifies procedures and welders; it does not design the piping, tank or vessel. For an in-service vessel, both the original construction code and API 510 matter.', 'Comment elles s’articulent : le code de construction ou la spécification du projet fixe les examens requis et les critères d’acceptation. La section V explique comment appliquer la méthode, sans donner automatiquement les critères d’acceptation. La section IX qualifie les modes opératoires et les soudeurs ; elle ne conçoit ni la tuyauterie, ni le réservoir, ni l’appareil. Pour un appareil en service, le code de construction d’origine et l’API 510 comptent tous les deux.']
        ],
        points: [['B31.3 → process piping (think: pipes in a process plant).', 'B31.3 → tuyauterie de procédé.'], ['API 650 → large welded storage tank.', 'API 650 → grand réservoir de stockage soudé.'], ['API 510 → pressure vessel after it has entered service.', 'API 510 → appareil à pression une fois en service.'], ['B16.5 → flange size / class / material compatibility.', 'B16.5 → compatibilité dimension / classe / matériau des brides.'], ['Section V → how to examine. Section IX → who and how is qualified to weld.', 'Section V → comment contrôler. Section IX → qui est qualifié pour souder et comment.']],
        check: { q: ['A new process-piping line is being built in a plant. Which standard governs its construction?', 'Une nouvelle ligne de tuyauterie de procédé est construite dans une usine. Quelle norme régit sa construction ?'],
          o: [['ASME B31.3', 'ASME B31.3'], ['API 510', 'API 510'], ['ASME Section V', 'ASME section V']], a: 0,
          why: ['B31.3 covers process piping from design to testing. API 510 is for in-service vessels; Section V only describes NDE methods.', 'La B31.3 couvre la tuyauterie de procédé de la conception aux essais. L’API 510 vise les appareils en service ; la section V décrit seulement les méthodes de CND.'] } },

      { id: 'b313', code: 'B31.3', icon: '🛢', title: ['ASME B31.3: process piping', 'ASME B31.3 : tuyauterie de procédé'],
        say: [
          ['B31.3 sets requirements for materials and components, design, fabrication, assembly, erection, examination, inspection and testing of process piping, carrying many kinds of fluids such as chemicals and petroleum products, within its scope and exclusions.', 'La B31.3 fixe les exigences pour les matériaux et composants, la conception, la fabrication, l’assemblage, le montage, l’examen, l’inspection et les essais des tuyauteries de procédé, transportant de nombreux fluides comme les produits chimiques et pétroliers, dans les limites de son domaine et de ses exclusions.'],
          ['Requirements depend on the fluid-service category and any special designation, such as Category M, high-pressure, high-purity or elevated-temperature service. The 2014 and 2020 editions are not interchangeable: use the edition required by the contract, jurisdiction or project.', 'Les exigences dépendent de la catégorie de service du fluide et de toute désignation particulière : catégorie M, haute pression, haute pureté ou service à température élevée. Les éditions 2014 et 2020 ne sont pas interchangeables : utilisez l’édition exigée par le contrat, la juridiction ou le projet.'],
          ['Important distinction. Examination is the quality-control activity performed by the manufacturer, fabricator or erector. Inspection is the owner’s Inspector verifying that the required examination and testing were done and that requirements are met.', 'Distinction importante. L’examen est l’activité de contrôle qualité réalisée par le fabricant, le préfabricant ou le monteur. L’inspection est la vérification, par l’inspecteur du propriétaire, que les examens et essais requis ont été faits et que les exigences sont respectées.'],
          ['Do not guess: there is no fixed RT/UT percentage or single acceptance limit for every job. The extent and criteria depend on the applicable paragraph, the fluid service, the design and the adopted edition. And never calculate pressure-test values from memory.', 'Ne devinez pas : il n’existe ni pourcentage fixe de RT/UT ni limite d’acceptation unique pour tous les travaux. L’étendue et les critères dépendent du paragraphe applicable, du service, de la conception et de l’édition retenue. Et ne calculez jamais une pression d’épreuve de mémoire.']
        ],
        points: [['1) Confirm edition, fluid service, design conditions, engineering documents.', '1) Confirmer l’édition, le service, les conditions de calcul, les documents d’ingénierie.'], ['2) Verify materials, ratings, compatibility, traceability.', '2) Vérifier matériaux, classes, compatibilité, traçabilité.'], ['3) Check design calculations and details against B31.3.', '3) Vérifier les calculs et détails selon la B31.3.'], ['4) Confirm WPS and welder qualifications to Section IX as required.', '4) Confirmer DMOS et qualifications des soudeurs selon la section IX.'], ['5) Fabrication / erection controls and any required heat treatment.', '5) Maîtrise de la fabrication / du montage et traitement thermique requis.'], ['6) Required examination and testing with the specified acceptance criteria.', '6) Examens et essais requis avec les critères d’acceptation spécifiés.'], ['7) Compile examination, test, material and qualification records.', '7) Rassembler les enregistrements d’examen, d’essai, de matériaux et de qualification.']],
        check: { q: ['Under B31.3, who performs "examination"?', 'Selon la B31.3, qui réalise l’« examen » ?'],
          o: [['The owner’s Inspector', 'L’inspecteur du propriétaire'], ['The manufacturer, fabricator or erector (quality control)', 'Le fabricant, préfabricant ou monteur (contrôle qualité)'], ['Nobody, it is optional', 'Personne, c’est facultatif']], a: 1,
          why: ['Examination is QC by the manufacturer/fabricator/erector. Inspection is the owner’s Inspector verifying it.', 'L’examen est le contrôle qualité du fabricant/préfabricant/monteur. L’inspection est la vérification par l’inspecteur du propriétaire.'] } },

      { id: 'api650', code: 'API 650', icon: '🛢', title: ['API 650: welded storage tanks', 'API 650 : réservoirs de stockage soudés'],
        say: [
          ['API 650 gives minimum requirements for materials, design, fabrication, erection and testing of vertical, cylindrical, aboveground, welded storage tanks within its scope. The uploaded document is the 11th edition (June 2007) with Addendum 1 (November 2008), an older edition: verify the one required by your project.', 'L’API 650 donne les exigences minimales pour les matériaux, la conception, la fabrication, le montage et les essais des réservoirs soudés verticaux, cylindriques et aériens de son domaine. Le document fourni est la 11e édition (juin 2007) avec l’addendum 1 (novembre 2008), une édition ancienne : vérifiez celle exigée par votre projet.'],
          ['That edition covers non-refrigerated tanks, normally at near-atmospheric internal pressure. Its basic scope sets a maximum design temperature of 93 °C (200 °F), except where specific appendices provide otherwise.', 'Cette édition couvre les réservoirs non réfrigérés, normalement à pression interne proche de l’atmosphère. Son domaine de base fixe une température de calcul maximale de 93 °C (200 °F), sauf dispositions particulières des annexes.'],
          ['Main areas to study: materials and traceability; design of shell courses, bottom, roof, openings and nozzles with the applicable loads; welding with qualified procedures and welders; inspection and NDE that depend on the joint and detail; the prescribed tests; and the nameplate, which records the edition, dimensions, capacity, design temperature, materials and identifiers.', 'Points à étudier : matériaux et traçabilité ; conception des viroles, du fond, du toit, des ouvertures et piquages avec les charges applicables ; soudage avec modes opératoires et soudeurs qualifiés ; inspection et CND selon le joint et le détail ; essais prescrits ; et la plaque signalétique, qui indique l’édition, les dimensions, la capacité, la température de calcul, les matériaux et les identifiants.'],
          ['Never apply one tank acceptance criterion to every weld: locate the correct API 650 paragraph and any applicable appendix.', 'N’appliquez jamais un seul critère d’acceptation à toutes les soudures du réservoir : trouvez le bon paragraphe de l’API 650 et l’annexe applicable.']
        ],
        points: [['Confirm tank number, drawings, data sheet, design conditions, code edition.', 'Confirmer n° de réservoir, plans, fiche technique, conditions de calcul, édition du code.'], ['Verify material certificates and shell-course identification.', 'Vérifier certificats matière et identification des viroles.'], ['Review WPS/PQR and welder qualifications.', 'Revoir DMOS/QMOS et qualifications des soudeurs.'], ['Check welds and attachments against the applicable visual/NDE requirements.', 'Contrôler soudures et attaches selon les exigences visuelles/CND applicables.'], ['Confirm examinations, hydrostatic test records, repairs and final documentation.', 'Confirmer examens, PV d’épreuve hydrostatique, réparations et dossier final.']],
        check: { q: ['In the uploaded API 650 edition, what is the basic maximum design temperature (unless an appendix allows otherwise)?', 'Dans l’édition fournie de l’API 650, quelle est la température de calcul maximale de base (sauf annexe contraire) ?'],
          o: [['93 °C (200 °F)', '93 °C (200 °F)'], ['150 °C (300 °F)', '150 °C (300 °F)'], ['There is no limit', 'Il n’y a pas de limite']], a: 0,
          why: ['The basic scope of that edition sets 93 °C (200 °F), except where specific appendices provide otherwise.', 'Le domaine de base de cette édition fixe 93 °C (200 °F), sauf dispositions particulières des annexes.'] } },

      { id: 'api510', code: 'API 510', icon: '⚙', tool: 'life', title: ['API 510: in-service pressure vessels', 'API 510 : appareils à pression en service'],
        say: [
          ['API 510 addresses inspection, rating, repair, alteration and rerating of pressure vessels while in service. It is different from the original construction code: a vessel may have been built to an ASME Section VIII edition, while API 510 governs in-service inspection and maintenance decisions. Confirm the exact edition on the cover before using paragraph numbers or intervals.', 'L’API 510 traite de l’inspection, du classement, de la réparation, de la modification et du reclassement des appareils à pression en service. Elle diffère du code de construction d’origine : un appareil peut avoir été construit selon une édition de l’ASME section VIII, tandis que l’API 510 régit les décisions d’inspection et de maintenance en service. Confirmez l’édition exacte sur la couverture avant d’utiliser des numéros de paragraphe ou des intervalles.'],
          ['Key ideas. Corrosion rate: how fast wall thickness is lost. Remaining thickness: what is measured now at the location evaluated. Required thickness: the minimum from the applicable engineering or code calculation. Remaining life: an estimate from current thickness, required thickness and a justified corrosion rate. Rerating: formally changing the allowable rating after engineering review. Repairs and alterations follow procedures, authorisation, examination, testing and records.', 'Notions clés. Vitesse de corrosion : la vitesse de perte d’épaisseur. Épaisseur restante : celle mesurée maintenant à l’endroit évalué. Épaisseur requise : le minimum issu du calcul d’ingénierie ou du code applicable. Durée de vie restante : estimation à partir de l’épaisseur actuelle, de l’épaisseur requise et d’une vitesse de corrosion justifiée. Reclassement : modification formelle du régime admissible après étude d’ingénierie. Réparations et modifications suivent procédures, autorisation, examens, essais et enregistrements.'],
          ['The simplified formula is: remaining life = (measured thickness − required thickness) ÷ corrosion rate. Example for learning only: 8.0 mm measured, 6.0 mm required, 0.25 mm/year → (8.0 − 6.0) ÷ 0.25 = 8 years. Try it with the calculator below.', 'La formule simplifiée : durée de vie restante = (épaisseur mesurée − épaisseur requise) ÷ vitesse de corrosion. Exemple pédagogique : 8,0 mm mesurés, 6,0 mm requis, 0,25 mm/an → (8,0 − 6,0) ÷ 0,25 = 8 ans. Essayez avec le calculateur ci-dessous.'],
          ['This result does not by itself authorise continued operation: apply the API 510 rules, the inspection plan, uncertainty, the minimum-thickness location and engineering review.', 'Ce résultat n’autorise pas à lui seul la poursuite de l’exploitation : appliquez les règles de l’API 510, le plan d’inspection, l’incertitude, l’emplacement de l’épaisseur minimale et l’étude d’ingénierie.']
        ],
        points: [['Vessel ID, construction data, design conditions, service history, prior reports.', 'Identification, données de construction, conditions de calcul, historique, rapports précédents.'], ['Damage mechanisms, CML/TML locations, thickness readings and data quality.', 'Mécanismes de dégradation, emplacements CML/TML, mesures d’épaisseur et qualité des données.'], ['Corrosion-rate basis, required thickness, remaining life, next inspection.', 'Base de la vitesse de corrosion, épaisseur requise, durée de vie restante, prochaine inspection.'], ['Repairs/alterations, required NDE or pressure/leak test, complete records.', 'Réparations/modifications, CND ou épreuve requis, dossiers complets.']],
        check: { q: ['Measured 10.0 mm, required 7.0 mm, corrosion rate 0.3 mm/year. What is the simplified remaining life?', 'Mesuré 10,0 mm, requis 7,0 mm, vitesse de corrosion 0,3 mm/an. Quelle est la durée de vie restante simplifiée ?'],
          o: [['10 years', '10 ans'], ['3 years', '3 ans'], ['33 years', '33 ans']], a: 0,
          why: ['(10.0 − 7.0) ÷ 0.3 = 10 years, in the time unit of the corrosion rate. It is an estimate, not an authorisation to operate.', '(10,0 − 7,0) ÷ 0,3 = 10 ans, dans l’unité de temps de la vitesse de corrosion. C’est une estimation, pas une autorisation d’exploiter.'] } },

      { id: 'b165', code: 'B16.5', icon: '🔩', title: ['ASME B16.5: pipe flanges and flanged fittings', 'ASME B16.5 : brides et accessoires à brides'],
        say: [
          ['B16.5 (2020) gives standardised requirements for pipe flanges and flanged fittings within its size range: pressure–temperature ratings, dimensions, tolerances, materials, marking and related joint information.', 'La B16.5 (2020) donne des exigences normalisées pour les brides et accessoires à brides de sa gamme de dimensions : classes pression–température, dimensions, tolérances, matériaux, marquage et informations sur l’assemblage.'],
          ['A flange’s pressure class alone is not a universal allowable pressure. The rating depends on the material group and the temperature, from the code’s tables and conditions. A Class 300 flange does not mean "300 of anything" at every temperature.', 'La classe de pression d’une bride n’est pas à elle seule une pression admissible universelle. Le régime dépend du groupe de matériau et de la température, d’après les tableaux et conditions du code. Une bride classe 300 ne signifie pas « 300 » à toute température.'],
          ['The common mistake: selecting a flange from NPS and Class only. You must also check the material, design temperature, pressure–temperature table, mating flange, gasket, bolting and project requirements. And correct components alone do not guarantee a leak-free joint: follow the project’s bolted-joint assembly procedure.', 'L’erreur fréquente : choisir une bride uniquement d’après le NPS et la classe. Il faut aussi vérifier le matériau, la température de calcul, le tableau pression–température, la bride conjuguée, le joint, la boulonnerie et les exigences du projet. Et des composants corrects ne garantissent pas à eux seuls un assemblage étanche : suivez la procédure de serrage du projet.']
        ],
        points: [['1) Nominal pipe size (NPS).', '1) Diamètre nominal (NPS).'], ['2) Pressure class (150, 300, 600…).', '2) Classe de pression (150, 300, 600…).'], ['3) Material specification/grade and its material group.', '3) Spécification/nuance du matériau et son groupe.'], ['4) Facing type and finish.', '4) Type et état de surface de la portée de joint.'], ['5) Flange type and dimensions, bolt-hole pattern, thickness.', '5) Type et dimensions, perçage, épaisseur.'], ['6) Service temperature and pressure, gasket and bolting compatibility.', '6) Température et pression de service, compatibilité joint et boulonnerie.']],
        check: { q: ['Can you select a flange using NPS and Class only?', 'Peut-on choisir une bride uniquement d’après le NPS et la classe ?'],
          o: [['Yes, the class gives the allowable pressure', 'Oui, la classe donne la pression admissible'], ['No: also material group, temperature, rating table, facing, gasket, bolting and project requirements', 'Non : aussi groupe de matériau, température, tableau de régime, portée, joint, boulonnerie et exigences du projet'], ['Yes, if the flange is new', 'Oui, si la bride est neuve']], a: 1,
          why: ['The rating depends on material group and temperature; the joint also depends on facing, gasket, bolting and assembly.', 'Le régime dépend du groupe de matériau et de la température ; l’assemblage dépend aussi de la portée, du joint, de la boulonnerie et du serrage.'] } },

      { id: 'sec9', code: 'Sec. IX', icon: '🔥', title: ['ASME Section IX: welding qualification', 'ASME section IX : qualification du soudage'],
        say: [
          ['Section IX gives the rules for qualifying welding and brazing procedures and the performance of welders, welding operators, brazers and brazing operators. It is a qualification standard: not a design code, and not the source of every weld acceptance criterion. Confirm the edition adopted by your construction code or project.', 'La section IX fixe les règles de qualification des modes opératoires de soudage et de brasage et des soudeurs, opérateurs, braseurs et opérateurs de brasage. C’est une norme de qualification : pas un code de conception, ni la source de tous les critères d’acceptation des soudures. Confirmez l’édition retenue par votre code de construction ou votre projet.'],
          ['The key documents. The WPS is the written instruction for making a weld, with the variables and ranges to follow. The PQR records the variables actually used and the test results of the procedure qualification. The welder performance qualification proves a welder can deposit sound weld metal within a qualified range, recorded on a WPQ or WQTR.', 'Les documents clés. Le WPS (DMOS) est l’instruction écrite pour réaliser une soudure, avec les variables et plages à respecter. Le PQR (QMOS) enregistre les variables réellement utilisées et les résultats d’essais de la qualification. La qualification du soudeur prouve qu’il peut déposer un métal sain dans une plage qualifiée, consignée dans un WPQ ou WQTR.'],
          ['Variables. An essential variable change beyond the permitted range requires requalification. A supplementary essential variable matters when notch-toughness (impact) testing is required. A nonessential variable change usually needs a WPS revision but not requalification.', 'Variables. Un changement d’une variable essentielle hors plage permise impose une requalification. Une variable essentielle supplémentaire compte lorsque des essais de résilience sont exigés. Un changement de variable non essentielle demande en général une révision du WPS mais pas de requalification.'],
          ['Identifiers: the P-Number groups base metals, the F-Number groups filler metals by usability, the A-Number classifies weld-metal chemistry. QW- paragraphs are for welding, QB- for brazing. And remember: a qualified WPS does not make every production weld acceptable; production welds must follow the WPS and pass the required examination.', 'Identifiants : le numéro P regroupe les métaux de base, le numéro F les métaux d’apport selon leur soudabilité, le numéro A classe la composition du métal fondu. Les paragraphes QW- concernent le soudage, QB- le brasage. Et retenez : un WPS qualifié ne rend pas acceptable chaque soudure de production ; elles doivent suivre le WPS et réussir les examens requis.']
        ],
        points: [['Check base metal spec/grade and P-Number / Group Number.', 'Vérifier spécification/nuance et numéro P / groupe.'], ['Check process, filler classification, F-Number, position, thickness/diameter ranges, essential variables.', 'Vérifier procédé, classification d’apport, numéro F, position, plages d’épaisseur/diamètre, variables essentielles.'], ['Impact testing required? Then supplementary essential variables apply.', 'Résilience exigée ? Alors les variables essentielles supplémentaires s’appliquent.'], ['WPS supported by a valid PQR (or another permitted route).', 'WPS appuyé par un PQR valide (ou autre voie permise).'], ['Each welder/operator qualified for the process and range used.', 'Chaque soudeur/opérateur qualifié pour le procédé et la plage utilisés.'], ['Check what the construction code (B31.3, API 650…) adds to Section IX.', 'Vérifier ce que le code de construction (B31.3, API 650…) ajoute à la section IX.']],
        check: { q: ['A change to an essential variable beyond the permitted range requires…', 'Un changement de variable essentielle au-delà de la plage permise exige…'],
          o: [['Requalification of the procedure', 'Une requalification du mode opératoire'], ['Nothing', 'Rien'], ['Only a note on the drawing', 'Seulement une note sur le plan']], a: 0,
          why: ['Essential variables affect the qualification: outside the permitted range, the procedure must be requalified.', 'Les variables essentielles affectent la qualification : hors de la plage permise, le mode opératoire doit être requalifié.'] } },

      { id: 'sec5', code: 'Sec. V', icon: '🔍', title: ['ASME Section V: nondestructive examination', 'ASME section V : examens non destructifs'],
        say: [
          ['Section V describes NDE methods, equipment and procedure requirements, calibration or reference standards, how to perform the examination and how to document it. The construction code or specification usually tells you which method, how much, and the acceptance criteria. Always check both documents.', 'La section V décrit les méthodes de CND, les exigences sur l’équipement et la procédure, les étalons ou références, la réalisation de l’examen et sa documentation. Le code de construction ou la spécification indique en général la méthode, l’étendue et les critères d’acceptation. Vérifiez toujours les deux documents.'],
          ['The usual articles: UT, ultrasonic testing, Article 4. PT, liquid penetrant, Article 6. MT, magnetic particle, Article 7. VT, visual, Article 9. RT, radiographic, Article 2.', 'Les articles habituels : UT, ultrasons, article 4. PT, ressuage, article 6. MT, magnétoscopie, article 7. VT, visuel, article 9. RT, radiographie, article 2.'],
          ['In one sentence each: UT sends sound into the material and evaluates reflected signals. PT finds surface-opening discontinuities on suitable non-porous surfaces. MT needs ferromagnetic material: leakage fields attract the particles. VT uses suitable access, lighting and viewing aids. RT creates an image of internal variations, with strict radiation safety.', 'En une phrase chacune : l’UT envoie du son dans la matière et évalue les signaux réfléchis. Le PT détecte les discontinuités débouchantes sur des surfaces non poreuses. Le MT exige un matériau ferromagnétique : les champs de fuite attirent les particules. Le VT demande un accès, un éclairage et des aides visuelles adaptés. La RT produit une image des variations internes, avec une radioprotection stricte.'],
          ['Method selection is not a personal preference: it must suit the material, geometry, defect type, code requirements and project specification. And evaluate indications against the governing construction code, not by guessing from Section V alone.', 'Le choix de la méthode n’est pas une préférence personnelle : il doit convenir au matériau, à la géométrie, au type de défaut, aux exigences du code et à la spécification du projet. Et les indications s’évaluent selon le code de construction applicable, pas en devinant à partir de la seule section V.']
        ],
        points: [['Verify code, edition, article, technique and written procedure.', 'Vérifier code, édition, article, technique et procédure écrite.'], ['Confirm personnel qualification/certification.', 'Confirmer qualification/certification du personnel.'], ['Check equipment, calibration, reference standards, surface, access, coverage.', 'Vérifier équipement, étalonnage, références, surface, accès, couverture.'], ['Perform the examination with the required technique; record results.', 'Réaliser l’examen avec la technique requise ; consigner les résultats.'], ['Evaluate against the construction code / specification criteria.', 'Évaluer selon les critères du code de construction / de la spécification.'], ['Report: weld ID, method, procedure, equipment, results, examiner, limitations.', 'Rapport : repère de soudure, méthode, procédure, matériel, résultats, opérateur, limites.']],
        check: { q: ['Which Section V article covers magnetic particle testing?', 'Quel article de la section V couvre la magnétoscopie ?'],
          o: [['Article 7', 'Article 7'], ['Article 6', 'Article 6'], ['Article 2', 'Article 2']], a: 0,
          why: ['MT is Article 7. PT is Article 6, RT Article 2, UT Article 4, VT Article 9.', 'Le MT est l’article 7. Le PT l’article 6, la RT l’article 2, l’UT l’article 4, le VT l’article 9.'] } },

      { id: 'links', code: 'Links', icon: '🔗', title: ['Welding + NDE: how the standards connect', 'Soudage + CND : comment les normes s’articulent'],
        say: [
          ['Example 1, a butt weld on process piping. B31.3 defines the construction requirements. Section IX qualifies the WPS and the welder where invoked. Section V gives the NDE method and procedure when the code calls for it. B31.3 and the engineering design set the examination extent and the acceptance criteria. The records must show the correct procedure, personnel, examination and acceptance basis.', 'Exemple 1, une soudure bout à bout sur tuyauterie de procédé. La B31.3 fixe les exigences de construction. La section IX qualifie le WPS et le soudeur lorsqu’elle est invoquée. La section V donne la méthode et la procédure de CND lorsque le code l’exige. La B31.3 et la conception fixent l’étendue des examens et les critères d’acceptation. Les enregistrements doivent montrer la bonne procédure, le bon personnel, l’examen et la base d’acceptation.'],
          ['Example 2, a welded storage tank. API 650 governs the construction. Section IX may be invoked for welding qualification. Section V may be invoked for NDE methods, but API 650 and the project decide where, how much, and the acceptance basis.', 'Exemple 2, un réservoir de stockage soudé. L’API 650 régit la construction. La section IX peut être invoquée pour la qualification du soudage. La section V peut l’être pour les méthodes de CND, mais l’API 650 et le projet décident où, combien et sur quelle base d’acceptation.'],
          ['Example 3, an in-service pressure vessel. API 510 provides the framework for in-service inspection, repair and rerating. The original construction information still matters. Repair welding, examination, testing and documentation follow the applicable rules and authorisation.', 'Exemple 3, un appareil à pression en service. L’API 510 fournit le cadre de l’inspection, de la réparation et du reclassement en service. Les informations de construction d’origine restent importantes. Le soudage de réparation, les examens, les essais et la documentation suivent les règles applicables et l’autorisation.'],
          ['The key question to ask every time: which equipment? Which activity? Which code edition? Which paragraph? What does the project specification say?', 'La question à se poser à chaque fois : quel équipement ? Quelle activité ? Quelle édition du code ? Quel paragraphe ? Que dit la spécification du projet ?']
        ],
        points: [['Construction code → what, how much, acceptance.', 'Code de construction → quoi, combien, acceptation.'], ['Section IX → who and with which procedure.', 'Section IX → qui et avec quel mode opératoire.'], ['Section V → how to perform the NDE.', 'Section V → comment réaliser le CND.'], ['API 510 → in-service decisions; original code still matters.', 'API 510 → décisions en service ; le code d’origine compte toujours.']],
        check: { q: ['For a butt weld on process piping, what sets the examination extent and acceptance criteria?', 'Pour une soudure bout à bout sur tuyauterie de procédé, qu’est-ce qui fixe l’étendue des examens et les critères d’acceptation ?'],
          o: [['B31.3 and the engineering design', 'La B31.3 et la conception'], ['Section V', 'La section V'], ['Section IX', 'La section IX']], a: 0,
          why: ['Section V says how to examine and Section IX qualifies the welding; B31.3 and the design decide how much and what is acceptable.', 'La section V dit comment examiner et la section IX qualifie le soudage ; la B31.3 et la conception décident combien et ce qui est acceptable.'] } },

      { id: 'formulas', code: 'Formulas', icon: '🧮', tool: 'formulas', title: ['Essential formulas and units', 'Formules et unités essentielles'],
        say: [
          ['Two formulas for corrosion. Corrosion rate = (previous thickness − current thickness) ÷ elapsed time. Remaining life, simplified = (current thickness − required thickness) ÷ corrosion rate. Always confirm when each formula applies and use the correct code equations and allowances for the actual job.', 'Deux formules pour la corrosion. Vitesse de corrosion = (épaisseur précédente − épaisseur actuelle) ÷ temps écoulé. Durée de vie restante simplifiée = (épaisseur actuelle − épaisseur requise) ÷ vitesse de corrosion. Confirmez toujours quand chaque formule s’applique et utilisez les bonnes équations et surépaisseurs du code pour le travail réel.'],
          ['Temperature: °F = (°C × 9/5) + 32, and °C = (°F − 32) × 5/9. Use the calculators below to practise.', 'Température : °F = (°C × 9/5) + 32, et °C = (°F − 32) × 5/9. Utilisez les calculateurs ci-dessous pour vous entraîner.'],
          ['Three reminders. Do not choose filler metal from the base-metal name alone. Do not select PWHT temperature or hold time from wall thickness alone. Do not accept or reject a weld from an NDE indication description alone: use the correct criteria and record the basis.', 'Trois rappels. Ne choisissez pas le métal d’apport d’après le seul nom du métal de base. Ne choisissez pas la température ou le maintien du traitement thermique d’après la seule épaisseur. N’acceptez ni ne refusez une soudure sur la seule description d’une indication de CND : utilisez les bons critères et consignez la base.'],
          ['Unit discipline: keep units consistent (mm with mm, years with mm/year, °C with °C), say whether a thickness is nominal, measured, minimum required or code-defined, and write the formula, values, units, calculation and conclusion in the report.', 'Rigueur des unités : gardez des unités cohérentes (mm avec mm, années avec mm/an, °C avec °C), précisez si une épaisseur est nominale, mesurée, minimale requise ou définie par le code, et écrivez formule, valeurs, unités, calcul et conclusion dans le rapport.']
        ],
        points: [['Corrosion rate = (previous − current) ÷ time.', 'Vitesse de corrosion = (précédente − actuelle) ÷ temps.'], ['Remaining life = (current − required) ÷ corrosion rate.', 'Durée de vie restante = (actuelle − requise) ÷ vitesse de corrosion.'], ['°F = °C × 9/5 + 32 ; °C = (°F − 32) × 5/9.', '°F = °C × 9/5 + 32 ; °C = (°F − 32) × 5/9.'], ['Write formula, values, units and conclusion in the report.', 'Écrire formule, valeurs, unités et conclusion dans le rapport.']],
        check: { q: ['Convert 93 °C to °F.', 'Convertissez 93 °C en °F.'],
          o: [['199.4 °F (about 200 °F)', '199,4 °F (environ 200 °F)'], ['167.4 °F', '167,4 °F'], ['125 °F', '125 °F']], a: 0,
          why: ['93 × 9/5 + 32 = 199.4 °F: the 93 °C / 200 °F limit you met in API 650.', '93 × 9/5 + 32 = 199,4 °F : la limite 93 °C / 200 °F vue dans l’API 650.'] } }
    ],
    exam: [
      { q: ['Which standard is mainly for process piping?', 'Quelle norme concerne principalement la tuyauterie de procédé ?'], o: [['ASME B31.3', 'ASME B31.3'], ['API 650', 'API 650'], ['ASME B16.5', 'ASME B16.5']], a: 0 },
      { q: ['Which standard is for welded aboveground storage tanks within its scope?', 'Quelle norme concerne les réservoirs de stockage soudés aériens de son domaine ?'], o: [['API 510', 'API 510'], ['API 650', 'API 650'], ['ASME Section IX', 'ASME section IX']], a: 1 },
      { q: ['Which standard addresses in-service pressure-vessel inspection and repair?', 'Quelle norme traite de l’inspection et de la réparation des appareils à pression en service ?'], o: [['API 510', 'API 510'], ['ASME B31.3', 'ASME B31.3'], ['ASME Section V', 'ASME section V']], a: 0 },
      { q: ['What does ASME B16.5 help you verify?', 'Que permet de vérifier l’ASME B16.5 ?'], o: [['Welder qualifications', 'Les qualifications des soudeurs'], ['Flange / flanged-fitting dimensions, ratings, materials and related requirements', 'Dimensions, classes, matériaux et exigences des brides et accessoires à brides'], ['Tank settlement', 'Le tassement des réservoirs']], a: 1 },
      { q: ['What is the role of ASME Section IX?', 'Quel est le rôle de l’ASME section IX ?'], o: [['Welding/brazing procedure and personnel qualification', 'Qualification des modes opératoires et du personnel de soudage/brasage'], ['Pressure-vessel design', 'Conception des appareils à pression'], ['NDE acceptance criteria for all codes', 'Critères d’acceptation CND pour tous les codes']], a: 0 },
      { q: ['What is the role of ASME Section V?', 'Quel est le rôle de l’ASME section V ?'], o: [['Flange ratings', 'Classes de brides'], ['NDE methods and examination requirements', 'Méthodes de CND et exigences d’examen'], ['Corrosion-rate calculation', 'Calcul de la vitesse de corrosion']], a: 1 },
      { q: ['Does Section V automatically give acceptance criteria for every weld?', 'La section V donne-t-elle automatiquement les critères d’acceptation de chaque soudure ?'], o: [['Yes', 'Oui'], ['No: check the construction code and project specification', 'Non : vérifier le code de construction et la spécification du projet']], a: 1 },
      { q: ['What is a WPS?', 'Qu’est-ce qu’un WPS (DMOS) ?'], o: [['Written instructions for making a weld within qualified limits', 'Les instructions écrites pour réaliser une soudure dans les limites qualifiées'], ['A record of test results', 'Un enregistrement de résultats d’essais'], ['A welder’s certificate', 'Un certificat de soudeur']], a: 0 },
      { q: ['What is a PQR?', 'Qu’est-ce qu’un PQR (QMOS) ?'], o: [['A drawing of the joint', 'Un plan du joint'], ['A record of procedure qualification variables and test results', 'L’enregistrement des variables et résultats d’essais de qualification du mode opératoire'], ['A pressure test report', 'Un PV d’épreuve']], a: 1 },
      { q: ['What is the simplified remaining-life formula?', 'Quelle est la formule simplifiée de durée de vie restante ?'], o: [['(Current − required thickness) ÷ corrosion rate', '(Épaisseur actuelle − requise) ÷ vitesse de corrosion'], ['Corrosion rate × thickness', 'Vitesse de corrosion × épaisseur'], ['(Required − current) × time', '(Requise − actuelle) × temps']], a: 0 },
      { q: ['Can you select a flange using class only?', 'Peut-on choisir une bride d’après la seule classe ?'], o: [['Yes', 'Oui'], ['No: also material group, temperature, rating, size, facing, bolting, gasket and project requirements', 'Non : aussi groupe de matériau, température, régime, dimension, portée, boulonnerie, joint et exigences du projet']], a: 1 },
      { q: ['Can you assume B31.3-2014 and B31.3-2020 are interchangeable?', 'Peut-on supposer que la B31.3-2014 et la B31.3-2020 sont interchangeables ?'], o: [['Yes, they are the same code', 'Oui, c’est le même code'], ['No: use the edition specified by the project/jurisdiction', 'Non : utiliser l’édition spécifiée par le projet/la juridiction']], a: 1 }
    ],
    safety: ['For live inspection, repair, welding, PWHT, acceptance, rerating or pressure testing, use the full applicable standard and edition, approved procedures, engineering calculations and authorised decisions. If a rule is not clearly supported by the governing documents, stop and verify it.', 'Pour une inspection, une réparation, un soudage, un traitement thermique, une acceptation, un reclassement ou une épreuve réels, utilisez la norme complète et son édition, les procédures approuvées, les calculs d’ingénierie et les décisions autorisées. Si une règle n’est pas clairement appuyée par les documents applicables, arrêtez et vérifiez.']
  };

  if (typeof document === 'undefined') return; // kb.mjs only needs the data above

  /* ======================= AI teacher (browser) ======================= */
  const S = window.CYSTUDY;
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  const KEY = 'cyclops-study-v1';
  const load = () => { try { return Object.assign({ done: {}, best: null }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { done: {}, best: null }; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch { /* storage unavailable: progress lasts for this visit */ } };
  let prog = load();
  const st = { lesson: 0, step: 0, voice: false, typing: null, busy: false, history: [], exam: null, talkUntil: 0, raf: 0, r: null };
  let dlg = null;

  const css = `
.cyst { width: min(1200px, 97vw); height: min(92vh, 900px); max-height: none; padding: 0; border: 1px solid var(--line); border-radius: 12px; background: var(--bg); color: var(--text); }
.cyst::backdrop { background: rgba(3, 7, 20, .72); }
.cyst-wrap { display: grid; grid-template-rows: auto 1fr; height: 100%; }
.cyst-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }
.cyst-head strong { display: block; font-size: 1.05rem; } .cyst-head span { color: var(--muted); font-size: 12px; }
.cyst-body { display: grid; grid-template-columns: 250px minmax(0, 1fr); min-height: 0; }
.cyst-nav { overflow: auto; border-right: 1px solid var(--line); padding: 10px; display: grid; gap: 6px; align-content: start; }
.cyst-nav button { text-align: left; display: grid; grid-template-columns: 26px 1fr auto; gap: 6px; align-items: center; padding: 8px; font-size: 13px; }
.cyst-nav button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cyst-nav small { color: #7de2b5; }
.cyst-main { display: grid; grid-template-rows: auto 1fr auto auto; min-height: 0; }
.cyst-stage { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 12px; padding: 12px 14px 0; align-items: start; }
.cyst-teacher { width: 100%; height: 200px; border-radius: 10px; border: 1px solid var(--line); display: block; background: #101a2b; }
.cyst-title h2 { margin: 2px 0 4px; font-size: 1.25rem; } .cyst-title p { margin: 0; color: var(--muted); font-size: 13px; }
.cyst-progress { height: 6px; border-radius: 99px; background: rgba(255,255,255,.08); margin-top: 10px; overflow: hidden; } .cyst-progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--blue), var(--violet)); transition: width .4s; }
.cyst-chat { overflow: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.cyst-msg { max-width: 860px; padding: 10px 12px; border-radius: 12px; line-height: 1.5; animation: cyst-in .25s ease-out; }
.cyst-msg.t { background: rgba(61, 169, 255, .10); border: 1px solid rgba(61, 169, 255, .35); border-top-left-radius: 3px; align-self: flex-start; }
.cyst-msg.u { background: rgba(157, 101, 255, .18); border: 1px solid rgba(157, 101, 255, .4); border-top-right-radius: 3px; align-self: flex-end; }
.cyst-msg .who { display: block; font-size: 11px; font-weight: 800; letter-spacing: .06em; color: var(--muted); margin-bottom: 3px; }
.cyst-msg ul { margin: 6px 0 0; padding-left: 20px; } .cyst-msg li { margin: 3px 0; }
.cyst-opts { display: grid; gap: 6px; margin-top: 8px; } .cyst-opts button { text-align: left; }
.cyst-opts button.ok { border-color: #42c991; background: rgba(28, 106, 78, .45); } .cyst-opts button.ko { border-color: #e66b78; background: rgba(130, 47, 61, .4); }
.cyst-src { margin-top: 8px; font-size: 12px; color: var(--muted); border-top: 1px dashed rgba(174,187,227,.35); padding-top: 6px; }
.cyst-src b { color: var(--text); }
.cyst-tool { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 8px; }
.cyst-tool label { font-size: 12px; color: var(--muted); } .cyst-tool input { display: block; width: 100%; margin-top: 3px; border: 1px solid var(--line); border-radius: 7px; background: #0b1530; color: var(--text); padding: 7px; font: inherit; }
.cyst-out { margin-top: 8px; font-weight: 700; color: #7de2b5; }
.cyst-ctrl { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px; border-top: 1px solid var(--line); }
.cyst-ctrl .primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.cyst-ask { display: flex; gap: 6px; padding: 0 14px 12px; }
.cyst-ask input { flex: 1; min-width: 0; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 10px 12px; font: inherit; }
.cyst-typing::after { content: '▍'; animation: cyst-blink 1s steps(2) infinite; }
.cyst-dots span { display: inline-block; width: 6px; height: 6px; margin: 0 2px; border-radius: 50%; background: var(--muted); animation: cyst-bounce 1s infinite; } .cyst-dots span:nth-child(2) { animation-delay: .15s; } .cyst-dots span:nth-child(3) { animation-delay: .3s; }
@keyframes cyst-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes cyst-blink { 50% { opacity: 0; } }
@keyframes cyst-bounce { 50% { transform: translateY(-4px); } }
html.field .cyst-msg.t { background: #eef5ff; } html.field .cyst-msg.u { background: #f1ebff; } html.field .cyst-tool input { background: #fff; color: #0a0d12; }
@media (max-width: 820px) { .cyst-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); } .cyst-nav { border-right: 0; border-bottom: 1px solid var(--line); display: flex; overflow-x: auto; } .cyst-nav button { min-width: 170px; } .cyst-stage { grid-template-columns: 110px minmax(0, 1fr); } .cyst-teacher { height: 120px; } }
@media (prefers-reduced-motion: reduce) { .cyst-msg { animation: none; } }
`;

  /* ---------- chat helpers ---------- */
  const chat = () => dlg.querySelector('.cyst-chat');
  function bubble(kind, html) {
    const b = document.createElement('div');
    b.className = 'cyst-msg ' + kind;
    b.innerHTML = '<span class="who">' + (kind === 't' ? '🎓 ' + L('TEACHER', 'FORMATEUR') : L('YOU', 'VOUS')) + '</span><div class="body">' + (html || '') + '</div>';
    chat().appendChild(b); b.scrollIntoView({ block: 'end', behavior: 'smooth' });
    return b.querySelector('.body');
  }
  // Teacher "speaks": text is typed out, the 3D instructor talks, optional voice.
  function say(text, then) {
    finishTyping();
    const body = bubble('t', ''); body.classList.add('cyst-typing');
    let i = 0; const step = Math.max(2, Math.round(text.length / 70));
    st.talkUntil = performance.now() + 600 + text.length * 22;
    st.typing = { body, text, then, timer: setInterval(() => { i += step; body.textContent = text.slice(0, i); if (i >= text.length) finishTyping(); }, 16) };
    speak(text);
    return body;
  }
  function finishTyping() {
    const t = st.typing; if (!t) return;
    clearInterval(t.timer); t.body.classList.remove('cyst-typing'); t.body.innerHTML = fmt(t.text); st.typing = null;
    if (t.then) t.then(t.body);
  }
  function speak(text) {
    if (!st.voice || typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text), want = L('en', 'fr');
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(want));
    if (v) u.voice = v; u.lang = L('en-US', 'fr-FR'); u.rate = 0.98;
    u.onstart = () => { st.talkUntil = performance.now() + 60000; }; u.onend = () => { st.talkUntil = performance.now() + 200; };
    speechSynthesis.speak(u);
  }

  /* ---------- lesson flow ---------- */
  const lesson = () => S.lessons[st.lesson];
  function stepsOf(l) { const s = l.say.map((_, i) => ({ k: 'say', i })); s.push({ k: 'points' }); if (l.tool) s.push({ k: 'tool' }); s.push({ k: 'check' }); return s; }
  function openLesson(i) {
    st.exam = null; st.lesson = i; st.step = 0; finishTyping(); chat().innerHTML = ''; if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    renderNav(); renderHead(); next();
  }
  function next() {
    if (st.typing) { finishTyping(); return; }
    if (st.exam) return;
    const l = lesson(), steps = stepsOf(l), s = steps[st.step];
    if (!s) { // lesson finished
      if (st.lesson < S.lessons.length - 1) openLesson(st.lesson + 1); else startExam();
      return;
    }
    st.step++;
    if (s.k === 'say') say(T2(l.say[s.i]));
    else if (s.k === 'points') { say(L('Let me sum up the key points:', 'Je résume les points clés :'), (body) => { body.insertAdjacentHTML('beforeend', '<ul>' + l.points.map((p) => '<li>' + esc(T2(p)) + '</li>').join('') + '</ul>'); }); }
    else if (s.k === 'tool') say(l.tool === 'life' ? L('Now practise with the calculator: change the values and watch the result.', 'Entraînez-vous avec le calculateur : changez les valeurs et regardez le résultat.') : L('Here are the calculators. Try a few values.', 'Voici les calculateurs. Essayez quelques valeurs.'), (body) => tool(body, l.tool));
    else if (s.k === 'check') say(L('Quick check: ', 'Petite vérification : ') + T2(l.check.q), (body) => mcq(body, l.check, (ok) => {
      prog.done[l.id] = prog.done[l.id] || ok; save(); renderNav(); renderHead();
      say((ok ? L('Correct! ', 'Exact ! ') : L('Not quite. ', 'Pas tout à fait. ')) + T2(l.check.why) + ' ' + (st.lesson < S.lessons.length - 1 ? L('Press "Continue" for the next lesson, or ask me a question.', 'Appuyez sur « Continuer » pour la leçon suivante, ou posez-moi une question.') : L('Press "Continue" for the final exam.', 'Appuyez sur « Continuer » pour l’examen final.')));
    }));
    renderHead();
  }
  function mcq(body, item, done) {
    const box = document.createElement('div'); box.className = 'cyst-opts';
    box.innerHTML = item.o.map((o, i) => '<button type="button" data-o="' + i + '">' + esc(T2(o)) + '</button>').join('');
    body.appendChild(box);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-o]'); if (!b || box.dataset.done) return; box.dataset.done = '1';
      const ok = Number(b.dataset.o) === item.a;
      b.classList.add(ok ? 'ok' : 'ko'); box.querySelector('[data-o="' + item.a + '"]').classList.add('ok');
      box.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      bubble('u', esc(b.textContent));
      done(ok);
    });
  }
  function tool(body, kind) {
    const n = (v) => Number(String(v).replace(',', '.'));
    const box = document.createElement('div');
    if (kind === 'life') {
      box.innerHTML = '<div class="cyst-tool"><label>' + L('Measured thickness (mm)', 'Épaisseur mesurée (mm)') + '<input data-k="m" value="8.0" inputmode="decimal"></label><label>' + L('Required thickness (mm)', 'Épaisseur requise (mm)') + '<input data-k="r" value="6.0" inputmode="decimal"></label><label>' + L('Corrosion rate (mm/year)', 'Vitesse de corrosion (mm/an)') + '<input data-k="c" value="0.25" inputmode="decimal"></label></div><div class="cyst-out"></div>';
      const upd = () => { const m = n(box.querySelector('[data-k=m]').value), r = n(box.querySelector('[data-k=r]').value), c = n(box.querySelector('[data-k=c]').value), o = box.querySelector('.cyst-out');
        if (!(c > 0) || isNaN(m) || isNaN(r)) { o.textContent = L('Enter numbers; the corrosion rate must be above 0.', 'Entrez des nombres ; la vitesse de corrosion doit être supérieure à 0.'); return; }
        const life = (m - r) / c;
        o.textContent = life < 0 ? L('Measured thickness is below the required thickness: stop and refer to engineering.', 'L’épaisseur mesurée est inférieure à l’épaisseur requise : arrêtez et consultez l’ingénierie.') : `(${m} − ${r}) ÷ ${c} = ${life.toFixed(1)} ${L('years (learning estimate only)', 'ans (estimation pédagogique)')}`; };
      box.addEventListener('input', upd); upd();
    } else {
      box.innerHTML = '<div class="cyst-tool"><label>' + L('Previous thickness (mm)', 'Épaisseur précédente (mm)') + '<input data-k="p" value="10.0" inputmode="decimal"></label><label>' + L('Current thickness (mm)', 'Épaisseur actuelle (mm)') + '<input data-k="c" value="9.2" inputmode="decimal"></label><label>' + L('Elapsed time (years)', 'Temps écoulé (ans)') + '<input data-k="y" value="4" inputmode="decimal"></label><label>' + L('Required thickness (mm)', 'Épaisseur requise (mm)') + '<input data-k="r" value="7.5" inputmode="decimal"></label></div><div class="cyst-out" data-o="1"></div>' +
        '<div class="cyst-tool"><label>°C<input data-k="tc" value="93" inputmode="decimal"></label><label>°F<input data-k="tf" value="199.4" inputmode="decimal"></label></div><div class="cyst-out" data-o="2"></div>';
      const upd = (e) => {
        const g = (k) => n(box.querySelector('[data-k=' + k + ']').value), o1 = box.querySelector('[data-o="1"]'), o2 = box.querySelector('[data-o="2"]');
        const rate = (g('p') - g('c')) / g('y');
        if (g('y') > 0 && rate > 0) { const life = (g('c') - g('r')) / rate; o1.textContent = `${L('Corrosion rate', 'Vitesse de corrosion')} = (${g('p')} − ${g('c')}) ÷ ${g('y')} = ${rate.toFixed(3)} mm/${L('year', 'an')} · ${L('remaining life', 'durée de vie restante')} = ${life >= 0 ? life.toFixed(1) + ' ' + L('years', 'ans') : L('below required thickness', 'sous l’épaisseur requise')}`; }
        else o1.textContent = L('Enter a positive elapsed time and a thickness loss.', 'Entrez un temps écoulé positif et une perte d’épaisseur.');
        if (e && e.target && e.target.dataset.k === 'tf') box.querySelector('[data-k=tc]').value = ((g('tf') - 32) * 5 / 9).toFixed(1);
        else box.querySelector('[data-k=tf]').value = (g('tc') * 9 / 5 + 32).toFixed(1);
        o2.textContent = `${box.querySelector('[data-k=tc]').value} °C = ${box.querySelector('[data-k=tf]').value} °F`;
      };
      box.addEventListener('input', upd); upd();
    }
    body.appendChild(box);
  }

  /* ---------- final exam ---------- */
  function startExam() {
    finishTyping(); chat().innerHTML = ''; st.exam = { i: 0, score: 0 };
    renderNav(); renderHead();
    say(L(`Final exam: ${S.exam.length} questions from the study guide. Take your time.`, `Examen final : ${S.exam.length} questions tirées du guide. Prenez votre temps.`), () => examQ());
  }
  function examQ() {
    const ex = st.exam, it = S.exam[ex.i];
    say(`${ex.i + 1}/${S.exam.length} · ${T2(it.q)}`, (body) => mcq(body, it, (ok) => {
      if (ok) ex.score++;
      ex.i++; renderHead();
      if (ex.i < S.exam.length) setTimeout(examQ, 450);
      else {
        const pct = Math.round(ex.score / S.exam.length * 100);
        prog.best = Math.max(prog.best || 0, pct); save(); renderNav();
        say(L(`You scored ${ex.score}/${S.exam.length} (${pct} %). `, `Vous avez obtenu ${ex.score}/${S.exam.length} (${pct} %). `) + (pct >= 80 ? L('Excellent work! ', 'Excellent travail ! ') : L('Review the lessons marked without a tick and try again. ', 'Revoyez les leçons sans coche et réessayez. ')) + T2(S.safety));
      }
    }));
  }

  /* ---------- ask the teacher ---------- */
  function localAnswer(q) {
    const words = new Set(String(q).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 2));
    const scored = [];
    S.lessons.forEach((l) => [...l.say, ...l.points].forEach((p) => {
      const text = T2(p), norm = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      let s = 0; words.forEach((w) => { if (norm.includes(w)) s += w.length > 4 ? 2 : 1; });
      if (s) scored.push([s, l, text]);
    }));
    scored.sort((a, b) => b[0] - a[0]);
    return scored.slice(0, 2);
  }
  async function ask(q) {
    if (!q || st.busy) return;
    finishTyping(); bubble('u', esc(q));
    st.busy = true; const wait = bubble('t', '<span class="cyst-dots"><span></span><span></span><span></span></span>'); st.talkUntil = performance.now() + 60000;
    const l = st.exam ? null : lesson();
    const question = l ? q + '\n\n[' + L('Current lesson', 'Leçon en cours') + ': ' + T2(l.title) + ' — ' + S.source + ']' : q;
    try {
      const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: question, lang: L('en', 'fr'), method: 'OTH', mode: 'teacher', history: st.history.slice(-6) }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.answer) throw new Error(data.error || ('HTTP ' + r.status));
      wait.parentElement.remove();
      st.history.push({ role: 'user', content: q }, { role: 'assistant', content: data.answer });
      say(data.answer, (body) => {
        if (data.sources && data.sources.length) body.insertAdjacentHTML('beforeend', '<div class="cyst-src">' + L('Sources', 'Sources') + ': ' + data.sources.map((s) => '<div><b>[' + esc(s.tag) + ']</b> ' + esc(s.typeLabel) + ' — ' + esc(s.source) + (s.section ? ' · ' + esc(s.section) : '') + '</div>').join('') + '</div>');
        if (data.truncated) body.insertAdjacentHTML('beforeend', '<div class="cyst-src">' + L('Answer shortened by the length limit.', 'Réponse raccourcie par la limite de longueur.') + '</div>');
      });
    } catch (err) {
      wait.parentElement.remove();
      const hits = localAnswer(q);
      const head = L('The AI is not available right now, so here is what the study guide says', 'L’IA n’est pas disponible pour le moment ; voici ce que dit le guide d’étude');
      say(hits.length ? head + ':\n\n' + hits.map(([, ll, t]) => '• ' + T2(ll.title) + ' — ' + t).join('\n\n') : L('The AI is not available right now and I could not find this in the study guide. Try other words, or check the lesson list.', 'L’IA n’est pas disponible pour le moment et je n’ai pas trouvé cela dans le guide. Essayez d’autres mots, ou consultez la liste des leçons.'),
        (body) => body.insertAdjacentHTML('beforeend', '<div class="cyst-src">' + L('Offline answer from the study guide', 'Réponse hors ligne tirée du guide') + ' · ' + esc(String(err.message || err).slice(0, 120)) + '</div>'));
    } finally { st.busy = false; }
  }

  /* ---------- rendering ---------- */
  function renderNav() {
    const nav = dlg.querySelector('.cyst-nav');
    nav.innerHTML = S.lessons.map((l, i) => '<button type="button" data-l="' + i + '" class="' + (!st.exam && i === st.lesson ? 'on' : '') + '"><span>' + l.icon + '</span><span>' + esc(T2(l.title)) + '</span><small>' + (prog.done[l.id] ? '✓' : '') + '</small></button>').join('') +
      '<button type="button" data-l="exam" class="' + (st.exam ? 'on' : '') + '"><span>🏁</span><span>' + L('Final exam', 'Examen final') + '</span><small>' + (prog.best != null ? prog.best + ' %' : '') + '</small></button>';
  }
  function renderHead() {
    const l = lesson(), done = Object.values(prog.done).filter(Boolean).length;
    dlg.querySelector('.cyst-title').innerHTML = st.exam
      ? '<p>🏁 ' + L('Final exam', 'Examen final') + '</p><h2>' + L('Question', 'Question') + ' ' + Math.min(st.exam.i + 1, S.exam.length) + ' / ' + S.exam.length + '</h2><p>' + L('Score', 'Score') + ': ' + st.exam.score + '</p>'
      : '<p>' + l.icon + ' ' + esc(l.code) + ' · ' + L('Lesson', 'Leçon') + ' ' + (st.lesson + 1) + ' / ' + S.lessons.length + '</p><h2>' + esc(T2(l.title)) + '</h2><p>' + L('Lessons completed', 'Leçons réussies') + ': ' + done + ' / ' + S.lessons.length + '</p>';
    dlg.querySelector('.cyst-progress span').style.width = (st.exam ? st.exam.i / S.exam.length : st.step / stepsOf(l).length) * 100 + '%';
    dlg.querySelector('[data-a=voice]').textContent = (st.voice ? '🔊 ' : '🔇 ') + L('Voice', 'Voix') + (st.voice ? ' ON' : ' OFF');
  }
  function build() {
    if (!document.getElementById('cyst-css')) { const s = document.createElement('style'); s.id = 'cyst-css'; s.textContent = css; document.head.appendChild(s); }
    dlg = document.createElement('dialog'); dlg.className = 'cyst';
    dlg.innerHTML = '<div class="cyst-wrap"><div class="cyst-head"><div><strong>🎓 ' + esc(T2(S.title)) + '</strong><span>' + L('AI teacher · lessons, calculators, quick checks and final exam · learning summary, verify the code edition', 'Formateur IA · leçons, calculateurs, vérifications et examen final · résumé pédagogique, vérifiez l’édition du code') + '</span></div><button type="button" data-a="close" aria-label="' + L('Close', 'Fermer') + '">✕</button></div>' +
      '<div class="cyst-body"><nav class="cyst-nav" aria-label="' + L('Lessons', 'Leçons') + '"></nav><section class="cyst-main"><div class="cyst-stage"><canvas class="cyst-teacher" aria-label="' + L('3D teacher', 'Formateur 3D') + '"></canvas><div><div class="cyst-title"></div><div class="cyst-progress"><span></span></div></div></div>' +
      '<div class="cyst-chat" aria-live="polite"></div>' +
      '<div class="cyst-ctrl"><button type="button" class="primary" data-a="next">▶ ' + L('Continue', 'Continuer') + '</button><button type="button" data-a="repeat">↻ ' + L('Repeat lesson', 'Répéter la leçon') + '</button><button type="button" data-a="voice"></button><button type="button" data-a="exam">🏁 ' + L('Final exam', 'Examen final') + '</button></div>' +
      '<form class="cyst-ask"><input type="text" maxlength="600" placeholder="' + L('Ask the teacher anything about these codes…', 'Posez une question au formateur sur ces codes…') + '" aria-label="' + L('Question for the teacher', 'Question pour le formateur') + '"><button type="submit">' + L('Ask', 'Demander') + '</button></form></section></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.l != null) { if (b.dataset.l === 'exam') startExam(); else openLesson(Number(b.dataset.l)); }
      else if (b.dataset.a === 'close') dlg.close();
      else if (b.dataset.a === 'next') next();
      else if (b.dataset.a === 'repeat') openLesson(st.exam ? 0 : st.lesson);
      else if (b.dataset.a === 'exam') startExam();
      else if (b.dataset.a === 'voice') { st.voice = !st.voice; if (!st.voice && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); renderHead(); }
    });
    dlg.querySelector('.cyst-ask').addEventListener('submit', (e) => { e.preventDefault(); const i = dlg.querySelector('.cyst-ask input'); const q = i.value.trim(); i.value = ''; ask(q); });
    const me = dlg;
    me.addEventListener('close', () => {
      me.remove();
      if (dlg !== me) return; // a newer dialog (e.g. after a language change) is already open
      cancelAnimationFrame(st.raf); st.raf = 0; st.r = null; finishTyping(); if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); dlg = null;
    });
    startTeacher();
  }
  // 3D instructor from cyclops3D.js (WebGL when available), mouth and arm move while the teacher talks
  function startTeacher() {
    const cv = dlg.querySelector('.cyst-teacher');
    if (!window.CY3 || !window.CY3.make3D || !window.CY3.drawInstructor) { cv.hidden = true; return; }
    const r = window.CY3.make3D(cv); r.reset({ d: 5.2, y: -0.25, p: 0.1, t: [0, 1.4, 0] }); st.r = r;
    const t0 = performance.now();
    const frame = (now) => { if (!dlg || !cv.isConnected) return; r.begin(); window.CY3.drawInstructor(r, (now - t0) / 1000, now < st.talkUntil); r.flush(); st.raf = requestAnimationFrame(frame); };
    st.raf = requestAnimationFrame(frame);
  }
  function open(i) {
    if (dlg) dlg.close();
    build(); dlg.showModal();
    st.history = [];
    if (i === 'exam') startExam(); else openLesson(i != null ? i : firstUndone());
  }
  const firstUndone = () => { const i = S.lessons.findIndex((l) => !prog.done[l.id]); return i < 0 ? 0 : i; };

  /* ---------- header button ---------- */
  function headerButton() {
    const actions = document.querySelector('.head-actions'); if (!actions || document.getElementById('study-open')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'study-open';
    const label = () => { b.textContent = '🎓 ' + L('ASME/API teacher', 'Formateur ASME/API'); b.title = L('Study the ASME & API guide with the AI teacher', 'Étudier le guide ASME & API avec le formateur IA'); };
    label(); b.addEventListener('click', () => open());
    const quiz = document.getElementById('quiz-open'); actions.insertBefore(b, quiz || actions.firstChild);
    const sw = document.getElementById('lang'); if (sw) sw.addEventListener('change', () => { label(); if (dlg) { const i = st.exam ? 'exam' : st.lesson; open(i); } });
  }
  window.CYSTUDY.open = open;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', headerButton); else headerButton();
}());
