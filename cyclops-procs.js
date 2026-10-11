(function () {
  'use strict';

  const procedure = (name, codes, steps, acc, wn) => ({ name, n: name, codes, steps, acc, wn });

  const PROC = {
    PT: procedure('PT - Penetrant Testing', [['ISO 3452-1', 'General principles for penetrant testing'], ['AQCS PT', 'Use the current approved procedure and code edition']], [['Preparation', ['Clean and dry the inspection surface.']], ['Penetrant', ['Apply a continuous wet film and respect the qualified dwell time.']], ['Developer and inspection', ['Apply a thin developer layer and inspect under the specified lighting.']]], [['Relevant indication', 'Evaluate only against the applicable procedure and acceptance standard.']], ['Confirm lighting, dwell time, surface condition, and code edition.']),
    MT: procedure('MT - Magnetic Testing', [['ISO 9934-1', 'General principles for magnetic particle testing']], [['Preparation', ['Clean the surface and apply contrast if required.']], ['Magnetization', ['Use suitable pole spacing and inspect in two directions.']], ['Particles', ['Apply the qualified medium while the field is active.']]], [['Indication', 'Assess orientation, location, and applicable acceptance criteria.']], ['Verify field direction, lighting, and demagnetization requirements.']),
    UT: procedure('UT - Ultrasonic Testing', [['ISO 16810', 'General principles of ultrasonic testing'], ['ISO 17640', 'Weld testing guidance']], [['Calibration', ['Calibrate range and sensitivity using the approved reference block.']], ['Scanning', ['Scan both sides where required and maintain coupling and overlap.']], ['Evaluation', ['Record position, sound path, amplitude, and sizing method.']]], [['Indication', 'Do not call an indication acceptable or rejectable without the applicable code and context.']], ['Confirm material, thickness, weld type, probe, calibration block, and acceptance level.']),
    RT: procedure('RT - Radiographic Testing', [['ISO 17636', 'Radiographic testing of welds']], [['Safety', ['Establish the controlled area and verify radiation protection measures.']], ['Setup', ['Position source, object, film or detector, and IQI according to the approved technique.']], ['Exposure and reading', ['Process the image and evaluate indications against the applicable standard.']]], [['Indication', 'Classify only with the applicable acceptance criteria.']], ['Radiation safety and the approved exposure technique take priority.']),
    VT: procedure('VT - Visual Testing', [['ISO 17637', 'Visual testing of welds']], [['Lighting and access', ['Verify lighting, distance, access, and viewing angle.']], ['Examination', ['Inspect the complete area and use suitable gauges where needed.']], ['Report', ['Record dimensions, location, appearance, and disposition.']]], [['Measured feature', 'Compare measurements with the current applicable acceptance criteria.']], ['Record equipment, lighting, surface condition, and inspector information.']),
    APL: procedure('APL - Lifting Equipment', [['ISO 4309', 'Wire ropes on cranes - care, maintenance, and inspection']], [['Documents', ['Verify identification, SWL, certificates, and inspection history.']], ['Structure and mechanisms', ['Inspect structure, brakes, limits, wheels, controls, and mechanisms.']], ['Load tests', ['Perform authorized tests using the approved test plan and exclusion zone.']]], [['Defect', 'Remove equipment from service when the approved criteria require it.']], ['Never work or stand under a suspended load.']),
    APE: procedure('APE - Electrical Equipment', [['IEC 60364', 'Low-voltage electrical installations']], [['Isolation', ['Apply lockout/tagout and verify absence of voltage.']], ['Tests', ['Perform insulation, continuity, loop, and RCD tests with calibrated instruments.']], ['Thermography', ['Interpret temperature rise with load and emissivity context.']]], [['Test result', 'Compare the measured value with the applicable standard and procedure.']], ['Use suitable PPE and prove the tester before and after the test.']),
    APVG: procedure('APVG - Pressure Equipment', [['EN 13445', 'Unfired pressure vessels']], [['External inspection', ['Inspect shell, heads, supports, nozzles, and corrosion.']], ['Thickness and test', ['Map thickness and perform the authorized pressure test with venting and calibrated gauges.']], ['Safety valve', ['Verify set pressure, seat tightness, and identification.']]], [['Thickness or pressure', 'Acceptance depends on design data, code edition, and approved procedure.']], ['Do not infer a safe operating limit from a single measurement.']),
    OTH: procedure('OTHER', [['AQCS', 'Use the approved method-specific procedure']], [['Preparation', ['Define scope, hazards, equipment, and acceptance basis.']], ['Inspection', ['Perform the approved inspection steps and record objective evidence.']], ['Report', ['Record results, deviations, references, and signature.']]], [['Result', 'State the applicable acceptance basis before making a disposition.']], ['Escalate uncertain or safety-critical findings to the qualified supervisor.'])
  };

  const PROC_FR = {
    PT: { name: 'PT - Ressuage', codes: [['Principes généraux du contrôle par ressuage'], ['Utilisez la procédure approuvée en vigueur et l’édition applicable du code']], steps: [['Préparation', ['Nettoyez et séchez la surface à contrôler.']], ['Pénétrant', ['Appliquez un film humide continu et respectez le temps de pénétration qualifié.']], ['Révélateur et examen', ['Appliquez une fine couche de révélateur et examinez sous l’éclairage spécifié.']]], acc: [['Indication pertinente', 'Évaluez uniquement selon la procédure applicable et les critères d’acceptation.']], wn: ['Vérifiez l’éclairage, le temps de pénétration, l’état de surface et l’édition du code.'], hse: ['Portez des gants et des lunettes de protection.', 'Utilisez les produits chimiques dans une zone ventilée et suivez leur fiche de données de sécurité.', 'Maîtrisez l’exposition aux UV-A et vérifiez l’éclairage avant le contrôle.'] },
    MT: { name: 'MT - Magnétoscopie', codes: [['Principes généraux du contrôle par particules magnétiques']], steps: [['Préparation', ['Nettoyez la surface et appliquez un contraste si nécessaire.']], ['Aimantation', ['Utilisez un écartement de pôles adapté et contrôlez dans deux directions.']], ['Particules', ['Appliquez le produit qualifié pendant que le champ est actif.']]], acc: [['Indication', 'Évaluez l’orientation, l’emplacement et les critères d’acceptation applicables.']], wn: ['Vérifiez la direction du champ, l’éclairage et les exigences de démagnétisation.'], hse: ['Portez des lunettes et des gants adaptés.', 'Gardez les mains éloignées des yokes, pointes et pièces en mouvement sous tension.', 'Éliminez le magnétisme résiduel lorsque la procédure approuvée l’exige.'] },
    UT: { name: 'UT - Contrôle ultrasonore', codes: [['Principes généraux du contrôle ultrasonore'], ['Guide de contrôle des soudures']], steps: [['Étalonnage', ['Étalonnez la portée et la sensibilité avec le bloc de référence approuvé.']], ['Balayage', ['Balayez les deux côtés lorsque requis et maintenez le couplage et le recouvrement.']], ['Évaluation', ['Consignez la position, le parcours acoustique, l’amplitude et la méthode de dimensionnement.']]], acc: [['Indication', 'Ne déclarez pas une indication acceptable ou rejetable sans le code applicable et le contexte requis.']], wn: ['Confirmez le matériau, l’épaisseur, le type de soudure, la sonde, le bloc d’étalonnage et le niveau d’acceptation.'], hse: ['Inspectez les câbles, sondes et connecteurs avant utilisation.', 'Utilisez un accès sûr et gardez la zone de travail sèche.', 'Ne prenez aucune décision d’acceptation sans la procédure et le code approuvés.'] },
    RT: { name: 'RT - Radiographie', codes: [['Contrôle radiographique des soudures']], steps: [['Sécurité', ['Établissez la zone contrôlée et vérifiez les mesures de radioprotection.']], ['Montage', ['Positionnez la source, la pièce, le film ou le détecteur et l’IQI selon la technique approuvée.']], ['Exposition et lecture', ['Traitez l’image et évaluez les indications selon la norme applicable.']]], acc: [['Indication', 'Classez uniquement selon les critères d’acceptation applicables.']], wn: ['La radioprotection et la technique d’exposition approuvée sont prioritaires.'], hse: ['Établissez et gardez la zone contrôlée.', 'Utilisez un radiamètre étalonné et un dosimètre individuel.', 'N’entrez jamais avant confirmation de la mise en sécurité de la source.'] },
    VT: { name: 'VT - Contrôle visuel', codes: [['Contrôle visuel des soudures']], steps: [['Éclairage et accès', ['Vérifiez l’éclairage, la distance, l’accès et l’angle d’observation.']], ['Examen', ['Inspectez toute la zone et utilisez des jauges adaptées si nécessaire.']], ['Rapport', ['Consignez les dimensions, l’emplacement, l’aspect et la décision.']]], acc: [['Caractéristique mesurée', 'Comparez les mesures aux critères d’acceptation applicables en vigueur.']], wn: ['Consignez l’équipement, l’éclairage, l’état de surface et les informations de l’inspecteur.'], hse: ['Utilisez un accès et un éclairage sûrs ainsi qu’une protection antichute si nécessaire.', 'Gardez les mains éloignées des arêtes vives et des surfaces chaudes.', 'Consignez les preuves objectives sans toucher ni perturber une situation dangereuse.'] },
    APL: { name: 'APL - Appareils de levage', codes: [['Câbles en acier pour appareils de levage : entretien et inspection']], steps: [['Documents', ['Vérifiez l’identification, la CMU, les certificats et l’historique d’inspection.']], ['Structure et mécanismes', ['Inspectez la structure, les freins, les limiteurs, les roues, les commandes et les mécanismes.']], ['Essais de charge', ['Effectuez les essais autorisés selon le plan approuvé et la zone d’exclusion.']]], acc: [['Défaut', 'Retirez l’équipement du service lorsque les critères approuvés l’exigent.']], wn: ['Ne travaillez jamais et ne vous tenez jamais sous une charge suspendue.'], hse: ['Établissez une zone d’exclusion autour des charges suspendues.', 'Vérifiez la CMU, les certificats, les élingues, les crochets, les freins et les limiteurs.', 'Ne vous tenez jamais sous une charge suspendue ni dans une zone dangereuse.'] },
    APE: { name: 'APE - Équipements électriques', codes: [['Installations électriques à basse tension']], steps: [['Consignation', ['Appliquez la consignation et vérifiez l’absence de tension.']], ['Essais', ['Effectuez les essais d’isolement, de continuité, de boucle et de différentiel avec des appareils étalonnés.']], ['Thermographie', ['Interprétez l’élévation de température en tenant compte de la charge et de l’émissivité.']]], acc: [['Résultat d’essai', 'Comparez la valeur mesurée à la norme et à la procédure applicables.']], wn: ['Utilisez les EPI adaptés et vérifiez le testeur avant et après le contrôle.'], hse: ['Appliquez la consignation avant toute intervention.', 'Vérifiez le testeur avant et après le contrôle d’absence de tension.', 'Portez les EPI contre l’arc électrique requis et gardez les capots et barrières en place.'] },
    APVG: { name: 'APVG - Appareils à pression', codes: [['Récipients sous pression non soumis à la flamme']], steps: [['Inspection externe', ['Inspectez la virole, les fonds, les supports, les piquages et la corrosion.']], ['Épaisseur et essai', ['Cartographiez les épaisseurs et réalisez l’essai de pression autorisé avec purge et manomètres étalonnés.']], ['Soupape de sûreté', ['Vérifiez la pression de tarage, l’étanchéité du siège et l’identification.']]], acc: [['Épaisseur ou pression', 'L’acceptation dépend des données de conception, de l’édition du code et de la procédure approuvée.']], wn: ['Ne déduisez pas une limite de fonctionnement sûre à partir d’une seule mesure.'], hse: ['Confirmez l’isolement, la dépressurisation, la purge et la vidange.', 'Utilisez des manomètres étalonnés et maintenez le personnel hors de la zone dangereuse.', 'Ne dépassez jamais la pression d’essai autorisée et ne vous approchez pas d’un appareil qui fuit.'] },
    OTH: { name: 'AUTRE', codes: [['AQCS', 'Utilisez la procédure approuvée correspondant à la méthode']], steps: [['Préparation', ['Définissez le périmètre, les dangers, l’équipement et les critères d’acceptation.']], ['Inspection', ['Suivez les étapes approuvées et consignez les preuves objectives.']], ['Rapport', ['Consignez les résultats, écarts, références et signature.']]], acc: [['Résultat', 'Indiquez la base d’acceptation applicable avant toute décision.']], wn: ['En cas de doute ou de risque critique, adressez-vous au superviseur qualifié.'], hse: ['Identifiez les dangers et les EPI requis avant de commencer.', 'Isolez les énergies dangereuses et utilisez du matériel étalonné.', 'Arrêtez le travail et signalez toute situation dangereuse ou incertaine.'] }
  };
  Object.keys(PROC).forEach((key) => { PROC[key].fr = PROC_FR[key]; });

  const EQUIPMENT = {
    PT: [
      ['Cleaner and remover', 'Removes oil, dirt, and excess penetrant so surface-breaking flaws remain visible.'],
      ['Penetrant spray or tank', 'Low-viscosity liquid enters open surface defects by capillary action.'],
      ['Dwell-time timer', 'Controls the qualified penetration time before excess penetrant is removed.'],
      ['Developer aerosol or powder', 'Draws penetrant back out of a discontinuity to create a visible indication.'],
      ['UV-A lamp', 'Excites fluorescent penetrant so indications can be seen in a darkened inspection area.'],
      ['White-light lamp', 'Provides the required visible illumination for colour-contrast penetrant inspection.'],
      ['Inspection booth', 'Controls background light, cleanliness, and viewing conditions during evaluation.']
    ],
    MT: [
      ['AC/DC yoke', 'Creates a local magnetic field in ferromagnetic material to attract particles to leakage fields.'],
      ['Prods', 'Pass current through the part to create a circular magnetic field around the current path.'],
      ['Coil or bench unit', 'Magnetizes a component longitudinally or circularly for broader coverage.'],
      ['Wet fluorescent particle unit', 'Circulates a particle suspension while UV-A reveals accumulated particles.'],
      ['Dry powder applicator', 'Deposits ferromagnetic powder on a magnetized surface to show leakage fields.'],
      ['Field indicator or pie gauge', 'Confirms field direction and approximate field adequacy before examination.'],
      ['Demagnetizer', 'Reduces residual magnetism after inspection using a decreasing alternating field.']
    ],
    UT: [
      ['Ultrasonic flaw detector', 'Sends pulses, receives echoes, and displays amplitude against time or sound path.'],
      ['Straight-beam probe', 'Introduces longitudinal waves normal to the surface for thickness and lamination checks.'],
      ['Angle-beam probe', 'Introduces refracted shear waves to inspect welds and angled discontinuities.'],
      ['Phased-array probe', 'Fires multiple elements with timed delays to steer and focus a sound beam electronically.'],
      ['TOFD probes', 'Uses diffracted signals from flaw tips to estimate height and position.'],
      ['Calibration block', 'Provides known reflectors and dimensions for range, sensitivity, and resolution checks.'],
      ['Couplant', 'Removes the air gap between probe and surface so ultrasonic energy can enter the material.'],
      ['Encoded scanner', 'Moves the probe at a controlled speed and records position with the UT data.']
    ],
    RT: [
      ['X-ray tube', 'Generates X-rays that pass through the object and form a projected attenuation image.'],
      ['Gamma projector', 'Stores and remotely exposes a sealed radioactive source for radiographic imaging.'],
      ['Radiographic film and cassette', 'Records radiation intensity differences as a permanent image after processing.'],
      ['Digital detector panel', 'Converts transmitted radiation into an electronic image for immediate evaluation.'],
      ['IQI / penetrameter', 'Demonstrates radiographic sensitivity and image quality on the exposure.'],
      ['Survey meter', 'Measures radiation dose rate to establish boundaries and confirm safe conditions.'],
      ['Darkroom processor', 'Develops, fixes, washes, and dries film so the latent image becomes readable.'],
      ['Collimator and shielding', 'Restricts the beam and absorbs scattered radiation to protect personnel and improve contrast.']
    ],
    VT: [
      ['White-light source', 'Illuminates the surface so geometry, colour, and surface-breaking defects can be observed.'],
      ['Weld gauge', 'Measures fillet size, reinforcement, undercut, misalignment, and related geometry.'],
      ['Vernier caliper', 'Measures external dimensions, lengths, and feature sizes with a sliding scale.'],
      ['Magnifier', 'Increases apparent feature size for close visual examination.'],
      ['Mirror and borescope', 'Provides line-of-sight access to hidden or restricted areas.'],
      ['Surface comparator', 'Compares surface profile or finish against known reference conditions.'],
      ['Camera and inspection record', 'Captures objective visual evidence with location and identification information.']
    ],
    APL: [
      ['Crane or lifting machine', 'Raises and moves loads through hoist, trolley, bridge, boom, or slew mechanisms.'],
      ['Wire-rope caliper', 'Measures rope diameter loss to identify wear, corrosion, or discard conditions.'],
      ['Rope diameter gauge', 'Checks the actual rope diameter against its nominal size and inspection history.'],
      ['Load cell', 'Measures tensile force in a lifting system during proof or operational load testing.'],
      ['Test weights', 'Provide a known load for static and dynamic verification of lifting equipment.'],
      ['Hook gauge', 'Measures hook throat opening and helps identify deformation or wear.'],
      ['Shackle and sling set', 'Connects the test load to the machine while transferring load through rated components.'],
      ['Limit-switch tester', 'Confirms that travel, overload, and emergency limit devices interrupt motion correctly.'],
      ['Brake tester', 'Checks whether the braking system holds or stops the rated test load.'],
      ['Visual and magnetic kit', 'Supports VT and MT checks of hooks, welds, pins, frames, and load-bearing parts.']
    ],
    APE: [
      ['Voltage indicator', 'Detects the presence or absence of electrical potential before and after isolation.'],
      ['Two-pole voltage tester', 'Uses a direct two-point measurement to verify voltage and prove safe isolation.'],
      ['Insulation resistance tester', 'Applies DC test voltage and measures leakage resistance between conductors and earth.'],
      ['Continuity tester', 'Passes a small current to confirm a low-resistance protective or bonding path.'],
      ['Loop impedance tester', 'Injects a test current and calculates fault-loop impedance from the voltage response.'],
      ['RCD / GFCI tester', 'Applies a controlled residual current and measures trip current or trip time.'],
      ['Clamp meter', 'Measures current through magnetic coupling around a conductor without opening the circuit.'],
      ['Multimeter', 'Measures voltage, current, resistance, and continuity using selectable electrical ranges.'],
      ['Thermal camera', 'Detects infrared radiation and converts temperature differences into a thermal image.'],
      ['LOTO kit', 'Physically isolates and identifies energy sources to prevent unexpected energization.']
    ],
    APVG: [
      ['Ultrasonic thickness gauge', 'Measures wall thickness from pulse travel time between entry and back-wall echoes.'],
      ['Hydrostatic test pump', 'Raises vessel pressure with an incompressible liquid for a controlled pressure test.'],
      ['Calibrated test gauge', 'Displays applied pressure and provides traceable verification of the test value.'],
      ['Pressure recorder', 'Records pressure over time to document the test cycle and hold period.'],
      ['Relief or safety valve test bench', 'Applies controlled pressure to verify set pressure and seat tightness.'],
      ['Borescope', 'Inspects internal surfaces, welds, tubes, and inaccessible areas through a small access point.'],
      ['Hardness tester', 'Applies a controlled indentation or rebound measurement to estimate material hardness.'],
      ['Corrosion mapping scanner', 'Collects repeated thickness readings over a grid to show local metal loss.'],
      ['Vent and drain manifold', 'Removes trapped air, controls filling, and safely drains the test medium.']
    ],
    OTH: [
      ['Calibrated measuring instrument', 'Converts a physical quantity into a traceable reading for the defined inspection.'],
      ['Reference standard', 'Provides a known value or condition against which the instrument or part is compared.'],
      ['Data logger', 'Records measurements over time so changes, trends, and events can be reviewed.'],
      ['PPE and isolation kit', 'Controls personal exposure and prevents release of hazardous energy during inspection.']
    ]
  };

  Object.keys(PROC).forEach((key) => { PROC[key].equipment = EQUIPMENT[key]; });

  const HSE = {
    PT: ['Wear gloves and eye protection.', 'Use chemicals in a ventilated area and follow the product SDS.', 'Control UV-A exposure and verify lighting before inspection.'],
    MT: ['Wear eye protection and suitable gloves.', 'Keep hands clear of energized yokes, prods, and moving parts.', 'Remove residual magnetism when the approved procedure requires it.'],
    UT: ['Inspect cables, probes, and connectors before use.', 'Use safe access and keep the work area dry.', 'Do not make an acceptance decision without the approved procedure and code.'],
    RT: ['Establish and guard the controlled radiation area.', 'Use a calibrated survey meter and personal dosimeter.', 'Never enter the area until the source is confirmed shielded or off.'],
    VT: ['Use safe access, lighting, and fall protection where required.', 'Keep hands clear of sharp edges and hot surfaces.', 'Record objective evidence without touching or disturbing unsafe conditions.'],
    APL: ['Establish an exclusion zone around suspended loads.', 'Verify SWL, certificates, slings, hooks, brakes, and limit devices.', 'Never stand under a suspended load or enter a danger zone.'],
    APE: ['Apply lockout/tagout before work.', 'Prove the voltage tester before and after verifying absence of voltage.', 'Use the required arc-flash PPE and keep covers and barriers in place.'],
    APVG: ['Confirm isolation, depressurization, venting, and drainage.', 'Use calibrated gauges and keep personnel outside the test danger zone.', 'Never exceed the authorized test pressure or approach a leaking vessel.'],
    OTH: ['Identify hazards and required PPE before starting.', 'Isolate hazardous energy and use calibrated equipment.', 'Stop work and escalate any unsafe or uncertain condition.']
  };

  Object.keys(PROC).forEach((key) => { PROC[key].hse = HSE[key]; });

  window.CYPROC = PROC;
}());