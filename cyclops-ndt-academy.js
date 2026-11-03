/* CYCLOPS CND Academy: topic-by-topic NDT modules for complete beginners (UT, RT, MT, PT, VT).
   Each module = animated technical diagram + step-by-step explanation + key points + check question
   + links to the dictionary, the simulators / 3D scenes and the beginner AI tutor.
   Mounted inside the Academy (cyclops-academy.js) with window.CYNDT.mount(container, api).
   Diagrams are simplified teaching drawings, not measurements; values to apply on a job come from
   the approved procedure and the code edition required by the contract. */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TAU = Math.PI * 2, rad = (d) => d * Math.PI / 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const M = (id, t, d, p, k, q, extra) => Object.assign({ id, t, d, p, k, q }, extra || {});
  const Q = (q, o, a, why) => ({ q, o, a, why });

  /* ============================ content ============================ */
  const MODS = {
    UT: [
      M('what', ['What is ultrasonic testing?', 'Qu’est-ce que le contrôle par ultrasons ?'], 'ut-what', [
        ['Ultrasound is sound with a frequency too high for human ears (above 20 kHz). For testing metals we use roughly 1 to 10 MHz, which means millions of vibrations per second.', 'Les ultrasons sont des sons de fréquence trop élevée pour l’oreille humaine (plus de 20 kHz). Pour contrôler les métaux, on utilise environ 1 à 10 MHz, soit des millions de vibrations par seconde.'],
        ['A probe sends a short pulse of sound into the metal. When the pulse meets the far wall or a defect, part of it bounces back to the probe. The instrument measures the time taken and shows each returning echo as a peak on its screen.', 'Un traducteur envoie une courte impulsion sonore dans le métal. Quand elle rencontre la paroi opposée ou un défaut, une partie revient vers le traducteur. L’appareil mesure le temps écoulé et affiche chaque écho comme un pic à l’écran.'],
        ['Because the speed of sound in steel is known, time becomes distance. This is how UT finds defects inside the thickness and measures wall thickness, from one side only.', 'Comme la vitesse du son dans l’acier est connue, le temps devient une distance. C’est ainsi que l’UT trouve les défauts dans l’épaisseur et mesure l’épaisseur des parois, depuis un seul côté.']],
        [['Sound pulse in, echoes back (pulse-echo).', 'Impulsion envoyée, échos reçus (écho-impulsion).'], ['Time × speed of sound = distance.', 'Temps × vitesse du son = distance.'], ['Works from one side and sees inside the metal.', 'Fonctionne d’un seul côté et voit dans le métal.']],
        Q(['Why does UT need the speed of sound in the material?', 'Pourquoi l’UT a-t-il besoin de la vitesse du son dans le matériau ?'], [['To turn the echo time into a distance', 'Pour convertir le temps de l’écho en distance'], ['To choose the paint colour', 'Pour choisir la couleur de peinture'], ['It does not need it', 'Il n’en a pas besoin']], 0, ['The instrument measures time; with the velocity it converts time into sound path, depth and thickness.', 'L’appareil mesure un temps ; avec la vitesse il le convertit en parcours, profondeur et épaisseur.']),
        { words: ['ut', 'probe', 'ascan'], tryIt: 'anim' }),
      M('how', ['How ultrasound travels', 'Comment se propagent les ultrasons'], 'ut-wave', [
        ['Sound is a vibration passed from atom to atom. In a longitudinal (compression) wave the atoms move back and forth in the direction of travel; in a shear (transverse) wave they move across it. Shear waves exist only in solids.', 'Le son est une vibration transmise d’atome en atome. Dans une onde longitudinale (de compression), les atomes vont et viennent dans le sens de propagation ; dans une onde transversale, ils bougent en travers. Les ondes transversales n’existent que dans les solides.'],
        ['Each material has its own velocity. In steel, longitudinal waves travel at about 5 920 m/s and shear waves at about 3 240 m/s; in water about 1 480 m/s; in air only about 340 m/s.', 'Chaque matériau a sa vitesse. Dans l’acier, les ondes longitudinales vont à environ 5 920 m/s et les transversales à environ 3 240 m/s ; dans l’eau environ 1 480 m/s ; dans l’air seulement environ 340 m/s.'],
        ['When sound reaches a boundary between two very different materials (steel/air at a crack or at the back wall) almost all of it is reflected. That reflection is the echo we use. The pulse-echo distance is d = v × t ÷ 2, because the sound goes there and back.', 'Quand le son atteint la limite entre deux matériaux très différents (acier/air dans une fissure ou au fond) presque tout est réfléchi. Cette réflexion est l’écho utilisé. En écho-impulsion, la distance vaut d = v × t ÷ 2, car le son fait l’aller-retour.']],
        [['Longitudinal waves: 0° probes. Shear waves: angle probes.', 'Ondes longitudinales : traducteurs 0°. Ondes transversales : traducteurs d’angle.'], ['Steel: ≈ 5 920 m/s (L), ≈ 3 240 m/s (T).', 'Acier : ≈ 5 920 m/s (L), ≈ 3 240 m/s (T).'], ['d = v × t ÷ 2 (there and back).', 'd = v × t ÷ 2 (aller-retour).']],
        Q(['An echo returns after 10 µs in steel with a 0° probe (5 920 m/s). How deep is the reflector?', 'Un écho revient après 10 µs dans l’acier avec un traducteur 0° (5 920 m/s). À quelle profondeur est le réflecteur ?'], [['About 29.6 mm', 'Environ 29,6 mm'], ['About 59.2 mm', 'Environ 59,2 mm'], ['About 5.9 mm', 'Environ 5,9 mm']], 0, ['5.92 mm/µs × 10 µs = 59.2 mm there and back, so 59.2 ÷ 2 = 29.6 mm deep.', '5,92 mm/µs × 10 µs = 59,2 mm aller-retour, donc 59,2 ÷ 2 = 29,6 mm de profondeur.']),
        { words: ['ut', 'soundpath'], tryIt: 'ut-explore' }),
      M('probes', ['Types of probes', 'Types de traducteurs'], 'ut-probes', [
        ['A probe (transducer) contains a piezoelectric element: an electric pulse makes it vibrate and send sound; returning sound makes it produce a small voltage.', 'Un traducteur contient un élément piézoélectrique : une impulsion électrique le fait vibrer et émettre du son ; le son qui revient lui fait produire une petite tension.'],
        ['Main types: the straight (0°) single-element probe, the dual (twin) probe with separate send and receive elements for thin parts and thickness gauging, the angle probe whose wedge sends the beam at 45°, 60° or 70°, and phased-array probes with many small elements whose beam is steered electronically. TOFD uses a pair of angled probes to time the tip signals of a defect.', 'Principaux types : le traducteur droit (0°) mono-élément, le traducteur double (TR) avec émetteur et récepteur séparés pour les faibles épaisseurs et la mesure d’épaisseur, le traducteur d’angle dont le sabot envoie le faisceau à 45°, 60° ou 70°, et le multi-éléments (phased array) dont le faisceau est orienté électroniquement. Le TOFD utilise une paire de traducteurs d’angle qui chronomètre les signaux des extrémités d’un défaut.'],
        ['Frequency and size matter: higher frequency gives better resolution (separates small, close reflectors) but less penetration; lower frequency penetrates thick or coarse-grained material better.', 'Fréquence et dimension comptent : une fréquence élevée donne une meilleure résolution (sépare de petits réflecteurs proches) mais moins de pénétration ; une fréquence basse pénètre mieux les fortes épaisseurs ou les matériaux à gros grains.']],
        [['0° straight: laminations, thickness, plates.', '0° droit : dédoublures, épaisseurs, tôles.'], ['Angle probe: welds.', 'Traducteur d’angle : soudures.'], ['Dual: thin walls and corrosion thickness.', 'Double (TR) : parois minces et épaisseurs de corrosion.'], ['Higher MHz = finer detail, less depth.', 'Plus de MHz = plus de détail, moins de profondeur.']],
        Q(['Which probe is normally used to inspect a butt weld?', 'Quel traducteur utilise-t-on normalement pour contrôler une soudure bout à bout ?'], [['An angle-beam probe', 'Un traducteur d’angle'], ['A straight 0° probe placed on the weld cap', 'Un traducteur droit 0° posé sur le cordon'], ['No probe: UT cannot test welds', 'Aucun : l’UT ne contrôle pas les soudures']], 0, ['The weld cap is not flat and the defects are often inclined, so an angle beam is sent from the plate beside the weld.', 'Le cordon n’est pas plan et les défauts sont souvent inclinés : on envoie un faisceau d’angle depuis la tôle à côté de la soudure.']),
        { words: ['probe'], tryIt: 'lab' }),
      M('beams', ['Straight and angle beams', 'Faisceaux droits et d’angle'], 'ut-angle', [
        ['A straight probe sends a longitudinal beam perpendicular to the surface: echoes come from the back wall and from flaws parallel to the surface, like laminations.', 'Un traducteur droit envoie un faisceau longitudinal perpendiculaire à la surface : les échos viennent du fond et des défauts parallèles à la surface, comme les dédoublures.'],
        ['An angle probe sits on a Perspex wedge. At the wedge/steel interface the sound is refracted (bent), following Snell’s law, and converted into a shear wave travelling at the nominal angle in steel, for example 60°.', 'Un traducteur d’angle est monté sur un sabot en Perspex. À l’interface sabot/acier, le son est réfracté (dévié) selon la loi de Snell et converti en onde transversale se propageant à l’angle nominal dans l’acier, par exemple 60°.'],
        ['The beam bounces between the back wall and the top surface: the first leg goes down, the second leg comes back up. The surface distance for one full V is the skip distance = 2 × thickness × tan(angle). The angle is chosen so the beam meets the weld bevel as close to 90° as possible.', 'Le faisceau rebondit entre le fond et la surface : le premier parcours descend, le second remonte. La distance en surface d’un V complet est le bond = 2 × épaisseur × tan(angle). On choisit l’angle pour que le faisceau rencontre le chanfrein le plus près possible de 90°.']],
        [['Snell’s law: the wedge bends the beam.', 'Loi de Snell : le sabot dévie le faisceau.'], ['Leg 1 down, leg 2 up.', 'Parcours 1 descend, parcours 2 remonte.'], ['Skip = 2 × T × tan θ.', 'Bond = 2 × T × tan θ.']],
        Q(['With a 60° probe on 20 mm plate, what is the full skip distance?', 'Avec un traducteur de 60° sur une tôle de 20 mm, quel est le bond complet ?'], [['About 69 mm', 'Environ 69 mm'], ['About 40 mm', 'Environ 40 mm'], ['About 23 mm', 'Environ 23 mm']], 0, ['2 × 20 × tan 60° = 2 × 20 × 1.732 ≈ 69 mm.', '2 × 20 × tan 60° = 2 × 20 × 1,732 ≈ 69 mm.']),
        { words: ['probe', 'soundpath'], tryIt: 'ut-explore' }),
      M('couplant', ['Couplant', 'Le couplant'], 'ut-couplant', [
        ['Air is the enemy of ultrasound: at a steel/air boundary practically all the sound is reflected. Even a thin air gap under the probe stops the beam from entering the part.', 'L’air est l’ennemi des ultrasons : à une limite acier/air, pratiquement tout le son est réfléchi. Même une fine lame d’air sous le traducteur empêche le faisceau d’entrer dans la pièce.'],
        ['A couplant (gel, oil, glycerine, paste or water) fills that gap so the sound can pass. Apply an even layer, keep the probe pressure steady, and use the same couplant for calibration and for the examination, because coupling changes the echo height.', 'Un couplant (gel, huile, glycérine, pâte ou eau) remplit cet espace pour laisser passer le son. Appliquez une couche régulière, gardez une pression constante sur le traducteur, et utilisez le même couplant pour l’étalonnage et le contrôle, car le couplage modifie la hauteur des échos.'],
        ['Clean the surface first (loose scale, spatter and paint blisters cause poor coupling) and remove the couplant afterwards if it could cause corrosion or contaminate the process.', 'Nettoyez d’abord la surface (calamine non adhérente, projections et cloques de peinture dégradent le couplage) et retirez le couplant après si il peut causer de la corrosion ou contaminer le procédé.']],
        [['No couplant = no signal (air gap).', 'Pas de couplant = pas de signal (lame d’air).'], ['Same couplant for calibration and test.', 'Même couplant pour étalonnage et contrôle.'], ['Clean surface, steady pressure.', 'Surface propre, pression constante.']],
        Q(['The echo suddenly disappears while scanning a clean plate. What do you check first?', 'L’écho disparaît soudain pendant le balayage d’une tôle propre. Que vérifiez-vous d’abord ?'], [['The coupling (enough couplant, probe flat on the surface)', 'Le couplage (assez de couplant, traducteur bien à plat)'], ['The paint colour', 'La couleur de la peinture'], ['Nothing: it is a crack', 'Rien : c’est une fissure']], 0, ['Loss of all signals (including the back wall) is first a coupling problem; a defect would add an echo, not remove everything.', 'La perte de tous les signaux (y compris le fond) est d’abord un problème de couplage ; un défaut ajouterait un écho, il n’effacerait pas tout.']),
        { words: ['couplant'] }),
      M('blocks', ['Calibration blocks', 'Blocs d’étalonnage'], 'ut-block', [
        ['Before testing, the instrument must be "taught" what the screen means. Calibration blocks are steel blocks with known shapes and dimensions, made of a material acoustically similar to the part.', 'Avant de contrôler, il faut « apprendre » à l’appareil ce que signifie l’écran. Les blocs d’étalonnage sont des blocs d’acier aux formes et dimensions connues, dans un matériau acoustiquement proche de la pièce.'],
        ['The IIW (V1) block has a 100 mm radius, a small drilled hole and a Perspex insert: it is used to set the time base (range) and zero, find the probe index point and check the real beam angle. The smaller V2 block does the same in the field.', 'Le bloc IIW (V1) a un rayon de 100 mm, un petit trou percé et un insert en Perspex : il sert à régler la base de temps et le zéro, trouver le point d’émergence et vérifier l’angle réel. Le bloc V2, plus petit, fait de même sur chantier.'],
        ['For sensitivity, a basic calibration block of the same material and similar thickness, with side-drilled holes, is used to draw the DAC curve: the reference level against which indications are compared.', 'Pour la sensibilité, un bloc de base de même matériau et d’épaisseur proche, avec trous génératrices, sert à tracer la courbe DAC : le niveau de référence auquel on compare les indications.']],
        [['V1 / V2: range, zero, index point, angle.', 'V1 / V2 : base de temps, zéro, point d’émergence, angle.'], ['Basic block with side-drilled holes: DAC.', 'Bloc de base à trous génératrices : DAC.'], ['Check the calibration during and after the work.', 'Vérifier l’étalonnage pendant et après le travail.']],
        Q(['What is the 100 mm radius of the V1 block mainly used for?', 'À quoi sert principalement le rayon de 100 mm du bloc V1 ?'], [['Setting the time base (range) and finding the probe index', 'Régler la base de temps et trouver le point d’émergence'], ['Drawing the DAC curve', 'Tracer la courbe DAC'], ['Measuring the couplant', 'Mesurer le couplant']], 0, ['The curved surface gives an echo at a known 100 mm sound path wherever the beam exits, so it fixes the range and the index point. The DAC uses side-drilled holes.', 'La surface courbe donne un écho à un parcours connu de 100 mm, ce qui fixe la base de temps et le point d’émergence. La DAC utilise des trous génératrices.']),
        { words: ['iiw', 'dac'], tryIt: 'ut-dac' }),
      M('ascan', ['Reading the A-scan', 'Lire l’A-scan'], 'ut-ascan', [
        ['The A-scan is a graph: horizontally, time converted to sound path (mm); vertically, echo amplitude in % of full screen height (FSH).', 'L’A-scan est un graphique : horizontalement, le temps converti en parcours (mm) ; verticalement, l’amplitude de l’écho en % de la hauteur d’écran.'],
        ['With a 0° probe you typically see the initial pulse at the left, a back-wall echo at the thickness, and possibly a defect echo in between. With an angle probe there is no back-wall echo: an echo inside the weld zone is investigated.', 'Avec un traducteur 0° on voit généralement l’impulsion d’émission à gauche, l’écho de fond à l’épaisseur, et éventuellement un écho de défaut entre les deux. Avec un traducteur d’angle il n’y a pas d’écho de fond : un écho dans la zone de soudure est examiné.'],
        ['The small random signals along the base line are noise ("grass"). A gate (horizontal bar) selects the zone to measure: the instrument reads the highest echo inside it, its position and its amplitude, compared with the DAC in dB.', 'Les petits signaux aléatoires le long de la ligne de base sont du bruit (« herbe »). Une porte (barre horizontale) sélectionne la zone à mesurer : l’appareil lit l’écho le plus haut à l’intérieur, sa position et son amplitude, comparée à la DAC en dB.']],
        [['Horizontal = where (sound path).', 'Horizontal = où (parcours).'], ['Vertical = how strong (% FSH, dB).', 'Vertical = quelle force (% écran, dB).'], ['Gate = the zone the instrument measures.', 'Porte = la zone mesurée par l’appareil.']],
        Q(['On a 0° A-scan of a 25 mm plate, an extra echo appears at 12 mm. What does it suggest?', 'Sur un A-scan 0° d’une tôle de 25 mm, un écho supplémentaire apparaît à 12 mm. Qu’est-ce que cela suggère ?'], [['A reflector about mid-thickness, such as a lamination', 'Un réflecteur vers la mi-épaisseur, comme une dédoublure'], ['The plate is 12 mm thick', 'La tôle fait 12 mm'], ['Nothing, echoes are random', 'Rien, les échos sont aléatoires']], 0, ['The back wall stays at 25 mm; a separate echo at 12 mm comes from a reflector at that depth and must be investigated.', 'Le fond reste à 25 mm ; un écho séparé à 12 mm vient d’un réflecteur à cette profondeur et doit être examiné.']),
        { words: ['ascan', 'db', 'dac'], tryIt: 'ut-lib' }),
      M('calc', ['Sound path calculations', 'Calculs de parcours'], 'ut-soundpath', [
        ['With an angle probe the instrument gives the sound path S (distance along the beam). To know where the reflector is, use the triangle formed by the beam: depth = S × cos θ and surface distance = S × sin θ, measured from the probe index point.', 'Avec un traducteur d’angle, l’appareil donne le parcours S (distance le long du faisceau). Pour situer le réflecteur, on utilise le triangle du faisceau : profondeur = S × cos θ et distance en surface = S × sin θ, mesurée depuis le point d’émergence.'],
        ['If S × cos θ is greater than the thickness T, the beam has bounced off the back wall: on the second leg, depth = 2T − S × cos θ. Always state which leg you are on.', 'Si S × cos θ dépasse l’épaisseur T, le faisceau a rebondi sur le fond : au second parcours, profondeur = 2T − S × cos θ. Indiquez toujours le parcours concerné.'],
        ['Move the sliders: change the angle, the thickness and the sound path, and watch why the reflector moves. This is exactly what the flaw detector computes for you.', 'Bougez les curseurs : changez l’angle, l’épaisseur et le parcours, et voyez pourquoi le réflecteur se déplace. C’est exactement ce que le détecteur calcule pour vous.']],
        [['Depth = S cos θ (leg 1).', 'Profondeur = S cos θ (parcours 1).'], ['Depth = 2T − S cos θ (leg 2).', 'Profondeur = 2T − S cos θ (parcours 2).'], ['Surface distance = S sin θ.', 'Distance en surface = S sin θ.']],
        Q(['60° probe, S = 40 mm, plate T = 25 mm. What is the depth?', 'Traducteur 60°, S = 40 mm, tôle T = 25 mm. Quelle est la profondeur ?'], [['20 mm (first leg)', '20 mm (premier parcours)'], ['34.6 mm', '34,6 mm'], ['5 mm (second leg)', '5 mm (second parcours)']], 0, ['40 × cos 60° = 20 mm, which is less than 25 mm, so it is still the first leg: depth 20 mm. The surface distance is 40 × sin 60° ≈ 34.6 mm.', '40 × cos 60° = 20 mm, inférieur à 25 mm, donc premier parcours : profondeur 20 mm. La distance en surface vaut 40 × sin 60° ≈ 34,6 mm.']),
        { words: ['soundpath'], interactive: true, tryIt: 'ut-explore' }),
      M('defects', ['Recognising defects', 'Reconnaître les défauts'], 'ut-defects', [
        ['An echo alone does not say what the defect is. The inspector combines position (depth, distance from the weld axis), amplitude (dB to DAC), echo shape and echo dynamics (how the echo changes when the probe moves or swivels).', 'Un écho seul ne dit pas ce qu’est le défaut. L’inspecteur combine la position (profondeur, distance à l’axe), l’amplitude (dB/DAC), la forme de l’écho et sa dynamique (comment il change quand on déplace ou pivote le traducteur).'],
        ['Planar defects (cracks, lack of fusion, lack of penetration) give sharp echoes that change strongly with angle; cracks are jagged and multi-peaked. Volumetric defects (porosity, slag) give rounder or broader echoes that change little with angle.', 'Les défauts plans (fissures, manques de fusion, manques de pénétration) donnent des échos nets qui varient fortement avec l’angle ; les fissures sont dentelées et à plusieurs pics. Les défauts volumiques (soufflures, laitier) donnent des échos plus arrondis ou larges, peu sensibles à l’angle.'],
        ['Geometry also reflects: root bead, cap edges, mismatch. Plotting the reflector on a cross-section of the weld is the best way to separate a real defect from a geometric echo. Open the UT simulator to see each indication with a rejected and a not rejected case.', 'La géométrie réfléchit aussi : pénétration, bords de finition, désalignement. Positionner le réflecteur sur une coupe de la soudure est le meilleur moyen de séparer un vrai défaut d’un écho géométrique. Ouvrez le simulateur UT pour voir chaque indication avec un cas refusé et un cas non refusé.']],
        [['Position + amplitude + shape + dynamics.', 'Position + amplitude + forme + dynamique.'], ['Planar: sharp, angle-sensitive. Volumetric: round, less sensitive.', 'Plan : net, sensible à l’angle. Volumique : arrondi, moins sensible.'], ['Plot it before deciding.', 'Positionner avant de décider.']],
        Q(['An echo is jagged, multi-peaked and changes a lot when you swivel the probe. What is the most likely type?', 'Un écho est dentelé, à plusieurs pics et change beaucoup quand on pivote le traducteur. Quel type est le plus probable ?'], [['A crack', 'Une fissure'], ['A single pore', 'Un pore isolé'], ['Root geometry', 'La géométrie de racine']], 0, ['Multiple facets give several peaks that move independently: typical of a crack. A pore gives one smooth echo that hardly changes with angle.', 'Les facettes multiples donnent plusieurs pics qui bougent indépendamment : typique d’une fissure. Un pore donne un écho lisse qui varie peu avec l’angle.']),
        { words: ['crack', 'porosity', 'lof'], tryIt: 'ut-lib' })
    ],
    RT: [
      M('rad', ['Radiation principles', 'Principes du rayonnement'], 'rt-principle', [
        ['X-rays and gamma rays are electromagnetic radiation like light, but with a much shorter wavelength and much more energy: they can pass through steel.', 'Les rayons X et gamma sont des rayonnements électromagnétiques comme la lumière, mais de longueur d’onde bien plus courte et d’énergie bien plus grande : ils traversent l’acier.'],
        ['The more material (thickness or density) the rays cross, the more they are absorbed. Where there is less metal (a pore, a crack, a thinner area) more radiation reaches the film, which becomes darker there. That contrast is the image.', 'Plus il y a de matière (épaisseur ou densité) à traverser, plus les rayons sont absorbés. Là où il y a moins de métal (pore, fissure, zone plus mince) plus de rayonnement atteint le film, qui devient plus sombre à cet endroit. Ce contraste forme l’image.'],
        ['Radiation is ionising and invisible: it can damage the body without any feeling. Protection uses three rules: time (stay exposed as briefly as possible), distance (intensity falls with the square of the distance: twice as far = four times less) and shielding (lead, steel, concrete), plus dosimeters and survey meters.', 'Le rayonnement est ionisant et invisible : il peut endommager le corps sans rien ressentir. La protection repose sur trois règles : le temps (le plus court possible), la distance (l’intensité baisse avec le carré de la distance : deux fois plus loin = quatre fois moins) et l’écran (plomb, acier, béton), plus dosimètres et radiamètres.']],
        [['Less metal = more radiation = darker film.', 'Moins de métal = plus de rayonnement = film plus sombre.'], ['Inverse square law: 2× distance → ¼ intensity.', 'Loi de l’inverse du carré : distance ×2 → intensité ÷4.'], ['Time, distance, shielding.', 'Temps, distance, écran.']],
        Q(['You move from 5 m to 10 m from a source. The dose rate becomes…', 'Vous passez de 5 m à 10 m d’une source. Le débit de dose devient…'], [['About one quarter', 'Environ le quart'], ['Half', 'La moitié'], ['Unchanged', 'Inchangé']], 0, ['Double the distance → (1/2)² = 1/4 of the intensity (inverse square law).', 'Distance doublée → (1/2)² = 1/4 de l’intensité (loi de l’inverse du carré).']),
        { words: ['rt', 'dose'], tryIt: 'anim' }),
      M('xgamma', ['X-ray and gamma-ray basics', 'Bases des rayons X et gamma'], 'rt-xgamma', [
        ['An X-ray tube accelerates electrons with a high voltage (kV) onto a metal target; the impact produces X-rays. Raising the kV gives more penetrating radiation; the current (mA) and the exposure time control the amount. Switched off, the tube emits nothing.', 'Un tube à rayons X accélère des électrons sous haute tension (kV) vers une cible métallique ; l’impact produit des rayons X. Augmenter les kV donne un rayonnement plus pénétrant ; l’intensité (mA) et le temps de pose règlent la quantité. Éteint, le tube n’émet rien.'],
        ['A gamma source is a small radioactive pellet (often Iridium-192, Selenium-75 for thinner steel, Cobalt-60 for very thick steel). It emits all the time, so it is stored in a shielded exposure container and wound out through a guide tube only during exposure.', 'Une source gamma est une petite pastille radioactive (souvent Iridium-192, Sélénium-75 pour les faibles épaisseurs, Cobalt-60 pour les très fortes). Elle émet en permanence : elle est rangée dans un projecteur blindé et sortie par une gaine d’éjection seulement pendant l’exposition.'],
        ['A source weakens over time: its half-life is about 74 days for Ir-192, about 120 days for Se-75 and about 5.3 years for Co-60, so exposure times must be recalculated from the current activity.', 'Une source s’affaiblit avec le temps : sa période est d’environ 74 jours pour l’Ir-192, environ 120 jours pour le Se-75 et environ 5,3 ans pour le Co-60 ; les temps de pose se recalculent avec l’activité du jour.']],
        [['X-ray: kV = penetration, mA × time = quantity; can be switched off.', 'Rayons X : kV = pénétration, mA × temps = quantité ; peut être éteint.'], ['Gamma: always emitting, kept in a shielded container.', 'Gamma : émet toujours, rangée dans un projecteur blindé.'], ['Ir-192 half-life ≈ 74 days.', 'Période de l’Ir-192 ≈ 74 jours.']],
        Q(['Why is a gamma source stored in a shielded container?', 'Pourquoi une source gamma est-elle rangée dans un projecteur blindé ?'], [['Because it emits radiation all the time', 'Parce qu’elle émet en permanence'], ['To keep it warm', 'Pour la garder au chaud'], ['Because it needs electricity', 'Parce qu’elle a besoin d’électricité']], 0, ['Unlike an X-ray tube, a radioactive source cannot be switched off.', 'Contrairement à un tube X, une source radioactive ne peut pas être éteinte.']),
        { words: ['rt', 'dose'], tryIt: 'lab' }),
      M('film', ['Film and digital radiography', 'Radiographie film et numérique'], 'rt-film', [
        ['Film radiography places a light-tight cassette with film between lead screens behind the weld. After exposure, the film is processed in a darkroom: developer, stop bath, fixer, washing and drying. The darkness of the result is measured as optical density.', 'En radiographie film, une cassette étanche à la lumière contenant le film entre écrans au plomb est placée derrière la soudure. Après exposition, le film est développé en chambre noire : révélateur, bain d’arrêt, fixateur, lavage et séchage. Le noircissement se mesure en densité optique.'],
        ['Computed radiography (CR) uses a reusable imaging plate read by a laser scanner. Digital radiography (DR) uses a flat-panel detector that shows the image on screen almost immediately. Both avoid chemicals and allow contrast adjustment, but have their own image-quality requirements (for example ISO 17636-2).', 'La radiographie numérique CR utilise un écran photostimulable réutilisable lu par un scanner laser. La radiographie DR utilise un détecteur plan qui affiche l’image presque immédiatement. Les deux évitent la chimie et permettent d’ajuster le contraste, mais ont leurs propres exigences de qualité d’image (par exemple ISO 17636-2).'],
        ['Whatever the medium, the image must show the identification, location markers and the required IQI sensitivity before anyone interprets it.', 'Quel que soit le support, l’image doit montrer l’identification, les repères de position et la sensibilité IQI exigée avant toute interprétation.']],
        [['Film: cassette, screens, darkroom, density.', 'Film : cassette, écrans, chambre noire, densité.'], ['CR: imaging plate + scanner. DR: flat panel, instant.', 'CR : écran photostimulable + scanner. DR : détecteur plan, immédiat.'], ['Image quality first, interpretation second.', 'D’abord la qualité d’image, ensuite l’interprétation.']],
        Q(['Which technique shows the image almost immediately on a screen?', 'Quelle technique affiche l’image presque immédiatement à l’écran ?'], [['DR flat-panel detector', 'Détecteur plan DR'], ['Film radiography', 'Radiographie film'], ['Penetrant testing', 'Ressuage']], 0, ['DR panels convert radiation to a digital image directly; film needs processing and CR needs scanning.', 'Les détecteurs DR convertissent directement le rayonnement en image ; le film doit être développé et la CR scannée.']),
        { words: ['density', 'rt'] }),
      M('iqi', ['Image quality indicators (IQI)', 'Indicateurs de qualité d’image (IQI)'], 'rt-iqi', [
        ['How do we know a radiograph is good enough to show small defects? We put an IQI on the part, usually on the source side: a set of fine wires of decreasing diameter (wire type), or a plaque with small holes (hole type).', 'Comment savoir si une radiographie est assez bonne pour montrer de petits défauts ? On place un IQI sur la pièce, généralement côté source : un jeu de fils fins de diamètres décroissants (type à fils) ou une plaquette percée de petits trous (type à trous).'],
        ['The code tells you which wire or hole must be visible for the thickness examined: the essential wire or hole. If it is visible in the area of interest, the required sensitivity is reached; if not, the film is rejected and the exposure repeated.', 'Le code indique quel fil ou trou doit être visible pour l’épaisseur contrôlée : le fil ou trou essentiel. S’il est visible dans la zone d’intérêt, la sensibilité exigée est atteinte ; sinon, le film est refusé et la prise de vue refaite.'],
        ['Common standards: ISO 19232-1 and ASTM E747 (wires), ASTM E1025 (holes). Density next to the IQI is also checked against the allowed range.', 'Normes courantes : ISO 19232-1 et ASTM E747 (fils), ASTM E1025 (trous). La densité à côté de l’IQI est aussi vérifiée par rapport à la plage autorisée.']],
        [['IQI on the source side.', 'IQI côté source.'], ['The essential wire/hole must be visible.', 'Le fil/trou essentiel doit être visible.'], ['Not visible → film rejected.', 'Non visible → film refusé.']],
        Q(['The essential wire is not visible on the film. What happens?', 'Le fil essentiel n’est pas visible sur le film. Que se passe-t-il ?'], [['The film is rejected and the exposure repeated', 'Le film est refusé et la prise de vue refaite'], ['The weld is accepted', 'La soudure est acceptée'], ['We ignore the IQI', 'On ignore l’IQI']], 0, ['Without the required sensitivity, small defects could be missed: the image is not valid for interpretation.', 'Sans la sensibilité exigée, de petits défauts pourraient être manqués : l’image n’est pas valable pour l’interprétation.']),
        { words: ['iqi', 'density'], tryIt: 'rt-steps' }),
      M('interp', ['Radiographic interpretation', 'Interprétation radiographique'], 'rt-interp', [
        ['Interpretation is done on a film viewer in a dimmed room, after checking the film quality: identification, markers, backscatter "B", density and IQI.', 'L’interprétation se fait au négatoscope dans une salle assombrie, après avoir vérifié la qualité du film : identification, repères, « B » de rétrodiffusé, densité et IQI.'],
        ['The interpreter then scans the whole weld systematically, recognises film artefacts (scratches, pressure marks), characterises each indication (shape, density, position across the weld), measures it, and compares it with the acceptance criteria of the code.', 'L’interprète examine ensuite toute la soudure méthodiquement, reconnaît les défauts de film (rayures, marques de pression), caractérise chaque indication (forme, densité, position dans la soudure), la mesure et la compare aux critères d’acceptation du code.'],
        ['Open the RT trainer for the full 11-step animated interpretation on a simulated film.', 'Ouvrez l’entraîneur RT pour l’interprétation animée complète en 11 étapes sur un film simulé.']],
        [['Quality first: ID, markers, B, density, IQI.', 'D’abord la qualité : ID, repères, B, densité, IQI.'], ['Systematic scan, then characterise and measure.', 'Examen méthodique, puis caractériser et mesurer.'], ['Decision from the code, not from habit.', 'Décision selon le code, pas selon l’habitude.']],
        Q(['A light "B" appears on a darker background. What does it mean?', 'Un « B » clair apparaît sur fond plus sombre. Qu’est-ce que cela signifie ?'], [['Backscatter reached the film: film rejected', 'Le rayonnement rétrodiffusé a atteint le film : film refusé'], ['The weld is excellent', 'La soudure est excellente'], ['The IQI is missing', 'L’IQI manque']], 0, ['The lead "B" behind the cassette should not show as a light image; if it does, scattered radiation is fogging the film.', 'Le « B » en plomb derrière la cassette ne doit pas apparaître en clair ; s’il apparaît, le rayonnement diffusé voile le film.']),
        { words: ['iqi', 'density'], tryIt: 'rt-steps' }),
      M('ind', ['Common weld indications on film', 'Indications courantes sur film'], 'rt-indications', [
        ['Darker means less material: porosity shows as dark round spots, slag as irregular dark shapes, cracks as fine dark jagged lines, lack of fusion as a straight dark line along the fusion edge, and incomplete penetration as a straight dark line at the weld centre.', 'Plus sombre signifie moins de matière : les soufflures apparaissent en taches rondes sombres, le laitier en formes sombres irrégulières, les fissures en lignes sombres fines et dentelées, le manque de fusion en ligne sombre droite le long du bord de fusion, et le manque de pénétration en ligne sombre droite au centre.'],
        ['Lighter means more or denser material: tungsten inclusions appear as bright white spots and excess penetration as a light band at the centre. Undercut and root concavity appear darker at the toe or at the root.', 'Plus clair signifie plus de matière ou plus dense : les inclusions de tungstène apparaissent en taches blanches brillantes et l’excès de pénétration en bande claire au centre. Les caniveaux et la retassure apparaissent plus sombres au pied ou à la racine.'],
        ['Open the film atlas to compare each indication in a rejected and a not rejected case.', 'Ouvrez l’atlas film pour comparer chaque indication dans un cas refusé et un cas non refusé.']],
        [['Dark = less material (pores, slag, cracks, LOF, IP).', 'Sombre = moins de matière (soufflures, laitier, fissures, manques).'], ['Light = denser (tungsten, excess penetration).', 'Clair = plus dense (tungstène, excès de pénétration).'], ['Position across the weld helps identify it.', 'La position dans la soudure aide à l’identifier.']],
        Q(['A very bright white spot on a TIG weld radiograph is probably…', 'Une tache blanche très brillante sur une radio de soudure TIG est probablement…'], [['A tungsten inclusion', 'Une inclusion de tungstène'], ['A pore', 'Une soufflure'], ['A crack', 'Une fissure']], 0, ['Tungsten is denser than steel and absorbs more radiation, so the film stays lighter there.', 'Le tungstène est plus dense que l’acier et absorbe plus, donc le film reste plus clair à cet endroit.']),
        { words: ['porosity', 'slag', 'crack'], tryIt: 'rt-atlas' })
    ],
    MT: [
      M('mag', ['Magnetic principles', 'Principes magnétiques'], 'mt-principle', [
        ['Ferromagnetic materials (iron, carbon and low-alloy steels, nickel, cobalt) can be strongly magnetised. Inside them, the magnetic flux flows easily like water in a pipe.', 'Les matériaux ferromagnétiques (fer, aciers au carbone et faiblement alliés, nickel, cobalt) peuvent être fortement aimantés. À l’intérieur, le flux magnétique circule facilement, comme de l’eau dans un tuyau.'],
        ['A crack is a gap full of air, which conducts flux badly. The flux has to jump over it and some of it leaks out of the surface, creating a small local north and south pole: the leakage field.', 'Une fissure est un espace rempli d’air, qui conduit mal le flux. Le flux doit la franchir et une partie fuit hors de la surface, créant un petit pôle nord et sud local : le champ de fuite.'],
        ['Fine iron particles spread on the surface are attracted by that leakage field and pile up along the crack, making it visible, even if it is too fine for the eye. Austenitic stainless steel and aluminium are not ferromagnetic: MT does not work on them.', 'De fines particules de fer répandues en surface sont attirées par ce champ de fuite et s’accumulent le long de la fissure, la rendant visible, même trop fine pour l’œil. L’inox austénitique et l’aluminium ne sont pas ferromagnétiques : la MT ne fonctionne pas sur eux.']],
        [['Defect = gap in the flux = leakage field.', 'Défaut = interruption du flux = champ de fuite.'], ['Particles gather at the leakage.', 'Les particules se rassemblent à la fuite.'], ['Ferromagnetic materials only.', 'Matériaux ferromagnétiques uniquement.']],
        Q(['Can MT be used on an austenitic stainless steel weld?', 'Peut-on utiliser la MT sur une soudure en inox austénitique ?'], [['No, the material is not ferromagnetic: use PT instead', 'Non, le matériau n’est pas ferromagnétique : utiliser le PT'], ['Yes, always', 'Oui, toujours'], ['Only with red particles', 'Seulement avec des particules rouges']], 0, ['Without magnetisation there is no leakage field; penetrant testing finds the surface cracks instead.', 'Sans aimantation il n’y a pas de champ de fuite ; le ressuage détecte alors les fissures débouchantes.']),
        { words: ['mt'], tryIt: 'anim' }),
      M('methods', ['Magnetisation methods', 'Techniques d’aimantation'], 'mt-methods', [
        ['Yoke: a portable U-shaped electromagnet; the field runs between its two legs (longitudinal field). It is the most common on welds. Its strength is checked by its lifting power (for example at least 4.5 kg for AC and 18 kg for DC yokes in ASME V; verify the procedure).', 'Yoke : électroaimant portable en U ; le champ circule entre ses deux pattes (champ longitudinal). C’est le plus courant sur les soudures. Sa force se vérifie par la force portante (par exemple au moins 4,5 kg en CA et 18 kg en CC selon l’ASME V ; vérifier la procédure).'],
        ['Prods: two electrodes pass a current through the part; the field circles around the current path (circular field). Risk of arc strikes, so they are avoided on finished surfaces. Coil: the part goes inside a coil, giving a field along its axis. Central conductor: a bar through a hollow part gives a circular field.', 'Électrodes (prods) : deux touches font passer un courant dans la pièce ; le champ tourne autour du trajet du courant (champ circulaire). Risque d’amorçages, donc évitées sur surfaces finies. Bobine : la pièce passe dans une bobine, champ selon son axe. Conducteur central : une barre traversant une pièce creuse donne un champ circulaire.'],
        ['AC concentrates the field at the surface (best for surface cracks); DC penetrates a little deeper (near-surface defects). The field can be checked with a field indicator or flux strips.', 'Le courant alternatif concentre le champ en surface (idéal pour les fissures débouchantes) ; le continu pénètre un peu plus (défauts sous-jacents). Le champ se vérifie avec un indicateur de champ ou des bandes de flux.']],
        [['Yoke: longitudinal field between the legs.', 'Yoke : champ longitudinal entre les pattes.'], ['Prods / central conductor: circular field.', 'Électrodes / conducteur central : champ circulaire.'], ['AC = surface, DC = slightly deeper.', 'CA = surface, CC = un peu plus profond.']],
        Q(['Which technique risks arc strikes on the part?', 'Quelle technique risque des amorçages sur la pièce ?'], [['Prods (current through the part)', 'Les électrodes (courant dans la pièce)'], ['Yoke', 'Le yoke'], ['Coil', 'La bobine']], 0, ['Prods pass current through contact points; a poor contact can arc and damage the surface.', 'Les électrodes font passer le courant par des points de contact ; un mauvais contact peut amorcer et abîmer la surface.']),
        { words: ['yoke', 'mt'], tryIt: 'lab' }),
      M('particles', ['Magnetic particles', 'Les particules magnétiques'], 'mt-particles', [
        ['Dry powder (grey, red, yellow…) is dusted on the surface: useful on rough or hot surfaces. Wet visible particles are black ink sprayed on a thin white contrast paint.', 'La poudre sèche (grise, rouge, jaune…) est saupoudrée sur la surface : utile sur surfaces rugueuses ou chaudes. Les particules humides visibles sont une encre noire pulvérisée sur une fine peinture blanche de contraste.'],
        ['Wet fluorescent particles glow green-yellow under UV-A light in a darkened area: they are the most sensitive, but need low ambient light and a UV lamp of the required intensity.', 'Les particules humides fluorescentes brillent en jaune-vert sous lumière UV-A dans une zone sombre : ce sont les plus sensibles, mais elles demandent peu de lumière ambiante et une lampe UV d’intensité exigée.'],
        ['Particles must be applied while the field is on (continuous method) and gently, so they can move to the leakage fields. For wet baths, the particle concentration is checked (settling test).', 'Les particules s’appliquent pendant l’aimantation (méthode continue) et en douceur, pour qu’elles puissent migrer vers les champs de fuite. Pour les bains humides, la concentration est vérifiée (test de décantation).']],
        [['Dry: rough or hot surfaces.', 'Sèche : surfaces rugueuses ou chaudes.'], ['Wet visible: black ink on white paint.', 'Humide visible : encre noire sur peinture blanche.'], ['Wet fluorescent: UV-A, darkened area, most sensitive.', 'Humide fluorescente : UV-A, zone sombre, la plus sensible.']],
        Q(['Which particles are the most sensitive?', 'Quelles particules sont les plus sensibles ?'], [['Wet fluorescent under UV-A light', 'Humides fluorescentes sous UV-A'], ['Dry grey powder', 'Poudre sèche grise'], ['There is no difference', 'Il n’y a aucune différence']], 0, ['Fine fluorescent particles glowing against a dark background make very small indications visible.', 'Les fines particules fluorescentes brillant sur fond sombre rendent visibles de très petites indications.']),
        { words: ['mt'], tryIt: 'mt-sim' }),
      M('direction', ['Field direction', 'Direction du champ'], 'mt-direction', [
        ['MT finds a crack best when the crack is perpendicular (90°) to the magnetic field: the flux is fully cut and leaks strongly. Up to about 45° it is still detected.', 'La MT détecte le mieux une fissure perpendiculaire (90°) au champ : le flux est complètement coupé et fuit fortement. Jusqu’à environ 45° elle reste détectée.'],
        ['A crack parallel to the field barely disturbs it: no leakage, no indication, even if the crack is large.', 'Une fissure parallèle au champ le perturbe à peine : pas de fuite, pas d’indication, même si la fissure est grande.'],
        ['That is why every area is examined in two directions at about 90° to each other, for example the yoke placed across the weld then along it.', 'C’est pourquoi chaque zone est contrôlée dans deux directions à environ 90° l’une de l’autre, par exemple le yoke posé en travers de la soudure puis le long.']],
        [['Best detection: crack ⟂ field.', 'Meilleure détection : fissure ⟂ champ.'], ['Crack ∥ field: invisible.', 'Fissure ∥ champ : invisible.'], ['Always two directions at 90°.', 'Toujours deux directions à 90°.']],
        Q(['Why is each area examined in two directions?', 'Pourquoi chaque zone est-elle contrôlée dans deux directions ?'], [['A crack parallel to the first field would be missed', 'Une fissure parallèle au premier champ serait manquée'], ['To use more particles', 'Pour utiliser plus de particules'], ['It is only tradition', 'C’est seulement une tradition']], 0, ['The second direction at 90° cuts the cracks that the first field ran along.', 'La seconde direction à 90° coupe les fissures que le premier champ longeait.']),
        { words: ['mt', 'yoke'], tryIt: 'mt-sim' }),
      M('mtinterp', ['Interpreting MT indications', 'Interpréter les indications MT'], 'mt-interp', [
        ['A relevant indication is caused by a real discontinuity: sharp, well-defined lines of particles that come back after cleaning and re-testing.', 'Une indication pertinente est causée par une vraie discontinuité : des lignes de particules nettes et bien définies qui réapparaissent après nettoyage et nouveau contrôle.'],
        ['Non-relevant indications come from real magnetic leakage but not from defects: sharp changes of section, the edge of the weld (HAZ boundary), or "magnetic writing" where another magnetised object touched the part. False indications come from scratches, dirt or the surface profile holding particles mechanically.', 'Les indications non pertinentes viennent d’une vraie fuite magnétique mais pas d’un défaut : changements brusques de section, bord de la ZAT, ou « écriture magnétique » au contact d’un autre objet aimanté. Les fausses indications viennent de rayures, de saleté ou du profil qui retient mécaniquement les particules.'],
        ['Linear indications (length more than three times the width) are typical of cracks. Record each relevant indication, compare with the criteria, then demagnetise and clean the part if required.', 'Les indications linéaires (longueur supérieure à trois fois la largeur) sont typiques des fissures. Consignez chaque indication pertinente, comparez aux critères, puis désaimantez et nettoyez la pièce si exigé.']],
        [['Relevant = real defect, repeatable.', 'Pertinente = vrai défaut, reproductible.'], ['Non-relevant = geometry or magnetic writing.', 'Non pertinente = géométrie ou écriture magnétique.'], ['False = scratches, dirt.', 'Fausse = rayures, saleté.']],
        Q(['Particles gather along the edge of the weld cap all along the weld. What is the most likely cause?', 'Les particules s’accumulent le long du bord de la finition sur toute la soudure. Cause la plus probable ?'], [['A non-relevant geometric indication; confirm by examining the toe', 'Une indication non pertinente géométrique ; confirmer en examinant le pied'], ['Certainly a crack', 'Certainement une fissure'], ['Bad particles', 'De mauvaises particules']], 0, ['Change of section at the toe causes leakage; it must be checked (light grinding, other angle, VT) before deciding.', 'Le changement de section au pied crée une fuite ; il faut vérifier (léger meulage, autre direction, VT) avant de décider.']),
        { words: ['mt', 'crack'], tryIt: 'mt-sim' })
    ],
    PT: [
      M('types', ['Penetrant types', 'Types de pénétrants'], 'pt-types', [
        ['Type I penetrants are fluorescent: inspected under UV-A light in a darkened area, very sensitive. Type II are visible (red dye): inspected under white light, practical on site.', 'Les pénétrants de type I sont fluorescents : observés sous UV-A dans une zone sombre, très sensibles. Ceux de type II sont visibles (colorés rouges) : observés en lumière blanche, pratiques sur chantier.'],
        ['They are also classed by how the excess is removed: water-washable, post-emulsifiable (an emulsifier is applied before rinsing) or solvent-removable (wiped with cloths and solvent). Solvent-removable visible penetrant in aerosol cans is the most common on welds.', 'Ils se classent aussi selon l’élimination de l’excès : lavable à l’eau, post-émulsifiable (on applique un émulsifiant avant le rinçage) ou éliminable au solvant (essuyé avec chiffons et solvant). Le pénétrant visible éliminable au solvant en aérosol est le plus courant sur soudures.'],
        ['Always use products of the same family (penetrant, remover, developer from compatible series) and check they are suitable for the material (for example low halogen and sulfur for stainless steel and nickel alloys).', 'Utilisez toujours des produits de la même famille (pénétrant, nettoyant, révélateur de séries compatibles) et vérifiez qu’ils conviennent au matériau (par exemple faibles teneurs en halogènes et soufre pour l’inox et les alliages de nickel).']],
        [['Type I fluorescent (UV-A), Type II visible red.', 'Type I fluorescent (UV-A), type II visible rouge.'], ['Removal: water, post-emulsifier, solvent.', 'Élimination : eau, post-émulsifiable, solvant.'], ['Same product family; check material compatibility.', 'Même famille de produits ; vérifier la compatibilité.']],
        Q(['Which penetrant needs a UV-A lamp in a darkened area?', 'Quel pénétrant exige une lampe UV-A dans une zone sombre ?'], [['Type I fluorescent', 'Type I fluorescent'], ['Type II visible red', 'Type II visible rouge'], ['All of them', 'Tous']], 0, ['Fluorescent dyes glow under UV-A; red visible dyes are viewed in white light.', 'Les colorants fluorescents brillent sous UV-A ; les rouges visibles s’observent en lumière blanche.']),
        { words: ['pt'], tryIt: 'lab' }),
      M('clean', ['Cleaning (pre-cleaning)', 'Nettoyage (pré-nettoyage)'], 'pt-steps', [
        ['Penetrant can only enter a crack that is open and empty. Oil, grease, paint, rust, scale, spatter or water inside the crack block it.', 'Le pénétrant ne peut entrer que dans une fissure ouverte et vide. Huile, graisse, peinture, rouille, calamine, projections ou eau dans la fissure la bouchent.'],
        ['Clean with solvent or detergent, remove paint and scale, then let the surface dry completely. Avoid methods that smear metal over the cracks (heavy grinding, shot blasting) unless the procedure allows them, followed if needed by etching.', 'Nettoyez au solvant ou au détergent, retirez peinture et calamine, puis laissez sécher complètement. Évitez les méthodes qui écrasent le métal sur les fissures (meulage fort, grenaillage) sauf si la procédure les autorise, suivies si besoin d’un décapage chimique.'],
        ['The surface and the products must also be within the temperature range of the procedure (often about 5 to 52 °C for standard techniques).', 'La surface et les produits doivent aussi être dans la plage de température de la procédure (souvent environ 5 à 52 °C pour les techniques standard).']],
        [['A dirty crack is an invisible crack.', 'Une fissure sale est une fissure invisible.'], ['Clean, then dry completely.', 'Nettoyer, puis sécher complètement.'], ['Do not smear metal over cracks.', 'Ne pas écraser le métal sur les fissures.']],
        Q(['Why must the surface be dry before applying penetrant?', 'Pourquoi la surface doit-elle être sèche avant le pénétrant ?'], [['Water left in a crack stops the penetrant from entering', 'L’eau restée dans une fissure empêche le pénétrant d’entrer'], ['To save penetrant', 'Pour économiser le pénétrant'], ['It does not matter', 'Ça n’a pas d’importance']], 0, ['The crack must be empty: any liquid inside takes the place of the penetrant.', 'La fissure doit être vide : tout liquide à l’intérieur prend la place du pénétrant.']),
        { stage: 0, words: ['pt'], tryIt: 'pt-sim' }),
      M('apply', ['Penetrant application and dwell', 'Application et temps de pénétration'], 'pt-steps', [
        ['Apply the penetrant by spraying, brushing or dipping so that the whole area is covered with a continuous wet film.', 'Appliquez le pénétrant par pulvérisation, pinceau ou immersion pour couvrir toute la zone d’un film humide continu.'],
        ['Then wait the dwell time: the liquid is drawn into the narrow openings by capillary action, the same force that makes water climb in a thin tube. The procedure gives the dwell time for the material and temperature, typically several minutes. The surface must not dry out during dwell.', 'Attendez ensuite le temps de pénétration : le liquide est aspiré dans les ouvertures étroites par capillarité, la même force qui fait monter l’eau dans un tube fin. La procédure donne le temps selon le matériau et la température, typiquement quelques minutes. La surface ne doit pas sécher pendant ce temps.'],
        ['Next comes removal of the excess. With solvent-removable penetrant: wipe with a dry lint-free cloth, then with a cloth lightly moistened with remover. Never spray solvent directly on the surface: it would wash the penetrant out of the cracks.', 'Vient ensuite l’élimination de l’excès. Avec un pénétrant éliminable au solvant : essuyez avec un chiffon sec non pelucheux, puis avec un chiffon légèrement imbibé de nettoyant. Ne pulvérisez jamais le solvant directement sur la surface : il rincerait le pénétrant des fissures.']],
        [['Continuous wet film over the whole area.', 'Film humide continu sur toute la zone.'], ['Capillarity fills the crack during dwell.', 'La capillarité remplit la fissure pendant l’attente.'], ['Remove excess with a moist cloth, never a direct spray.', 'Éliminer l’excès au chiffon humide, jamais par pulvérisation directe.']],
        Q(['How is excess solvent-removable penetrant removed?', 'Comment élimine-t-on l’excès de pénétrant éliminable au solvant ?'], [['Dry cloth, then a cloth lightly moistened with remover', 'Chiffon sec, puis chiffon légèrement imbibé de nettoyant'], ['Spraying solvent directly on the weld', 'Pulvériser le solvant directement sur la soudure'], ['Rinsing with a hose', 'Rincer au jet']], 0, ['Direct spraying floods the cracks and washes the penetrant out (over-removal).', 'La pulvérisation directe inonde les fissures et en rince le pénétrant (sur-élimination).']),
        { stage: 1, words: ['dwell', 'pt'], tryIt: 'pt-sim' }),
      M('develop', ['Development', 'Révélation'], 'pt-steps', [
        ['The developer is a very thin, even white layer (sprayed from about 30 cm for aerosols). It acts like blotting paper: it draws the penetrant trapped in the defect back to the surface and spreads it, so the indication becomes wider and visible.', 'Le révélateur est une couche blanche très fine et régulière (pulvérisée à environ 30 cm pour les aérosols). Il agit comme un buvard : il fait remonter le pénétrant piégé dans le défaut et l’étale, l’indication devient plus large et visible.'],
        ['Too thick a layer hides small indications. Observe the surface as soon as the developer dries (indications can spread quickly), then interpret after the development time set by the procedure.', 'Une couche trop épaisse masque les petites indications. Observez dès le séchage du révélateur (les indications peuvent s’étaler vite), puis interprétez après le temps de révélation fixé par la procédure.'],
        ['Inspection lighting: visible penetrant needs enough white light on the surface (for example at least 1 000 lux in ASME V); fluorescent penetrant needs UV-A of the required intensity and a dark area.', 'Éclairage d’inspection : le pénétrant visible exige assez de lumière blanche sur la surface (par exemple au moins 1 000 lux selon l’ASME V) ; le fluorescent exige des UV-A de l’intensité requise et une zone sombre.']],
        [['Thin, even developer = blotting paper.', 'Révélateur fin et régulier = buvard.'], ['Watch from the start, interpret at the set time.', 'Observer dès le début, interpréter au temps fixé.'], ['Right light for the penetrant type.', 'Bon éclairage selon le type de pénétrant.']],
        Q(['What happens if the developer layer is too thick?', 'Que se passe-t-il si la couche de révélateur est trop épaisse ?'], [['Small indications can be hidden', 'De petites indications peuvent être masquées'], ['Indications become sharper', 'Les indications deviennent plus nettes'], ['Nothing', 'Rien']], 0, ['A thick coat masks the small amount of penetrant coming out of fine cracks.', 'Une couche épaisse masque la petite quantité de pénétrant sortant des fissures fines.']),
        { stage: 3, words: ['developer'], tryIt: 'pt-sim' }),
      M('ptinterp', ['Interpreting PT indications', 'Interpréter les indications PT'], 'pt-interp', [
        ['The bleed-out is always larger than the defect itself, because the developer spreads the penetrant. Note its shape and measure its length.', 'Le ressuage est toujours plus grand que le défaut lui-même, car le révélateur étale le pénétrant. Notez sa forme et mesurez sa longueur.'],
        ['A linear indication is one whose length is more than three times its width (typical of cracks, lack of fusion). A rounded indication is circular or elliptical with length up to three times the width (typical of porosity).', 'Une indication linéaire a une longueur supérieure à trois fois sa largeur (typique des fissures, manques de fusion). Une indication arrondie est circulaire ou elliptique, de longueur au plus trois fois la largeur (typique des soufflures).'],
        ['False indications come from poor cleaning or excess penetrant not removed; when in doubt, clean and re-test the area. Then compare relevant indications with the acceptance criteria and clean the part after inspection.', 'Les fausses indications viennent d’un mauvais nettoyage ou d’un excès non éliminé ; en cas de doute, nettoyez et recontrôlez la zone. Comparez ensuite les indications pertinentes aux critères d’acceptation et nettoyez la pièce après contrôle.']],
        [['Bleed-out > actual defect.', 'Ressuage > défaut réel.'], ['Linear: length > 3 × width.', 'Linéaire : longueur > 3 × largeur.'], ['Doubt → clean and re-test.', 'Doute → nettoyer et recontrôler.']],
        Q(['An indication is 6 mm long and 1 mm wide. How is it classified?', 'Une indication fait 6 mm de long et 1 mm de large. Comment la classer ?'], [['Linear (6 > 3 × 1)', 'Linéaire (6 > 3 × 1)'], ['Rounded', 'Arrondie'], ['Not an indication', 'Ce n’est pas une indication']], 0, ['Its length is six times its width, more than three: linear.', 'Sa longueur vaut six fois sa largeur, plus que trois : linéaire.']),
        { words: ['pt', 'crack', 'porosity'], tryIt: 'pt-sim' })
    ],
    VT: [
      M('vtprin', ['Visual inspection principles', 'Principes du contrôle visuel'], 'vt-principle', [
        ['Visual testing is always the first NDT method: many problems (cracks, undercut, wrong size, missing welds) are visible before using any instrument.', 'Le contrôle visuel est toujours la première méthode de CND : beaucoup de problèmes (fissures, caniveaux, mauvaise dimension, soudures manquantes) sont visibles avant tout appareil.'],
        ['Direct visual examination: the eye is placed close to the surface (ASME V: within about 600 mm) at an angle of at least 30° to the surface. Remote visual examination uses mirrors, borescopes or cameras, which must give at least equivalent resolution.', 'Examen visuel direct : l’œil est proche de la surface (ASME V : à environ 600 mm au plus) avec un angle d’au moins 30° par rapport à la surface. L’examen à distance utilise miroirs, endoscopes ou caméras, qui doivent offrir une résolution au moins équivalente.'],
        ['The inspector’s eyesight is checked regularly (near vision and colour perception) and the examination follows a written procedure with criteria.', 'La vue de l’inspecteur est vérifiée régulièrement (vision de près et perception des couleurs) et l’examen suit une procédure écrite avec des critères.']],
        [['VT always comes first.', 'Le VT vient toujours en premier.'], ['Direct: ≤ 600 mm, ≥ 30° (ASME V).', 'Direct : ≤ 600 mm, ≥ 30° (ASME V).'], ['Remote: mirror, borescope, camera.', 'À distance : miroir, endoscope, caméra.']],
        Q(['Which situation requires remote visual examination?', 'Quelle situation exige un examen visuel à distance ?'], [['The inside of a small pipe the eye cannot reach', 'L’intérieur d’un petit tube que l’œil ne peut atteindre'], ['A plate on a table', 'Une tôle sur une table'], ['Any weld at all', 'N’importe quelle soudure']], 0, ['When direct access (distance and angle) is impossible, a borescope or camera brings the image to the inspector.', 'Quand l’accès direct (distance et angle) est impossible, un endoscope ou une caméra apporte l’image à l’inspecteur.']),
        { words: ['vt'], tryIt: 'anim' }),
      M('light', ['Lighting', 'Éclairage'], 'vt-light', [
        ['Without enough light, defects stay invisible. Codes set a minimum illuminance on the surface: for example 1 000 lux in ASME V Article 9, and at least 350 lux (500 lux recommended) in ISO 17637. It is measured with a light meter.', 'Sans assez de lumière, les défauts restent invisibles. Les codes fixent un éclairement minimal sur la surface : par exemple 1 000 lux selon l’ASME V article 9, et au moins 350 lux (500 lux recommandés) selon l’ISO 17637. On le mesure au luxmètre.'],
        ['Direction matters too: light coming from the side (oblique lighting) creates shadows that reveal relief such as undercut, overlap or ripples; light from the front flattens them.', 'La direction compte aussi : une lumière rasante crée des ombres qui révèlent le relief (caniveaux, débordements, stries) ; une lumière de face les aplatit.'],
        ['Avoid glare and reflections on shiny surfaces, and use a torch to look into corners and roots.', 'Évitez l’éblouissement et les reflets sur les surfaces brillantes, et utilisez une lampe torche pour regarder dans les angles et les racines.']],
        [['Measure the light: lux meter.', 'Mesurer la lumière : luxmètre.'], ['ASME V: ≥ 1 000 lux. ISO 17637: ≥ 350 lux (500 recommended).', 'ASME V : ≥ 1 000 lux. ISO 17637 : ≥ 350 lux (500 recommandés).'], ['Oblique light reveals relief.', 'La lumière rasante révèle le relief.']],
        Q(['Why use oblique (side) lighting during VT?', 'Pourquoi utiliser une lumière rasante en VT ?'], [['Its shadows reveal relief such as undercut', 'Ses ombres révèlent le relief comme les caniveaux'], ['It uses less energy', 'Elle consomme moins'], ['It hides defects', 'Elle cache les défauts']], 0, ['Small depressions and steps cast shadows under oblique light and become visible.', 'Les petits creux et marches projettent des ombres sous lumière rasante et deviennent visibles.']),
        { words: ['vt'] }),
      M('tools', ['Measuring instruments', 'Instruments de mesure'], 'vt-gauge', [
        ['Weld gauges measure dimensions: the Cambridge (multi-purpose) gauge measures reinforcement height, undercut depth, fillet throat and preparation angles; the Hi-Lo gauge measures misalignment between pipe ends; fillet gauges check leg length and throat.', 'Les jauges de soudure mesurent les dimensions : la jauge Cambridge (multi-usages) mesure la surépaisseur, la profondeur de caniveau, la gorge et les angles de chanfrein ; la jauge Hi-Lo mesure le désalignement entre bouts de tube ; les jauges d’angle vérifient côté et gorge.'],
        ['Also used: steel rule and caliper, magnifier (2× to 10×), mirror, torch, borescope, and a light meter. Measuring instruments must be in good condition and verified or calibrated.', 'On utilise aussi : réglet et pied à coulisse, loupe (2× à 10×), miroir, lampe, endoscope et luxmètre. Les instruments doivent être en bon état et vérifiés ou étalonnés.'],
        ['Record the value and where it was measured: a measurement without location is useless for repair.', 'Consignez la valeur et l’endroit mesuré : une mesure sans localisation est inutile pour la réparation.']],
        [['Cambridge: reinforcement, undercut, throat, angles.', 'Cambridge : surépaisseur, caniveau, gorge, angles.'], ['Hi-Lo: misalignment.', 'Hi-Lo : désalignement.'], ['Record value + location.', 'Consigner valeur + emplacement.']],
        Q(['Which gauge measures misalignment between two pipe ends?', 'Quelle jauge mesure le désalignement entre deux bouts de tube ?'], [['Hi-Lo gauge', 'Jauge Hi-Lo'], ['Light meter', 'Luxmètre'], ['Magnifier', 'Loupe']], 0, ['The Hi-Lo gauge compares the internal surfaces of both pipes to measure the step between them.', 'La jauge Hi-Lo compare les surfaces internes des deux tubes pour mesurer la marche entre eux.']),
        { words: ['vt'], tryIt: 'lab' }),
      M('weldvt', ['Weld visual examination', 'Examen visuel des soudures'], 'vt-weld', [
        ['Before welding: check the preparation (bevel angle, root gap, alignment, cleanliness) against the WPS. During welding: preheat, interpass cleaning and temperature.', 'Avant soudage : vérifier la préparation (angle de chanfrein, écartement, alignement, propreté) selon le DMOS. Pendant : préchauffage, nettoyage et température entre passes.'],
        ['After welding: check the weld profile and size (reinforcement height, fillet size), surface defects (cracks, undercut, overlap, porosity, arc strikes, spatter), the root when accessible, and misalignment.', 'Après soudage : contrôler profil et dimensions (surépaisseur, gorge), défauts de surface (fissures, caniveaux, débordements, soufflures, amorçages, projections), la racine si accessible, et le désalignement.'],
        ['Compare each measurement with the acceptance criteria of the applicable code or of a quality level (for example ISO 5817 levels B, C or D) and record the result.', 'Comparez chaque mesure aux critères du code applicable ou à un niveau de qualité (par exemple ISO 5817 niveaux B, C ou D) et consignez le résultat.']],
        [['Before, during and after welding.', 'Avant, pendant et après soudage.'], ['Profile, size, surface defects, root, alignment.', 'Profil, dimension, défauts de surface, racine, alignement.'], ['Criteria from the code (e.g. ISO 5817 level).', 'Critères du code (ex. niveau ISO 5817).']],
        Q(['When should the root gap and bevel angle be checked?', 'Quand faut-il contrôler l’écartement et l’angle du chanfrein ?'], [['Before welding, against the WPS', 'Avant soudage, selon le DMOS'], ['Only after welding', 'Seulement après soudage'], ['Never', 'Jamais']], 0, ['Fit-up defects cause welding defects; they are cheapest to fix before welding.', 'Les défauts d’accostage causent des défauts de soudage ; on les corrige le moins cher avant soudage.']),
        { words: ['weld', 'wps', 'undercut'], tryIt: 'anim' }),
      M('surface', ['Surface imperfections', 'Imperfections de surface'], 'vt-surface', [
        ['Undercut: a groove melted into the base metal at the toe. Overlap: weld metal flowing onto the plate without fusing. Excess reinforcement: a cap that is too high, creating a notch at the toe.', 'Caniveau : sillon fondu dans le métal de base au pied. Débordement : métal fondu coulé sur la tôle sans fusion. Surépaisseur excessive : finition trop haute, créant une entaille au pied.'],
        ['Underfill: the groove is not completely filled. Arc strike: a small burned spot where the arc touched the plate outside the weld, which can start cracks. Spatter: droplets of metal stuck around the weld. Misalignment (hi-lo): the two parts are not level.', 'Manque d’épaisseur : le chanfrein n’est pas complètement rempli. Amorçage : petite brûlure où l’arc a touché la tôle hors soudure, pouvant amorcer des fissures. Projections : gouttelettes de métal collées autour. Désalignement (hi-lo) : les deux pièces ne sont pas au même niveau.'],
        ['ISO 6520-1 gives names and reference numbers to these imperfections; the acceptance limits come from the code or quality level chosen by the project.', 'L’ISO 6520-1 nomme et numérote ces imperfections ; les limites d’acceptation viennent du code ou du niveau de qualité retenu par le projet.']],
        [['Undercut, overlap, excess reinforcement, underfill.', 'Caniveau, débordement, surépaisseur, manque d’épaisseur.'], ['Arc strikes can start cracks.', 'Les amorçages peuvent amorcer des fissures.'], ['Names: ISO 6520-1. Limits: the code.', 'Noms : ISO 6520-1. Limites : le code.']],
        Q(['Why is an arc strike outside the weld a concern?', 'Pourquoi un amorçage hors soudure est-il un problème ?'], [['It is a hard, brittle spot that can start cracks', 'C’est un point dur et fragile qui peut amorcer des fissures'], ['It only looks ugly', 'C’est seulement inesthétique'], ['It makes the weld stronger', 'Il renforce la soudure']], 0, ['The very fast heating and cooling creates hard, brittle material and sometimes micro-cracks.', 'Le chauffage et le refroidissement très rapides créent un métal dur et fragile, parfois des micro-fissures.']),
        { words: ['undercut', 'weld'], tryIt: 'anim' })
    ]
  };

  /* ============================ animated diagrams ============================ */
  const C = { bg: '#0b1530', steel: '#6f7f99', steelD: '#4b5a74', weld: '#9a948a', beam: '#ffe14d', echo: '#7dff9a', red: '#ff5a6a', blue: '#4db3ff', text: '#e8eefc', mut: '#9fb0d0', air: '#1d2a48', film: '#2b2f36' };
  const ease = (x) => x * x * (3 - 2 * x);
  function txt(g, s, x, y, col, size, align) { g.fillStyle = col || C.text; g.font = (size ? size : 12) + 'px system-ui, sans-serif'; g.textAlign = align || 'left'; g.fillText(s, x, y); }
  function arrow(g, x1, y1, x2, y2, col, w) { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w || 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 9 * Math.cos(a - 0.4), y2 - 9 * Math.sin(a - 0.4)); g.lineTo(x2 - 9 * Math.cos(a + 0.4), y2 - 9 * Math.sin(a + 0.4)); g.closePath(); g.fill(); }
  function plate(g, x, y, w, h, col) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, col || C.steel); gr.addColorStop(1, C.steelD); g.fillStyle = gr; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(255,255,255,.15)'; g.strokeRect(x + .5, y + .5, w - 1, h - 1); }
  function probe(g, x, y, ang) { g.save(); g.translate(x, y); g.rotate(ang || 0); g.fillStyle = '#2e6bd1'; g.fillRect(-16, -26, 32, 22); g.fillStyle = '#d8a050'; g.globalAlpha = .85; g.fillRect(-16, -4, 32, 6); g.globalAlpha = 1; g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -26); g.quadraticCurveTo(10, -46, 30, -50); g.stroke(); g.restore(); }
  function ascan(g, x, y, w, h, peaks, t, opts) {
    g.fillStyle = '#03140d'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(120,255,170,.15)'; g.lineWidth = 1;
    for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(x + w * i / 10, y); g.lineTo(x + w * i / 10, y + h); g.stroke(); }
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x, y + h * i / 5); g.lineTo(x + w, y + h * i / 5); g.stroke(); }
    g.strokeStyle = C.echo; g.lineWidth = 1.5; g.beginPath();
    for (let i = 0; i <= w; i++) {
      const f = i / w; let v = 0.03 * Math.abs(Math.sin(i * 12.9898 + Math.floor(t * 20) * 78.233));
      for (const p of peaks) { const k = Math.exp(-Math.pow((f - p[0]) / (p[2] || 0.012), 2)) * p[1]; v = Math.max(v, k * (0.7 + 0.3 * Math.abs(Math.cos((f - p[0]) * 400)))); }
      const yy = y + h - 4 - Math.min(1, v) * (h - 10); i ? g.lineTo(x + i, yy) : g.moveTo(x + i, yy);
    }
    g.stroke();
    if (opts && opts.gate) { g.strokeStyle = C.beam; g.lineWidth = 3; g.beginPath(); g.moveTo(x + w * opts.gate[0], y + h * 0.62); g.lineTo(x + w * opts.gate[1], y + h * 0.62); g.stroke(); }
  }
  // pulse position along a polyline at fraction f
  function along(pts, f) { let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; } let d = f * tot; for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const k = d / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } d -= seg[i]; } return pts[pts.length - 1]; }
  function dot(g, p, col, r) { g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 10; g.beginPath(); g.arc(p[0], p[1], r || 5, 0, TAU); g.fill(); g.shadowBlur = 0; }
  function cap(g, w, h, s) { g.fillStyle = 'rgba(8,16,32,.85)'; g.fillRect(0, h - 26, w, 26); txt(g, s, 10, h - 9, C.text, 13); }

  const DRAW = {
    'ut-what'(g, w, h, t) {
      const px = w * 0.28, top = h * 0.3, th = h * 0.36; plate(g, 30, top, w * 0.5, th); probe(g, px, top);
      const cyc = (t % 3) / 3, pts = [[px, top], [px, top + th], [px, top]], p = along(pts, cyc);
      g.strokeStyle = 'rgba(255,225,77,.35)'; g.lineWidth = 6; g.beginPath(); g.moveTo(px, top); g.lineTo(px, top + th); g.stroke(); dot(g, p, C.beam);
      txt(g, L('back wall', 'fond'), px + 8, top + th - 6, C.mut);
      const ax = w * 0.6, aw = w * 0.36, ay = h * 0.22, ah = h * 0.5; const peaks = [[0.04, 0.95]]; if (cyc > 0.5) peaks.push([0.8, 0.75 * ease(Math.min(1, (cyc - 0.5) * 4))]);
      ascan(g, ax, ay, aw, ah, peaks, t); txt(g, L('initial pulse', 'émission'), ax + 4, ay - 6, C.mut, 11); txt(g, L('back-wall echo', 'écho de fond'), ax + aw * 0.62, ay - 6, C.mut, 11);
      cap(g, w, h, cyc < 0.5 ? L('1. The probe sends a sound pulse into the steel…', '1. Le traducteur envoie une impulsion dans l’acier…') : L('2. …the echo returns and appears as a peak on the screen.', '2. …l’écho revient et apparaît comme un pic à l’écran.'));
    },
    'ut-wave'(g, w, h, t) {
      const rows = [[L('Longitudinal wave: atoms move ALONG the travel direction', 'Onde longitudinale : les atomes bougent DANS le sens de propagation'), 0.27, 'L'], [L('Shear wave: atoms move ACROSS the travel direction (solids only)', 'Onde transversale : les atomes bougent EN TRAVERS (solides seulement)'), 0.65, 'T']];
      for (const [label, yf, k] of rows) {
        const y = h * yf; txt(g, label, 14, y - 30, C.text, 12);
        for (let i = 0; i < 36; i++) { const x0 = 20 + i * (w - 40) / 35, ph = i * 0.45 - t * 5; const dx = k === 'L' ? 6 * Math.sin(ph) : 0, dy = k === 'T' ? 10 * Math.sin(ph) : 0; dot(g, [x0 + dx, y + dy], k === 'L' ? C.blue : C.echo, 3.5); }
        arrow(g, w - 70, y + 24, w - 20, y + 24, C.mut, 2);
      }
      cap(g, w, h, L('Steel: L ≈ 5 920 m/s · T ≈ 3 240 m/s · water ≈ 1 480 m/s · air ≈ 340 m/s', 'Acier : L ≈ 5 920 m/s · T ≈ 3 240 m/s · eau ≈ 1 480 m/s · air ≈ 340 m/s'));
    },
    'ut-probes'(g, w, h, t) {
      const top = h * 0.42, th = h * 0.32; plate(g, 10, top, w - 20, th);
      const xs = [0.14, 0.38, 0.62, 0.86].map((f) => f * w), lab = [L('Straight 0°', 'Droit 0°'), L('Dual (TR)', 'Double (TR)'), L('Angle 60°', 'Angle 60°'), L('Phased array', 'Multi-éléments')];
      const ph = (t % 2) / 2;
      xs.forEach((x, i) => {
        probe(g, x, top); txt(g, lab[i], x, top - 58, C.text, 12, 'center');
        g.strokeStyle = 'rgba(255,225,77,.6)'; g.lineWidth = 3;
        if (i === 0) { g.beginPath(); g.moveTo(x, top); g.lineTo(x, top + th * ph); g.stroke(); }
        if (i === 1) { g.beginPath(); g.moveTo(x - 6, top); g.lineTo(x, top + th * 0.5 * ph); g.lineTo(x + 6, top); g.stroke(); }
        if (i === 2) { g.beginPath(); g.moveTo(x, top); g.lineTo(x + th * 1.4 * ph * 0.866, top + th * ph * 0.95); g.stroke(); }
        if (i === 3) { const a = Math.sin(t * 1.5) * 0.7; g.beginPath(); g.moveTo(x, top); g.lineTo(x + Math.sin(a) * th * ph, top + Math.cos(a) * th * ph); g.stroke(); for (let k = -3; k <= 3; k++) { g.fillStyle = '#9fd0ff'; g.fillRect(x + k * 4 - 1, top - 3, 2, 3); } }
      });
      cap(g, w, h, L('Probe type follows the job: plates, thin walls, welds, electronic steering.', 'Le type de traducteur suit le travail : tôles, parois minces, soudures, orientation électronique.'));
    },
    'ut-angle'(g, w, h, t) {
      const top = h * 0.32, th = h * 0.3, x0 = w * 0.12, ang = rad(60), skip = 2 * th * Math.tan(ang);
      plate(g, 10, top, w - 20, th);
      g.save(); g.translate(x0, top); g.fillStyle = 'rgba(216,160,80,.8)'; g.beginPath(); g.moveTo(-22, 0); g.lineTo(26, 0); g.lineTo(26, -16); g.lineTo(-22, -34); g.closePath(); g.fill(); g.fillStyle = '#2e6bd1'; g.save(); g.rotate(-0.36); g.fillRect(-22, -48, 40, 18); g.restore(); g.restore();
      const pts = [[x0, top], [x0 + th * Math.tan(ang), top + th], [x0 + skip, top], [x0 + skip * 1.5, top + th]];
      g.strokeStyle = 'rgba(255,225,77,.55)'; g.lineWidth = 3; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      dot(g, along(pts, (t % 3) / 3), C.beam);
      g.setLineDash([4, 4]); g.strokeStyle = C.mut; g.beginPath(); g.moveTo(x0, top); g.lineTo(x0, top + th); g.stroke(); g.setLineDash([]);
      txt(g, 'θ = 60°', x0 + 8, top + 34, C.beam); txt(g, L('leg 1', 'parcours 1'), x0 + th * 0.55, top + th * 0.62, C.text); txt(g, L('leg 2', 'parcours 2'), x0 + skip * 0.72, top + th * 0.62, C.text);
      arrow(g, x0, top + th + 18, x0 + skip, top + th + 18, C.echo, 1.5); txt(g, L('skip = 2·T·tan θ', 'bond = 2·T·tan θ'), x0 + skip / 2, top + th + 36, C.echo, 12, 'center');
      cap(g, w, h, L('The wedge refracts the beam (Snell’s law); it then bounces between the walls.', 'Le sabot réfracte le faisceau (loi de Snell) ; il rebondit ensuite entre les parois.'));
    },
    'ut-couplant'(g, w, h, t) {
      const ph = (t % 2.4) / 2.4, top = h * 0.4, th = h * 0.28;
      [[0.06, L('Air gap', 'Lame d’air'), false], [0.54, L('With couplant', 'Avec couplant'), true]].forEach(([xf, label, ok]) => {
        const x = w * xf, ww = w * 0.4, px = x + ww / 2; plate(g, x, top, ww, th);
        if (ok) { g.fillStyle = 'rgba(80,180,255,.45)'; g.fillRect(px - 26, top - 5, 52, 5); } else { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(px - 26, top - 7, 52, 7); }
        probe(g, px, top - (ok ? 5 : 7)); txt(g, label, px, top - 62, C.text, 13, 'center');
        if (ok) { dot(g, [px, top + th * (ph < 0.5 ? ph * 2 : 2 - ph * 2)], C.beam); txt(g, L('✓ sound enters, echo returns', '✓ le son entre, l’écho revient'), px, top + th + 22, C.echo, 12, 'center'); }
        else { dot(g, [px, top - 7 + (ph < 0.5 ? ph * 10 : (1 - ph) * 10) - 5], C.red); txt(g, L('✗ reflected at the air gap: no signal', '✗ réfléchi sur la lame d’air : pas de signal'), px, top + th + 22, C.red, 12, 'center'); }
      });
      cap(g, w, h, L('Steel/air reflects almost 100 %: couplant removes the air.', 'Acier/air réfléchit presque 100 % : le couplant supprime l’air.'));
    },
    'ut-block'(g, w, h, t) {
      const x = 30, y = h * 0.28, bw = w * 0.5, bh = h * 0.42, R = bh * 0.95;
      g.fillStyle = C.steel; g.beginPath(); g.moveTo(x, y); g.lineTo(x + bw - R, y); g.arc(x + bw - R, y + bh, R, -Math.PI / 2, 0); g.lineTo(x, y + bh); g.closePath(); g.fill();
      g.fillStyle = 'rgba(216,160,80,.7)'; g.beginPath(); g.arc(x + bw * 0.25, y + bh * 0.55, bh * 0.22, 0, TAU); g.fill(); txt(g, 'Perspex', x + bw * 0.25, y + bh * 0.58, '#222', 10, 'center');
      g.fillStyle = '#000'; g.beginPath(); g.arc(x + bw * 0.12, y + bh * 0.3, 3, 0, TAU); g.fill();
      const cx = x + bw - R, cy = y + bh, sweep = Math.sin(t * 0.9) * 0.18, px = cx + Math.cos(-Math.PI / 2 + 0.0) * 0; probe(g, cx + sweep * 60, y, 0);
      const peak = Math.exp(-Math.pow(sweep / 0.06, 2));
      g.strokeStyle = 'rgba(255,225,77,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + sweep * 60, y); g.lineTo(cx + sweep * 60 + R * 0.5, y + R * 0.866); g.stroke();
      txt(g, 'R 100 mm', cx + R * 0.45, y + bh * 0.55, C.text, 12);
      ascan(g, w * 0.62, h * 0.22, w * 0.34, h * 0.5, [[0.5, 0.9 * peak], [1, 0.4 * peak]], t); txt(g, '100 mm', w * 0.62 + w * 0.17, h * 0.2, C.echo, 11, 'center');
      cap(g, w, h, L('Move the probe to maximise the 100 mm echo: range and probe index are set.', 'Déplacez le traducteur pour maximiser l’écho à 100 mm : base de temps et point d’émergence réglés.'));
    },
    'ut-ascan'(g, w, h, t) {
      const x = 30, y = h * 0.16, aw = w - 60, ah = h * 0.56, grow = ease(clamp((t % 6) / 2, 0, 1));
      ascan(g, x, y, aw, ah, [[0.03, 1], [0.45, 0.55 * grow], [0.88, 0.8]], t, { gate: [0.35, 0.6] });
      const lab = [[0.03, L('initial pulse', 'émission')], [0.45, L('defect echo (in gate)', 'écho de défaut (dans la porte)')], [0.88, L('back wall', 'fond')]];
      lab.forEach(([f, s]) => { arrow(g, x + aw * f, y + ah + 26, x + aw * f, y + ah + 6, C.mut, 1.5); txt(g, s, x + aw * f, y + ah + 40, C.text, 12, f < 0.1 ? 'left' : f > 0.8 ? 'right' : 'center'); });
      txt(g, L('% FSH', '% écran'), x - 24, y + 10, C.mut, 11); txt(g, L('sound path →', 'parcours →'), x + aw - 80, y - 6, C.mut, 11);
      cap(g, w, h, L('Horizontal = where (sound path). Vertical = how strong (amplitude).', 'Horizontal = où (parcours). Vertical = quelle force (amplitude).'));
    },
    'ut-soundpath'(g, w, h, t, s) {
      const ang = rad(s.angle), T = s.T, S = s.S, D = S * Math.cos(ang), leg = Math.floor(D / T), depth = leg % 2 === 0 ? D - leg * T : (leg + 1) * T - D, surf = S * Math.sin(ang);
      const scale = Math.min((w - 80) / Math.max(surf + 20, 2 * T * Math.tan(ang) + 20), (h - 90) / (T + 10)), x0 = 40, top = 40;
      plate(g, 10, top, w - 20, T * scale);
      probe(g, x0, top);
      g.strokeStyle = 'rgba(255,225,77,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, top);
      let x = x0, z = 0, left = S, down = true;
      while (left > 0.01) { const dz = down ? T - z : z, seg = Math.min(left, dz / Math.cos(ang)); x += seg * Math.sin(ang) * scale; z += (down ? 1 : -1) * seg * Math.cos(ang); left -= seg; g.lineTo(x, top + z * scale); down = !down; }
      g.stroke(); dot(g, [x, top + z * scale], C.red, 6);
      g.setLineDash([4, 4]); g.strokeStyle = C.echo; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, top); g.lineTo(x, top + depth * scale); g.moveTo(x0, top - 10); g.lineTo(x, top - 10); g.stroke(); g.setLineDash([]);
      txt(g, `d = ${depth.toFixed(1)} mm`, x + 8, top + depth * scale / 2, C.echo, 13); txt(g, `${L('surface', 'surface')} = ${surf.toFixed(1)} mm`, (x0 + x) / 2, top - 16, C.echo, 13, 'center');
      cap(g, w, h, leg % 2 === 0 ? `${L('Leg', 'Parcours')} ${leg + 1}: d = S·cos θ − ${leg}·T = ${S}·cos ${s.angle}° ${leg ? '− ' + leg * T : ''} = ${depth.toFixed(1)} mm` : `${L('Leg', 'Parcours')} ${leg + 1}: d = ${leg + 1}·T − S·cos θ = ${(leg + 1) * T} − ${(S * Math.cos(ang)).toFixed(1)} = ${depth.toFixed(1)} mm`);
    },
    'ut-defects'(g, w, h, t) {
      const jit = (k) => 0.5 + 0.5 * Math.sin(t * 3 + k);
      ascan(g, 20, h * 0.18, w / 2 - 30, h * 0.5, [[0.42, 0.55 + 0.3 * jit(0)], [0.48, 0.4 + 0.4 * jit(2)], [0.54, 0.35 + 0.35 * jit(4)]], t);
      ascan(g, w / 2 + 10, h * 0.18, w / 2 - 30, h * 0.5, [[0.48, 0.6 + 0.05 * jit(0), 0.02]], t);
      txt(g, L('Crack: jagged, peaks move', 'Fissure : dentelé, pics mobiles'), w / 4, h * 0.14, C.red, 13, 'center'); txt(g, L('Pore: one smooth peak', 'Pore : un pic lisse'), w * 0.75, h * 0.14, C.echo, 13, 'center');
      cap(g, w, h, L('Shape and dynamics help separate planar from volumetric defects.', 'Forme et dynamique aident à séparer défauts plans et volumiques.'));
    },
    'rt-principle'(g, w, h, t) {
      const sx = w / 2, sy = 30, top = h * 0.42, th = 26, fy = h * 0.72;
      g.fillStyle = '#e8c33a'; g.fillRect(sx - 14, sy - 10, 28, 16); txt(g, L('source', 'source'), sx + 20, sy + 2, C.text);
      plate(g, 40, top, w - 80, th); g.fillStyle = C.air; g.beginPath(); g.ellipse(w * 0.62, top + th / 2, 10, 6, 0, 0, TAU); g.fill();
      const fill = ease(clamp((t % 5) / 3, 0, 1));
      g.fillStyle = C.film; g.fillRect(40, fy, w - 80, 22);
      const grd = g.createLinearGradient(40, 0, w - 40, 0); g.fillStyle = `rgba(20,20,24,${0.6 * fill})`; g.fillRect(40, fy, w - 80, 22); g.fillStyle = `rgba(0,0,0,${0.9 * fill})`; g.fillRect(w * 0.62 - 10, fy, 20, 22);
      for (let i = 0; i < 9; i++) { const x = 60 + i * (w - 120) / 8, p = ((t * 0.7 + i * 0.13) % 1); g.strokeStyle = 'rgba(255,225,77,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, fy); g.stroke(); const yy = sy + (fy - sy) * p, xx = sx + (x - sx) * p; dot(g, [xx, yy], C.beam, yy > top && yy < top + th ? 2 : 3); }
      txt(g, L('film', 'film'), 44, fy + 38, C.mut); txt(g, L('pore → darker spot', 'soufflure → tache plus sombre'), w * 0.62, fy + 38, C.red, 12, 'center');
      cap(g, w, h, L('Less metal on the path → more radiation reaches the film → darker.', 'Moins de métal sur le trajet → plus de rayonnement sur le film → plus sombre.'));
    },
    'rt-xgamma'(g, w, h, t) {
      const L1 = w * 0.25, L2 = w * 0.75, y = h * 0.42;
      g.fillStyle = '#5b6680'; g.fillRect(L1 - 70, y - 30, 140, 60); g.fillStyle = '#b8c4dc'; g.fillRect(L1 + 40, y - 12, 20, 24);
      for (let i = 0; i < 5; i++) { const p = (t * 1.5 + i / 5) % 1; dot(g, [L1 - 55 + p * 95, y + (i - 2) * 4], C.blue, 3); }
      for (let i = -2; i <= 2; i++) arrow(g, L1 + 52, y + 12, L1 + 52 + i * 18, y + 80, 'rgba(255,225,77,.7)', 1.5);
      txt(g, L('X-ray tube: electrons (kV) hit a target', 'Tube X : électrons (kV) sur une cible'), L1, y - 44, C.text, 12, 'center'); txt(g, L('switch off = no radiation', 'éteint = aucun rayonnement'), L1, y + 100, C.echo, 12, 'center');
      g.fillStyle = '#e2b52c'; g.beginPath(); g.arc(L2, y, 34, 0, TAU); g.fill(); txt(g, '☢', L2, y + 8, '#111', 22, 'center');
      const out = (Math.sin(t) + 1) / 2; g.strokeStyle = '#222'; g.lineWidth = 4; g.beginPath(); g.moveTo(L2 + 34, y); g.lineTo(L2 + 34 + 70, y + 30); g.stroke(); dot(g, [L2 + 34 + 70 * out, y + 30 * out], C.red, 5);
      txt(g, L('Gamma source (Ir-192): always emitting', 'Source gamma (Ir-192) : émet toujours'), L2, y - 50, C.text, 12, 'center'); txt(g, L('stored shielded, wound out to expose', 'rangée blindée, sortie pour exposer'), L2, y + 100, C.red, 12, 'center');
      cap(g, w, h, L('X-ray: kV = penetration, mA × time = quantity. Gamma half-life: Ir-192 ≈ 74 days.', 'X : kV = pénétration, mA × temps = quantité. Période gamma : Ir-192 ≈ 74 jours.'));
    },
    'rt-film'(g, w, h, t) {
      const steps = [L('Developer', 'Révélateur'), L('Stop', 'Arrêt'), L('Fixer', 'Fixateur'), L('Wash', 'Lavage'), L('Dry', 'Séchage')], k = Math.floor(t % 5);
      steps.forEach((s, i) => { const x = 20 + i * (w * 0.55 - 20) / 5; g.fillStyle = i === k ? '#3d6fd1' : '#24324f'; g.fillRect(x, h * 0.3, (w * 0.55 - 40) / 5, 50); txt(g, s, x + (w * 0.55 - 40) / 10, h * 0.3 + 30, C.text, 11, 'center'); });
      txt(g, L('Film: darkroom processing', 'Film : développement en chambre noire'), 20, h * 0.24, C.text, 13);
      const px = w * 0.62, pw = w * 0.34; g.fillStyle = '#1b2333'; g.fillRect(px, h * 0.25, pw, h * 0.32); g.fillStyle = '#5c6a7e'; g.fillRect(px + 10, h * 0.3, pw - 20, h * 0.22);
      const scan = (t % 2) / 2; g.fillStyle = 'rgba(77,179,255,.4)'; g.fillRect(px + 10, h * 0.3 + scan * h * 0.22, pw - 20, 3);
      txt(g, L('Digital (CR/DR): image on screen', 'Numérique (CR/DR) : image à l’écran'), px, h * 0.22, C.text, 13);
      cap(g, w, h, L('Both must show ID, markers and IQI sensitivity before interpretation.', 'Les deux doivent montrer ID, repères et sensibilité IQI avant interprétation.'));
    },
    'rt-iqi'(g, w, h, t) {
      g.fillStyle = '#41464f'; g.fillRect(30, h * 0.18, w - 60, h * 0.5);
      const ds = [0.81, 0.64, 0.51, 0.41, 0.33, 0.25], ess = 4;
      ds.forEach((d, i) => { const x = 80 + i * (w - 160) / 5, vis = i <= ess ? 0.65 - i * 0.08 : 0.08 + 0.04 * Math.sin(t * 2); g.strokeStyle = `rgba(240,240,240,${vis})`; g.lineWidth = Math.max(1, d * 8); g.beginPath(); g.moveTo(x, h * 0.22); g.lineTo(x, h * 0.64); g.stroke(); txt(g, String(11 - i), x, h * 0.72, i === ess ? C.echo : C.mut, 12, 'center'); });
      const ex = 80 + ess * (w - 160) / 5; g.strokeStyle = C.echo; g.lineWidth = 2; g.strokeRect(ex - 12, h * 0.2, 24, h * 0.46);
      txt(g, L('essential wire visible ✓', 'fil essentiel visible ✓'), ex, h * 0.82, C.echo, 13, 'center');
      cap(g, w, h, L('Thinner wires fade out: the essential one must stay visible.', 'Les fils fins disparaissent : le fil essentiel doit rester visible.'));
    },
    'rt-interp'(g, w, h, t) {
      g.fillStyle = '#f2efe4'; g.fillRect(14, h * 0.18, w - 28, h * 0.52); g.fillStyle = '#3c4048'; g.fillRect(24, h * 0.24, w - 48, h * 0.4); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(24, h * 0.38, w - 48, h * 0.12);
      g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(w * 0.42, h * 0.44, 7, 5, 0, 0, TAU); g.fill(); g.fillRect(w * 0.7, h * 0.43, 40, 3);
      const mx = 40 + ((t * 60) % (w - 80)); g.strokeStyle = '#cfe0ff'; g.lineWidth = 3; g.beginPath(); g.arc(mx, h * 0.44, 30, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(mx + 21, h * 0.44 + 21); g.lineTo(mx + 40, h * 0.44 + 40); g.stroke();
      ['ID', 'B', L('density', 'densité'), 'IQI', L('artefacts', 'artefacts'), L('scan', 'examen'), L('measure', 'mesure')].forEach((s, i) => { txt(g, (t % 7 > i ? '✓ ' : '○ ') + s, 20 + i * (w - 40) / 7, h * 0.12, t % 7 > i ? C.echo : C.mut, 12); });
      cap(g, w, h, L('Quality checks first, then a systematic scan of the whole weld.', 'D’abord les contrôles de qualité, puis l’examen méthodique de toute la soudure.'));
    },
    'rt-indications'(g, w, h, t) {
      g.fillStyle = '#3c4048'; g.fillRect(14, h * 0.24, w - 28, h * 0.36); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(14, h * 0.36, w - 28, h * 0.12);
      const n = Math.floor(t % 7), y = h * 0.42, list = [
        [0.1, L('porosity', 'soufflure'), (x) => { g.fillStyle = 'rgba(0,0,0,.7)'; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }],
        [0.24, L('slag', 'laitier'), (x) => { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x - 14, y - 3, 28, 5); }],
        [0.38, L('crack', 'fissure'), (x) => { g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 16, y); for (let i = 0; i < 8; i++) g.lineTo(x - 16 + i * 4, y + (i % 2 ? 2 : -2)); g.stroke(); }],
        [0.52, L('lack of fusion', 'manque de fusion'), (x) => { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(x - 18, h * 0.365, 36, 2); }],
        [0.66, L('incompl. penetration', 'manque de pénétr.'), (x) => { g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(x - 18, y - 1, 36, 3); }],
        [0.8, L('tungsten (light)', 'tungstène (clair)'), (x) => { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }],
        [0.92, L('undercut', 'caniveau'), (x) => { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x - 14, h * 0.36, 28, 3); }]];
      list.forEach(([f, s, d], i) => { if (i > n) return; d(f * w); txt(g, s, f * w, h * 0.7 + (i % 2) * 16, C.text, 11, 'center'); });
      cap(g, w, h, L('Dark = less material · Light = denser material.', 'Sombre = moins de matière · Clair = matière plus dense.'));
    },
    'mt-principle'(g, w, h, t) {
      const top = h * 0.4, th = 34; plate(g, 30, top, w - 60, th);
      g.fillStyle = C.air; g.fillRect(w / 2 - 2, top, 4, 16);
      for (let k = 0; k < 4; k++) { const y = top + 6 + k * 7; g.strokeStyle = 'rgba(77,179,255,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(40, y); if (y < top + 18) { g.lineTo(w / 2 - 12, y); g.quadraticCurveTo(w / 2, top - 22 - k * 6, w / 2 + 12, y); } g.lineTo(w - 40, y); g.stroke(); const p = ((t * 0.3 + k * 0.2) % 1); dot(g, [40 + (w - 80) * p, y], C.blue, 2.5); }
      const pile = ease(clamp((t % 6) / 4, 0, 1)); for (let i = 0; i < 26; i++) { const a = (i * 2.4) % 1, fall = clamp(pile * 1.4 - a * 0.4, 0, 1); dot(g, [w / 2 - 14 + (i % 9) * 3.5 + (1 - fall) * (i % 5 - 2) * 20, top - 60 + fall * 58 - (i % 3) * 2], '#cfcfcf', 2); }
      txt(g, 'N', w / 2 - 22, top - 8, C.red, 12); txt(g, 'S', w / 2 + 14, top - 8, C.blue, 12); txt(g, L('leakage field over the crack', 'champ de fuite au-dessus de la fissure'), w / 2, top - 70, C.text, 12, 'center');
      cap(g, w, h, L('The crack blocks the flux, which leaks out and holds the particles.', 'La fissure bloque le flux, qui fuit et retient les particules.'));
    },
    'mt-methods'(g, w, h, t) {
      const k = Math.floor((t / 3) % 3), cx = w / 2, cy = h * 0.5, names = [L('Yoke: longitudinal field', 'Yoke : champ longitudinal'), L('Prods: circular field around the current', 'Électrodes : champ circulaire autour du courant'), L('Coil: field along the axis', 'Bobine : champ selon l’axe')];
      plate(g, 40, cy - 14, w - 80, 28);
      if (k === 0) { g.fillStyle = '#c63a3a'; g.fillRect(cx - 90, cy - 80, 20, 66); g.fillRect(cx + 70, cy - 80, 20, 66); g.fillRect(cx - 90, cy - 90, 180, 16); for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(77,179,255,.7)'; g.beginPath(); g.ellipse(cx, cy - 4, 70, 6 + i * 4, 0, 0, Math.PI); g.stroke(); } }
      if (k === 1) { g.fillStyle = '#ddd'; g.fillRect(cx - 80, cy - 70, 8, 58); g.fillRect(cx + 72, cy - 70, 8, 58); arrow(g, cx - 76, cy - 12, cx + 76, cy - 12, C.beam, 2); for (let i = 1; i <= 3; i++) { g.strokeStyle = 'rgba(77,179,255,.7)'; g.beginPath(); g.ellipse(cx, cy - 12, i * 12, i * 7, 0, 0, TAU); g.stroke(); } }
      if (k === 2) { for (let i = 0; i < 9; i++) { g.strokeStyle = '#c9803c'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx - 60 + i * 15, cy, 6, 30, 0, 0, TAU); g.stroke(); } g.lineWidth = 1.5; for (let i = -1; i <= 1; i++) arrow(g, cx - 120, cy + i * 8, cx + 120, cy + i * 8, 'rgba(77,179,255,.8)', 1.5); }
      txt(g, names[k], cx, h * 0.18, C.text, 14, 'center');
      cap(g, w, h, L('AC: surface defects · DC: slightly deeper (near-surface).', 'CA : défauts de surface · CC : un peu plus profond (sous-jacents).'));
    },
    'mt-particles'(g, w, h, t) {
      const uv = Math.floor(t / 4) % 2 === 1, top = h * 0.5;
      g.fillStyle = uv ? '#05060c' : 'transparent'; if (uv) g.fillRect(0, 0, w, h);
      plate(g, 30, top, w - 60, 30, uv ? '#1a1d26' : '#e9e9e9');
      for (let i = 0; i < 60; i++) { const x = 40 + (i * 37) % (w - 80), p = ((t * 0.5 + i * 0.07) % 1); const near = Math.abs(x - w / 2) < 30; const fx = near ? x + (w / 2 - x) * ease(p) : x; dot(g, [fx, top - 50 + p * 50], uv ? '#c8ff3c' : '#222', near && p > 0.8 ? 2.6 : 1.6); }
      if (uv) { g.strokeStyle = 'rgba(200,255,60,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 - 20, top + 2); g.lineTo(w / 2 + 20, top + 2); g.stroke(); }
      txt(g, uv ? L('Wet fluorescent under UV-A (dark area)', 'Humide fluorescente sous UV-A (zone sombre)') : L('Wet visible: black ink on white contrast paint', 'Humide visible : encre noire sur peinture blanche'), w / 2, h * 0.2, uv ? '#c8ff3c' : C.text, 14, 'center');
      cap(g, w, h, L('Apply particles gently while the field is on.', 'Appliquer les particules en douceur pendant l’aimantation.'));
    },
    'mt-direction'(g, w, h, t) {
      const a = (t * 0.4) % Math.PI, cx = w / 2, cy = h * 0.48;
      g.fillStyle = '#e9e9e9'; g.fillRect(40, cy - 70, w - 80, 140);
      for (let i = -3; i <= 3; i++) { const dx = Math.cos(a) * 160, dy = Math.sin(a) * 160, ox = -Math.sin(a) * i * 18, oy = Math.cos(a) * i * 18; arrow(g, cx - dx / 2 + ox, cy - dy / 2 + oy, cx + dx / 2 + ox, cy + dy / 2 + oy, 'rgba(77,140,255,.5)', 1.2); }
      [[-0.32, 0], [0, Math.PI / 4], [0.32, Math.PI / 2]].forEach(([xf, ca]) => { const x = cx + xf * w, vis = Math.abs(Math.sin(ca - a)); g.strokeStyle = `rgba(20,20,20,${0.15 + 0.85 * vis})`; g.lineWidth = 2 + 4 * vis; g.beginPath(); g.moveTo(x - Math.cos(ca) * 30, cy - Math.sin(ca) * 30); g.lineTo(x + Math.cos(ca) * 30, cy + Math.sin(ca) * 30); g.stroke(); });
      txt(g, L('Field direction rotates: each crack shows when it is across the field', 'La direction du champ tourne : chaque fissure apparaît quand elle est en travers'), cx, h * 0.12, C.text, 12, 'center');
      cap(g, w, h, L('Crack ⟂ field: strong. Crack ∥ field: invisible. → test in 2 directions.', 'Fissure ⟂ champ : nette. Fissure ∥ champ : invisible. → 2 directions.'));
    },
    'mt-interp'(g, w, h, t) {
      g.fillStyle = '#e9e9e9'; g.fillRect(20, h * 0.2, w - 40, h * 0.46); g.fillStyle = '#d4d4d4'; g.fillRect(20, h * 0.36, w - 40, h * 0.14);
      const k = Math.floor(t % 6);
      if (k >= 0) { g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.15, h * 0.43); g.lineTo(w * 0.27, h * 0.44); g.stroke(); txt(g, L('relevant: sharp line', 'pertinente : ligne nette'), w * 0.21, h * 0.74, C.echo, 12, 'center'); }
      if (k >= 2) { g.strokeStyle = 'rgba(17,17,17,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.38, h * 0.36); g.lineTo(w * 0.62, h * 0.36); g.stroke(); txt(g, L('non-relevant: weld toe', 'non pertinente : pied de cordon'), w * 0.5, h * 0.74, C.beam, 12, 'center'); }
      if (k >= 4) { g.strokeStyle = 'rgba(17,17,17,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.72, h * 0.25); g.lineTo(w * 0.88, h * 0.6); g.stroke(); txt(g, L('false: scratch', 'fausse : rayure'), w * 0.8, h * 0.74, C.red, 12, 'center'); }
      cap(g, w, h, L('Linear = length > 3 × width. Re-test when in doubt, then demagnetise if required.', 'Linéaire = longueur > 3 × largeur. Recontrôler en cas de doute, puis désaimanter si exigé.'));
    },
    'pt-types'(g, w, h, t) {
      plate(g, 20, h * 0.35, w / 2 - 30, 60, '#f0f0f0'); g.strokeStyle = '#d0202c'; g.lineWidth = 4; g.beginPath(); g.moveTo(60, h * 0.35 + 30); g.lineTo(w / 2 - 50, h * 0.35 + 34); g.stroke();
      g.fillStyle = '#05060c'; g.fillRect(w / 2 + 10, h * 0.25, w / 2 - 30, h * 0.5); plate(g, w / 2 + 20, h * 0.35, w / 2 - 50, 60, '#1a1d26');
      g.shadowColor = '#b6ff3c'; g.shadowBlur = 12 + 6 * Math.sin(t * 3); g.strokeStyle = '#c8ff3c'; g.beginPath(); g.moveTo(w / 2 + 50, h * 0.35 + 30); g.lineTo(w - 60, h * 0.35 + 34); g.stroke(); g.shadowBlur = 0;
      txt(g, L('Type II visible (red) – white light', 'Type II visible (rouge) – lumière blanche'), w / 4, h * 0.25, C.text, 12, 'center'); txt(g, L('Type I fluorescent – UV-A, dark area', 'Type I fluorescent – UV-A, zone sombre'), w * 0.75, h * 0.2, '#c8ff3c', 12, 'center');
      cap(g, w, h, L('Removal: water-washable · post-emulsifiable · solvent-removable.', 'Élimination : lavable à l’eau · post-émulsifiable · au solvant.'));
    },
    'pt-steps'(g, w, h, t, s) {
      // cross-section of a crack through the 4 stages; the module's own stage is highlighted and lasts longer
      const stages = [L('1 Clean & dry', '1 Nettoyer & sécher'), L('2 Penetrant + dwell', '2 Pénétrant + attente'), L('3 Remove excess', '3 Éliminer l’excès'), L('4 Developer', '4 Révélateur')];
      const cyc = t % 12, k = Math.min(3, Math.floor(cyc / 3)), p = (cyc % 3) / 3, top = h * 0.42, cx = w / 2;
      stages.forEach((n, i) => { g.fillStyle = i === k ? (i === s.stage ? '#7657e8' : '#3d6fd1') : (i === s.stage ? 'rgba(118,87,232,.35)' : '#24324f'); g.fillRect(14 + i * (w - 28) / 4, 14, (w - 28) / 4 - 6, 30); txt(g, n, 14 + i * (w - 28) / 4 + ((w - 28) / 4 - 6) / 2, 34, C.text, 12, 'center'); });
      plate(g, 20, top, w - 40, h * 0.3);
      g.fillStyle = C.bg; g.beginPath(); g.moveTo(cx - 6, top); g.lineTo(cx + 6, top); g.lineTo(cx + 1, top + h * 0.22); g.lineTo(cx - 1, top + h * 0.22); g.closePath(); g.fill();
      if (k === 0) { for (let i = 0; i < 12; i++) { const x = 40 + i * (w - 80) / 11; g.fillStyle = `rgba(110,80,40,${0.8 * (1 - p)})`; g.fillRect(x, top - 4, 16, 4); } g.fillStyle = `rgba(110,80,40,${0.8 * (1 - p)})`; g.fillRect(cx - 4, top, 8, h * 0.1); }
      if (k >= 1) { const lvl = k === 1 ? ease(p) : 1; g.fillStyle = '#d0202c'; g.beginPath(); g.moveTo(cx - 6 + 5 * (1 - lvl) * 0, top); g.lineTo(cx + 6, top); g.lineTo(cx + 1, top + h * 0.22 * lvl); g.lineTo(cx - 1, top + h * 0.22 * lvl); g.closePath(); g.fill(); }
      if (k === 1) { g.fillStyle = 'rgba(208,32,44,.8)'; g.fillRect(20, top - 5, w - 40, 5); }
      if (k === 2) { g.fillStyle = `rgba(208,32,44,${0.8 * (1 - p)})`; g.fillRect(20, top - 5, w - 40, 5); const wx = 40 + p * (w - 120); g.fillStyle = '#eee'; g.fillRect(wx, top - 18, 60, 12); }
      if (k === 3) { g.fillStyle = 'rgba(245,245,245,.95)'; g.fillRect(20, top - 7, w - 40, 7); const r = 6 + 22 * ease(p); const gr = g.createRadialGradient(cx, top - 4, 0, cx, top - 4, r); gr.addColorStop(0, 'rgba(208,32,44,.95)'); gr.addColorStop(1, 'rgba(208,32,44,0)'); g.fillStyle = gr; g.fillRect(cx - r, top - 8, 2 * r, 8); }
      txt(g, L('crack', 'fissure'), cx + 14, top + h * 0.18, C.mut, 11);
      cap(g, w, h, [L('Remove dirt, oil, paint and water so the crack is empty.', 'Retirer saleté, huile, peinture et eau : la fissure doit être vide.'), L('Capillarity draws the penetrant into the crack during dwell.', 'La capillarité aspire le pénétrant dans la fissure pendant l’attente.'), L('Wipe the surface only; the crack keeps its penetrant.', 'Essuyer la surface seulement ; la fissure garde son pénétrant.'), L('The developer blots the penetrant out: a red line on white.', 'Le révélateur aspire le pénétrant : une ligne rouge sur blanc.')][k]);
    },
    'pt-interp'(g, w, h, t) {
      g.fillStyle = '#f2f2f2'; g.fillRect(20, h * 0.18, w - 40, h * 0.5);
      const grow = 0.6 + 0.4 * ease(clamp((t % 4) / 2, 0, 1));
      g.fillStyle = 'rgba(208,32,44,.85)'; g.beginPath(); g.ellipse(w * 0.3, h * 0.43, 70 * grow, 6 * grow, 0, 0, TAU); g.fill();
      for (const [x, r] of [[0.62, 9], [0.7, 6], [0.77, 8]]) { g.beginPath(); g.arc(w * x, h * 0.43, r * grow, 0, TAU); g.fill(); }
      txt(g, L('LINEAR: length > 3 × width', 'LINÉAIRE : longueur > 3 × largeur'), w * 0.3, h * 0.6, '#a01020', 13, 'center'); txt(g, L('ROUNDED: length ≤ 3 × width', 'ARRONDIE : longueur ≤ 3 × largeur'), w * 0.7, h * 0.6, '#a01020', 13, 'center');
      cap(g, w, h, L('The bleed-out grows with time and is larger than the real defect.', 'Le ressuage grandit avec le temps et dépasse la taille réelle du défaut.'));
    },
    'vt-principle'(g, w, h, t) {
      plate(g, 30, h * 0.66, w - 60, 26); g.fillStyle = C.weld; g.beginPath(); g.ellipse(w * 0.6, h * 0.66, 40, 8, 0, Math.PI, TAU); g.fill();
      const a = rad(30 + 25 * (0.5 + 0.5 * Math.sin(t * 0.8))), ex = w * 0.6 - Math.cos(a) * 200, ey = h * 0.66 - Math.sin(a) * 200;
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, ey, 14, 9, 0, 0, TAU); g.fill(); g.fillStyle = '#123'; g.beginPath(); g.arc(ex + 3, ey + 2, 5, 0, TAU); g.fill();
      g.setLineDash([5, 4]); g.strokeStyle = C.beam; g.beginPath(); g.moveTo(ex, ey); g.lineTo(w * 0.6, h * 0.66); g.stroke(); g.setLineDash([]);
      txt(g, `${Math.round(a * 180 / Math.PI)}° ${L('to the surface', 'par rapport à la surface')}`, w * 0.6 - 120, h * 0.6, C.beam, 12); txt(g, L('≤ 600 mm, ≥ 30° (ASME V)', '≤ 600 mm, ≥ 30° (ASME V)'), w * 0.6 - 120, h * 0.6 + 16, C.echo, 12);
      cap(g, w, h, L('Direct VT: close and not too flat. Otherwise: mirror, borescope, camera.', 'VT direct : proche et pas trop rasant. Sinon : miroir, endoscope, caméra.'));
    },
    'vt-light'(g, w, h, t) {
      const la = rad(15 + 60 * (0.5 + 0.5 * Math.sin(t * 0.7))), top = h * 0.62;
      plate(g, 20, top, w - 40, 28);
      const lx = w / 2 - Math.cos(la) * 230, ly = top - Math.sin(la) * 230; dot(g, [lx, ly], '#ffd66b', 9);
      for (let i = 0; i < 5; i++) { const x = w / 2 - 50 + i * 25; g.fillStyle = C.weld; g.beginPath(); g.arc(x, top, 9, Math.PI, TAU); g.fill(); const sh = Math.max(0, 30 * Math.cos(la)); g.fillStyle = `rgba(0,0,0,${0.5 * Math.cos(la)})`; g.fillRect(x + 6, top - 3, sh, 3); }
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(w / 2 + 70, top - 2, 26, 3); txt(g, L('undercut', 'caniveau'), w / 2 + 83, top + 44, C.text, 11, 'center');
      const lux = Math.round(1400 * Math.sin(la)); txt(g, `☀ ${lux} lux ${lux >= 1000 ? '✓ ASME V' : lux >= 500 ? '✓ ISO 17637' : '✗'}`, 20, 30, lux >= 1000 ? C.echo : lux >= 500 ? C.beam : C.red, 14);
      cap(g, w, h, L('Low (oblique) light casts shadows that reveal relief; check the lux level.', 'Une lumière rasante projette des ombres qui révèlent le relief ; vérifier l’éclairement.'));
    },
    'vt-gauge'(g, w, h, t) {
      const top = h * 0.62; plate(g, 20, top, w - 40, 30); g.fillStyle = C.weld; g.beginPath(); g.ellipse(w / 2, top, 70, 22, 0, Math.PI, TAU); g.fill();
      g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.ellipse(w / 2 + 78, top, 8, 3, 0, 0, Math.PI); g.fill();
      const k = Math.floor(t / 4) % 2, p = ease(clamp((t % 4) / 2, 0, 1));
      g.fillStyle = '#cfd6e0'; g.fillRect(w / 2 - 110, top - 40, 220, 12); g.fillStyle = '#9aa5b8';
      if (k === 0) { const len = 22 * p; g.fillRect(w / 2 - 3, top - 28, 6, len); txt(g, `${L('reinforcement', 'surépaisseur')} ${(2.1 * p).toFixed(1)} mm`, w / 2, top - 52, C.echo, 13, 'center'); }
      else { g.fillRect(w / 2 + 75, top - 28, 6, 28 + 3 * p); txt(g, `${L('undercut', 'caniveau')} ${(0.3 * p).toFixed(1)} mm`, w / 2 + 78, top - 52, C.beam, 13, 'center'); }
      cap(g, w, h, L('Cambridge gauge: reinforcement, undercut, throat, angles. Record value + location.', 'Jauge Cambridge : surépaisseur, caniveau, gorge, angles. Consigner valeur + emplacement.'));
    },
    'vt-weld'(g, w, h, t) {
      const top = h * 0.55, n = Math.floor(t % 7);
      plate(g, 20, top, w / 2 - 22, 50); plate(g, w / 2 + 2, top, w / 2 - 22, 50);
      g.fillStyle = C.weld; g.beginPath(); g.moveTo(w / 2 - 40, top); g.quadraticCurveTo(w / 2, top - 30, w / 2 + 40, top); g.lineTo(w / 2 + 6, top + 50); g.lineTo(w / 2 - 6, top + 50); g.closePath(); g.fill();
      const items = [[w / 2 + 44, top + 2, L('undercut', 'caniveau')], [w / 2 - 50, top - 4, L('overlap', 'débordement')], [w / 2, top - 30, L('reinforcement height', 'surépaisseur')], [w / 2 + 10, top + 20, L('porosity', 'soufflure')], [w / 2 - 70, top - 2, L('spatter', 'projections')], [w / 2, top + 56, L('root', 'racine')]];
      items.forEach(([x, y, s], i) => { if (i > n) return; dot(g, [x, y], C.red, 4); txt(g, s, x, y - 12 - (i % 2) * 12, C.text, 11, 'center'); });
      txt(g, L('Before: bevel, gap, alignment · During: preheat, interpass · After: profile, size, defects', 'Avant : chanfrein, écartement, alignement · Pendant : préchauffage, entre-passes · Après : profil, dimension, défauts'), w / 2, 24, C.mut, 11, 'center');
      cap(g, w, h, L('Compare every observation with the code criteria (e.g. ISO 5817 level).', 'Comparer chaque observation aux critères du code (ex. niveau ISO 5817).'));
    },
    'vt-surface'(g, w, h, t) {
      g.fillStyle = C.steel; g.fillRect(20, h * 0.2, w - 40, h * 0.5); g.fillStyle = C.weld; g.fillRect(20, h * 0.38, w - 40, h * 0.14);
      for (let x = 30; x < w - 30; x += 10) { g.strokeStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.arc(x, h * 0.45, 8, -0.6, 0.6); g.stroke(); }
      const n = Math.floor(t % 6), items = [
        [0.15, () => { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(w * 0.1, h * 0.375, w * 0.1, 3); }, L('undercut', 'caniveau')],
        [0.35, () => { g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(w * 0.35, h * 0.27, 6, 0, TAU); g.fill(); }, L('arc strike', 'amorçage')],
        [0.5, () => { for (let i = 0; i < 7; i++) { g.fillStyle = '#bbb'; g.beginPath(); g.arc(w * (0.45 + (i % 4) * 0.03), h * (0.6 + (i % 3) * 0.03), 2, 0, TAU); g.fill(); } }, L('spatter', 'projections')],
        [0.68, () => { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(w * 0.63, h * 0.44, w * 0.1, 6); }, L('underfill', 'manque d’épaisseur')],
        [0.85, () => { g.fillStyle = 'rgba(0,0,0,.7)'; g.beginPath(); g.arc(w * 0.85, h * 0.45, 4, 0, TAU); g.fill(); }, L('surface pore', 'soufflure débouchante')]];
      items.forEach(([f, d, s], i) => { if (i > n) return; d(); txt(g, s, w * f, h * 0.8, C.text, 12, 'center'); });
      cap(g, w, h, L('Names and numbers: ISO 6520-1 · limits: the applicable code or quality level.', 'Noms et numéros : ISO 6520-1 · limites : code ou niveau de qualité applicable.'));
    }
  };

  /* ============================ UI ============================ */
  const css = `
.cynd-methods { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; } .cynd-methods button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cynd-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
.cynd-list button { text-align: left; padding: 10px 12px; } .cynd-list button.done { border-color: #42c991; } .cynd-list small { display: block; color: var(--muted); }
.cynd-mod { max-width: 900px; } .cynd-mod h2 { margin: 6px 0 8px; }
.cynd-canvas { width: 100%; height: 300px; display: block; border-radius: 10px; border: 1px solid var(--line); background: #0b1530; }
.cynd-ctrl { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 8px 0; font-size: 13px; color: var(--muted); } .cynd-ctrl input[type=range] { accent-color: var(--blue); }
.cynd-out { font-weight: 700; color: #7de2b5; }
.cynd-mod p { line-height: 1.6; } .cynd-mod ol { padding-left: 22px; } .cynd-mod ol li { margin: 6px 0; line-height: 1.5; }
.cynd-keys { border: 1px solid var(--line); border-radius: 9px; padding: 8px 14px; margin: 10px 0; } .cynd-keys li { margin: 4px 0; }
.cynd-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
.cynd-note { color: var(--muted); font-size: 12px; }
@media (max-width: 760px) { .cynd-canvas { height: 230px; } }
`;
  const st = { m: 'UT', id: null, angle: 60, T: 25, S: 40, raf: 0 };
  let api = null, root = null;
  const tryLabel = { 'ut-explore': ['🔬 Experiment on the UT simulator', '🔬 Expérimenter sur le simulateur UT'], 'mt-sim': ['🧲 Try it on the MT simulator', '🧲 Essayer sur le simulateur MT'], 'pt-sim': ['🧪 Try it on the PT simulator', '🧪 Essayer sur le simulateur PT'], anim: ['🎬 See the 3D animation', '🎬 Voir l’animation 3D'], lab: ['🧊 Open the equipment in 3D', '🧊 Ouvrir l’équipement en 3D'], 'ut-lib': ['📟 Try it on the flaw detector', '📟 Essayer sur le détecteur'], 'ut-dac': ['📈 Draw a DAC yourself', '📈 Tracer une DAC vous-même'], 'rt-steps': ['🎞 Animated film interpretation', '🎞 Interprétation de film animée'], 'rt-atlas': ['🎞 Open the film atlas', '🎞 Ouvrir l’atlas film'] };

  function mount(el, a) {
    api = a; root = el;
    if (!document.getElementById('cynd-css')) { const s = document.createElement('style'); s.id = 'cynd-css'; s.textContent = css; document.head.appendChild(s); }
    draw();
  }
  const doneId = (m, id) => 'mod:' + m + ':' + id;
  const methodDone = (m, has) => MODS[m].every((x) => has(doneId(m, x.id)));
  function draw() {
    cancelAnimationFrame(st.raf);
    const methods = Object.keys(MODS);
    let html = '<div class="cynd-methods">' + methods.map((m) => '<button type="button" data-m="' + m + '" class="' + (m === st.m ? 'on' : '') + '">' + m + ' · ' + MODS[m].filter((x) => api.has(doneId(m, x.id))).length + '/' + MODS[m].length + '</button>').join('') + '</div>';
    const mod = st.id && MODS[st.m].find((x) => x.id === st.id);
    if (!mod) {
      html += '<p>' + L('Pick a topic. Each module has an animated diagram, a step-by-step explanation, key points and a check question.', 'Choisissez un thème. Chaque module contient un schéma animé, une explication pas à pas, des points clés et une question de vérification.') + '</p><div class="cynd-list">' +
        MODS[st.m].map((x, i) => '<button type="button" data-mod="' + x.id + '" class="' + (api.has(doneId(st.m, x.id)) ? 'done' : '') + '"><b>' + (i + 1) + '. ' + esc(T2(x.t)) + '</b><small>' + (api.has(doneId(st.m, x.id)) ? '✓ ' + L('Completed', 'Terminé') : L('About 4 min', 'Environ 4 min')) + '</small></button>').join('') + '</div>';
      root.innerHTML = html; return;
    }
    const i = MODS[st.m].indexOf(mod), next = MODS[st.m][i + 1];
    html += '<div class="cynd-mod"><button type="button" data-list="1">← ' + st.m + ' · ' + L('all topics', 'tous les thèmes') + '</button><h2>' + (i + 1) + '. ' + esc(T2(mod.t)) + '</h2>' +
      '<canvas class="cynd-canvas" aria-label="' + L('Animated diagram', 'Schéma animé') + '"></canvas>' +
      (mod.interactive ? '<div class="cynd-ctrl"><label>' + L('Probe angle', 'Angle') + ' <select data-k="angle">' + [45, 60, 70].map((a) => '<option' + (a === st.angle ? ' selected' : '') + '>' + a + '</option>').join('') + '</select>°</label><label>' + L('Thickness T', 'Épaisseur T') + ' <input type="range" data-k="T" min="8" max="50" value="' + st.T + '"> <b data-v="T">' + st.T + '</b> mm</label><label>' + L('Sound path S', 'Parcours S') + ' <input type="range" data-k="S" min="5" max="180" value="' + st.S + '"> <b data-v="S">' + st.S + '</b> mm</label></div><p class="cynd-out" data-out></p>' : '') +
      '<ol>' + mod.p.map((p) => '<li>' + esc(T2(p)) + '</li>').join('') + '</ol>' +
      '<div class="cynd-keys"><b>🔑 ' + L('Key points', 'Points clés') + '</b><ul>' + mod.k.map((k) => '<li>' + esc(T2(k)) + '</li>').join('') + '</ul></div>' +
      '<div class="cynd-row">' + (mod.tryIt ? '<button type="button" data-try="' + mod.tryIt + '">' + T2(tryLabel[mod.tryIt]) + '</button>' : '') + (mod.words || []).map((w) => '<button type="button" data-word="' + w + '">📖 ' + esc(w === 'iso9712' ? 'ISO 9712' : (api.term(w) || w)) + '</button>').join('') + '<button type="button" data-tutor="1">🧒 ' + L('Explain it again (AI tutor)', 'Réexplique-moi (tuteur IA)') + '</button></div>' +
      '<h3>✅ ' + L('Check your understanding', 'Vérifiez votre compréhension') + '</h3><p><b>' + esc(T2(mod.q.q)) + '</b></p><div class="cyac-opts" data-mq="1">' + mod.q.o.map((o, k) => '<button type="button" data-mo="' + k + '">' + esc(T2(o)) + '</button>').join('') + '</div><div data-mfb></div>' +
      '<p>' + (next ? '<button type="button" data-mod="' + next.id + '">' + L('Next topic', 'Thème suivant') + ' → ' + esc(T2(next.t)) + '</button>' : '<button type="button" data-list="1">🏁 ' + L('Back to the ' + st.m + ' topics', 'Retour aux thèmes ' + st.m) + '</button>') + '</p>' +
      '<p class="cynd-note">' + L('Simplified teaching diagram: on a real job, values come from the approved procedure and the code edition required by the contract.', 'Schéma pédagogique simplifié : sur un vrai chantier, les valeurs viennent de la procédure approuvée et de l’édition du code exigée par le contrat.') + '</p></div>';
    root.innerHTML = html;
    animate(mod);
  }
  function animate(mod) {
    const cv = root.querySelector('.cynd-canvas'), fn = DRAW[mod.d]; if (!cv || !fn) return;
    const t0 = performance.now(), out = root.querySelector('[data-out]');
    const frame = (now) => {
      if (!cv.isConnected) return;
      const r = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
      const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, w, h); g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
      try { fn(g, w, h, (now - t0) / 1000, { stage: mod.stage || 0, angle: st.angle, T: st.T, S: st.S }); } catch (e) { console.error(e); return; }
      if (out) { const a = rad(st.angle), D = st.S * Math.cos(a), leg = Math.floor(D / st.T), d = leg % 2 === 0 ? D - leg * st.T : (leg + 1) * st.T - D; out.textContent = `θ ${st.angle}° · S ${st.S} mm · ${L('depth', 'profondeur')} ${d.toFixed(1)} mm · ${L('surface distance', 'distance en surface')} ${(st.S * Math.sin(a)).toFixed(1)} mm · ${L('leg', 'parcours')} ${leg + 1} · ${L('skip', 'bond')} ${(2 * st.T * Math.tan(a)).toFixed(1)} mm`; }
      st.raf = requestAnimationFrame(frame);
    };
    st.raf = requestAnimationFrame(frame);
  }
  function onClick(e) {
    if (!root || !root.contains(e.target)) return;
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.m) { st.m = d.m; st.id = null; draw(); return; }
    if (d.list) { st.id = null; draw(); return; }
    if (d.mod) { st.id = d.mod; draw(); root.scrollIntoView({ block: 'start' }); return; }
    const mod = st.id && MODS[st.m].find((x) => x.id === st.id); if (!mod) return;
    if (d.mo != null) {
      const box = b.closest('[data-mq]'); if (box.dataset.done) return; box.dataset.done = '1';
      const ok = Number(d.mo) === mod.q.a; b.classList.add(ok ? 'ok' : 'ko'); box.querySelector('[data-mo="' + mod.q.a + '"]').classList.add('ok');
      root.querySelector('[data-mfb]').innerHTML = '<div class="cyac-fb">' + esc((ok ? '✅ ' + L('Correct! ', 'Exact ! ') : '❌ ' + L('Not quite. ', 'Pas tout à fait. ')) + T2(mod.q.why)) + (ok ? '' : ' <button type="button" data-mod="' + mod.id + '">↻ ' + L('Retry', 'Réessayer') + '</button>') + '</div>';
      if (ok) api.record(doneId(st.m, mod.id));
      return;
    }
    // data-word buttons are handled by the Academy dialog itself (opens the dictionary)
    if (d.tutor) return api.tutor(L('Explain to me as a complete beginner, step by step with a practical example: ', 'Explique-moi comme à un débutant complet, pas à pas avec un exemple pratique : ') + st.m + ' — ' + T2(mod.t));
    if (d.try) return api.tryIt(d.try, st.m);
  }
  function onInput(e) {
    if (!root || !root.contains(e.target)) return;
    const k = e.target.dataset.k; if (!k) return;
    st[k] = Number(e.target.value); const v = root.querySelector('[data-v="' + k + '"]'); if (v) v.textContent = st[k];
  }
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);
  window.CYNDT = { MODS, mount, methodDone, count: () => Object.values(MODS).reduce((n, a) => n + a.length, 0), open: (m, id) => { st.m = m; st.id = id || null; } };
}());
