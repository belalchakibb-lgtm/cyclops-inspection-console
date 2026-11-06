/* CYCLOPS complete video guide: a narrated tour of the whole app, built on REAL screenshots of CYCLOPS
   (captured by tools/capture-guide.mjs into /guide/en and /guide/fr, with the position of each highlighted
   control in /guide/manifest.json). Every scene says what a feature is, what it is for and how to use it.
   The player zooms to the control, moves a cursor to it, highlights it, shows the text as subtitles and reads it
   aloud (browser speech synthesis, sentence by sentence; timed subtitles if no voice is available).
   window.CYGUIDE = { mount(el, api), visible(on), pause(), SCENES, CHAPTERS } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CHAPTERS = [
    ['Welcome: what CYCLOPS is', 'Bienvenue : ce qu’est CYCLOPS'], ['Procedures and 3D', 'Procédures et 3D'], ['The simulators', 'Les simulateurs'], ['The Academy', 'L’Académie'],
    ['Practice and your coach', 'Entraînement et coach'], ['The AI teacher', 'Le formateur IA'], ['The training lab', 'Le laboratoire'], ['Field inspections', 'Inspections terrain'], ['Your route through CYCLOPS', 'Votre parcours dans CYCLOPS']
  ];
  // { id, c: chapter index, t: title, s: narration, go: menu action for "Try it now" }
  const S = (id, c, t, s, go) => ({ id, c, t, s, go: go || null });
  const SCENES = [
    S('welcome', 0, ['What is CYCLOPS?', 'Qu’est-ce que CYCLOPS ?'], ['CYCLOPS is the industrial inspection school and field console of AQCS. It is made for complete beginners who want to learn inspection, and for inspectors who need a reference and a tool on site. It covers four departments: non-destructive testing, called CND, pressure equipment, called APVG, lifting equipment, called APL, and electrical installations, called APE. This guide shows you everything in the app, what each part is for, and exactly how to use it.', 'CYCLOPS est l’école d’inspection industrielle et la console terrain d’AQCS. Elle s’adresse aux débutants complets qui veulent apprendre l’inspection, et aux inspecteurs qui ont besoin d’une référence et d’un outil sur site. Elle couvre quatre départements : le contrôle non destructif, ou CND, les appareils à pression, ou APVG, les appareils de levage, ou APL, et les installations électriques, ou APE. Ce guide vous montre tout ce que contient l’application, à quoi sert chaque partie, et comment l’utiliser exactement.']),
    S('header', 0, ['The top bar', 'La barre du haut'], ['The top bar is always there. Home brings you back to this page and this guide. Menu opens the list of everything. Field mode switches to high contrast, which is easier to read outdoors in sunlight. The FR and EN switch changes the language of the whole app, including this guide. When accounts are enabled, a Sign out button also appears here.', 'La barre du haut est toujours là. Accueil vous ramène à cette page et à ce guide. Menu ouvre la liste de tout le contenu. Le mode terrain passe en contraste élevé, plus lisible dehors au soleil. L’interrupteur FR et EN change la langue de toute l’application, y compris ce guide. Quand les comptes sont activés, un bouton Déconnexion apparaît aussi ici.']),
    S('drawer', 0, ['The Menu', 'Le menu'], ['Press Menu from any page and this panel slides in. It lists every part of CYCLOPS, grouped by what you want to do: learn, practise, use the training lab, or work in the field. At the bottom you can jump straight to the procedures of any method. To close it, press the cross or click outside the panel.', 'Appuyez sur Menu depuis n’importe quelle page et ce panneau s’ouvre. Il liste chaque partie de CYCLOPS, classée selon ce que vous voulez faire : apprendre, vous entraîner, utiliser le laboratoire ou travailler sur le terrain. En bas, vous pouvez aller directement aux procédures de chaque méthode. Pour le fermer, appuyez sur la croix ou cliquez à côté du panneau.']),
    S('grid', 0, ['The home menu', 'Le menu de l’accueil'], ['Under this guide, the home page shows the same content as large cards, each with one line saying what it does. Just click a card to open it. If you do not know where to start, the beginner lessons card is made for you.', 'Sous ce guide, la page d’accueil présente le même contenu en grandes cartes, chacune avec une ligne qui dit à quoi elle sert. Cliquez simplement sur une carte pour l’ouvrir. Si vous ne savez pas par où commencer, la carte des leçons débutant est faite pour vous.'], 'basics'),

    S('tabs', 1, ['One page per method', 'Une page par méthode'], ['The procedures pages are your technical reference. There is one page for each method: PT penetrant testing, MT magnetic particles, UT ultrasound, RT radiography, VT visual testing, then APL lifting, APE electrical, APVG pressure equipment, and OTH for other general topics. Click a tab to open its page.', 'Les pages de procédures sont votre référence technique. Il y a une page par méthode : PT ressuage, MT magnétoscopie, UT ultrasons, RT radiographie, VT contrôle visuel, puis APL levage, APE électrique, APVG appareils à pression, et OTH pour les autres sujets généraux. Cliquez un onglet pour ouvrir sa page.'], 'ut'),
    S('anim', 1, ['The 3D animation', 'L’animation 3D'], ['Each page starts with a live 3D animation that shows the method phase by phase, in an industrial hall. It is for seeing how the work is really done before reading about it. Drag with the mouse or your finger to turn around it. Use the wheel or pinch to zoom. Double-click to go back to the starting view.', 'Chaque page commence par une animation 3D en direct qui montre la méthode étape par étape, dans un hall industriel. Elle sert à voir comment le travail se fait vraiment avant de le lire. Glissez avec la souris ou le doigt pour tourner autour. Utilisez la molette ou pincez pour zoomer. Double-cliquez pour revenir à la vue de départ.'], 'ut'),
    S('anim-bar', 1, ['The animation controls', 'Les commandes de l’animation'], ['Under the animation: pause, previous and next phase, and speed. The voice buttons read each phase aloud. Explode separates the parts so you see how the equipment is assembled. Section cuts it open so you see inside. Click any part of the model to get its name and purpose. The numbered buttons jump to a phase.', 'Sous l’animation : pause, étape précédente et suivante, et vitesse. Les boutons de voix lisent chaque étape à haute voix. Éclater sépare les pièces pour voir comment l’équipement est assemblé. Coupe l’ouvre pour voir l’intérieur. Cliquez une pièce du modèle pour connaître son nom et son rôle. Les boutons numérotés vont directement à une étape.'], 'ut'),
    S('equip', 1, ['Equipment cards', 'Les cartes d’équipement'], ['Further down, you find all the equipment of the method, with what each item does. These cards are for learning to recognise the tools and choose the right kit for a job. Click a card to open that item in 3D.', 'Plus bas, vous trouvez tout l’équipement de la méthode, avec le rôle de chaque élément. Ces cartes servent à apprendre à reconnaître les outils et à choisir le bon matériel pour un travail. Cliquez une carte pour ouvrir cet élément en 3D.'], 'ut'),
    S('equip3d', 1, ['An item in 3D', 'Un élément en 3D'], ['Here is one item opened in 3D. On the screen you get how it works, how to use it and what it is used for, with its health and safety rules underneath. Close it with the cross at the top.', 'Voici un élément ouvert en 3D. À l’écran, vous avez son fonctionnement, son mode d’utilisation et son utilité, avec ses règles de santé et de sécurité en dessous. Fermez avec la croix en haut.'], 'ut'),
    S('steps', 1, ['Steps, safety and codes', 'Étapes, sécurité et codes'], ['The rest of the page gives the step-by-step procedure, the health and safety rules, and the codes and references to check. Click a title to open or close a section. Important: the codes listed are references to verify. The contract, the regulation and the edition in force decide what really applies.', 'Le reste de la page donne la procédure pas à pas, les règles de santé et de sécurité, et les codes et références à vérifier. Cliquez un titre pour ouvrir ou fermer une section. Important : les codes cités sont des références à vérifier. Le contrat, la réglementation et l’édition en vigueur décident de ce qui s’applique vraiment.'], 'ut'),
    S('search', 1, ['Search and photo', 'Recherche et photo'], ['The search box filters methods as you type: try an equipment name, a hazard or a code. The Photo button takes a picture or a file and can send it to the AI assistant, which describes what it sees. Clear resets the search.', 'La zone de recherche filtre les méthodes pendant la frappe : essayez un nom d’équipement, un risque ou un code. Le bouton Photo prend une image ou un fichier et peut l’envoyer à l’assistant IA, qui décrit ce qu’il voit. Effacer remet la recherche à zéro.'], 'ut'),
    S('course', 1, ['The full course', 'Le cours complet'], ['Press Start full course, at the top of a method page, and a 3D instructor teaches you the whole method lesson by lesson, with the outline on the side and a knowledge check at the end. Use it when you want to learn a method completely, from its principle to its limits.', 'Appuyez sur Commencer le cours complet, en haut d’une page de méthode, et un formateur 3D vous enseigne toute la méthode leçon par leçon, avec le plan sur le côté et une vérification à la fin. Utilisez-le pour apprendre une méthode en entier, de son principe à ses limites.'], 'ut'),
    S('pro', 1, ['Professional courses', 'Cours professionnels'], ['For working inspectors, the professional courses present the code requirements in a narrated slideshow: for example the calibration block and hole size for each weld thickness, and the accept and reject criteria. Each table names its source. A green badge means cross-checked with public sources, and an orange badge means verify it first. The official edition always decides. Press Present with voice to follow a course, and try the small calculators on the slides.', 'Pour les inspecteurs en activité, les cours professionnels présentent les exigences des codes dans un diaporama commenté : par exemple le bloc d’étalonnage et le diamètre de trou pour chaque épaisseur de soudure, et les critères d’acceptation et de refus. Chaque tableau cite sa source. Un badge vert signifie recoupé avec des sources publiques, et un badge orange signifie à vérifier d’abord. L’édition officielle décide toujours. Appuyez sur Présenter avec la voix pour suivre un cours, et essayez les petits calculateurs des diapositives.'], 'pro'),

    S('ut-lib', 2, ['UT: the indication library', 'UT : la bibliothèque d’indications'], ['On the UT page you find a complete flaw detector simulator. Its first mode is the indication library. It is for learning what each defect looks like on the screen. Click a defect, such as a crack, and see its echo. Then switch between the rejected and the not rejected case to see the difference.', 'Sur la page UT se trouve un simulateur complet de détecteur de défauts. Son premier mode est la bibliothèque d’indications. Elle sert à apprendre l’aspect de chaque défaut à l’écran. Cliquez un défaut, par exemple une fissure, et regardez son écho. Puis passez du cas refusé au cas non refusé pour voir la différence.'], 'ut'),
    S('ut-ctrl', 2, ['UT: the controls', 'UT : les réglages'], ['As on a real instrument, you set the probe angle, the gain and the range, and you move the probe with the sliders. Find max echo brings the probe to the strongest signal, and auto-scan sweeps along the weld. The boxes under the screen give the sound path, the depth, the surface distance, the amplitude and the level against the DAC curve.', 'Comme sur un vrai appareil, vous réglez l’angle du traducteur, le gain et la plage, et vous déplacez le traducteur avec les curseurs. Chercher l’écho max amène le traducteur au signal le plus fort, et le balayage automatique parcourt la soudure. Les cases sous l’écran donnent le parcours, la profondeur, la distance en surface, l’amplitude et le niveau par rapport à la courbe DAC.'], 'ut'),
    S('ut-ex', 2, ['UT: the training exercise', 'UT : l’exercice d’entraînement'], ['In Training exercise, a defect is hidden in the weld. Your job is to find it with the probe, identify its type, and decide if it is rejected or not. Then you get the answer with the explanation. Use it after the library, to test yourself.', 'Dans l’exercice d’entraînement, un défaut est caché dans la soudure. Votre travail : le trouver avec le traducteur, identifier son type et décider s’il est refusé ou non. Vous recevez ensuite la réponse et l’explication. Utilisez-le après la bibliothèque pour vous tester.'], 'ut'),
    S('ut-dac', 2, ['UT: drawing the DAC', 'UT : tracer la DAC'], ['Draw the DAC teaches calibration step by step. Follow the instructions on the right: find each reference hole, peak its echo, set the reference gain, and press Mark point. At the end you have the complete distance amplitude curve and the calibration sheet.', 'Tracer la DAC enseigne l’étalonnage pas à pas. Suivez les instructions à droite : trouvez chaque trou de référence, maximisez son écho, réglez le gain de référence et appuyez sur Marquer le point. À la fin, vous avez la courbe distance amplitude complète et la fiche d’étalonnage.'], 'ut'),
    S('ut-explore', 2, ['UT: Explore', 'UT : Explorer'], ['Explore answers the question why. Change one setting at a time: material, instrument velocity, thickness, reflector or probe frequency. The screen changes, and the Why list explains it with real numbers, for example how a wrong velocity moves the echo, or how frequency changes the resolution.', 'Explorer répond à la question pourquoi. Changez un réglage à la fois : matériau, vitesse de l’appareil, épaisseur, réflecteur ou fréquence du traducteur. L’écran change, et la liste Pourquoi l’explique avec de vrais chiffres, par exemple comment une mauvaise vitesse déplace l’écho, ou comment la fréquence change la résolution.'], 'ut'),
    S('rt-steps', 2, ['RT: interpreting a film', 'RT : interpréter un film'], ['On the RT page, the trainer walks you through the interpretation of a radiograph in order, from checking that the film is valid, with its markers, density and image quality indicator, up to the report. Press next to move through the steps and read why each one matters.', 'Sur la page RT, le module vous guide dans l’interprétation d’un radiogramme, dans l’ordre, de la vérification de la validité du film, avec ses repères, sa densité et son indicateur de qualité d’image, jusqu’au rapport. Appuyez sur suivant pour avancer et lisez pourquoi chaque étape compte.'], 'rt'),
    S('rt-atlas', 2, ['RT: the film atlas', 'RT : l’atlas des films'], ['The atlas shows each defect as it appears on film, in a rejected and a not rejected case. Use it to train your eye: dark means less metal, light means denser or thicker metal.', 'L’atlas montre chaque défaut tel qu’il apparaît sur le film, dans un cas refusé et un cas non refusé. Utilisez-le pour entraîner votre œil : sombre signifie moins de métal, clair signifie un métal plus dense ou plus épais.'], 'rt'),
    S('mt-sim', 2, ['MT simulator', 'Simulateur MT'], ['On the MT page, you move and rotate a magnetic yoke over the part, choose the current and the particles, then magnetise. Four cracks are hidden. The goal is to find them all, and it teaches why you need two directions, and why only direct current finds the crack below the surface.', 'Sur la page MT, vous déplacez et orientez un yoke sur la pièce, choisissez le courant et les particules, puis vous aimantez. Quatre fissures sont cachées. Le but est de toutes les trouver, et cela apprend pourquoi il faut deux directions, et pourquoi seul le courant continu trouve la fissure sous la surface.'], 'mt'),
    S('pt-sim', 2, ['PT simulator', 'Simulateur PT'], ['On the PT page, you run a full penetrant test: cleaning, penetrant type, dwell time, removal of the excess, developer and lighting. Then you see the result and an explanation of each mistake. Try skipping the cleaning to see what happens.', 'Sur la page PT, vous réalisez un ressuage complet : nettoyage, type de pénétrant, temps de pénétration, élimination de l’excès, révélateur et éclairage. Vous voyez ensuite le résultat et l’explication de chaque erreur. Essayez de sauter le nettoyage pour voir ce qui se passe.'], 'pt'),

    S('ac-path', 3, ['The learning path', 'Le parcours'], ['The Academy is the school inside CYCLOPS. The learning path has five levels, from absolute beginner to professional. Each level lists objectives, and the Start button next to an objective takes you straight to the right lesson or simulator. Finishing a level unlocks the next one. The bar at the top shows your points, your level and your streak of days.', 'L’Académie est l’école de CYCLOPS. Le parcours compte cinq niveaux, du débutant absolu au professionnel. Chaque niveau liste des objectifs, et le bouton Commencer à côté d’un objectif vous emmène directement à la bonne leçon ou au bon simulateur. Terminer un niveau débloque le suivant. La barre du haut montre vos points, votre niveau et votre série de jours.'], 'academy'),
    S('ac-basics', 3, ['Beginner lessons', 'Leçons débutant'], ['If you know nothing about inspection, start here. Six short lessons of about three minutes explain what inspection is, what a weld is, the difference between destructive and non-destructive testing, and the safety basics. Each lesson ends with a check question.', 'Si vous ne connaissez rien à l’inspection, commencez ici. Six leçons courtes d’environ trois minutes expliquent ce qu’est l’inspection, ce qu’est une soudure, la différence entre essais destructifs et non destructifs, et les bases de la sécurité. Chaque leçon se termine par une question de vérification.'], 'basics'),
    S('ac-cnd', 3, ['CND Academy modules', 'Modules Académie CND'], ['Thirty animated modules teach UT, RT, MT, PT and VT topic by topic. Choose a method, then a topic. Each one has an animated diagram, a clear explanation, key points and a question, with links to the matching simulator and to the dictionary.', 'Trente modules animés enseignent UT, RT, MT, PT et VT thème par thème. Choisissez une méthode, puis un thème. Chacun contient un schéma animé, une explication claire, les points clés et une question, avec des liens vers le simulateur correspondant et le dictionnaire.'], 'cnd'),
    S('ac-dict', 3, ['The visual dictionary', 'Le dictionnaire visuel'], ['Never stay stuck on a word. Search in English or French, and for each term you get a simple explanation, the technical definition and a practical example, with a link to see it in 3D, on the A-scan or on film.', 'Ne restez jamais bloqué sur un mot. Cherchez en français ou en anglais : pour chaque terme, vous avez une explication simple, la définition technique et un exemple pratique, avec un lien pour le voir en 3D, sur l’A-scan ou sur film.'], 'dict'),
    S('ac-lab', 3, ['The 3D equipment lab', 'Le labo 3D des équipements'], ['This tab gathers all the equipment of every department in one place. Click a card to open it in 3D. Use it to discover the tools of a department you do not know yet.', 'Cet onglet rassemble tout l’équipement de chaque département au même endroit. Cliquez une carte pour l’ouvrir en 3D. Utilisez-le pour découvrir les outils d’un département que vous ne connaissez pas encore.'], 'lab3d'),
    S('ac-progress', 3, ['My progress', 'Ma progression'], ['My progress shows your learning time, your percentage of correct answers, your knowledge by discipline, your improvement over six weeks and your history. Lower down are your achievements and certificates of completion to print. They confirm that you followed the training. They are not an official qualification such as ISO 9712.', 'Ma progression montre votre temps d’apprentissage, votre taux de bonnes réponses, vos connaissances par discipline, vos progrès sur six semaines et votre historique. Plus bas se trouvent vos succès et vos attestations de suivi à imprimer. Elles confirment que vous avez suivi la formation. Ce n’est pas une qualification officielle comme l’ISO 9712.'], 'progress'),

    S('chal', 4, ['Challenges', 'Défis'], ['Come back every day for the daily challenge: five questions with a calculation, a defect image, knowledge, a real situation and a harder one. Practice gives unlimited questions by category, and the difficulty adapts: two right answers make it harder, one wrong answer makes it easier.', 'Revenez chaque jour pour le défi du jour : cinq questions avec un calcul, une image de défaut, des connaissances, une situation réelle et une plus difficile. L’entraînement donne des questions illimitées par catégorie, et la difficulté s’adapte : deux bonnes réponses la montent, une erreur la baisse.'], 'chal'),
    S('scen-list', 4, ['Scenarios and missions', 'Scénarios et missions'], ['Scenarios are complete jobs, from the brief to the final decision. Eight guided scenarios cover all the areas. Above them, adaptive missions create a new fictional job every time, with new equipment and new numbers. Press Adaptive mission and CYCLOPS chooses your weakest area and the right difficulty, or choose the area and level yourself.', 'Les scénarios sont des travaux complets, du dossier à la décision finale. Huit scénarios guidés couvrent tous les domaines. Au-dessus, les missions adaptatives créent à chaque fois un nouveau travail fictif, avec un nouvel équipement et de nouveaux chiffres. Appuyez sur Mission adaptative et CYCLOPS choisit votre domaine le plus faible et la bonne difficulté, ou choisissez vous-même le domaine et le niveau.'], 'scen'),
    S('scen-step', 4, ['Playing a job', 'Jouer un travail'], ['Read the situation at the top, then answer step by step: choose the objective and the equipment, calibrate, calculate, interpret an image, and decide. Select your answer and press Validate. You immediately get the explanation, then you go to the next step.', 'Lisez la situation en haut, puis répondez étape par étape : choisissez l’objectif et le matériel, étalonnez, calculez, interprétez une image et décidez. Sélectionnez votre réponse et appuyez sur Valider. Vous avez aussitôt l’explication, puis vous passez à l’étape suivante.'], 'scen'),
    S('scen-debrief', 4, ['The debrief', 'Le débriefing'], ['At the end, the debrief gives your score and explains each mistake, with the right answer and why. A button takes you to the lesson or simulator to review. The values and acceptance rules in these jobs are training examples, always to be checked against the real code edition.', 'À la fin, le débriefing donne votre score et explique chaque erreur, avec la bonne réponse et le pourquoi. Un bouton vous emmène à la leçon ou au simulateur à revoir. Les valeurs et règles d’acceptation de ces travaux sont des exemples de formation, à toujours vérifier avec l’édition réelle du code.'], 'scen'),
    S('coach', 4, ['My coach', 'Mon coach'], ['Your coach looks at every answer you give and finds your weak points. For each mistake, it shows your answer, the right one, and a likely cause when your number reveals one. Press New exercise to practise the same weakness, or Analyse with the AI for a personal explanation.', 'Votre coach regarde chaque réponse donnée et trouve vos points faibles. Pour chaque erreur, il montre votre réponse, la bonne, et une cause probable quand votre nombre en révèle une. Appuyez sur Nouvel exercice pour travailler la même faiblesse, ou sur Analyser avec l’IA pour une explication personnelle.'], 'coach'),
    S('quiz', 4, ['The quiz', 'Le quiz'], ['The quiz tests your knowledge of the procedures. Tick the methods you want, choose a difficulty level, and start. At the end, you get your score and a review of every question.', 'Le quiz teste vos connaissances des procédures. Cochez les méthodes voulues, choisissez un niveau de difficulté et commencez. À la fin, vous avez votre score et la revue de chaque question.'], 'quiz'),

    S('ai', 5, ['The AI assistant', 'L’assistant IA'], ['The robot assistant answers your questions at any time. Type your question in your own words, or press the microphone to speak it. The camera button sends a photo of equipment or of a defect. It knows the lesson you are studying and your weak points, and it adapts its explanation.', 'L’assistant répond à vos questions à tout moment. Écrivez votre question avec vos mots, ou appuyez sur le micro pour la dire. Le bouton appareil photo envoie une photo d’équipement ou de défaut. Il connaît la leçon en cours et vos points faibles, et il adapte son explication.'], 'ai'),
    S('ai-answer', 5, ['Reading its answers', 'Lire ses réponses'], ['The buttons above the box give quick questions, and Explain like I’m a beginner gives a simple version with an everyday example. Open Sources under an answer to see where it comes from, and press the speaker to hear it. The AI can be wrong and never replaces the code, the procedure or a qualified inspector. Always check.', 'Les boutons au-dessus de la zone donnent des questions rapides, et Explique-moi comme à un débutant donne une version simple avec un exemple du quotidien. Ouvrez Sources sous une réponse pour voir d’où elle vient, et appuyez sur le haut-parleur pour l’écouter. L’IA peut se tromper et ne remplace jamais le code, la procédure ni un inspecteur qualifié. Vérifiez toujours.'], 'ai'),
    S('teacher', 5, ['The ASME and API teacher', 'Le formateur ASME et API'], ['This AI teacher takes you through a study guide on ASME B31.3, API 650, API 510, ASME B16.5, and ASME Sections V and IX. Choose a lesson on the left, follow the explanation, answer the check question, use the built-in calculators, then take the final exam. It is a learning summary, not the code itself.', 'Ce formateur IA vous guide dans un guide d’étude sur l’ASME B31.3, l’API 650, l’API 510, l’ASME B16.5 et les sections V et IX de l’ASME. Choisissez une leçon à gauche, suivez l’explication, répondez à la question, utilisez les calculateurs intégrés, puis passez l’examen final. C’est un résumé pédagogique, pas le code lui-même.'], 'teacher'),

    S('lab-hub', 6, ['The training lab', 'Le laboratoire'], ['The training lab gathers the hands-on tools: the engineering workspace, digital twins, the 3D defect lab, adaptive missions and your coach. Everything marked Training simulation uses fictional or typical values. It is never the result of a real inspection.', 'Le laboratoire rassemble les outils pratiques : l’atelier de calcul, les jumeaux numériques, le labo 3D des défauts, les missions adaptatives et votre coach. Tout ce qui est marqué Simulation de formation utilise des valeurs fictives ou typiques. Ce n’est jamais le résultat d’une inspection réelle.']),
    S('work', 6, ['The engineering workspace', 'L’atelier de calcul'], ['Eleven calculators for the calculations of the job: sound path, thickness, probe angle, decibels, radiation, corrosion, shell thickness, slings, electrical, units and materials. Change a value on the left. On the right you see the formula, your values and the result with its unit, then why it matters. In the UT calculator, a drawing shows the beam in the plate.', 'Onze calculateurs pour les calculs du métier : parcours, épaisseur, angle du traducteur, décibels, rayonnement, corrosion, épaisseur de virole, élingues, électricité, unités et matériaux. Changez une valeur à gauche. À droite, vous voyez la formule, vos valeurs et le résultat avec son unité, puis pourquoi c’est important. Dans le calculateur UT, un dessin montre le faisceau dans la tôle.'], 'work'),
    S('twin', 6, ['Digital twins', 'Les jumeaux numériques'], ['A digital twin is a virtual copy of a piece of equipment for training. There are three fictional ones: an air receiver for APVG, an overhead crane for APL, and a distribution board for APE. Choose one at the top. The overview gives the 3D model, the nameplate and every component explained.', 'Un jumeau numérique est une copie virtuelle d’un équipement pour la formation. Il y en a trois, fictifs : un réservoir d’air pour l’APVG, un pont roulant pour l’APL et une armoire de distribution pour l’APE. Choisissez-en un en haut. La vue d’ensemble donne le modèle 3D, la plaque signalétique et chaque composant expliqué.'], 'twin'),
    S('twin-op', 6, ['Operating conditions', 'Conditions de fonctionnement'], ['In Operating conditions, move the sliders, for example the pressure or the temperature, and watch the live status. You see what happens close to the limit, when the safety valve opens, or when the overload limiter trips on the crane. It is for understanding why the limits exist.', 'Dans Conditions de fonctionnement, déplacez les curseurs, par exemple la pression ou la température, et regardez l’état en direct. Vous voyez ce qui se passe près de la limite, quand la soupape s’ouvre, ou quand le limiteur de charge coupe sur le pont roulant. Cela sert à comprendre pourquoi les limites existent.'], 'twin'),
    S('twin-test', 6, ['Hands-on inspections', 'Inspections pratiques'], ['In Inspect, you carry out real tasks: thickness survey and hydrostatic test on the vessel, wire rope and load test on the crane, lockout, insulation, RCD and thermography on the board. Here you click each point to measure the thickness, then you calculate the corrosion rate and the remaining life, and decide. A scored debrief explains everything. Read the History tab first: it contains clues.', 'Dans Inspecter, vous réalisez de vraies tâches : mesures d’épaisseur et épreuve hydraulique sur le réservoir, câble et essai de charge sur le pont, consignation, isolement, différentiels et thermographie sur l’armoire. Ici, vous cliquez chaque point pour mesurer l’épaisseur, puis vous calculez la vitesse de corrosion et la durée de vie, et vous décidez. Un débriefing noté explique tout. Lisez d’abord l’onglet Historique : il contient des indices.'], 'twin'),
    S('defects', 6, ['The 3D defect lab', 'Le labo 3D des défauts'], ['Choose one of seven defects in a welded plate, such as a crack, lack of fusion or porosity. Turn it around, press Section to cut through the weld, or X-ray to see through the metal. Press a method, UT, RT, MT, PT or VT, to see in 3D how it may reveal this defect, or why it cannot. The dots rate each method, and you can compare two defects side by side.', 'Choisissez l’un des sept défauts d’une tôle soudée, par exemple une fissure, un manque de fusion ou une porosité. Tournez autour, appuyez sur Coupe pour traverser la soudure, ou sur Rayons X pour voir à travers le métal. Appuyez sur une méthode, UT, RT, MT, PT ou VT, pour voir en 3D comment elle peut révéler ce défaut, ou pourquoi elle ne le peut pas. Les points notent chaque méthode, et vous pouvez comparer deux défauts côte à côte.'], 'defects'),

    S('ft-list', 7, ['Starting a field inspection', 'Démarrer une inspection terrain'], ['Field inspections is the tool for real work on site. Press New inspection, choose the method, then Create. Your inspections are saved on this device and keep working without a network. You can export a job to back it up or move it to another device, and import it there.', 'Les inspections terrain sont l’outil du vrai travail sur site. Appuyez sur Nouvelle inspection, choisissez la méthode, puis Créer. Vos inspections sont enregistrées sur cet appareil et fonctionnent sans réseau. Vous pouvez exporter une mission pour la sauvegarder ou la transférer sur un autre appareil, puis l’y importer.'], 'tools'),
    S('ft-check', 7, ['Information and checklist', 'Informations et checklist'], ['First fill in the Information tab: reference, client, component and date. Then open Checklist. It is built for your method: for each point press OK, Not OK or N/A, and add a comment if needed. The counter at the top shows how many points are done, so nothing is forgotten.', 'Remplissez d’abord l’onglet Informations : référence, client, composant et date. Puis ouvrez Checklist. Elle est construite pour votre méthode : pour chaque point, appuyez sur OK, Non OK ou N/A, et ajoutez un commentaire si besoin. Le compteur en haut indique combien de points sont faits, pour ne rien oublier.'], 'tools'),
    S('ft-ind', 7, ['Indications and photos', 'Indications et photos'], ['In Indications, press Record an indication each time you find one. Enter its data, take a photo, and set its evaluation: pending, acceptable, rejectable or further examination. The Notes and photos tab is for your general observations and pictures.', 'Dans Indications, appuyez sur Enregistrer une indication à chaque découverte. Saisissez ses données, prenez une photo et indiquez son évaluation : en attente, acceptable, rejetable ou examen complémentaire. L’onglet Notes et photos sert à vos observations générales et à vos images.'], 'tools'),
    S('ft-report', 7, ['The report', 'Le rapport'], ['The Report tab summarises what is missing, then you enter the overall conclusion, a summary and your name and level. Press Open report to print it or save it as a PDF. The conclusion is the inspector’s decision: CYCLOPS records it, it does not decide for you.', 'L’onglet Rapport résume ce qui manque, puis vous saisissez la conclusion générale, une synthèse et votre nom et niveau. Appuyez sur Ouvrir le rapport pour l’imprimer ou l’enregistrer en PDF. La conclusion est la décision de l’inspecteur : CYCLOPS l’enregistre, il ne décide pas pour vous.'], 'tools'),

    S('route', 8, ['Where should you start?', 'Par où commencer ?'], ['A good route for a beginner: first the beginner lessons, then the Academy learning path, level by level. Practise on the simulators, do the daily challenge, and read your coach every week. When you are ready, move on to missions and digital twins. Already an inspector? Go directly to the procedures, the workspace, the AI assistant and field inspections. Everything in CYCLOPS is training support: on a real job, the approved procedure, the code edition in force and the qualified inspector always decide. Good training!', 'Un bon parcours pour un débutant : d’abord les leçons débutant, puis le parcours de l’Académie, niveau par niveau. Entraînez-vous sur les simulateurs, faites le défi du jour et lisez votre coach chaque semaine. Quand vous êtes prêt, passez aux missions et aux jumeaux numériques. Déjà inspecteur ? Allez directement aux procédures, à l’atelier de calcul, à l’assistant IA et aux inspections terrain. Tout dans CYCLOPS est un support de formation : sur un vrai travail, la procédure approuvée, l’édition du code en vigueur et l’inspecteur qualifié décident toujours. Bonne formation !'], 'basics')
  ];

  /* ======================= player ======================= */
  const css = `
.cygd { display: grid; grid-template-columns: minmax(0, 1fr) 270px; gap: 0; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: #0a1430; box-shadow: 0 22px 60px rgba(3, 7, 24, .55); }
.cygd-main { min-width: 0; display: flex; flex-direction: column; }
.cygd-stage { position: relative; background: #050a18; } .cygd-stage canvas { display: block; width: 100%; aspect-ratio: 16 / 9; cursor: pointer; }
.cygd-poster { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 10px; text-align: center; padding: 16px; background: radial-gradient(circle, rgba(8, 17, 38, .72), rgba(8, 17, 38, .93)); }
.cygd-poster h2 { margin: 0; font-size: clamp(1.15rem, 3.4vw, 2rem); color: #fff; } .cygd-poster p { margin: 0; color: #c7d4f5; max-width: 560px; font-size: clamp(.8rem, 1.8vw, 1rem); }
.cygd-big { background: linear-gradient(135deg, var(--blue), var(--violet)) !important; border: 0 !important; color: #fff !important; font-size: clamp(1rem, 2.4vw, 1.25rem); font-weight: 800; padding: 12px 24px; border-radius: 99px; box-shadow: 0 8px 30px rgba(61, 169, 255, .4); }
.cygd-sub { padding: 10px 14px; min-height: 118px; background: rgba(8, 17, 38, .95); border-top: 1px solid var(--line); }
.cygd-sub small { color: var(--blue); font-weight: 700; letter-spacing: .03em; } .cygd-sub h3 { margin: 1px 0 4px; color: #fff; font-size: 1.05rem; }
.cygd-sub p { margin: 0; line-height: 1.5; color: #93a3cc; font-size: 14.5px; } .cygd-sub p .on { color: #fff; font-weight: 600; }
.cygd-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px 10px; background: var(--panel); border-top: 1px solid var(--line); }
.cygd-bar input[type=range] { flex: 1 1 100%; accent-color: var(--blue); margin: 0 0 2px; } .cygd-bar .sp { flex: 1; } .cygd-bar .tm { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.cygd-try { background: linear-gradient(135deg, var(--blue), var(--violet)) !important; border: 0 !important; color: #fff !important; font-weight: 700; }
.cygd-toc { background: rgba(8, 17, 38, .95); border-left: 1px solid var(--line); overflow: auto; font-size: 13px; padding: 8px; max-height: 720px; }
.cygd-toc h4 { margin: 10px 2px 3px; color: var(--muted); font-size: 11px; letter-spacing: .05em; text-transform: uppercase; } .cygd-toc h4:first-child { margin-top: 2px; }
.cygd-toc button { display: block; width: 100%; text-align: left; padding: 4px 8px; border-color: transparent; background: transparent; font-size: 12.5px; border-radius: 6px; } .cygd-toc button:hover { background: rgba(61, 169, 255, .15); border-color: transparent; color: inherit; } .cygd-toc button.on { background: var(--accent); color: #fff; }
.cygd:fullscreen { border-radius: 0; border: 0; height: 100vh; grid-template-columns: minmax(0, 1fr); } .cygd:fullscreen .cygd-toc { display: none; } .cygd:fullscreen .cygd-main { height: 100vh; } .cygd:fullscreen .cygd-stage { flex: 1; min-height: 0; display: grid; align-items: center; } .cygd:fullscreen canvas { max-height: 100%; width: auto; max-width: 100%; margin: auto; }
@media (max-width: 900px) { .cygd { grid-template-columns: minmax(0, 1fr); } .cygd-toc { border-left: 0; border-top: 1px solid var(--line); max-height: 240px; } }
`;
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
  const sentences = (s) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean); // "B31.3" stays whole
  const words = (s) => s.trim().split(/\s+/).length;
  const estimate = (sc) => words(T2(sc.s)) / 2.45 + 2.2; // seconds at normal speed

  let root = null, cv = null, ctx = null, W = 0, H = 0, api = null;
  const st = { i: 0, t: 0, playing: false, started: false, voice: true, rate: 1, sent: 0, parts: [], spoke: false, done: 0, shown: true, last: 0, cur: [0.5, 0.5], from: [0.5, 0.5] };
  let manifest = null, raf = 0, token = 0;
  const imgs = new Map();
  const img = (i) => { const sc = SCENES[i]; if (!sc) return null; const src = `/guide/${L('en', 'fr')}/${sc.id}.jpg`; if (!imgs.has(src)) { const m = new Image(); m.src = src; imgs.set(src, m); } return imgs.get(src); };
  const rectOf = (i) => { const sc = SCENES[i], m = manifest && manifest[L('en', 'fr')]; return (sc && m && m[sc.id]) || null; };
  const ready = (m) => m && m.complete && m.naturalWidth > 0;
  let prevImg = null, fadeAt = 0;

  function mount(el, a) {
    api = a; root = el;
    if (!document.getElementById('cygd-css')) { const s = document.createElement('style'); s.id = 'cygd-css'; s.textContent = css; document.head.appendChild(s); }
    if (!manifest) fetch('/guide/manifest.json').then((r) => (r.ok ? r.json() : null)).then((m) => { manifest = m; }).catch(() => {});
    el.addEventListener('click', onClick); el.addEventListener('input', onSeek);
    // mounted again after a language change: restart the current step in the new language
    const was = st.playing; stopVoice(); st.playing = false; st.sent = 0; st.t = 0; prevImg = null;
    render();
    if (was) setPlaying(true);
  }
  const total = () => SCENES.reduce((n, x) => n + estimate(x), 0);
  const elapsed = () => SCENES.slice(0, st.i).reduce((n, x) => n + estimate(x), 0) + Math.min(st.t, estimate(SCENES[st.i]));
  const mmss = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function render() {
    if (!root) return;
    let last = -1;
    root.innerHTML = `<div class="cygd"><div class="cygd-main"><div class="cygd-stage"><canvas role="img" aria-label="${L('Video guide of CYCLOPS, using screenshots of the app', 'Guide vidéo de CYCLOPS, avec des captures de l’application')}"></canvas>
${st.started ? '' : `<div class="cygd-poster"><h2>${L('The complete guide to CYCLOPS', 'Le guide complet de CYCLOPS')}</h2><p>${L('Everything in the app: what it is, what it is for and how to use it, shown on the real screens with a voice explaining each step.', 'Tout ce que contient l’application : ce que c’est, à quoi ça sert et comment l’utiliser, montré sur les vrais écrans avec une voix qui explique chaque étape.')}</p><button type="button" class="cygd-big" data-gd="start">▶ ${L('Watch the guide', 'Regarder le guide')} · ${Math.round(total() / 60)} min</button><p style="font-size:12px">${SCENES.length} ${L('steps in', 'étapes en')} ${CHAPTERS.length} ${L('chapters — jump to any part with the list', 'chapitres — allez à n’importe quelle partie avec la liste')}</p></div>`}</div>
<div class="cygd-sub" aria-live="off"></div>
<div class="cygd-bar"><input type="range" data-gd-seek min="0" max="${SCENES.length - 1}" value="${st.i}" aria-label="${L('Position in the guide', 'Position dans le guide')}">
<button type="button" data-gd="prev" aria-label="${L('Previous step', 'Étape précédente')}">⏮</button><button type="button" data-gd="play" aria-label="${L('Play or pause', 'Lecture ou pause')}">${st.playing ? '⏸' : '▶'}</button><button type="button" data-gd="next" aria-label="${L('Next step', 'Étape suivante')}">⏭</button>
<button type="button" data-gd="voice"></button><button type="button" data-gd="rate" title="${L('Speed', 'Vitesse')}">${st.rate}×</button><span class="tm"></span><span class="sp"></span><button type="button" class="cygd-try" data-gd="try" hidden></button><button type="button" data-gd="full" aria-label="${L('Full screen', 'Plein écran')}">⛶</button></div></div>
<aside class="cygd-toc" aria-label="${L('Chapters', 'Chapitres')}">${SCENES.map((s, i) => { const h = s.c !== last ? `<h4>${s.c + 1}. ${esc(T2(CHAPTERS[s.c]))}</h4>` : ''; last = s.c; return `${h}<button type="button" data-gd-go="${i}">${esc(T2(s.t))}</button>`; }).join('')}</aside></div>`;
    cv = root.querySelector('canvas'); ctx = cv.getContext('2d');
    new ResizeObserver(resize).observe(cv); resize();
    sceneUi();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function resize() { if (!cv) return; const r = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return; cv.width = Math.round(W * r); cv.height = Math.round(H * r); ctx.setTransform(r, 0, 0, r, 0, 0); }
  function sceneUi() {
    const sc = SCENES[st.i]; if (!root || !sc) return;
    st.parts = sentences(T2(sc.s));
    const sub = root.querySelector('.cygd-sub');
    sub.innerHTML = `<small>${L('Chapter', 'Chapitre')} ${sc.c + 1} · ${esc(T2(CHAPTERS[sc.c]))} · ${st.i + 1}/${SCENES.length}</small><h3>${esc(T2(sc.t))}</h3><p>${st.parts.map((p, k) => `<span data-p="${k}">${esc(p)}</span>`).join(' ')}</p>`;
    root.querySelectorAll('[data-gd-go]').forEach((b) => { const on = Number(b.dataset.gdGo) === st.i; b.classList.toggle('on', on); if (on && st.started) { const toc = b.closest('.cygd-toc'); if (toc.scrollHeight > toc.clientHeight) toc.scrollTop = b.offsetTop - toc.offsetTop - 60; } });
    const seek = root.querySelector('[data-gd-seek]'); if (seek) seek.value = st.i;
    const tr = root.querySelector('[data-gd="try"]'); if (tr) { tr.hidden = !sc.go; tr.textContent = '➜ ' + L('Try it now', 'Essayer maintenant'); }
    const vb = root.querySelector('[data-gd="voice"]'); if (vb) vb.textContent = st.voice ? '🔊 ' + L('Voice on', 'Voix activée') : '🔇 ' + L('Voice off', 'Voix coupée');
    highlight(); img(st.i); img(st.i + 1);
  }
  function highlight() { if (!root) return; root.querySelectorAll('[data-p]').forEach((s) => s.classList.toggle('on', Number(s.dataset.p) === st.sent)); }

  /* ---------- narration ---------- */
  const synth = () => (typeof speechSynthesis !== 'undefined' ? speechSynthesis : null);
  function pickVoice() {
    const s = synth(); if (!s) return null; const code = L('en', 'fr'), list = s.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith(code));
    return list.find((v) => /natural|online|neural/i.test(v.name)) || list.find((v) => /google/i.test(v.name)) || list[0] || null;
  }
  function stopVoice() { token++; const s = synth(); if (s) s.cancel(); }
  function speakFrom(k) {
    const s = synth(); stopVoice(); const my = token; st.sent = k; highlight();
    if (!s || !st.voice || !st.playing) return;
    if (k >= st.parts.length) { st.done = performance.now(); return; }
    const u = new SpeechSynthesisUtterance(st.parts[k]); u.lang = L('en-US', 'fr-FR'); u.rate = st.rate; const v = pickVoice(); if (v) u.voice = v;
    u.onstart = () => { if (my === token) st.spoke = true; };
    u.onend = () => { if (my === token) speakFrom(k + 1); };
    u.onerror = () => { if (my === token) st.spoke = false; };
    s.speak(u);
  }
  function go(i, keepPlaying) {
    const prev = img(st.i); if (ready(prev)) { prevImg = prev; fadeAt = performance.now(); }
    const r0 = rectOf(st.i); st.from = r0 ? [r0[0] + r0[2] / 2, r0[1] + r0[3] / 2] : [0.5, 0.5];
    st.i = Math.max(0, Math.min(SCENES.length - 1, i)); st.t = 0; st.sent = 0; st.spoke = false; st.done = 0;
    sceneUi();
    if (st.playing && keepPlaying !== false) speakFrom(0);
  }
  function setPlaying(p) {
    st.playing = p; const b = root && root.querySelector('[data-gd="play"]'); if (b) b.textContent = p ? '⏸' : '▶';
    if (p) speakFrom(st.sent); else stopVoice();
  }

  /* ---------- frame ---------- */
  function frame(ts) {
    if (!cv || !cv.isConnected) return;
    const dt = Math.min(0.1, ((ts - st.last) / 1000) || 0); st.last = ts;
    if (st.shown && document.visibilityState === 'visible') {
      if (st.playing) {
        st.t += dt;
        const est = estimate(SCENES[st.i]) / st.rate, voiceActive = st.voice && synth() && pickVoice();
        if (voiceActive) {
          // the voice drives the scene; if it never starts or stalls, fall back to the timer
          const stalled = (!st.spoke && st.t > 2.5) || st.t > est * 2.2 + 4;
          if (stalled && !st.done) { const k = Math.min(st.parts.length - 1, Math.floor(st.t / est * st.parts.length)); if (k !== st.sent) { st.sent = k; highlight(); } if (st.t >= est) next(); }
          else if (st.done && performance.now() - st.done > 900) next();
        } else {
          const p = st.t / est, tl = T2(SCENES[st.i].s).length; let a = 0, k = 0; for (; k < st.parts.length; k++) { a += st.parts[k].length; if (a / tl >= p) break; }
          k = Math.min(st.parts.length - 1, k); if (k !== st.sent) { st.sent = k; highlight(); }
          if (st.t >= est) next();
        }
      }
      draw();
      const tm = root.querySelector('.tm'); if (tm) tm.textContent = mmss(elapsed()) + ' / ' + mmss(total());
    }
    raf = requestAnimationFrame(frame);
  }
  function next() {
    if (st.i >= SCENES.length - 1) { setPlaying(false); st.t = 0; return; }
    go(st.i + 1);
  }
  function drawCursor(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 17); ctx.lineTo(4.4, 13); ctx.lineTo(7.4, 19.6); ctx.lineTo(10.4, 18.3); ctx.lineTo(7.5, 12); ctx.lineTo(13, 12); ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6; ctx.fill(); ctx.stroke(); ctx.restore();
  }
  function draw() {
    if (!W || !H) return;
    ctx.fillStyle = '#050a18'; ctx.fillRect(0, 0, W, H);
    const m = img(st.i), rect = rectOf(st.i), t = reduced ? 9 : st.t;
    // camera: starts on the whole screen, then glides to the highlighted control
    let f = 1, cx = 0.5, cy = 0.5;
    if (rect) {
      const tf = Math.max(0.5, Math.min(1, Math.max(rect[2], rect[3]) / 0.74)), k = ease((t - 0.5) / 1.5);
      f = 1 + (tf - 1) * k; const tx = Math.max(tf / 2, Math.min(1 - tf / 2, rect[0] + rect[2] / 2)), ty = Math.max(tf / 2, Math.min(1 - tf / 2, rect[1] + rect[3] / 2));
      cx = 0.5 + (tx - 0.5) * k; cy = 0.5 + (ty - 0.5) * k;
    }
    const X = (x) => (x - (cx - f / 2)) / f * W, Y = (y) => (y - (cy - f / 2)) / f * H;
    if (ready(m)) ctx.drawImage(m, (cx - f / 2) * m.naturalWidth, (cy - f / 2) * m.naturalHeight, f * m.naturalWidth, f * m.naturalHeight, 0, 0, W, H);
    else { ctx.fillStyle = '#8fa3c0'; ctx.font = '14px system-ui'; ctx.textAlign = 'center'; ctx.fillText(L('Loading…', 'Chargement…'), W / 2, H / 2); }
    if (rect && ready(m)) {
      const a = ease((t - 1.6) / 0.5), x = X(rect[0]) - 5, y = Y(rect[1]) - 5, w = rect[2] / f * W + 10, h = rect[3] / f * H + 10;
      if (a > 0) {
        if (rect[2] < 0.93 || rect[3] < 0.93) { ctx.fillStyle = `rgba(3,7,20,${0.5 * a})`; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.roundRect(x, y, w, h, 8); ctx.fill('evenodd'); }
        ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffe14d'; ctx.shadowBlur = 10 + 5 * Math.sin(t * 3); ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.stroke(); ctx.restore();
      }
      // cursor glides from the previous control, then "clicks"
      if (!reduced) {
        const u = ease((t - 0.3) / 1.4), tx = rect[0] + rect[2] / 2, ty = rect[1] + rect[3] / 2, px = st.from[0] + (tx - st.from[0]) * u, py = st.from[1] + (ty - st.from[1]) * u, s = Math.max(0.9, W / 800);
        const c = t - 1.75; if (c > 0 && c < 0.6) { ctx.strokeStyle = `rgba(255,225,77,${1 - c / 0.6})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(px), Y(py), 6 + c * 50, 0, 7); ctx.stroke(); }
        drawCursor(X(px), Y(py), s);
      }
    }
    // crossfade from the previous screen
    if (prevImg && !reduced) { const fa = 1 - (performance.now() - fadeAt) / 350; if (fa > 0) { ctx.globalAlpha = fa; ctx.drawImage(prevImg, 0, 0, W, H); ctx.globalAlpha = 1; } else prevImg = null; }
    if (!st.playing && st.started) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 32, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(W / 2 - 10, H / 2 - 15); ctx.lineTo(W / 2 + 17, H / 2); ctx.lineTo(W / 2 - 10, H / 2 + 15); ctx.fill(); }
  }

  /* ---------- events ---------- */
  function begin() { st.started = true; const p = root.querySelector('.cygd-poster'); if (p) p.remove(); setPlaying(true); }
  function onClick(e) {
    if (e.target.matches('canvas')) { if (!st.started) return begin(); return setPlaying(!st.playing); }
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.gdGo != null) { if (!st.started) begin(); return go(Number(d.gdGo)); }
    if (d.gd === 'start') return begin();
    if (d.gd === 'play') { if (!st.started) return begin(); return setPlaying(!st.playing); }
    if (d.gd === 'prev') return go(st.i - 1);
    if (d.gd === 'next') return go(st.i + 1);
    if (d.gd === 'voice') { st.voice = !st.voice; sceneUi(); st.t = 0; if (st.voice) speakFrom(st.sent); else stopVoice(); return; }
    if (d.gd === 'rate') { st.rate = st.rate >= 1.5 ? 0.75 : st.rate + 0.25; b.textContent = st.rate + '×'; if (st.playing && st.voice) speakFrom(st.sent); return; }
    if (d.gd === 'full') { const v = root.querySelector('.cygd'); if (!document.fullscreenElement && v.requestFullscreen) v.requestFullscreen().catch(() => {}); else if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); return; }
    if (d.gd === 'try') { setPlaying(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); const k = SCENES[st.i].go; if (k && api && api.action) api.action(k); }
  }
  function onSeek(e) { if (e.target.matches('[data-gd-seek]')) { if (!st.started) begin(); go(Number(e.target.value)); } }
  document.addEventListener('keydown', (e) => {
    if (!root || !st.shown || !st.started || (e.target.matches && e.target.matches('input,select,textarea')) || document.querySelector('dialog[open]')) return;
    if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); setPlaying(!st.playing); }
    if (e.key === 'ArrowRight') go(st.i + 1);
    if (e.key === 'ArrowLeft') go(st.i - 1);
  });
  // voices load late in some browsers; a dialog over the page or leaving the page pauses the guide
  if (synth()) { synth().getVoices(); }
  window.CYGUIDE = {
    SCENES, CHAPTERS, mount,
    visible(on) { st.shown = on; if (!on) { if (st.playing) setPlaying(false); } },
    pause() { if (st.playing) setPlaying(false); }
  };
}());
