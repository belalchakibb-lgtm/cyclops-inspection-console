/* CYCLOPS Academy: the inspection school for complete beginners.
   One entry point (header button) that turns the existing modules into a progressive learning path:
   - Learning path: 5 levels that unlock in order, built from new beginner lessons and the existing
     method courses, UT/RT simulators, quiz and ASME/API teacher.
   - 3D Lab: every equipment model of the 4 departments (CND, APVG, APL, APE) with explode/section/inspect.
   - Visual dictionary: searchable EN/FR terms with simple + technical definitions, example and a link
     to a 3D view, the UT A-scan library or the RT film atlas.
   - Progress: XP, streak, achievements, statistics and printable course-completion certificates.
   Modules report learning activity with:  window.dispatchEvent(new CustomEvent('cy-learn', {detail:{id, ok, score}}))
   Progress is stored on this device only (localStorage). Training only: not a qualification. */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const today = () => new Date().toISOString().slice(0, 10);

  /* ======================= beginner lessons (Level 1) ======================= */
  const BASICS = [
    { id: 'b1', icon: '🏭', t: ['What is industrial inspection?', 'Qu’est-ce que l’inspection industrielle ?'],
      p: [
        ['Factories, refineries and power plants are full of equipment that holds pressure, lifts heavy loads or carries electricity. If such equipment fails, people can be injured and the plant can stop or even explode.', 'Les usines, raffineries et centrales sont remplies d’équipements qui contiennent de la pression, soulèvent de lourdes charges ou transportent l’électricité. Si l’un d’eux casse, des personnes peuvent être blessées et l’installation peut s’arrêter, voire exploser.'],
        ['Inspection means checking that equipment is in the condition required by written rules. The inspector looks, measures and tests, then compares the results with acceptance criteria written in a procedure, a code or a standard. He or she records objective evidence: what was checked, how, with which instrument, and the result.', 'Inspecter, c’est vérifier qu’un équipement est dans l’état exigé par des règles écrites. L’inspecteur observe, mesure et teste, puis compare les résultats aux critères d’acceptation écrits dans une procédure, un code ou une norme. Il consigne des preuves objectives : ce qui a été contrôlé, comment, avec quel appareil, et le résultat.'],
        ['Inspection happens at three moments: during fabrication (new equipment), periodically in service (ageing, corrosion, wear) and after a repair or modification.', 'L’inspection a lieu à trois moments : pendant la fabrication (équipement neuf), périodiquement en service (vieillissement, corrosion, usure) et après une réparation ou une modification.'],
        ['At AQCS the work is organised in four departments: CND (non-destructive testing of materials and welds), APVG (pressure equipment), APL (lifting equipment) and APE (electrical equipment). This Academy teaches all four, starting from zero.', 'Chez AQCS, le travail est organisé en quatre départements : CND (contrôle non destructif des matériaux et soudures), APVG (appareils à pression), APL (appareils de levage) et APE (équipements électriques). Cette Académie enseigne les quatre, en partant de zéro.']
      ],
      words: ['inspection', 'procedure', 'code', 'acceptance'],
      q: { q: ['What does an inspector compare his or her observations with?', 'À quoi l’inspecteur compare-t-il ses observations ?'], o: [['The written requirements: procedure, code, acceptance criteria', 'Aux exigences écrites : procédure, code, critères d’acceptation'], ['A personal feeling about the equipment', 'À une impression personnelle sur l’équipement'], ['The manufacturer’s advertising', 'À la publicité du fabricant']], a: 0,
        why: ['Inspection is always a comparison with written, agreed requirements, never an opinion.', 'L’inspection est toujours une comparaison avec des exigences écrites et convenues, jamais une opinion.'] } },
    { id: 'b2', icon: '🔥', t: ['Welds and why they matter', 'Les soudures et leur importance'],
      p: [
        ['A weld joins two metal parts by melting their edges together, usually with extra filler metal. Pipes, pressure vessels, tanks and crane structures are mostly welded, so a large part of inspection is about welds.', 'Une soudure assemble deux pièces métalliques en faisant fondre leurs bords ensemble, généralement avec un métal d’apport. Tuyauteries, appareils à pression, réservoirs et charpentes de grues sont surtout soudés : une grande partie de l’inspection porte donc sur les soudures.'],
        ['A weld has named zones: the base metal (the original plates), the weld metal (what was melted), the fusion line (the border between them), the heat-affected zone or HAZ (base metal changed by the heat), the cap (top surface) and the root (the bottom of the joint).', 'Une soudure a des zones nommées : le métal de base (les tôles d’origine), le métal fondu, la ligne de fusion (la limite entre les deux), la zone affectée thermiquement ou ZAT (métal de base modifié par la chaleur), la passe de finition (surface du dessus) et la racine (le fond du joint).'],
        ['Welding can leave imperfections: cracks (the metal is split), porosity (gas bubbles), slag inclusions (non-metallic residue trapped inside), lack of fusion (metal not melted together) and undercut (a groove melted at the edge).', 'Le soudage peut laisser des imperfections : fissures (le métal est fendu), soufflures (bulles de gaz), inclusions de laitier (résidu non métallique piégé), manque de fusion (métal non fondu ensemble) et caniveaux (sillon fondu en bordure).'],
        ['Some small imperfections are acceptable; others, like cracks, are almost never accepted because they can grow and break the part. Which ones are acceptable is decided by the applicable code, not by the inspector’s taste.', 'Certaines petites imperfections sont acceptables ; d’autres, comme les fissures, ne le sont presque jamais car elles peuvent grandir et rompre la pièce. C’est le code applicable qui décide lesquelles sont acceptables, pas le goût de l’inspecteur.']
      ],
      words: ['weld', 'haz', 'root', 'crack', 'porosity', 'slag', 'lof'],
      q: { q: ['What is porosity in a weld?', 'Qu’est-ce qu’une soufflure dans une soudure ?'], o: [['Gas bubbles trapped in the weld metal', 'Des bulles de gaz piégées dans le métal fondu'], ['A split in the metal', 'Une fente dans le métal'], ['The paint on the weld', 'La peinture sur la soudure']], a: 0,
        why: ['Porosity is gas trapped while the weld metal solidifies; a split in the metal is a crack.', 'Une soufflure est du gaz piégé pendant la solidification ; une fente dans le métal est une fissure.'] } },
    { id: 'b3', icon: '🔬', t: ['Destructive and non-destructive testing', 'Essais destructifs et non destructifs'],
      p: [
        ['Destructive testing cuts, bends, pulls or breaks a sample to measure its properties (strength, ductility, toughness). It is used to qualify materials and welding procedures. The sample is destroyed, so it cannot be done on the real equipment.', 'Les essais destructifs découpent, plient, tirent ou cassent une éprouvette pour mesurer ses propriétés (résistance, ductilité, ténacité). Ils servent à qualifier les matériaux et les modes opératoires de soudage. L’éprouvette est détruite : on ne peut pas le faire sur l’équipement réel.'],
        ['Non-destructive testing (NDT, in French CND) examines the real part without damaging it, so the part can go into service after the test.', 'Le contrôle non destructif (CND, en anglais NDT) examine la vraie pièce sans l’abîmer : elle peut être mise en service après le contrôle.'],
        ['No single NDT method finds everything. Surface methods (VT, PT, MT) find defects that reach or are close to the surface. Volumetric methods (UT, RT) look inside the thickness. Visual testing always comes first.', 'Aucune méthode de CND ne détecte tout. Les méthodes de surface (VT, PT, MT) détectent les défauts débouchants ou proches de la surface. Les méthodes volumiques (UT, RT) regardent dans l’épaisseur. Le contrôle visuel vient toujours en premier.']
      ],
      words: ['ndt', 'vt', 'ut', 'rt'],
      q: { q: ['Why do we use NDT on a real pressure vessel?', 'Pourquoi utilise-t-on le CND sur un vrai appareil à pression ?'], o: [['Because it checks the part without damaging it', 'Parce qu’il contrôle la pièce sans l’abîmer'], ['Because it replaces the code', 'Parce qu’il remplace le code'], ['Because it is always faster than looking', 'Parce qu’il est toujours plus rapide que regarder']], a: 0,
        why: ['NDT keeps the part usable; the code still decides what is required and acceptable.', 'Le CND garde la pièce utilisable ; c’est toujours le code qui décide de ce qui est exigé et acceptable.'] } },
    { id: 'b4', icon: '🧰', t: ['The five main NDT methods', 'Les cinq principales méthodes de CND'],
      p: [
        ['VT, visual testing: the eyes, good light and simple gauges. It is always done first and finds most surface problems.', 'VT, contrôle visuel : les yeux, un bon éclairage et des jauges simples. Il se fait toujours en premier et trouve la plupart des problèmes de surface.'],
        ['PT, penetrant testing: a coloured liquid soaks into cracks open to the surface; after cleaning, a white developer pulls it back out and draws a red line on white where the crack is.', 'PT, ressuage : un liquide coloré pénètre dans les fissures débouchantes ; après nettoyage, un révélateur blanc le fait ressortir et dessine une ligne rouge sur fond blanc à l’endroit de la fissure.'],
        ['MT, magnetic particle testing: the steel is magnetised; a crack disturbs the magnetic field, which leaks out and attracts fine iron particles into a visible line. It only works on ferromagnetic steels.', 'MT, magnétoscopie : l’acier est aimanté ; une fissure perturbe le champ magnétique, qui fuit et attire de fines particules de fer en une ligne visible. Ne fonctionne que sur les aciers ferromagnétiques.'],
        ['UT, ultrasonic testing: a probe sends high-frequency sound into the metal; reflections from defects come back as echoes on a screen called the A-scan. RT, radiographic testing: X-rays or gamma rays pass through the part and make an image; defects with less metal appear darker.', 'UT, ultrasons : un traducteur envoie un son à haute fréquence dans le métal ; les réflexions sur les défauts reviennent comme des échos sur un écran appelé A-scan. RT, radiographie : des rayons X ou gamma traversent la pièce et forment une image ; les défauts, avec moins de métal, apparaissent plus sombres.']
      ],
      words: ['pt', 'mt', 'ut', 'rt', 'ascan'],
      q: { q: ['Which method only works on ferromagnetic materials such as carbon steel?', 'Quelle méthode ne fonctionne que sur les matériaux ferromagnétiques comme l’acier au carbone ?'], o: [['MT, magnetic particle testing', 'MT, magnétoscopie'], ['PT, penetrant testing', 'PT, ressuage'], ['VT, visual testing', 'VT, contrôle visuel']], a: 0,
        why: ['MT needs a magnetic field inside the part; stainless austenitic steel and aluminium cannot be magnetised.', 'La MT a besoin d’un champ magnétique dans la pièce ; l’inox austénitique et l’aluminium ne s’aimantent pas.'] } },
    { id: 'b5', icon: '🏗', t: ['Pressure, lifting and electrical equipment', 'Équipements à pression, de levage et électriques'],
      p: [
        ['APVG, pressure equipment: vessels, boilers and piping contain fluids under pressure, which store a lot of energy. Inspectors check wall thickness and corrosion, welds, supports, safety valves, gauges, and prove strength with a pressure test.', 'APVG, appareils à pression : réservoirs, chaudières et tuyauteries contiennent des fluides sous pression, qui stockent beaucoup d’énergie. Les inspecteurs contrôlent épaisseurs et corrosion, soudures, supports, soupapes, manomètres, et prouvent la résistance par une épreuve.'],
        ['APL, lifting equipment: cranes, hoists, hooks, slings and wire ropes lift loads above people. Inspectors check the structure, brakes, limit switches, rope wear and hook deformation, and carry out load tests against the safe working load (SWL).', 'APL, appareils de levage : grues, palans, crochets, élingues et câbles soulèvent des charges au-dessus des personnes. Les inspecteurs contrôlent la structure, les freins, les fins de course, l’usure des câbles et la déformation des crochets, et réalisent des essais de charge par rapport à la charge maximale d’utilisation (CMU).'],
        ['APE, electrical equipment: boards, cables and protective devices. Inspectors work only after safe isolation (lockout/tagout) and measure insulation resistance, earth continuity, RCD trip time and temperatures with thermography.', 'APE, équipements électriques : armoires, câbles et appareils de protection. Les inspecteurs travaillent seulement après consignation (verrouillage/étiquetage) et mesurent l’isolement, la continuité de terre, le temps de déclenchement des différentiels et les températures par thermographie.']
      ],
      words: ['vessel', 'hydro', 'psv', 'swl', 'rope', 'loto', 'rcd'],
      q: { q: ['What does SWL mean on a lifting device?', 'Que signifie la CMU (SWL) sur un appareil de levage ?'], o: [['Safe working load: the maximum load it may lift in service', 'Charge maximale d’utilisation : la charge maximale qu’il peut lever en service'], ['Steel weld length', 'Longueur de soudure acier'], ['Standard water level', 'Niveau d’eau standard']], a: 0,
        why: ['SWL (also WLL) is the maximum load allowed in normal use; test loads above it are only applied during controlled tests.', 'La CMU est la charge maximale autorisée en usage normal ; des charges supérieures ne s’appliquent que lors d’essais maîtrisés.'] } },
    { id: 'b6', icon: '🦺', t: ['Safety, procedures, codes and qualification', 'Sécurité, procédures, codes et qualification'],
      p: [
        ['Safety comes first: personal protective equipment, work permits, radiation controlled areas, lockout/tagout on electrical systems, and never standing under a suspended load.', 'La sécurité d’abord : équipements de protection individuelle, permis de travail, zones contrôlées en radiographie, consignation des installations électriques, et ne jamais se tenir sous une charge suspendue.'],
        ['A procedure is a written, approved document that says exactly how to perform an inspection. A code or standard (ASME, API, ISO, EN…) sets requirements and acceptance criteria. The project specification can add more. Codes change edition by edition, so always use the edition required by the contract.', 'Une procédure est un document écrit et approuvé qui dit exactement comment réaliser un contrôle. Un code ou une norme (ASME, API, ISO, EN…) fixe les exigences et les critères d’acceptation. La spécification du projet peut en ajouter. Les codes changent d’une édition à l’autre : utilisez toujours l’édition exigée par le contrat.'],
        ['NDT personnel are qualified by level (for example ISO 9712): Level 1 performs tests following written instructions under supervision; Level 2 sets up, performs and interprets tests against codes; Level 3 establishes techniques and procedures. This Academy is training only: it is not a qualification or certification.', 'Le personnel CND est qualifié par niveau (par exemple ISO 9712) : le niveau 1 réalise les contrôles selon des instructions écrites sous supervision ; le niveau 2 règle, réalise et interprète selon les codes ; le niveau 3 établit les techniques et procédures. Cette Académie est une formation : ce n’est ni une qualification ni une certification.']
      ],
      words: ['ppe', 'procedure', 'code', 'iso9712'],
      q: { q: ['Who decides the acceptance criteria for a weld?', 'Qui fixe les critères d’acceptation d’une soudure ?'], o: [['The applicable code and project specification', 'Le code applicable et la spécification du projet'], ['The welder', 'Le soudeur'], ['The trainee’s opinion', 'L’avis du stagiaire']], a: 0,
        why: ['Acceptance criteria come from the governing code/specification; the qualified inspector applies them.', 'Les critères viennent du code/de la spécification applicable ; l’inspecteur qualifié les applique.'] } }
  ];

  /* ======================= visual dictionary ======================= */
  // see: {m:'UT'} → 3D method animation · {eq:['UT',0]} → 3D equipment · {ut:'crack'} → A-scan library · {rt:'crack'} → film atlas · {study:4} → ASME/API lesson
  const D = (id, cat, en, fr, simple, tech, ex, see) => ({ id, cat, en, fr, simple, tech, ex, see });
  const DICT = [
    D('inspection', 'GEN', 'Inspection', 'Inspection', ['Checking that equipment is in the condition required.', 'Vérifier qu’un équipement est dans l’état exigé.'], ['Examination, measurement or testing of an item and comparison of the results with specified requirements, with recorded objective evidence.', 'Examen, mesure ou essai d’un élément et comparaison des résultats avec des exigences spécifiées, avec preuves objectives enregistrées.'], ['Checking a crane hook for cracks and measuring its throat opening before use.', 'Contrôler un crochet de grue pour les fissures et mesurer son ouverture avant usage.']),
    D('procedure', 'GEN', 'Procedure', 'Procédure', ['A written recipe that says exactly how to do a job.', 'Une recette écrite qui dit exactement comment faire un travail.'], ['Approved document defining the method, equipment, sequence, parameters, acceptance references and records for an activity.', 'Document approuvé définissant méthode, matériel, séquence, paramètres, références d’acceptation et enregistrements d’une activité.'], ['The AQCS PT procedure gives the penetrant dwell time and lighting level.', 'La procédure PT AQCS donne le temps de pénétration et l’éclairement.']),
    D('code', 'GEN', 'Code / standard', 'Code / norme', ['A published rule book for designing, building or inspecting equipment.', 'Un recueil de règles publié pour concevoir, fabriquer ou contrôler.'], ['Document issued by a standards body (ASME, API, ISO, EN…) setting requirements; the edition to apply is fixed by contract or regulation.', 'Document émis par un organisme (ASME, API, ISO, EN…) fixant des exigences ; l’édition à appliquer est fixée par le contrat ou la réglementation.'], ['ASME B31.3 for process piping, API 650 for storage tanks.', 'ASME B31.3 pour la tuyauterie de procédé, API 650 pour les réservoirs.'], { study: 1 }),
    D('acceptance', 'GEN', 'Acceptance criteria', 'Critères d’acceptation', ['The limits that say "this is OK" or "this must be repaired".', 'Les limites qui disent « c’est bon » ou « il faut réparer ».'], ['Quantified limits (size, type, amplitude, length…) given by the governing code or specification against which results are judged.', 'Limites chiffrées (taille, type, amplitude, longueur…) données par le code ou la spécification et servant à juger les résultats.'], ['A crack is usually rejected whatever its length; a small pore may be accepted.', 'Une fissure est généralement refusée quelle que soit sa longueur ; un petit pore peut être accepté.']),
    D('ppe', 'GEN', 'PPE', 'EPI', ['Protective gear you wear: helmet, glasses, gloves, safety shoes.', 'L’équipement de protection que l’on porte : casque, lunettes, gants, chaussures.'], ['Personal protective equipment selected from the risk assessment of the task (including dosimeter in RT, insulated gloves in electrical work).', 'Équipements de protection individuelle choisis selon l’analyse de risques (dont dosimètre en RT, gants isolants en électricité).'], ['Safety glasses and gloves when spraying penetrant.', 'Lunettes et gants pour pulvériser le pénétrant.']),
    D('iso9712', 'GEN', 'ISO 9712 levels', 'Niveaux ISO 9712', ['The 3 qualification levels of NDT personnel.', 'Les 3 niveaux de qualification du personnel CND.'], ['Level 1 performs NDT to written instructions under supervision; Level 2 sets up, performs, interprets and reports against codes; Level 3 establishes techniques and procedures.', 'Niveau 1 : réalise selon instructions écrites sous supervision ; niveau 2 : règle, réalise, interprète et rapporte selon les codes ; niveau 3 : établit techniques et procédures.'], ['A UT Level 2 can sign a weld examination report.', 'Un niveau 2 UT peut signer un rapport de contrôle de soudure.']),
    D('weld', 'WELD', 'Weld', 'Soudure', ['Two metal parts melted together into one.', 'Deux pièces métalliques fondues ensemble pour n’en faire qu’une.'], ['Localised union of metals produced by heating, with or without filler metal and pressure.', 'Assemblage localisé de métaux obtenu par chauffage, avec ou sans métal d’apport et pression.'], ['A butt weld joining two pipe ends.', 'Une soudure bout à bout reliant deux extrémités de tube.'], { m: 'VT' }),
    D('haz', 'WELD', 'Heat-affected zone (HAZ)', 'Zone affectée thermiquement (ZAT)', ['The strip of base metal next to the weld that was changed by the heat.', 'La bande de métal de base près de la soudure, modifiée par la chaleur.'], ['Base metal not melted but whose microstructure and properties were altered by the welding thermal cycle.', 'Métal de base non fondu dont la microstructure et les propriétés ont été modifiées par le cycle thermique du soudage.'], ['Hydrogen cracks often start in the HAZ.', 'Les fissures à froid démarrent souvent dans la ZAT.'], { m: 'PT' }),
    D('root', 'WELD', 'Root', 'Racine', ['The bottom of the weld, on the far side.', 'Le fond de la soudure, côté opposé.'], ['The portion of the joint where the first pass is deposited; the root side may show penetration, concavity or lack of penetration.', 'Partie du joint où est déposée la première passe ; le côté racine peut montrer pénétration, retassure ou manque de pénétration.'], ['Root concavity is checked by RT density or visually inside the pipe.', 'La retassure se contrôle par densité RT ou visuellement à l’intérieur du tube.'], { rt: 'rootconc' }),
    D('crack', 'DEF', 'Crack', 'Fissure', ['A split in the metal.', 'Une fente dans le métal.'], ['Planar discontinuity with a sharp tip and high length-to-opening ratio; usually rejectable because it can propagate.', 'Discontinuité plane à pointe aiguë et grand rapport longueur/ouverture ; généralement refusée car elle peut se propager.'], ['A longitudinal crack in the weld cap found by MT.', 'Une fissure longitudinale dans la passe de finition détectée par MT.'], { ut: 'crack', rt: 'crack' }),
    D('porosity', 'DEF', 'Porosity', 'Soufflure / porosité', ['Gas bubbles trapped in the weld.', 'Bulles de gaz piégées dans la soudure.'], ['Cavity-type discontinuity formed by gas entrapment during solidification; single, clustered, aligned or elongated (wormhole).', 'Discontinuité de type cavité due au gaz piégé à la solidification ; isolée, en nid, alignée ou allongée (vermiculaire).'], ['Damp electrodes can cause porosity.', 'Des électrodes humides peuvent causer des soufflures.'], { ut: 'pore', rt: 'pore' }),
    D('slag', 'DEF', 'Slag inclusion', 'Inclusion de laitier', ['Dirty non-metal residue stuck inside the weld.', 'Résidu non métallique sale coincé dans la soudure.'], ['Non-metallic solid entrapped in the weld metal or between passes, often elongated.', 'Solide non métallique piégé dans le métal fondu ou entre passes, souvent allongé.'], ['Poor cleaning between passes leaves slag lines.', 'Un mauvais nettoyage entre passes laisse des lignes de laitier.'], { ut: 'slag', rt: 'slag' }),
    D('lof', 'DEF', 'Lack of fusion', 'Manque de fusion', ['The weld did not melt into the metal beside it.', 'La soudure n’a pas fondu avec le métal voisin.'], ['Planar lack of union between weld metal and base metal (side-wall) or between passes (inter-run).', 'Absence plane de liaison entre métal fondu et métal de base (paroi) ou entre passes.'], ['Too low current or wrong torch angle on the bevel.', 'Intensité trop faible ou mauvais angle de torche sur le chanfrein.'], { ut: 'lof', rt: 'lof' }),
    D('ip', 'DEF', 'Incomplete penetration', 'Manque de pénétration', ['The weld did not reach the bottom of the joint.', 'La soudure n’a pas atteint le fond du joint.'], ['Failure of weld metal to extend through the joint thickness, leaving unfused root faces.', 'Le métal fondu ne traverse pas toute l’épaisseur du joint, laissant des talons non fondus.'], ['A straight dark line in the centre of a radiograph.', 'Une ligne sombre droite au centre d’un radiogramme.'], { ut: 'ip', rt: 'ip' }),
    D('undercut', 'DEF', 'Undercut', 'Caniveau', ['A groove melted into the plate at the edge of the weld.', 'Un sillon fondu dans la tôle au bord de la soudure.'], ['Groove at the weld toe in the base metal left unfilled by weld metal; depth limited by the code (measured by VT).', 'Sillon au pied de cordon dans le métal de base non comblé ; profondeur limitée par le code (mesurée en VT).'], ['Measured with a Cambridge gauge.', 'Mesuré avec une jauge Cambridge.'], { ut: 'undercut', rt: 'undercut' }),
    D('lamination', 'DEF', 'Lamination', 'Dédoublure', ['A flat split inside a plate, parallel to its surface.', 'Une séparation plate dans une tôle, parallèle à sa surface.'], ['Planar discontinuity parallel to the rolled surface from the steel-making process; found with a 0° UT probe.', 'Discontinuité plane parallèle à la surface laminée issue de l’élaboration ; détectée au palpeur UT 0°.'], ['Checked on plate before welding nozzles.', 'Contrôlée sur tôle avant le soudage de piquages.'], { ut: 'lamination' }),
    D('ndt', 'NDT', 'NDT (CND)', 'CND (NDT)', ['Testing a part without damaging it.', 'Contrôler une pièce sans l’abîmer.'], ['Non-destructive testing: methods that detect and size discontinuities or measure properties without impairing future usefulness.', 'Contrôle non destructif : méthodes qui détectent et dimensionnent des discontinuités ou mesurent des propriétés sans nuire à l’usage futur.'], ['UT of a pipe weld before it goes into service.', 'UT d’une soudure de tube avant mise en service.']),
    D('vt', 'NDT', 'Visual testing (VT)', 'Contrôle visuel (VT)', ['Looking carefully with good light and gauges.', 'Regarder attentivement avec un bon éclairage et des jauges.'], ['Direct or remote examination with specified lighting, viewing distance/angle and measuring aids (ASME V Art. 9, ISO 17637).', 'Examen direct ou à distance avec éclairage, distance/angle et instruments spécifiés (ASME V art. 9, ISO 17637).'], ['Checking weld profile, spatter and undercut.', 'Contrôler profil de cordon, projections et caniveaux.'], { m: 'VT' }),
    D('pt', 'NDT', 'Penetrant testing (PT)', 'Ressuage (PT)', ['A coloured liquid shows cracks open to the surface.', 'Un liquide coloré révèle les fissures débouchantes.'], ['Liquid penetrant enters surface-breaking discontinuities by capillarity; after excess removal a developer draws it out as a visible indication.', 'Le pénétrant entre par capillarité dans les discontinuités débouchantes ; après élimination de l’excès, le révélateur le fait ressortir en indication visible.'], ['Red line on white developer at a crack.', 'Ligne rouge sur révélateur blanc à l’endroit d’une fissure.'], { m: 'PT' }),
    D('developer', 'NDT', 'Developer', 'Révélateur', ['The white powder that pulls the penetrant back out.', 'La poudre blanche qui fait ressortir le pénétrant.'], ['Thin absorbent layer (dry, wet or non-aqueous) that draws penetrant from discontinuities and gives contrast.', 'Couche mince absorbante (sèche, humide ou non aqueuse) qui extrait le pénétrant des discontinuités et donne le contraste.'], ['Spray a thin, even coat from about 30 cm.', 'Pulvériser une couche fine et régulière à environ 30 cm.'], { eq: ['PT', 3] }),
    D('dwell', 'NDT', 'Dwell time', 'Temps de pénétration', ['How long the penetrant stays on before cleaning.', 'Le temps pendant lequel le pénétrant reste avant nettoyage.'], ['Time the penetrant remains on the surface to enter discontinuities; set by the procedure for material and temperature range.', 'Temps de contact du pénétrant pour entrer dans les discontinuités ; fixé par la procédure selon matériau et température.'], ['Typically several minutes; always use the procedure value.', 'Typiquement quelques minutes ; toujours utiliser la valeur de la procédure.'], { m: 'PT' }),
    D('mt', 'NDT', 'Magnetic particle testing (MT)', 'Magnétoscopie (MT)', ['Magnetise steel; iron powder gathers at cracks.', 'Aimanter l’acier ; la poudre de fer se rassemble aux fissures.'], ['A discontinuity in magnetised ferromagnetic material creates leakage flux that attracts fine ferromagnetic particles; best when the defect is perpendicular to the field.', 'Une discontinuité dans un matériau ferromagnétique aimanté crée un flux de fuite qui attire de fines particules ; meilleure détection si le défaut est perpendiculaire au champ.'], ['Two yoke directions at 90° to find cracks in any direction.', 'Deux directions de yoke à 90° pour trouver les fissures dans toutes les directions.'], { m: 'MT' }),
    D('yoke', 'NDT', 'Yoke', 'Électroaimant (yoke)', ['A U-shaped magnet tool used in MT.', 'Un aimant en forme de U utilisé en MT.'], ['Portable electromagnet with articulated legs producing a longitudinal field between the poles; lifting power verified before use.', 'Électroaimant portable à pattes articulées créant un champ longitudinal entre les pôles ; force portante vérifiée avant usage.'], ['AC yoke placed across the weld, then rotated 90°.', 'Yoke CA posé en travers de la soudure, puis tourné de 90°.'], { m: 'MT' }),
    D('ut', 'NDT', 'Ultrasonic testing (UT)', 'Ultrasons (UT)', ['Sending sound into metal and listening for echoes.', 'Envoyer du son dans le métal et écouter les échos.'], ['High-frequency sound (typically 1–10 MHz) is introduced by a probe; reflections from interfaces and discontinuities are displayed versus time (sound path).', 'Un son à haute fréquence (typiquement 1–10 MHz) est introduit par un traducteur ; les réflexions sont affichées en fonction du temps (parcours).'], ['Finding lack of fusion in a 20 mm butt weld with a 60° probe.', 'Trouver un manque de fusion dans une soudure de 20 mm avec un traducteur de 60°.'], { m: 'UT' }),
    D('probe', 'NDT', 'Probe (transducer)', 'Traducteur (palpeur)', ['The part you hold on the metal that makes and hears the sound.', 'La pièce posée sur le métal qui émet et reçoit le son.'], ['Piezoelectric element converting electrical pulses to sound and back; straight (0°) for laminations/thickness, angle (45°, 60°, 70°) via a wedge for welds.', 'Élément piézoélectrique convertissant impulsions électriques et son ; droit (0°) pour dédoublures/épaisseurs, d’angle (45°, 60°, 70°) via un sabot pour les soudures.'], ['A 4 MHz 60° probe for a 20 mm weld.', 'Un traducteur 4 MHz 60° pour une soudure de 20 mm.'], { m: 'UT' }),
    D('couplant', 'NDT', 'Couplant', 'Couplant', ['Gel or oil that lets the sound pass from probe to metal.', 'Gel ou huile qui laisse passer le son du traducteur au métal.'], ['Liquid or gel removing the air gap between probe and surface; the same couplant is used for calibration and examination.', 'Liquide ou gel supprimant la lame d’air entre traducteur et surface ; le même couplant sert à l’étalonnage et au contrôle.'], ['Without couplant the echo disappears.', 'Sans couplant l’écho disparaît.'], { m: 'UT' }),
    D('ascan', 'NDT', 'A-scan', 'A-scan', ['The screen that shows echoes as peaks.', 'L’écran qui montre les échos sous forme de pics.'], ['Display of signal amplitude (vertical, % full screen height) versus time or sound path (horizontal).', 'Affichage de l’amplitude du signal (vertical, % de hauteur d’écran) en fonction du temps ou du parcours (horizontal).'], ['A sharp jagged peak at 22 mm sound path may be a crack.', 'Un pic net et dentelé à 22 mm de parcours peut être une fissure.'], { ut: 'crack' }),
    D('soundpath', 'NDT', 'Sound path', 'Parcours ultrasonore', ['How far the sound travelled to reach the reflector.', 'La distance parcourue par le son jusqu’au réflecteur.'], ['Distance along the beam from the probe index to the reflector; depth = S·cos θ and surface distance = S·sin θ (first leg).', 'Distance le long du faisceau du point d’émergence au réflecteur ; profondeur = S·cos θ et distance en surface = S·sin θ (1er parcours).'], ['S = 22 mm at 60°: depth = 11 mm, surface distance = 19 mm.', 'S = 22 mm à 60° : profondeur = 11 mm, distance en surface = 19 mm.'], { ut: 'crack' }),
    D('iiw', 'NDT', 'Calibration block (IIW/V1)', 'Bloc d’étalonnage (IIW/V1)', ['A steel block with known shapes used to set up the UT instrument.', 'Un bloc d’acier aux formes connues pour régler l’appareil UT.'], ['Reference block used to set range/velocity and zero, check probe index and beam angle; basic blocks with side-drilled holes are used for DAC.', 'Bloc de référence pour régler base de temps/vitesse et zéro, vérifier point d’émergence et angle ; les blocs à trous génératrices servent à la DAC.'], ['The 100 mm radius gives a known echo for range calibration.', 'Le rayon de 100 mm donne un écho connu pour l’étalonnage de la base.'], { m: 'UT' }),
    D('dac', 'NDT', 'DAC', 'DAC', ['A curve that shows how big a reference echo is at each distance.', 'Une courbe qui montre la hauteur d’un écho de référence à chaque distance.'], ['Distance-amplitude correction curve drawn from a reference reflector (e.g. side-drilled holes) at several sound paths; indications are rated in dB to DAC.', 'Courbe de correction distance-amplitude tracée à partir d’un réflecteur de référence (ex. trous génératrices) à plusieurs parcours ; les indications sont notées en dB/DAC.'], ['An echo at +4 dB to DAC is above the reference level.', 'Un écho à +4 dB/DAC dépasse le niveau de référence.'], { m: 'UT' }),
    D('db', 'NDT', 'Decibel (dB) and gain', 'Décibel (dB) et gain', ['A way to say "how many times bigger" an echo is.', 'Une façon de dire « combien de fois plus grand » est un écho.'], ['Logarithmic amplitude ratio: dB = 20·log10(A1/A2). +6 dB ≈ doubles the screen height, +20 dB = ×10.', 'Rapport d’amplitude logarithmique : dB = 20·log10(A1/A2). +6 dB ≈ double la hauteur, +20 dB = ×10.'], ['Raising gain by 6 dB takes an echo from 40 % to about 80 %.', 'Augmenter le gain de 6 dB fait passer un écho de 40 % à environ 80 %.'], { m: 'UT' }),
    D('rt', 'NDT', 'Radiographic testing (RT)', 'Radiographie (RT)', ['Taking an "X-ray picture" of a weld.', 'Prendre une « radio » d’une soudure.'], ['X- or gamma radiation passes through the part; differences in absorbed radiation form an image on film or a digital detector.', 'Les rayons X ou gamma traversent la pièce ; les différences d’absorption forment une image sur film ou détecteur numérique.'], ['A porosity appears as dark round spots.', 'Une soufflure apparaît comme des taches rondes sombres.'], { m: 'RT', rt: 'pore' }),
    D('iqi', 'NDT', 'IQI', 'IQI', ['A small test piece on the film that proves the picture is sharp enough.', 'Une petite pièce témoin qui prouve que l’image est assez nette.'], ['Image quality indicator (wire or hole type) placed on the source side; the required wire or hole must be visible to prove sensitivity.', 'Indicateur de qualité d’image (fils ou trous) côté source ; le fil ou trou exigé doit être visible pour prouver la sensibilité.'], ['Essential wire 7 visible on the film.', 'Fil essentiel 7 visible sur le film.'], { m: 'RT' }),
    D('density', 'NDT', 'Film density', 'Densité optique', ['How dark the film is.', 'À quel point le film est sombre.'], ['Optical density D = log10(incident light / transmitted light), measured with a densitometer; codes set minimum and maximum values.', 'Densité optique D = log10(lumière incidente / transmise), mesurée au densitomètre ; les codes fixent un minimum et un maximum.'], ['D = 2 means only 1 % of the light passes through.', 'D = 2 signifie que seulement 1 % de la lumière traverse.'], { m: 'RT' }),
    D('dose', 'NDT', 'Controlled area / dose rate', 'Zone contrôlée / débit de dose', ['The fenced zone around radiography where nobody may enter.', 'La zone balisée autour de la radiographie où personne n’entre.'], ['Area delimited at the regulatory dose-rate limit, checked with a calibrated survey meter; time, distance and shielding reduce exposure.', 'Zone délimitée à la limite réglementaire de débit de dose, vérifiée au radiamètre étalonné ; temps, distance et écran réduisent l’exposition.'], ['Barrier rope at the measured limit, warning signs on posts.', 'Corde de balisage à la limite mesurée, panneaux sur poteaux.'], { m: 'RT' }),
    D('vessel', 'APVG', 'Pressure vessel', 'Appareil à pression', ['A closed tank that holds gas or liquid under pressure.', 'Un réservoir fermé qui contient un gaz ou un liquide sous pression.'], ['Closed container designed for internal or external pressure, built to a code (e.g. ASME VIII) and inspected in service (e.g. API 510).', 'Enceinte fermée conçue pour une pression interne ou externe, construite selon un code (ex. ASME VIII) et inspectée en service (ex. API 510).'], ['A compressed-air receiver.', 'Un réservoir d’air comprimé.'], { m: 'APVG' }),
    D('mawp', 'APVG', 'MAWP', 'PMS (MAWP)', ['The highest pressure the vessel is allowed to run at.', 'La pression la plus haute à laquelle l’appareil peut fonctionner.'], ['Maximum allowable working pressure at the top of the vessel at a designated temperature, from the code calculation; marked on the nameplate.', 'Pression maximale admissible au sommet de l’appareil à une température désignée, issue du calcul ; marquée sur la plaque.'], ['The safety valve is set at or below the MAWP.', 'La soupape est tarée à la PMS ou en dessous.'], { m: 'APVG' }),
    D('hydro', 'APVG', 'Hydrostatic test', 'Épreuve hydraulique', ['Filling with water and raising the pressure to prove strength.', 'Remplir d’eau et monter la pression pour prouver la résistance.'], ['Pressure test with water at a pressure above design (factor set by the code, e.g. 1.3 × MAWP in ASME VIII Div. 1 — verify), held then inspected for leaks.', 'Essai de pression à l’eau au-dessus de la pression de calcul (facteur fixé par le code, ex. 1,3 × PMS en ASME VIII div. 1 — à vérifier), maintenu puis inspecté.'], ['Air is vented before pressurising.', 'L’air est purgé avant la mise en pression.'], { m: 'APVG' }),
    D('psv', 'APVG', 'Safety valve (PSV)', 'Soupape de sûreté', ['A valve that opens by itself if the pressure gets too high.', 'Une vanne qui s’ouvre seule si la pression devient trop haute.'], ['Pressure-relief device set to open at the set pressure; checked for set pressure, seat tightness and test interval.', 'Dispositif de décharge qui s’ouvre à la pression de tarage ; contrôlé pour tarage, étanchéité et périodicité.'], ['The PSV seal shows nobody changed the setting.', 'Le plomb de la soupape montre que personne n’a modifié le tarage.'], { m: 'APVG' }),
    D('corrosion', 'APVG', 'Corrosion rate / remaining life', 'Vitesse de corrosion / durée de vie', ['How fast the wall gets thinner, and how long it can last.', 'À quelle vitesse la paroi s’amincit, et combien de temps elle peut durer.'], ['Rate = (previous − current thickness) ÷ time; remaining life = (current − required thickness) ÷ rate (simplified, API 510 context).', 'Vitesse = (épaisseur précédente − actuelle) ÷ temps ; durée de vie = (actuelle − requise) ÷ vitesse (simplifié, contexte API 510).'], ['(8.0 − 6.0) ÷ 0.25 = 8 years.', '(8,0 − 6,0) ÷ 0,25 = 8 ans.'], { study: 4 }),
    D('swl', 'APL', 'SWL / WLL', 'CMU', ['The maximum load a lifting device may lift.', 'La charge maximale qu’un appareil de levage peut soulever.'], ['Safe (working) load limit marked on the equipment; test loads above it (e.g. 125 % static, 110 % dynamic — verify the regulation) are only applied during controlled tests.', 'Charge maximale d’utilisation marquée sur l’appareil ; les charges d’essai supérieures (ex. 125 % statique, 110 % dynamique — vérifier la réglementation) ne s’appliquent qu’en essai.'], ['"SWL 10 t" on the girder.', '« CMU 10 t » sur la poutre.'], { m: 'APL' }),
    D('rope', 'APL', 'Wire rope', 'Câble', ['A steel cable made of many twisted wires.', 'Un câble d’acier fait de nombreux fils torsadés.'], ['Strands of steel wires laid around a core; discard criteria (e.g. ISO 4309) cover broken wires, diameter loss, corrosion and deformation.', 'Torons de fils d’acier autour d’une âme ; les critères de dépose (ex. ISO 4309) portent sur fils cassés, perte de diamètre, corrosion et déformation.'], ['Counting broken wires over 6d and 30d lengths.', 'Compter les fils cassés sur 6d et 30d.'], { m: 'APL' }),
    D('hook', 'APL', 'Hook (throat opening)', 'Crochet (ouverture)', ['The hook that holds the load, and the gap at its mouth.', 'Le crochet qui tient la charge, et l’écart à son ouverture.'], ['Forged hook with safety latch; an increase in throat opening or twist shows overload (removal limits per the applicable standard, e.g. ASME B30.10 — verify).', 'Crochet forgé avec linguet ; une augmentation d’ouverture ou une torsion révèle une surcharge (limites de retrait selon la norme applicable, ex. ASME B30.10 — à vérifier).'], ['Measure between two punch marks at each inspection.', 'Mesurer entre deux coups de pointeau à chaque inspection.'], { m: 'APL' }),
    D('loadtest', 'APL', 'Load test', 'Essai de charge', ['Lifting a known heavy test weight to prove the crane is safe.', 'Lever une masse d’essai connue pour prouver que la grue est sûre.'], ['Static test (load held, no movement) and dynamic test (all motions) at specified percentages of SWL, with exclusion zone and approved plan.', 'Essai statique (charge maintenue) et dynamique (tous mouvements) à des pourcentages fixés de la CMU, avec zone d’exclusion et plan approuvé.'], ['Hold the static load 10 minutes, then check deformation.', 'Maintenir la charge statique 10 minutes puis vérifier la déformation.'], { m: 'APL' }),
    D('loto', 'APE', 'LOTO (lockout/tagout)', 'Consignation', ['Switching off, locking and labelling before working.', 'Couper, verrouiller et étiqueter avant de travailler.'], ['Isolation, locking, tagging and verification of absence of voltage with a tested detector (test – circuit – test).', 'Séparation, condamnation, étiquetage et vérification d’absence de tension avec un VAT testé (test – circuit – test).'], ['Padlock on the breaker and "do not operate" tag.', 'Cadenas sur le disjoncteur et étiquette « ne pas manœuvrer ».'], { m: 'APE' }),
    D('insulation', 'APE', 'Insulation resistance', 'Résistance d’isolement', ['How well a cable’s plastic stops electricity leaking.', 'À quel point l’isolant d’un câble empêche le courant de fuir.'], ['Resistance between conductors and earth measured with a DC test voltage (e.g. 500 V) using a megohmmeter; minimum values set by the standard.', 'Résistance entre conducteurs et terre mesurée sous tension continue (ex. 500 V) au mégohmmètre ; minima fixés par la norme.'], ['480 MΩ on a circuit: insulation in good condition.', '480 MΩ sur un circuit : isolement en bon état.'], { m: 'APE' }),
    D('rcd', 'APE', 'RCD (residual current device)', 'Dispositif différentiel (DDR)', ['A switch that cuts power if current leaks to earth (to protect people).', 'Un interrupteur qui coupe si le courant fuit à la terre (protège les personnes).'], ['Device tripping when the residual current exceeds its rated value (e.g. 30 mA); tested for trip current and time.', 'Appareil déclenchant quand le courant différentiel dépasse sa valeur assignée (ex. 30 mA) ; testé en courant et temps de déclenchement.'], ['Trip at 24 ms: within the limit given by the standard.', 'Déclenchement à 24 ms : dans la limite de la norme.'], { m: 'APE' }),
    D('thermo', 'APE', 'Thermography', 'Thermographie', ['A camera that sees heat.', 'Une caméra qui voit la chaleur.'], ['Infrared imaging of temperature; abnormal temperature rise under load reveals loose connections or overloads.', 'Imagerie infrarouge des températures ; un échauffement anormal sous charge révèle des connexions desserrées ou surcharges.'], ['A terminal 18 °C hotter than its neighbours.', 'Une borne 18 °C plus chaude que ses voisines.'], { m: 'APE' }),
    D('wps', 'WELD', 'WPS', 'DMOS (WPS)', ['The written instructions the welder follows.', 'Les instructions écrites que suit le soudeur.'], ['Welding procedure specification listing variables and ranges, supported by a PQR (ASME IX).', 'Descriptif de mode opératoire listant variables et plages, appuyé par un PQR (ASME IX).'], ['Process, filler, current range, preheat and position.', 'Procédé, apport, plage d’intensité, préchauffage et position.'], { study: 6 }),
    D('pqr', 'WELD', 'PQR', 'QMOS (PQR)', ['The test record that proves the welding recipe works.', 'Le PV d’essais qui prouve que la recette de soudage fonctionne.'], ['Procedure qualification record: actual variables used and test results (tensile, bend, impact if required).', 'Procès-verbal de qualification : variables réellement utilisées et résultats d’essais (traction, pliage, résilience si exigée).'], ['A WPS refers to one or more PQRs.', 'Un DMOS renvoie à un ou plusieurs PQR.'], { study: 6 })
  ];
  const DCAT = { GEN: ['General', 'Général'], WELD: ['Welding', 'Soudage'], DEF: ['Defects', 'Défauts'], NDT: ['NDT / CND', 'CND'], APVG: ['APVG', 'APVG'], APL: ['APL', 'APL'], APE: ['APE', 'APE'] };

  /* ======================= progress store ======================= */
  const KEY = 'cyclops-academy-v1';
  const blank = () => ({ ev: {}, days: [], name: '', seen: {} });
  let P = (() => { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return blank(); } })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* storage unavailable: progress lasts for this visit */ } };
  const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; } };
  function record(id, info, quiet) {
    if (!id) return;
    const e = P.ev[id] || { n: 0, ok: 0, first: today() };
    e.n++; if (!info || info.ok !== false) e.ok++; e.last = today();
    if (info && typeof info.score === 'number') e.best = Math.max(e.best || 0, info.score);
    P.ev[id] = e;
    if (!P.days.includes(today())) P.days.push(today()), P.days = P.days.slice(-120);
    save();
    if (dlg && !quiet) render();
    else if (dlg) { const s = dlg.querySelector('.cyac-stats'); if (s) s.innerHTML = statsHtml(); }
  }
  window.addEventListener('cy-learn', (e) => record(e.detail && e.detail.id, e.detail));
  const has = (id) => !!P.ev[id];
  const countPrefix = (p) => Object.keys(P.ev).filter((k) => k.startsWith(p)).length;
  const okCount = (id) => (P.ev[id] ? P.ev[id].ok : 0);
  const course = (m) => (readJSON('cy-course-progress-v1')[m] || {});
  const study = () => Object.assign({ done: {}, best: null }, readJSON('cyclops-study-v1'));
  function streak() {
    const set = new Set(P.days); let n = 0; const d = new Date();
    if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ======================= learning path ======================= */
  const goMethod = (m) => () => { close(); const b = [...document.querySelectorAll('#ptab button')].find((x) => x.textContent.trim() === m); if (b) b.click(); setTimeout(() => { const v = document.querySelector('.cy3'); if (v) v.scrollIntoView({ behavior: 'smooth' }); }, 300); };
  const goCourse = (m) => () => { close(); if (window.CY3) window.CY3.openCourse(m); };
  const goSim = (m, sel, mode) => () => { close(); const b = [...document.querySelectorAll('#ptab button')].find((x) => x.textContent.trim() === m); if (b) b.click(); setTimeout(() => { const s = document.querySelector(sel); if (!s) return; if (mode) { const mb = s.querySelector('[data-mode="' + mode + '"]'); if (mb) mb.click(); } s.scrollIntoView({ behavior: 'smooth' }); }, 400); };
  const goStudy = (i) => () => { close(); if (window.CYSTUDY && window.CYSTUDY.open) window.CYSTUDY.open(i); };
  const goQuiz = () => () => { close(); const b = document.getElementById('quiz-open'); if (b) b.click(); };
  const obj = (id, t, d, done, go, xp) => ({ id, t, d, done, go, xp });
  const coursePassed = (m) => !!course(m).examPassed;
  const modsDone = (...ms) => !!window.CYNDT && ms.every((m) => window.CYNDT.methodDone(m, has));
  const goModules = (m) => () => { if (window.CYNDT) window.CYNDT.open(m); openTab('cnd'); };
  // areas where an advanced (★★★) mission scored 80 % or more
  const missionAreas = (minDiff) => new Set(Object.keys(P.ev).filter((k) => k.startsWith('mission:') && Number(k.split(':')[2]) >= (minDiff || 1) && (P.ev[k].best || 0) >= 80).map((k) => k.split(':')[1])).size;
  const scenTotal = () => (window.CYSCEN ? window.CYSCEN.SCEN.length : 8);
  const scenGood = () => (window.CYSCEN ? window.CYSCEN.SCEN.filter((s) => ((P.ev['scen:' + s.id] || {}).best || 0) >= 80).length : 0);
  const LEVELS = [
    { n: 1, t: ['Absolute beginner', 'Débutant absolu'], goal: ['Understand what inspection is, the vocabulary and the four departments.', 'Comprendre ce qu’est l’inspection, le vocabulaire et les quatre départements.'], obj: [
      obj('basics', ['Complete the 6 beginner lessons', 'Terminer les 6 leçons débutant'], ['Short lessons with a check question each.', 'Leçons courtes avec une question de vérification chacune.'], () => BASICS.every((b) => has('basic:' + b.id)), () => openTab('basics'), 60),
      obj('dict5', ['Look up 5 words in the dictionary', 'Chercher 5 mots dans le dictionnaire'], ['Never stay stuck on a word.', 'Ne restez jamais bloqué sur un mot.'], () => countPrefix('dict:') >= 5, () => openTab('dict'), 10),
      obj('lab3', ['Explore 3 equipment models in the 3D lab', 'Explorer 3 modèles d’équipement dans le labo 3D'], ['Rotate, explode and click the parts.', 'Tournez, éclatez et cliquez sur les pièces.'], () => countPrefix('lab:') >= 3, () => openTab('lab'), 15)
    ] },
    { n: 2, t: ['Basic inspection knowledge', 'Connaissances de base en inspection'], goal: ['Learn the surface methods VT, PT and MT step by step.', 'Apprendre les méthodes de surface VT, PT et MT pas à pas.'], obj: [
      obj('mSurf', ['Complete the VT, PT and MT academy modules', 'Terminer les modules Académie VT, PT et MT'], ['15 animated topics with a check question each.', '15 thèmes animés avec une question chacun.'], () => modsDone('VT', 'PT', 'MT'), () => goModules(['VT', 'PT', 'MT'].find((m) => !modsDone(m)) || 'VT')(), 60),
      obj('cVT', ['Pass the VT course', 'Réussir le cours VT'], ['Guided course with 3D instructor and knowledge check.', 'Cours guidé avec formateur 3D et vérification.'], () => coursePassed('VT'), goCourse('VT'), 40),
      obj('cPT', ['Pass the PT course', 'Réussir le cours PT'], ['Penetrant testing from cleaning to interpretation.', 'Le ressuage du nettoyage à l’interprétation.'], () => coursePassed('PT'), goCourse('PT'), 40),
      obj('cMT', ['Pass the MT course', 'Réussir le cours MT'], ['Magnetisation, particles and field direction.', 'Aimantation, particules et direction du champ.'], () => coursePassed('MT'), goCourse('MT'), 40),
      obj('mtsim', ['Find all 4 cracks on the MT simulator', 'Trouver les 4 fissures sur le simulateur MT'], ['Two directions, the right current, the right particles.', 'Deux directions, le bon courant, les bonnes particules.'], () => has('mt-sim'), goSim('MT', '.cymt'), 40),
      obj('ptsim', ['Score 100 % on the PT simulator', 'Obtenir 100 % sur le simulateur PT'], ['Every defect found, no false indication.', 'Tous les défauts trouvés, aucune fausse indication.'], () => has('pt-sim'), goSim('PT', '.cypt'), 40),
      obj('dict15', ['Know 15 dictionary words', 'Connaître 15 mots du dictionnaire'], ['Keep building your vocabulary.', 'Continuez à enrichir votre vocabulaire.'], () => countPrefix('dict:') >= 15, () => openTab('dict'), 15)
    ] },
    { n: 3, t: ['Intermediate technical knowledge', 'Connaissances techniques intermédiaires'], goal: ['Understand the volumetric methods UT and RT and what defects look like.', 'Comprendre les méthodes volumiques UT et RT et l’aspect des défauts.'], obj: [
      obj('mVol', ['Complete the UT and RT academy modules', 'Terminer les modules Académie UT et RT'], ['15 animated topics, including sound path calculations.', '15 thèmes animés, dont les calculs de parcours.'], () => modsDone('UT', 'RT'), () => goModules(['UT', 'RT'].find((m) => !modsDone(m)) || 'UT')(), 70),
      obj('cUT', ['Pass the UT course', 'Réussir le cours UT'], ['Sound, probes, calibration and echoes.', 'Son, traducteurs, étalonnage et échos.'], () => coursePassed('UT'), goCourse('UT'), 50),
      obj('cRT', ['Pass the RT course', 'Réussir le cours RT'], ['Radiation, film and image quality.', 'Rayonnement, film et qualité d’image.'], () => coursePassed('RT'), goCourse('RT'), 50),
      obj('utexp', ['Experiment with material and velocity in UT Explore', 'Expérimenter matériau et vitesse dans UT Explorer'], ['See why a wrong velocity or another material moves the echo.', 'Comprendre pourquoi une mauvaise vitesse ou un autre matériau déplace l’écho.'], () => has('ut-explore'), goSim('UT', '.cyut', 'explore'), 30),
      obj('utlib', ['See 6 indications on the UT flaw detector', 'Voir 6 indications sur le détecteur UT'], ['Indication library: rejected and not rejected cases.', 'Bibliothèque d’indications : cas refusés et non refusés.'], () => countPrefix('ut-lib:') >= 6, goSim('UT', '.cyut', 'library'), 30),
      obj('rtatlas', ['See 6 indications on radiographic film', 'Voir 6 indications sur film radiographique'], ['Film atlas with rejected and not rejected cases.', 'Atlas film avec cas refusés et non refusés.'], () => countPrefix('rt-atlas:') >= 6, goSim('RT', '.cyrt', 'atlas'), 30)
    ] },
    { n: 4, t: ['Advanced inspection knowledge', 'Connaissances avancées en inspection'], goal: ['Calibrate, interpret, and learn equipment inspection and the codes.', 'Étalonner, interpréter, et apprendre l’inspection des équipements et les codes.'], obj: [
      obj('dac', ['Draw a complete DAC on the UT simulator', 'Tracer une DAC complète sur le simulateur UT'], ['Six points, reference gain, 50 % and 20 % curves.', 'Six points, gain de référence, courbes 50 % et 20 %.'], () => has('ut-dac'), goSim('UT', '.cyut', 'dac'), 60),
      obj('rtint', ['Follow the full radiograph interpretation', 'Suivre l’interprétation complète d’un radiogramme'], ['All 11 steps up to the report.', 'Les 11 étapes jusqu’au rapport.'], () => has('rt-interp'), goSim('RT', '.cyrt', 'steps'), 40),
      obj('cEq', ['Pass the APVG, APL and APE courses', 'Réussir les cours APVG, APL et APE'], ['Pressure, lifting and electrical equipment.', 'Appareils à pression, de levage et électriques.'], () => ['APVG', 'APL', 'APE'].every(coursePassed), () => { const m = ['APVG', 'APL', 'APE'].find((x) => !coursePassed(x)) || 'APVG'; goCourse(m)(); }, 90),
      obj('daily3', ['Complete 3 daily challenges', 'Terminer 3 défis du jour'], ['A new set of 5 questions every day.', 'Une nouvelle série de 5 questions chaque jour.'], () => countPrefix('daily:') >= 3, () => openTab('chal'), 45),
      obj('codes', ['Complete 5 ASME/API teacher lessons', 'Terminer 5 leçons du formateur ASME/API'], ['B31.3, API 650, API 510, B16.5, Section V and IX.', 'B31.3, API 650, API 510, B16.5, sections V et IX.'], () => Object.values(study().done).filter(Boolean).length >= 5, goStudy(), 50),
      obj('scen3', ['Finish 3 inspection scenarios', 'Terminer 3 scénarios d’inspection'], ['Complete jobs from the brief to the decision, with a debrief.', 'Des travaux complets du dossier à la décision, avec débriefing.'], () => countPrefix('scen:') >= 3, () => openTab('scen'), 60)
    ] },
    { n: 5, t: ['Professional technical challenges', 'Défis techniques professionnels'], goal: ['Prove your skills on hidden indications, exams and difficult quizzes.', 'Prouvez vos compétences sur indications cachées, examens et quiz difficiles.'], obj: [
      obj('utex', ['Solve 5 hidden UT indications correctly', 'Résoudre correctement 5 indications UT cachées'], ['Type and decision both right.', 'Type et décision justes.'], () => okCount('ut-ex') >= 5, goSim('UT', '.cyut', 'exercise'), 80),
      obj('hard10', ['Answer 10 challenges correctly at ★4–★5', 'Réussir 10 défis de niveau ★4–★5'], ['Practice adapts the difficulty to you.', 'L’entraînement adapte la difficulté à votre niveau.'], () => ((P.ev['chal-hard'] || {}).n || 0) >= 10, () => openTab('chal'), 80),
      obj('exam', ['Score 80 % or more on the ASME/API final exam', 'Obtenir 80 % ou plus à l’examen final ASME/API'], ['12 questions on the codes.', '12 questions sur les codes.'], () => (study().best || 0) >= 80, goStudy('exam'), 80),
      obj('quiz', ['Score 80 % or more on the expert quiz', 'Obtenir 80 % ou plus au quiz expert'], ['Choose the hardest difficulty in the Quiz.', 'Choisissez la difficulté la plus élevée dans le Quiz.'], () => ((P.ev['quiz:master'] || {}).best || 0) >= 80, goQuiz(), 80),
      obj('scenAll', ['Score 80 % or more on all 8 inspection scenarios', 'Obtenir 80 % ou plus aux 8 scénarios d’inspection'], ['UT, RT, MT, PT, VT, pressure, lifting and electrical jobs.', 'Travaux UT, RT, MT, PT, VT, pression, levage et électrique.'], () => scenGood() >= scenTotal(), () => openTab('scen'), 100),
      obj('mission3', ['Score 80 % or more on advanced missions (★★★) in 3 areas', 'Obtenir 80 % ou plus à des missions avancées (★★★) dans 3 domaines'], ['Randomised fictional jobs: new numbers every time.', 'Travaux fictifs aléatoires : de nouveaux chiffres à chaque fois.'], () => missionAreas(3) >= 3, () => openTab('scen'), 90)
    ] }
  ];
  const levelDone = (lv) => lv.obj.every((o) => o.done());
  const unlocked = (i) => i === 0 || LEVELS.slice(0, i).every(levelDone);
  const currentLevel = () => { let n = 1; LEVELS.forEach((lv, i) => { if (unlocked(i)) n = lv.n; }); return n; };
  function xp() {
    let x = 0;
    LEVELS.forEach((lv) => lv.obj.forEach((o) => { if (o.done()) x += o.xp; }));
    x += countPrefix('dict:') * 2 + countPrefix('lab:') * 5 + countPrefix('basic:') * 10 + countPrefix('mod:') * 8 + countPrefix('daily:') * 15 + ((P.ev.chal || {}).ok || 0) * 2 + countPrefix('ut-lib:') * 3 + countPrefix('rt-atlas:') * 3 + okCount('ut-ex') * 10 + scenGood() * 20 + missionAreas(1) * 15 + countPrefix('twin:') * 5 + countPrefix('defect3d:') * 3 + countPrefix('ws:') * 2;
    return x;
  }
  const ACH = [
    ['🌱', ['First steps', 'Premiers pas'], ['Complete a beginner lesson', 'Terminer une leçon débutant'], () => countPrefix('basic:') >= 1],
    ['📖', ['Word collector', 'Collectionneur de mots'], ['Look up 20 terms', 'Consulter 20 termes'], () => countPrefix('dict:') >= 20],
    ['🧊', ['3D explorer', 'Explorateur 3D'], ['Open 8 equipment models', 'Ouvrir 8 modèles d’équipement'], () => countPrefix('lab:') >= 8],
    ['🔥', ['On a roll', 'Sur la lancée'], ['3-day learning streak', 'Série de 3 jours'], () => streak() >= 3],
    ['🏅', ['Committed', 'Assidu'], ['7-day learning streak', 'Série de 7 jours'], () => streak() >= 7],
    ['📈', ['DAC master', 'Maître de la DAC'], ['Draw a full DAC', 'Tracer une DAC complète'], () => has('ut-dac')],
    ['🎯', ['Sharp eye', 'Œil aiguisé'], ['Solve 10 hidden UT indications', 'Résoudre 10 indications UT cachées'], () => okCount('ut-ex') >= 10],
    ['🎞', ['Film reader', 'Lecteur de films'], ['Finish the RT interpretation', 'Terminer l’interprétation RT'], () => has('rt-interp')],
    ['📚', ['Code reader', 'Lecteur de codes'], ['100 % on the ASME/API exam', '100 % à l’examen ASME/API'], () => (study().best || 0) >= 100],
    ['⚡', ['Challenger', 'Challenger'], ['Complete 3 daily challenges', 'Terminer 3 défis du jour'], () => countPrefix('daily:') >= 3],
    ['🧮', ['Calculator', 'Calculateur'], ['10 correct answers at ★4–★5', '10 bonnes réponses à ★4–★5'], () => ((P.ev['chal-hard'] || {}).n || 0) >= 10],
    ['🧪', ['Field-ready trainee', 'Stagiaire prêt pour le terrain'], ['80 % or more on 4 inspection scenarios', '80 % ou plus à 4 scénarios d’inspection'], () => scenGood() >= 4],
    ['🎲', ['Mission specialist', 'Spécialiste des missions'], ['80 % or more on missions in 5 areas', '80 % ou plus aux missions dans 5 domaines'], () => missionAreas(1) >= 5],
    ['🏭', ['Twin inspector', 'Inspecteur jumeau'], ['Complete 5 digital-twin inspections', 'Terminer 5 inspections sur jumeaux numériques'], () => Object.keys(P.ev).filter((k) => /^twin:[A-Z]+:/.test(k)).length >= 5],
    ['🎓', ['Graduate', 'Diplômé'], ['Complete all 5 levels', 'Terminer les 5 niveaux'], () => LEVELS.every(levelDone)]
  ];

  /* ======================= UI ======================= */
  const css = `
.cyac { width: min(1180px, 97vw); height: min(92vh, 900px); padding: 0; border: 1px solid var(--line); border-radius: 12px; background: var(--bg); color: var(--text); }
.cyac::backdrop { background: rgba(3, 7, 20, .72); }
.cyac[open] { animation: cyac-in .22s ease-out; } @keyframes cyac-in { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
.cyac-body > * { animation: cyac-fade .25s ease-out; } @keyframes cyac-fade { from { opacity: 0; } to { opacity: 1; } }
.cyac-tabs button { transition: background .15s ease, border-color .15s ease; }
@media (prefers-reduced-motion: reduce) { .cyac[open], .cyac-body > * { animation: none; } }
@media (max-width: 640px) { .cyac { width: 100vw; height: 100dvh; max-height: none; border-radius: 0; } .cyac-tabs { flex-wrap: nowrap; overflow-x: auto; } .cyac-tabs button { white-space: nowrap; } }
.cyac-wrap { display: grid; grid-template-rows: auto auto 1fr; height: 100%; }
.cyac-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 16px; background: var(--panel); border-bottom: 1px solid var(--line); }
.cyac-head strong { font-size: 1.1rem; } .cyac-head span { display: block; color: var(--muted); font-size: 12px; }
.cyac-stats { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; } .cyac-stats b { color: #fff; }
.cyac-tabs { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 16px; border-bottom: 1px solid var(--line); }
.cyac-tabs button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cyac-body { overflow: auto; padding: 14px 16px 24px; }
.cyac-level { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; background: rgba(18, 29, 59, .55); }
.cyac-level.locked { opacity: .55; }
.cyac-level h3 { margin: 0 0 4px; display: flex; gap: 8px; align-items: center; } .cyac-level h3 small { color: var(--muted); font-weight: 600; }
.cyac-level > p { margin: 0 0 8px; color: var(--muted); }
.cyac-obj { display: grid; grid-template-columns: 26px 1fr auto; gap: 8px; align-items: center; padding: 7px 0; border-top: 1px solid rgba(52, 74, 131, .5); }
.cyac-obj span { color: var(--muted); font-size: 12px; display: block; } .cyac-obj .ok { color: #7de2b5; font-weight: 800; }
.cyac-bar { height: 7px; border-radius: 99px; background: rgba(255,255,255,.08); overflow: hidden; margin: 6px 0 8px; } .cyac-bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--blue), var(--violet)); }
.cyac-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.cyac-card { text-align: left; border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; background: rgba(16, 25, 35, .7); }
.cyac-card b { display: block; } .cyac-card span { color: var(--muted); font-size: 13px; }
.cyac-card.done { border-color: #42c991; }
.cyac-lesson { max-width: 820px; } .cyac-lesson p { line-height: 1.6; }
.cyac-words { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; } .cyac-words button { font-size: 13px; padding: 4px 10px; border-radius: 99px; }
.cyac-opts { display: grid; gap: 6px; margin: 8px 0; } .cyac-opts button { text-align: left; }
.cyac-opts .ok { border-color: #42c991; background: rgba(28, 106, 78, .45); } .cyac-opts .ko { border-color: #e66b78; background: rgba(130, 47, 61, .4); }
.cyac-fb { padding: 8px 12px; border-left: 3px solid var(--blue); margin: 8px 0; }
.cyac-search { width: 100%; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 10px 12px; font: inherit; margin-bottom: 10px; }
.cyac-dict { display: grid; grid-template-columns: minmax(200px, 300px) minmax(0, 1fr); gap: 14px; }
.cyac-terms { display: grid; gap: 4px; align-content: start; max-height: 62vh; overflow: auto; } .cyac-terms button { text-align: left; padding: 7px 10px; } .cyac-terms button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cyac-terms small { display: block; color: var(--muted); font-size: 11px; } .cyac-terms button.on small { color: #fff; }
.cyac-term h3 { margin: 0; } .cyac-term .tr { color: var(--muted); margin: 2px 0 10px; }
.cyac-term section { border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; margin: 8px 0; } .cyac-term section h4 { margin: 0 0 4px; font-size: 12px; letter-spacing: .06em; color: var(--muted); }
.cyac-ach { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; } .cyac-ach div { border: 1px solid var(--line); border-radius: 9px; padding: 8px 10px; opacity: .45; } .cyac-ach div.got { opacity: 1; border-color: #e0a526; }
.cyac-ach b { display: block; } .cyac-ach span { color: var(--muted); font-size: 12px; }
.cyac-note { color: var(--muted); font-size: 12px; }
.cyac-cert { display: none; }
@media print { body.cyac-printing > *:not(.cyac-cert) { display: none !important; } body.cyac-printing .cyac-cert { display: block !important; } }
.cyac-cert { font-family: Georgia, serif; color: #111; background: #fff; padding: 40px; text-align: center; border: 10px double #0b4fd6; margin: 20px; }
.cyac-cert h1 { font-size: 30px; margin: 10px 0; } .cyac-cert h2 { font-size: 24px; margin: 20px 0 6px; }
html.field .cyac-level, html.field .cyac-card { background: #fff; }
@media (max-width: 760px) { .cyac-dict { grid-template-columns: minmax(0, 1fr); } .cyac-terms { max-height: 30vh; } }
`;
  let dlg = null, tab = 'path', sel = { lesson: null, term: DICT[0].id, q: '' };
  function open(t) {
    if (!document.getElementById('cyac-css')) { const s = document.createElement('style'); s.id = 'cyac-css'; s.textContent = css; document.head.appendChild(s); }
    if (dlg) { dlg.remove(); dlg = null; }
    dlg = document.createElement('dialog'); dlg.className = 'cyac';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', onClick); dlg.addEventListener('input', onInput);
    const me = dlg; me.addEventListener('close', () => { me.remove(); if (dlg === me) dlg = null; });
    if (t) tab = t;
    if (!P.days.includes(today())) { P.days.push(today()); save(); }
    render(); dlg.showModal();
  }
  function close() { if (dlg) dlg.close(); }
  function openTab(t) { tab = t; sel.lesson = null; render(); }
  function render() {
    if (!dlg) return;
    dlg.innerHTML = '<div class="cyac-wrap"><div class="cyac-head"><div><strong>🏫 ' + L('CYCLOPS Academy', 'Académie CYCLOPS') + '</strong><span>' + L('Industrial inspection school from absolute zero · training only, not a qualification', 'École d’inspection industrielle à partir de zéro · formation uniquement, pas une qualification') + '</span></div>' +
      '<div class="cyac-stats">' + statsHtml() + '</div></div>' +
      '<div class="cyac-tabs">' + [['path', '🧭 ' + L('Learning path', 'Parcours')], ['basics', '🌱 ' + L('Beginner lessons', 'Leçons débutant')], ['cnd', '🎓 ' + L('CND Academy', 'Académie CND')], ['chal', '⚡ ' + L('Challenges', 'Défis')], ['scen', '🧪 ' + L('Scenarios & missions', 'Scénarios et missions')], ['coach', '🧠 ' + L('My coach', 'Mon coach')],['lab', '🧊 ' + L('3D lab', 'Labo 3D')], ['dict', '📖 ' + L('Dictionary', 'Dictionnaire')], ['progress', '🏆 ' + L('My progress', 'Ma progression')]].map(([k, n]) => '<button type="button" data-tab="' + k + '" class="' + (tab === k ? 'on' : '') + '">' + n + '</button>').join('') +
      '<button type="button" data-a="tutor">🧒 ' + L('Explain like I’m a beginner (AI)', 'Explique-moi comme à un débutant (IA)') + '</button>' + (window.CYLAB ? '<button type="button" data-a="lab">🧪 ' + L('Training lab', 'Laboratoire') + '</button>' : '') + '</div>' +
      '<div class="cyac-body">' + body() + '</div></div>';
    const s = dlg.querySelector('.cyac-search'); if (s && sel.focus) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); sel.focus = false; }
    const cnd = dlg.querySelector('.cyac-cnd'); if (cnd && window.CYNDT) window.CYNDT.mount(cnd, ndtApi);
    const chal = dlg.querySelector('.cyac-chal'); if (chal && window.CYCHAL) window.CYCHAL.mount(chal, { record: (id, info) => record(id, info, true), level: currentLevel, tutor: (q) => tutor(q) });
    const insightApi = { record: (id, info) => record(id, info, true), tutor: (q) => tutor(q), go };
    const coachEl = dlg.querySelector('.cyac-coach'); if (coachEl && window.CYINSIGHT) window.CYINSIGHT.mountCoach(coachEl, insightApi);
    const dashEl = dlg.querySelector('.cyac-dash'); if (dashEl && window.CYINSIGHT) window.CYINSIGHT.mountDashboard(dashEl, insightApi);
    const scen = dlg.querySelector('.cyac-scen'); if (scen && window.CYSCEN) window.CYSCEN.mount(scen, { record: (id, info) => record(id, info, true), tutor: (q) => tutor(q), review });
  }
  // one navigation entry point for the coach, analytics, workspace, twins and missions:
  // { tab } | { mod: method, id? } | { sim } | { study } | { dict } | { ws: area } | { twin: dept }
  function go(act) {
    if (!act) return;
    if (act.tab) { if (!dlg) open(act.tab); else openTab(act.tab); return; }
    if (act.mod) { if (!dlg) open('cnd'); if (window.CYNDT) window.CYNDT.open(act.mod, act.id); return openTab('cnd'); }
    if (act.sim) return ndtApi.tryIt(act.sim);
    if (act.study != null) return goStudy(act.study === 1 ? undefined : act.study)();
    if (act.dict) { if (!dlg) open('dict'); tab = 'dict'; sel.term = act.dict; sel.q = ''; return record('dict:' + act.dict); }
    if (act.ws) { close(); if (window.CYWORK) window.CYWORK.open(act.ws); return; }
    if (act.twin) { close(); if (window.CYTWIN) window.CYTWIN.open(act.twin); return; }
  }
  // debrief links from a scenario: { mod: [method, id] } | { sim } | { study } | { dict }
  function review(rv) {
    if (rv.mod) { if (window.CYNDT) window.CYNDT.open(rv.mod[0], rv.mod[1]); return openTab('cnd'); }
    if (rv.sim) return ndtApi.tryIt(rv.sim);
    if (rv.study != null) return goStudy(rv.study)();
    if (rv.dict) { tab = 'dict'; sel.term = rv.dict; sel.q = ''; return record('dict:' + rv.dict); }
  }
  // services the CND modules (cyclops-ndt-academy.js) use from the Academy
  const ndtApi = {
    has, record: (id) => record(id, null, true),
    term: (id) => { const d = DICT.find((x) => x.id === id); return d ? L(d.en, d.fr) : null; },
    tutor: (q) => tutor(q),
    tryIt: (kind, m) => ({ 'ut-explore': goSim('UT', '.cyut', 'explore'), 'mt-sim': goSim('MT', '.cymt'), 'pt-sim': goSim('PT', '.cypt'), anim: goMethod(m), lab: () => openTab('lab'), 'ut-lib': goSim('UT', '.cyut', 'library'), 'ut-dac': goSim('UT', '.cyut', 'dac'), 'rt-steps': goSim('RT', '.cyrt', 'steps'), 'rt-atlas': goSim('RT', '.cyrt', 'atlas') }[kind] || (() => {}))()
  };
  function statsHtml() {
    return '<span>⭐ <b>' + xp() + '</b> XP</span><span>🎚 ' + L('Level', 'Niveau') + ' <b>' + currentLevel() + '</b>/5</span><span>🔥 <b>' + streak() + '</b> ' + L('day streak', 'jours de suite') + '</span><button type="button" data-a="close" aria-label="' + L('Close', 'Fermer') + '">✕</button>';
  }
  function body() {
    if (tab === 'path') return LEVELS.map((lv, i) => {
      const open = unlocked(i), done = lv.obj.filter((o) => o.done()).length, all = levelDone(lv);
      return '<div class="cyac-level' + (open ? '' : ' locked') + '"><h3>' + (all ? '✅' : open ? '🔓' : '🔒') + ' ' + L('Level', 'Niveau') + ' ' + lv.n + ' · ' + esc(T2(lv.t)) + ' <small>' + done + '/' + lv.obj.length + '</small></h3><p>' + esc(T2(lv.goal)) + '</p>' +
        '<div class="cyac-bar"><i style="width:' + Math.round(done / lv.obj.length * 100) + '%"></i></div>' +
        (open ? lv.obj.map((o) => '<div class="cyac-obj"><div class="' + (o.done() ? 'ok' : '') + '">' + (o.done() ? '✓' : '○') + '</div><div>' + esc(T2(o.t)) + '<span>' + esc(T2(o.d)) + ' · +' + o.xp + ' XP</span></div><button type="button" data-go="' + lv.n + ':' + o.id + '">' + (o.done() ? L('Review', 'Revoir') : L('Start', 'Commencer')) + '</button></div>').join('')
          : '<p class="cyac-note">🔒 ' + L('Complete level ' + (lv.n - 1) + ' to unlock.', 'Terminez le niveau ' + (lv.n - 1) + ' pour débloquer.') + '</p>') +
        (all ? '<button type="button" data-cert="' + lv.n + '">📜 ' + L('Certificate of completion', 'Attestation de réussite') + '</button>' : '') + '</div>';
    }).join('') + '<p class="cyac-note">' + L('Your progress is saved on this device only.', 'Votre progression est enregistrée sur cet appareil uniquement.') + '</p>';
    if (tab === 'basics') {
      if (sel.lesson) return lessonView(BASICS.find((b) => b.id === sel.lesson));
      return '<p>' + L('Start here if you know nothing about inspection. Each lesson takes about 3 minutes.', 'Commencez ici si vous ne connaissez rien à l’inspection. Chaque leçon dure environ 3 minutes.') + '</p><div class="cyac-grid">' + BASICS.map((b, i) => '<button type="button" class="cyac-card' + (has('basic:' + b.id) ? ' done' : '') + '" data-lesson="' + b.id + '"><b>' + b.icon + ' ' + (i + 1) + '. ' + esc(T2(b.t)) + '</b><span>' + (has('basic:' + b.id) ? '✓ ' + L('Completed', 'Terminée') : L('About 3 min', 'Environ 3 min')) + '</span></button>').join('') + '</div>';
    }
    if (tab === 'chal') return window.CYCHAL ? '<div class="cyac-chal"></div>' : '<p class="cyac-note">' + L('The challenges could not be loaded.', 'Les défis n’ont pas pu être chargés.') + '</p>';
    if (tab === 'coach') return window.CYINSIGHT ? '<div class="cyac-coach"></div>' : '<p class="cyac-note">' + L('The coach could not be loaded.', 'Le coach n’a pas pu être chargé.') + '</p>';
    if (tab === 'scen') return window.CYSCEN ? '<div class="cyac-scen"></div>' : '<p class="cyac-note">' + L('The scenarios could not be loaded.', 'Les scénarios n’ont pas pu être chargés.') + '</p>';
    if (tab === 'cnd') return window.CYNDT ? '<div class="cyac-cnd"></div>' : '<p class="cyac-note">' + L('The CND modules could not be loaded.', 'Les modules CND n’ont pas pu être chargés.') + '</p>';
    if (tab === 'lab') {
      const P2 = window.CYPROC || {}, deps = [['CND', ['VT', 'PT', 'MT', 'UT', 'RT']], ['APVG', ['APVG']], ['APL', ['APL']], ['APE', ['APE']]];
      return '<p>' + L('Open any equipment in 3D. Drag to rotate 360°, use 🧩 Explode to separate the parts, ✂ Section to cut it open, and click a part to learn its name and purpose.', 'Ouvrez n’importe quel équipement en 3D. Glissez pour tourner à 360°, utilisez 🧩 Éclater pour séparer les pièces, ✂ Coupe pour l’ouvrir, et cliquez une pièce pour connaître son nom et son rôle.') + '</p>' +
        deps.map(([d, ms]) => '<h3>' + d + '</h3>' + ms.map((m) => { const eqs = (P2[m] && P2[m].equipment) || []; return '<p class="cyac-note"><b>' + m + '</b> · <button type="button" data-anim="' + m + '">🎬 ' + L('Animated lesson', 'Leçon animée') + '</button></p><div class="cyac-grid">' + eqs.map((e, i) => { const tx = window.CY3 && window.CY3.equipmentText ? window.CY3.equipmentText(m, i, e) : e; return '<button type="button" class="cyac-card' + (has('lab:' + m + ':' + i) ? ' done' : '') + '" data-eq="' + m + ':' + i + '"><b>🧊 ' + esc(tx[0]) + '</b><span>' + esc(tx[1]) + '</span></button>'; }).join('') + '</div>'; }).join('')).join('');
    }
    if (tab === 'dict') {
      const q = norm(sel.q), list = DICT.filter((d) => !q || norm([d.en, d.fr, T2(d.simple), T2(DCAT[d.cat])].join(' ')).includes(q));
      const cur = DICT.find((d) => d.id === sel.term) || list[0] || DICT[0];
      return '<input class="cyac-search" type="search" value="' + esc(sel.q) + '" placeholder="' + L('Search a word in English or French…', 'Chercher un mot en français ou en anglais…') + '" aria-label="' + L('Search the dictionary', 'Rechercher dans le dictionnaire') + '">' +
        '<div class="cyac-dict"><div class="cyac-terms">' + (list.map((d) => '<button type="button" data-term="' + d.id + '" class="' + (d.id === cur.id ? 'on' : '') + '">' + (has('dict:' + d.id) ? '✓ ' : '') + esc(L(d.en, d.fr)) + '<small>' + esc(T2(DCAT[d.cat])) + ' · ' + esc(L(d.fr, d.en)) + '</small></button>').join('') || '<p class="cyac-note">' + L('No word found.', 'Aucun mot trouvé.') + '</p>') + '</div>' + termView(cur) + '</div>';
    }
    // progress
    const s = study(), courses = ['VT', 'PT', 'MT', 'UT', 'RT', 'APVG', 'APL', 'APE'].filter(coursePassed);
    return (window.CYINSIGHT ? '<div class="cyac-dash"></div><h3>🧾 ' + L('Course and activity counters', 'Compteurs de cours et d’activités') + '</h3>' : '') + '<div class="cyac-grid">' + [
      ['⭐', 'XP', xp()], ['🎚', L('Current level', 'Niveau actuel'), currentLevel() + ' / 5'], ['🔥', L('Day streak', 'Jours de suite'), streak()], ['📅', L('Learning days', 'Jours d’apprentissage'), P.days.length],
      ['🌱', L('Beginner lessons', 'Leçons débutant'), countPrefix('basic:') + ' / ' + BASICS.length],
      ['⚡', L('Challenges answered / correct · daily challenges', 'Défis répondus / justes · défis du jour'), ((P.ev.chal || {}).n || 0) + ' / ' + ((P.ev.chal || {}).ok || 0) + ' · ' + countPrefix('daily:')],
      ['🧪', L('Inspection scenarios done · at 80 %+', 'Scénarios d’inspection faits · à 80 %+'), countPrefix('scen:') + ' · ' + scenGood() + ' / ' + scenTotal()],
      ['🎓', L('CND Academy modules', 'Modules Académie CND'), countPrefix('mod:') + ' / ' + (window.CYNDT ? window.CYNDT.count() : 0)], ['🎓', L('Method courses passed', 'Cours de méthode réussis'), courses.length + ' / 8' + (courses.length ? ' (' + courses.join(', ') + ')' : '')],
      ['📖', L('Dictionary words', 'Mots du dictionnaire'), countPrefix('dict:') + ' / ' + DICT.length], ['🧊', L('3D models explored', 'Modèles 3D explorés'), countPrefix('lab:')],
      ['📟', L('UT indications studied / solved', 'Indications UT étudiées / résolues'), countPrefix('ut-lib:') + ' / ' + okCount('ut-ex')], ['🎞', L('RT film indications studied', 'Indications film RT étudiées'), countPrefix('rt-atlas:')],
      ['📚', L('ASME/API lessons · best exam', 'Leçons ASME/API · meilleur examen'), Object.values(s.done).filter(Boolean).length + ' · ' + (s.best != null ? s.best + ' %' : '—')]
    ].map(([i, n, v]) => '<div class="cyac-card"><b>' + i + ' ' + esc(String(v)) + '</b><span>' + esc(n) + '</span></div>').join('') + '</div>' +
      '<h3>🏅 ' + L('Achievements', 'Succès') + '</h3><div class="cyac-ach">' + ACH.map(([i, n, d, ok]) => '<div class="' + (ok() ? 'got' : '') + '"><b>' + i + ' ' + esc(T2(n)) + '</b><span>' + esc(T2(d)) + '</span></div>').join('') + '</div>' +
      '<h3>📜 ' + L('Certificates', 'Attestations') + '</h3><p class="cyac-note">' + L('Name printed on certificates:', 'Nom imprimé sur les attestations :') + ' <input class="cyac-name" value="' + esc(P.name || '') + '" maxlength="60" style="border:1px solid var(--line);border-radius:7px;background:var(--panel);color:var(--text);padding:6px 8px"></p>' +
      LEVELS.map((lv) => '<p>' + (levelDone(lv) ? '<button type="button" data-cert="' + lv.n + '">📜 ' + L('Level', 'Niveau') + ' ' + lv.n + ' · ' + esc(T2(lv.t)) + '</button>' : '<span class="cyac-note">🔒 ' + L('Level', 'Niveau') + ' ' + lv.n + ' · ' + esc(T2(lv.t)) + '</span>') + '</p>').join('') +
      '<p class="cyac-note">' + L('Certificates confirm completion of CYCLOPS training content. They are not an NDT qualification or certification (e.g. ISO 9712).', 'Les attestations confirment le suivi des contenus de formation CYCLOPS. Ce ne sont ni une qualification ni une certification CND (ex. ISO 9712).') + '</p>';
  }
  function lessonView(b) {
    const i = BASICS.indexOf(b), done = has('basic:' + b.id);
    return '<div class="cyac-lesson"><button type="button" data-tab="basics">← ' + L('All lessons', 'Toutes les leçons') + '</button><h2>' + b.icon + ' ' + esc(T2(b.t)) + '</h2>' + b.p.map((p) => '<p>' + esc(T2(p)) + '</p>').join('') +
      '<p class="cyac-note">' + L('Key words (click to open the dictionary):', 'Mots clés (cliquer pour ouvrir le dictionnaire) :') + '</p><div class="cyac-words">' + b.words.map((w) => { const d = DICT.find((x) => x.id === w); return d ? '<button type="button" data-word="' + w + '">📖 ' + esc(L(d.en, d.fr)) + '</button>' : ''; }).join('') + '</div>' +
      '<h3>✅ ' + L('Check your understanding', 'Vérifiez votre compréhension') + '</h3><p><b>' + esc(T2(b.q.q)) + '</b></p><div class="cyac-opts" data-q="' + b.id + '">' + b.q.o.map((o, k) => '<button type="button" data-o="' + k + '">' + esc(T2(o)) + '</button>').join('') + '</div><div data-fb></div>' +
      '<p><button type="button" data-a="tutor-lesson" data-l="' + b.id + '">🧒 ' + L('Ask the AI tutor to explain this lesson again', 'Demander au tuteur IA de réexpliquer cette leçon') + '</button> ' +
      (i < BASICS.length - 1 ? '<button type="button" data-lesson="' + BASICS[i + 1].id + '">' + L('Next lesson', 'Leçon suivante') + ' →</button>' : '<button type="button" data-tab="path">🧭 ' + L('Back to the learning path', 'Retour au parcours') + '</button>') + '</p>' +
      (done ? '<p class="cyac-note">✓ ' + L('Lesson completed', 'Leçon terminée') + '</p>' : '') + '</div>';
  }
  function termView(d) {
    const see = d.see || {}, btns = [];
    if (see.m) btns.push('<button type="button" data-anim="' + see.m + '">🎬 ' + L('See it in 3D', 'Voir en 3D') + ' (' + see.m + ')</button>');
    if (see.eq) btns.push('<button type="button" data-eq="' + see.eq[0] + ':' + see.eq[1] + '">🧊 ' + L('Open the 3D model', 'Ouvrir le modèle 3D') + '</button>');
    if (see.ut) btns.push('<button type="button" data-ut="' + see.ut + '">📟 ' + L('See it on the A-scan', 'Voir sur l’A-scan') + '</button>');
    if (see.rt) btns.push('<button type="button" data-rt="' + see.rt + '">🎞 ' + L('See it on film', 'Voir sur film') + '</button>');
    if (see.study != null) btns.push('<button type="button" data-study="' + see.study + '">🎓 ' + L('Related ASME/API lesson', 'Leçon ASME/API liée') + '</button>');
    return '<div class="cyac-term"><h3>' + esc(L(d.en, d.fr)) + '</h3><div class="tr">🇬🇧 ' + esc(d.en) + ' · 🇫🇷 ' + esc(d.fr) + ' · ' + esc(T2(DCAT[d.cat])) + '</div>' +
      '<section><h4>' + L('IN SIMPLE WORDS', 'EN MOTS SIMPLES') + '</h4>' + esc(T2(d.simple)) + '</section>' +
      '<section><h4>' + L('TECHNICAL DEFINITION', 'DÉFINITION TECHNIQUE') + '</h4>' + esc(T2(d.tech)) + '</section>' +
      '<section><h4>' + L('PRACTICAL EXAMPLE', 'EXEMPLE PRATIQUE') + '</h4>' + esc(T2(d.ex)) + '</section>' +
      '<div class="cyac-words">' + btns.join('') + '<button type="button" data-a="tutor-term" data-t="' + d.id + '">🧒 ' + L('Explain it to me (AI tutor)', 'Explique-le-moi (tuteur IA)') + '</button></div>' +
      '<p class="cyac-note">' + L('Illustrations are 3D models and simulations drawn for training, not photographs of real inspections.', 'Les illustrations sont des modèles 3D et simulations dessinés pour la formation, pas des photos d’inspections réelles.') + '</p></div>';
  }
  function tutor(question) {
    close();
    if (window.CY3 && window.CY3.beginner) window.CY3.beginner(question);
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.a === 'close') return close();
    if (d.a === 'lab') { close(); if (window.CYLAB) window.CYLAB.open(); return; }
    if (d.tab) return openTab(d.tab);
    if (d.lesson) { tab = 'basics'; sel.lesson = d.lesson; render(); dlg.querySelector('.cyac-body').scrollTop = 0; return; }
    if (d.o != null) {
      const box = b.closest('.cyac-opts'); if (box.dataset.done) return; box.dataset.done = '1';
      const les = BASICS.find((x) => x.id === box.dataset.q), ok = Number(d.o) === les.q.a;
      b.classList.add(ok ? 'ok' : 'ko'); box.querySelector('[data-o="' + les.q.a + '"]').classList.add('ok');
      const fb = (ok ? '✅ ' + L('Correct! ', 'Exact ! ') : '❌ ' + L('Not quite. ', 'Pas tout à fait. ')) + T2(les.q.why) + (ok ? '' : ' ' + L('Read the lesson again, then retry.', 'Relisez la leçon, puis réessayez.'));
      dlg.querySelector('[data-fb]').innerHTML = '<div class="cyac-fb">' + esc(fb) + (ok ? '' : ' <button type="button" data-lesson="' + les.id + '">↻ ' + L('Retry', 'Réessayer') + '</button>') + '</div>';
      if (ok && !has('basic:' + les.id)) record('basic:' + les.id, null, true);
      return;
    }
    if (d.go) { const [n, id] = d.go.split(':'); const o = LEVELS[Number(n) - 1].obj.find((x) => x.id === id); if (o) o.go(); return; }
    if (d.word) { tab = 'dict'; sel.term = d.word; sel.q = ''; record('dict:' + d.word); return; }
    if (d.term) { sel.term = d.term; record('dict:' + d.term); render(); return; }
    if (d.eq) { const [m, i] = d.eq.split(':'); record('lab:' + m + ':' + i); close(); if (window.CY3) window.CY3.openEquipment(m, Number(i)); return; }
    if (d.anim) return goMethod(d.anim)();
    if (d.ut) return goSimSelect('UT', '.cyut', d.ut)();
    if (d.rt) return goSimSelect('RT', '.cyrt', d.rt)();
    if (d.study != null) return goStudy(Number(d.study))();
    if (d.cert) return certificate(Number(d.cert));
    if (d.a === 'tutor') return tutor(L('I am a complete beginner in industrial inspection. Where should I start, and what are the four departments (CND, APVG, APL, APE)?', 'Je suis un débutant complet en inspection industrielle. Par où commencer, et que sont les quatre départements (CND, APVG, APL, APE) ?'));
    if (d.a === 'tutor-lesson') { const les = BASICS.find((x) => x.id === d.l); return tutor(L('Explain this to me as a complete beginner, step by step, with a simple industrial example: ', 'Explique-moi ceci comme à un débutant complet, pas à pas, avec un exemple industriel simple : ') + T2(les.t)); }
    if (d.a === 'tutor-term') { const t = DICT.find((x) => x.id === d.t); return tutor(L('Explain the term "' + t.en + '" to a complete beginner, with a practical example.', 'Explique le terme « ' + t.fr + ' » à un débutant complet, avec un exemple pratique.')); }
  }
  // open a simulator on a given indication (UT library card or RT atlas card)
  const goSimSelect = (m, root, key) => () => {
    close();
    const b = [...document.querySelectorAll('#ptab button')].find((x) => x.textContent.trim() === m); if (b) b.click();
    setTimeout(() => { const s = document.querySelector(root); if (!s) return; const lib = s.querySelector(m === 'UT' ? '[data-mode="library"]' : '[data-mode="atlas"]'); if (lib) lib.click(); const c = s.querySelector('[data-type="' + key + '"]'); if (c) c.click(); s.scrollIntoView({ behavior: 'smooth' }); }, 400);
  };
  function onInput(e) {
    if (e.target.classList.contains('cyac-search')) { sel.q = e.target.value; sel.focus = true; render(); }
    if (e.target.classList.contains('cyac-name')) { P.name = e.target.value.slice(0, 60); save(); }
  }
  function certificate(n) {
    const lv = LEVELS[n - 1]; if (!levelDone(lv)) return;
    document.querySelectorAll('.cyac-cert').forEach((c) => c.remove());
    const c = document.createElement('div'); c.className = 'cyac-cert';
    c.innerHTML = '<p>AQCS · CYCLOPS Academy</p><h1>' + L('Certificate of course completion', 'Attestation de suivi de formation') + '</h1><p>' + L('This certifies that', 'Nous attestons que') + '</p><h2>' + esc(P.name || L('(name)', '(nom)')) + '</h2><p>' + L('has completed', 'a terminé') + ' <b>' + L('Level', 'le niveau') + ' ' + n + ' — ' + esc(T2(lv.t)) + '</b></p><ul style="text-align:left;display:inline-block">' + lv.obj.map((o) => '<li>' + esc(T2(o.t)) + '</li>').join('') + '</ul><p>' + L('Date', 'Date') + ': ' + new Date().toLocaleDateString(L('en-GB', 'fr-FR')) + '</p><p style="font-size:12px;margin-top:30px">' + L('Training content completion only. This is not an NDT qualification or certification (e.g. ISO 9712) and does not authorise inspection work.', 'Suivi de contenus de formation uniquement. Ce document n’est ni une qualification ni une certification CND (ex. ISO 9712) et n’autorise pas à réaliser des inspections.') + '</p>';
    document.body.appendChild(c);
    document.body.classList.add('cyac-printing');
    const done = () => { document.body.classList.remove('cyac-printing'); c.remove(); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  }

  /* ---------- header button ---------- */
  function headerButton() {
    const actions = document.querySelector('.head-actions'); if (!actions || document.getElementById('academy-open')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'academy-open'; b.className = 'primary-academy';
    const label = () => { b.textContent = '🏫 ' + L('Academy', 'Académie'); b.title = L('Learn inspection from zero', 'Apprendre l’inspection à partir de zéro'); };
    label(); b.addEventListener('click', () => open());
    actions.insertBefore(b, actions.querySelector('#back') ? actions.querySelector('#back').nextSibling : actions.firstChild);
    const sw = document.getElementById('lang'); if (sw) sw.addEventListener('change', () => { label(); if (dlg) render(); });
  }
  window.CYACADEMY = { open, record, level: currentLevel, xp, DICT, BASICS, LEVELS, events: () => P.ev, go: (act) => go(act) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', headerButton); else headerButton();
}());
