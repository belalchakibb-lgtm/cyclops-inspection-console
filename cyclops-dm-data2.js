/* CYCLOPS damage-mechanism catalogue, part 2 of 2 (API RP 571, 3rd edition 2020, sections 3.35–3.67).
   Training summaries written for CYCLOPS, not the text of RP 571. See cyclops-dm-data.js for the field list. */
(function () {
  'use strict';
  const DM = window.CYDM_DATA = window.CYDM_DATA || [];
  const add = (o) => DM.push(o);

  add({ s: '3.35', k: 'h2h2s', f: 'ht', n: ['High-temperature H2/H2S corrosion', 'Corrosion haute température H2/H2S'],
    mat: ['Carbon and low-alloy steels, 400- and 300-series stainless (increasing resistance)', 'Aciers au carbone et faiblement alliés, inox 400 et 300 (résistance croissante)'],
    where: ['Hydroprocessing reactor feed and effluent piping, heater tubes, exchangers above about 230 °C', 'Charges et effluents d’hydrotraitement, tubes de four, échangeurs au-dessus d’environ 230 °C'],
    st: [['Hydrogen makes sulfur in the stream more aggressive to hot steel.', 'L’hydrogène rend le soufre du flux plus agressif pour l’acier chaud.'], ['Uniform loss with a thick grey sulfide scale.', 'Perte uniforme avec une épaisse calamine de sulfure grise.'], ['Wall thins evenly to minimum thickness.', 'La paroi s’amincit régulièrement jusqu’au minimum.']],
    look: ['Uniform thinning under a thick, layered, shiny grey iron sulfide scale.', 'Amincissement uniforme sous une épaisse calamine de sulfure de fer gris brillant, en couches.'],
    prev: ['Alloy selection by temperature and H2S (higher chromium).', 'Choix d’alliage selon température et H2S (plus de chrome).'],
    insp: 'UT:2,RT:2,VT:1,MON:1', focus: ['UT or RT thickness; internal VT of vessels; heater tubes by UT or smart pig.', 'Épaisseur UT ou RT ; VT interne des capacités ; tubes de four par UT ou racleur instrumenté.'],
    a: 'GML', m: { t: 'scale', side: 'ID', c: 'sulfide' } });

  add({ s: '3.36', k: 'htha', f: 'h2', n: ['High-temperature hydrogen attack (HTHA)', 'Attaque par l’hydrogène à haute température (HTHA)'],
    mat: ['Carbon steel (especially as-welded), C-0.5Mo, Cr-Mo steels (increasing resistance)', 'Acier au carbone (surtout brut de soudage), C-0,5Mo, aciers Cr-Mo (résistance croissante)'],
    where: ['Hot hydrogen service: hydroprocessing, reformer effluent, hydrogen plants', 'Service hydrogène chaud : hydrotraitement, effluent de reformage, unités d’hydrogène'],
    st: [['Hydrogen enters hot steel and reacts with carbides to form methane.', 'L’hydrogène pénètre l’acier chaud et réagit avec les carbures pour former du méthane.'], ['Methane can’t escape: bubbles grow at grain boundaries and link into fissures.', 'Le méthane ne peut sortir : des bulles grossissent aux joints de grains et forment des fissures.'], ['Fissures link into cracks; sudden failure is possible.', 'Les fissures se rejoignent ; une rupture soudaine est possible.']],
    look: ['Inside the wall: voids, fissures, decarburization near the surface; sometimes blisters.', 'Dans la paroi : cavités, fissures, décarburation près de la surface ; parfois des cloques.'],
    prev: ['Select materials by the API RP 941 curves with margin; PWHT; avoid using weak carbon steel.', 'Choisir les matériaux selon les courbes de l’API RP 941 avec marge ; détensionnement ; éviter l’acier au carbone faible.'],
    insp: 'PAUT:2,TOFD:2,FMR:1,DT:2,VT:0', focus: ['Specialised advanced UT (PAUT, TOFD, backscatter) by trained teams; damage can be anywhere, including base metal.', 'UT avancé spécialisé (PAUT, TOFD, rétrodiffusion) par équipes formées ; le dommage peut être partout, y compris le métal de base.'],
    a: 'MAT', m: { t: 'voids', side: 'ID', htha: 1 } });

  add({ s: '3.37', k: 'hcl', f: 'thin', n: ['Hydrochloric acid corrosion', 'Corrosion par l’acide chlorhydrique'],
    mat: ['All common alloys; carbon steel very affected', 'Tous les alliages courants ; acier au carbone très touché'],
    where: ['Crude overhead condensers and drums, hydroprocessing, catalytic reforming', 'Condenseurs et ballons de tête de colonnes, hydrotraitement, reformage catalytique'],
    st: [['Chlorides form HCl that dissolves in the first condensed water.', 'Les chlorures forment du HCl qui se dissout dans la première eau condensée.'], ['Very acidic droplets attack locally; stainless pits or cracks.', 'Les gouttes très acides attaquent localement ; l’inox pique ou fissure.'], ['Rapid local thinning and leaks.', 'Amincissement local rapide et fuites.']],
    look: ['Uniform or local thinning, under-deposit attack; orange-yellow staining; stainless pitting.', 'Amincissement uniforme ou local, attaque sous dépôt ; taches orange-jaune ; piqûres de l’inox.'],
    prev: ['Desalting, caustic injection, neutralizers; control first-water dew point; alloys.', 'Dessalage, injection de soude, neutralisants ; maîtriser le point de rosée ; alliages.'],
    insp: 'VT:2,UT:2,UTS:2,RT:2,MON:1', focus: ['VT where accessible, then UT scanning or RT of the condensing zone.', 'VT là où c’est accessible, puis cartographie UT ou RT de la zone de condensation.'],
    a: 'LML', m: { t: 'local', side: 'ID', c: 'rust' } });

  add({ s: '3.38', k: 'hf', f: 'thin', n: ['Hydrofluoric acid corrosion', 'Corrosion par l’acide fluorhydrique'],
    mat: ['Carbon steel, Cu-Ni alloys, Alloy 400', 'Acier au carbone, alliages Cu-Ni, alliage 400'],
    where: ['HF alkylation units: acid circuits, drains, vents, rerun columns', 'Unités d’alkylation HF : circuits d’acide, purges, évents, colonnes de redistillation'],
    st: [['Water in HF breaks the protective fluoride film.', 'L’eau dans le HF détruit le film de fluorure protecteur.'], ['High general or local loss, sometimes with hydrogen blistering.', 'Forte perte générale ou locale, parfois avec cloquage par l’hydrogène.'], ['Highly variable local rates lead to leaks.', 'Des vitesses locales très variables mènent à des fuites.']],
    look: ['General or local loss; weld preferential attack; may come with blisters and cracking.', 'Perte générale ou locale ; attaque préférentielle des soudures ; parfois cloques et fissures.'],
    prev: ['Keep water low; material and hardness controls; special HF practices.', 'Limiter l’eau ; contrôle des matériaux et duretés ; pratiques spécifiques HF.'],
    insp: 'UT:2,UTS:2,RT:2,VT:1', focus: ['Many UT readings or scans per component (rates vary a lot); profile RT of drains and vents.', 'Nombreuses mesures ou cartographies UT par composant (vitesses très variables) ; RT de profil des purges et évents.'],
    a: 'LML', m: { t: 'local', side: 'ID', c: 'grey' } });

  add({ s: '3.39', k: 'hfscc', f: 'scc', n: ['HF stress corrosion cracking of nickel alloys', 'Corrosion sous contrainte des alliages de nickel en HF'],
    mat: ['Alloy 400, Alloy K-500 and other nickel alloys', 'Alliage 400, alliage K-500 et autres alliages de nickel'],
    where: ['Alloy 400 parts in HF vapour, especially with air ingress', 'Pièces en alliage 400 dans les vapeurs de HF, surtout avec entrée d’air'],
    st: [['Oxygen with HF forms cupric fluoride on the alloy.', 'L’oxygène avec le HF forme du fluorure cuivrique sur l’alliage.'], ['Cracks start under stress, intergranular or transgranular.', 'Des fissures démarrent sous contrainte, intergranulaires ou transgranulaires.'], ['Cracks penetrate and leak.', 'Les fissures pénètrent et fuient.']],
    look: ['Green crystalline deposit (copper fluoride) with cracks.', 'Dépôt cristallin vert (fluorure cuivrique) avec fissures.'],
    prev: ['Stress relief; keep air out; alternative alloys.', 'Détensionnement ; empêcher l’entrée d’air ; autres alliages.'],
    insp: 'PT:2,VT:1,MON:1', focus: ['PT of parts showing green crystals; monitor purge gas oxygen.', 'PT des pièces avec cristaux verts ; suivre l’oxygène des gaz de purge.'],
    a: 'CRACK', m: { t: 'scc', side: 'OD', branch: 2, c: 'green', dep: 1, comp: 'ni' } });

  add({ s: '3.40', k: 'he', f: 'h2', n: ['Hydrogen embrittlement', 'Fragilisation par l’hydrogène'],
    mat: ['High-strength and low-alloy steels, 400-series, duplex, some nickel alloys', 'Aciers à haute résistance et faiblement alliés, inox 400, duplex, certains alliages de nickel'],
    where: ['Hard welds, high-strength bolts, cathodically protected parts, after welding with wet electrodes', 'Soudures dures, boulons à haute résistance, pièces sous protection cathodique, soudures à électrodes humides'],
    st: [['Atomic hydrogen enters the steel (welding, corrosion, cathodic protection).', 'L’hydrogène atomique entre dans l’acier (soudage, corrosion, protection cathodique).'], ['It gathers at high-stress, hard zones and lowers toughness.', 'Il s’accumule aux zones dures et très contraintes et réduit la ténacité.'], ['Delayed brittle cracking, often at room temperature.', 'Fissuration fragile différée, souvent à température ambiante.']],
    look: ['No visible sign until cracks appear, usually surface-breaking at hard welds.', 'Aucun signe avant l’apparition de fissures, souvent débouchantes aux soudures dures.'],
    prev: ['Low-hydrogen welding, preheat and PWHT; hardness limits; bake-out.', 'Soudage bas hydrogène, préchauffage et détensionnement ; limites de dureté ; dégazage.'],
    insp: 'PT:2,MT:2,WFMT:2,SWUT:2,RT:0,VT:0', focus: ['PT, MT or WFMT for surface cracks; angle UT to find and size; RT not sensitive enough.', 'PT, MT ou MT fluorescent en surface ; UT d’angle pour détecter et dimensionner ; RT pas assez sensible.'],
    a: 'CRACK', m: { t: 'crack', side: 'OD', hard: 1 } });

  add({ s: '3.41', k: 'hschf', f: 'h2', n: ['Hydrogen stress cracking in HF acid', 'Fissuration sous contrainte par l’hydrogène en HF'],
    mat: ['Carbon steel and low-alloy steel with hard zones', 'Aciers au carbone et faiblement alliés à zones dures'],
    where: ['Hard welds, HAZs and bolts in HF alkylation units', 'Soudures, ZAT et boulons durs des unités d’alkylation HF'],
    st: [['Hydrogen from HF corrosion enters hard weld metal or bolts.', 'L’hydrogène issu de la corrosion HF entre dans les soudures ou boulons durs.'], ['Cracks start at the hard zones.', 'Des fissures démarrent aux zones dures.'], ['Sudden cracking of welds or bolts.', 'Fissuration soudaine des soudures ou boulons.']],
    look: ['Surface-breaking cracks at welds; metallography needed to confirm.', 'Fissures débouchantes aux soudures ; métallographie nécessaire pour confirmer.'],
    prev: ['Hardness limits on welds and bolting; PWHT.', 'Limites de dureté des soudures et boulonnerie ; détensionnement.'],
    insp: 'PT:2,MT:2,WFMT:2,SWUT:2,HT:2', focus: ['Hardness testing of welds and bolts is the key; surface NDT for cracks.', 'La dureté des soudures et boulons est la clé ; CND de surface pour les fissures.'],
    a: 'CRACK', m: { t: 'crack', side: 'ID', hard: 1 } });

  add({ s: '3.42', k: 'lme', f: 'metal', n: ['Liquid metal embrittlement', 'Fragilisation par métal liquide'],
    mat: ['Many alloys: steels, stainless, nickel, copper, aluminium, titanium', 'Nombreux alliages : aciers, inox, nickel, cuivre, aluminium, titane'],
    where: ['After fires (molten zinc, aluminium, cadmium dripping), mercury in some streams', 'Après incendies (zinc, aluminium, cadmium fondus), mercure dans certains flux'],
    st: [['A liquid low-melting metal wets a stressed part.', 'Un métal liquide à bas point de fusion mouille une pièce contrainte.'], ['It penetrates grain boundaries very fast.', 'Il pénètre très vite les joints de grains.'], ['Sudden brittle cracking in a normally ductile metal.', 'Fissuration fragile soudaine d’un métal normalement ductile.']],
    look: ['Brittle intergranular cracks filled with the embrittling metal.', 'Fissures intergranulaires fragiles remplies du métal fragilisant.'],
    prev: ['Avoid galvanized parts near stainless where fire is possible; remove mercury.', 'Éviter les pièces galvanisées près de l’inox en zone feu ; éliminer le mercure.'],
    insp: 'VT:2,MT:2,PT:2', focus: ['After a fire, check where molten metal dripped; MT on ferritic, PT on non-magnetic.', 'Après un incendie, contrôler où le métal fondu a coulé ; MT sur ferritique, PT sur amagnétique.'],
    a: 'CRACK', m: { t: 'crack', side: 'OD', drip: 1 } });

  add({ s: '3.43', k: 'mechfat', f: 'mech', n: ['Mechanical fatigue (incl. vibration)', 'Fatigue mécanique (vibrations comprises)'],
    mat: ['All engineering alloys', 'Tous les alliages industriels'],
    where: ['Small-bore branches, socket welds, compressor and pump piping, rotating shafts', 'Piquages de petit diamètre, soudures à emboîtement, lignes de compresseurs et pompes, arbres'],
    st: [['Repeated stress cycles act at a notch, thread or weld toe.', 'Des cycles répétés agissent sur une entaille, un filetage ou un pied de soudure.'], ['A crack starts and grows a little each cycle (beach marks).', 'Une fissure démarre et avance un peu à chaque cycle (lignes d’arrêt).'], ['The remaining section breaks suddenly.', 'La section restante casse soudainement.']],
    look: ['A crack from a stress raiser; fracture shows beach marks and a final rough zone.', 'Une fissure partant d’un concentrateur ; cassure avec lignes d’arrêt et zone finale rugueuse.'],
    prev: ['Remove vibration, support small branches, smooth geometry, good weld profiles.', 'Supprimer les vibrations, supporter les piquages, géométrie douce, bons profils de soudure.'],
    insp: 'VT:1,PT:2,MT:2,SWUT:2,VIB:2', focus: ['Vibration surveys and visual checks of small branches; PT or MT of suspect welds.', 'Mesures vibratoires et VT des piquages ; PT ou MT des soudures suspectes.'],
    a: 'FAT', m: { t: 'crack', side: 'OD', toe: 1, beach: 1 } });

  add({ s: '3.44', k: 'dusting', f: 'ht', n: ['Metal dusting', 'Metal dusting (désintégration catalytique)'],
    mat: ['Low-alloy steels, stainless, nickel alloys — none fully immune', 'Aciers faiblement alliés, inox, alliages de nickel — aucun totalement immunisé'],
    where: ['Hydrogen and synthesis-gas plants, reformer outlets, around 480–815 °C', 'Unités d’hydrogène et gaz de synthèse, sorties de reformeurs, vers 480–815 °C'],
    st: [['Carbon-rich gas deposits carbon on hot metal.', 'Un gaz riche en carbone dépose du carbone sur le métal chaud.'], ['The metal breaks down into dust and soot in small pits.', 'Le métal se désagrège en poussière et suie dans de petites piqûres.'], ['Very fast deep pitting through the wall.', 'Piqûres profondes très rapides jusqu’à la perforation.']],
    look: ['Rounded pits filled with crumbly soot and metal dust.', 'Piqûres arrondies remplies de suie et de poussière métallique friables.'],
    prev: ['Resistant alloys and coatings; process control (adding sulfur can help).', 'Alliages et revêtements résistants ; conduite du procédé (le soufre peut aider).'],
    insp: 'VT:2,RT:1,DT:2', focus: ['Usually found after a leak; VT if internals are accessible; sampling confirms.', 'Souvent découvert après une fuite ; VT si les internes sont accessibles ; prélèvement de confirmation.'],
    a: 'PIT', m: { t: 'pits', side: 'ID', c: 'soot', round: 1 } });

  add({ s: '3.45', k: 'mic', f: 'thin', n: ['Microbiologically influenced corrosion (MIC)', 'Corrosion influencée par les micro-organismes (MIC)'],
    mat: ['Steels, stainless, aluminium, copper, some nickel alloys', 'Aciers, inox, aluminium, cuivre, certains alliages de nickel'],
    where: ['Stagnant or low-flow water: fire water, cooling water, tank bottoms, hydrotest water left in', 'Eau stagnante : eau incendie, refroidissement, fonds de bacs, eau d’épreuve laissée'],
    st: [['Bacteria settle and build a slimy deposit (tubercle).', 'Des bactéries se fixent et forment un dépôt visqueux (tubercule).'], ['Under the tubercle, cup-shaped pits grow fast.', 'Sous le tubercule, des piqûres en cupule grandissent vite.'], ['Pits perforate even thick walls.', 'Les piqûres percent même des parois épaisses.']],
    look: ['Tubercles and slime; cup-shaped pits under them; stainless pits at welds.', 'Tubercules et dépôts visqueux ; piqûres en cupule dessous ; piqûres de l’inox aux soudures.'],
    prev: ['Avoid stagnant water; biocides; drain and dry after hydrotest.', 'Éviter l’eau stagnante ; biocides ; vidanger et sécher après épreuve.'],
    insp: 'MON:2,UTS:2,RT:1,VT:1', focus: ['Monitor microbes and biocide; UT scanning for pits at low-flow spots.', 'Suivre microbes et biocide ; cartographie UT des piqûres aux zones calmes.'],
    a: 'PIT', m: { t: 'tuber', side: 'ID', c: 'rust', slime: 1 } });

  add({ s: '3.46', k: 'nac', f: 'ht', n: ['Naphthenic acid corrosion', 'Corrosion par les acides naphténiques'],
    mat: ['Carbon steel, low-alloy, 400- and 300-series stainless, nickel alloys', 'Acier au carbone, faiblement allié, inox 400 et 300, nickel'],
    where: ['Crude and vacuum unit hot sections, heater tubes, transfer lines, about 220–400 °C', 'Sections chaudes des unités atmosphériques et sous vide, tubes de four, lignes de transfert, vers 220–400 °C'],
    st: [['Organic acids in hot crude attack where flow is fast.', 'Les acides organiques du brut chaud attaquent là où le flux est rapide.'], ['Sharp-edged pits and flow grooves form; no scale.', 'Des piqûres à bords vifs et des rainures de flux se forment ; pas de calamine.'], ['Rapid local loss at bends and high velocity.', 'Perte locale rapide aux coudes et fortes vitesses.']],
    look: ['Clean, sharp-edged pits or grooves aligned with the flow.', 'Piqûres ou rainures propres, à bords vifs, alignées sur le flux.'],
    prev: ['Molybdenum-bearing alloys (316); crude blending; inhibitors.', 'Alliages au molybdène (316) ; mélange des bruts ; inhibiteurs.'],
    insp: 'VT:1,RT:2,UTS:2,MON:1', focus: ['RT and close-grid UT of hot high-velocity zones.', 'RT et UT à maillage serré des zones chaudes à forte vitesse.'],
    a: 'LML', m: { t: 'groove', side: 'ID', c: 'grey', sharp: 1, flow: 1 } });

  add({ s: '3.47', k: 'nitrid', f: 'ht', n: ['Nitriding', 'Nitruration'],
    mat: ['Carbon steel, low-alloy, 400- and 300-series stainless', 'Acier au carbone, faiblement allié, inox 400 et 300'],
    where: ['Ammonia-rich hot streams: ammonia plants, cracker parts', 'Flux chauds riches en ammoniac : unités d’ammoniac, pièces de craqueurs'],
    st: [['Nitrogen diffuses into the hot surface.', 'L’azote diffuse dans la surface chaude.'], ['A hard, brittle nitride layer forms, dull grey.', 'Une couche de nitrures dure et fragile se forme, gris terne.'], ['Surface cracking of the brittle layer.', 'Fissuration superficielle de la couche fragile.']],
    look: ['Dull dark grey surface; hard; cracks in advanced cases.', 'Surface gris foncé terne ; dure ; fissures en cas avancé.'],
    prev: ['Nickel alloys; limit temperature.', 'Alliages de nickel ; limiter la température.'],
    insp: 'HT:2,PT:1,DT:2,VT:1', focus: ['Hardness and surface checks; sampling to confirm depth.', 'Dureté et contrôles de surface ; prélèvement pour la profondeur.'],
    a: 'MAT', m: { t: 'layer', side: 'OD', c: 'dark', craze: 1 } });

  add({ s: '3.48', k: 'oxid', f: 'ht', n: ['Oxidation', 'Oxydation'],
    mat: ['Iron-based alloys, stainless, nickel alloys', 'Alliages de fer, inox, nickel'],
    where: ['Fired heater tubes and supports, burners, hot components in air', 'Tubes et supports de fours, brûleurs, pièces chaudes à l’air'],
    st: [['Oxygen reacts with hot metal and forms oxide scale.', 'L’oxygène réagit avec le métal chaud et forme de la calamine.'], ['Scale thickens; flakes off and the metal keeps thinning.', 'La calamine s’épaissit ; elle s’écaille et le métal continue de s’amincir.'], ['General wall loss to failure.', 'Perte générale jusqu’à la rupture.']],
    look: ['Thick dark oxide scale on the hot surface; general thinning.', 'Épaisse calamine sombre sur la surface chaude ; amincissement général.'],
    prev: ['Chromium-rich alloys; temperature control.', 'Alliages riches en chrome ; maîtrise de la température.'],
    insp: 'IRT:2,UT:2,RT:1,VT:2', focus: ['Tube-skin thermocouples and IR thermography; UT or RT of remaining wall.', 'Thermocouples de peau et thermographie IR ; UT ou RT de l’épaisseur restante.'],
    a: 'GML', m: { t: 'scale', side: 'OD', c: 'oxide', comp: 'tube' } });

  add({ s: '3.49', k: 'o2water', f: 'thin', n: ['Oxygenated process water corrosion', 'Corrosion par eau de procédé oxygénée'],
    mat: ['Carbon and low-alloy steels', 'Aciers au carbone et faiblement alliés'],
    where: ['Water draws, wash water, ejector condensers, any process water with air', 'Soutirages d’eau, eau de lavage, condenseurs d’éjecteurs, toute eau de procédé aérée'],
    st: [['Dissolved oxygen in liquid water reaches the steel.', 'L’oxygène dissous dans l’eau atteint l’acier.'], ['Widespread pitting at low flow; accelerated attack at high velocity.', 'Piqûres étendues à faible débit ; attaque accélérée à forte vitesse.'], ['Pits perforate.', 'Les piqûres percent.']],
    look: ['Extensive pitting on wetted surfaces; local attack at turbulent spots.', 'Piqûres étendues sur les surfaces mouillées ; attaque locale aux turbulences.'],
    prev: ['Keep air out; oxygen scavengers; coatings.', 'Empêcher l’entrée d’air ; réducteurs d’oxygène ; revêtements.'],
    insp: 'UTS:2,RT:2,VT:1', focus: ['Inspect the full circumference at high-velocity and stagnant zones.', 'Contrôler toute la circonférence aux zones rapides et stagnantes.'],
    a: 'PIT', m: { t: 'pits', side: 'ID', c: 'rust' } });

  add({ s: '3.50', k: 'phenol', f: 'thin', n: ['Phenol (carbolic acid) corrosion', 'Corrosion par le phénol (acide carbolique)'],
    mat: ['Carbon steel, 304L, 316L, Alloy C276 (increasing resistance)', 'Acier au carbone, 304L, 316L, alliage C276 (résistance croissante)'],
    where: ['Lube oil extraction plants using phenol', 'Unités d’extraction d’huiles de base au phénol'],
    st: [['Hot wet phenol attacks carbon steel.', 'Le phénol chaud et humide attaque l’acier au carbone.'], ['General loss, and erosion-corrosion at high velocity.', 'Perte générale, et érosion-corrosion à forte vitesse.'], ['Local thinning to leak.', 'Amincissement local jusqu’à la fuite.']],
    look: ['General or local thinning, often erosion-corrosion at impingement.', 'Amincissement général ou local, souvent érosion-corrosion aux impacts.'],
    prev: ['Material selection; control water content and velocity.', 'Choix des matériaux ; maîtriser eau et vitesse.'],
    insp: 'VT:2,UT:2,RT:1', focus: ['VT at impingement areas then UT; RT for local attack.', 'VT aux zones d’impact puis UT ; RT pour l’attaque locale.'],
    a: 'LML', m: { t: 'local', side: 'ID', c: 'grey' } });

  add({ s: '3.51', k: 'phosph', f: 'thin', n: ['Phosphoric acid corrosion', 'Corrosion par l’acide phosphorique'],
    mat: ['Carbon steel, 304L, 316L, Alloy 20, Alloy 825 (increasing resistance)', 'Acier au carbone, 304L, 316L, alliage 20, alliage 825 (résistance croissante)'],
    where: ['Polymerization units, catalyst areas where free water collects', 'Unités de polymérisation, zones de catalyseur où l’eau libre s’accumule'],
    st: [['Water dilutes the acid where it collects.', 'L’eau dilue l’acide là où elle s’accumule.'], ['Local thinning with a pitted or smooth surface.', 'Amincissement local à surface piquée ou lisse.'], ['Leaks at low points.', 'Fuites aux points bas.']],
    look: ['Local thinning; sensitized stainless suffers intergranular attack.', 'Amincissement local ; l’inox sensibilisé subit une attaque intergranulaire.'],
    prev: ['Control water content; L-grade stainless.', 'Maîtriser la teneur en eau ; inox bas carbone.'],
    insp: 'UT:2,RT:2,MON:2', focus: ['UT and RT; monitor iron content and water in the overhead.', 'UT et RT ; suivre fer et eau en tête de colonne.'],
    a: 'LML', m: { t: 'local', side: 'ID', c: 'grey' } });

  add({ s: '3.52', k: 'ptascc', f: 'scc', n: ['Polythionic acid stress corrosion cracking', 'Corrosion sous contrainte par acides polythioniques'],
    mat: ['Sensitized 300-series stainless, Alloys 600 and 800', 'Inox 300 sensibilisés, alliages 600 et 800'],
    where: ['Hydroprocessing heaters, exchangers, FCC parts during shutdowns', 'Fours, échangeurs d’hydrotraitement, pièces FCC pendant les arrêts'],
    st: [['During shutdown, sulfide scale meets air and moisture: polythionic acid forms.', 'À l’arrêt, la calamine sulfurée rencontre air et humidité : de l’acide polythionique se forme.'], ['The acid attacks sensitized grain boundaries next to welds.', 'L’acide attaque les joints de grains sensibilisés près des soudures.'], ['Intergranular cracks leak at start-up.', 'Des fissures intergranulaires fuient au redémarrage.']],
    look: ['Very localized intergranular cracking next to welds; often a leak at start-up.', 'Fissuration intergranulaire très localisée près des soudures ; souvent une fuite au redémarrage.'],
    prev: ['Shutdown protection per NACE SP0170 (nitrogen purge, soda-ash wash); stabilized grades.', 'Protection à l’arrêt selon NACE SP0170 (azote, lavage au carbonate) ; nuances stabilisées.'],
    insp: 'PT:2,PAUT:1,VT:1', focus: ['Best managed by prevention; PT is the common method; cracks may appear late in a turnaround.', 'Mieux géré par prévention ; le PT est courant ; les fissures peuvent apparaître tard dans l’arrêt.'],
    a: 'CRACK', m: { t: 'scc', side: 'ID', branch: 2, comp: 'ss' } });

  add({ s: '3.53', k: 'refract', f: 'mech', n: ['Refractory degradation', 'Dégradation des réfractaires'],
    mat: ['Castables, brick, ceramic fibre, plastic refractories', 'Bétons, briques, fibres céramiques, réfractaires plastiques'],
    where: ['FCC reactor and regenerator, heaters, boilers, sulfur plants', 'Réacteur et régénérateur FCC, fours, chaudières, unités de soufre'],
    st: [['Thermal cycles, erosion or poor installation crack the lining.', 'Cycles thermiques, érosion ou mauvaise pose fissurent le revêtement.'], ['Cracks open, pieces spall, hot gas channels behind.', 'Les fissures s’ouvrent, des morceaux s’écaillent, le gaz chaud passe derrière.'], ['Hot spots on the steel shell.', 'Points chauds sur l’enveloppe acier.']],
    look: ['Cracking, spalling, lift-off and erosion of the lining.', 'Fissuration, écaillage, décollement et érosion du revêtement.'],
    prev: ['Good refractory design, anchors, installation and dry-out.', 'Bonne conception, ancrages, pose et séchage des réfractaires.'],
    insp: 'VT:2,IRT:2,HAM:1', focus: ['VT at outages; IR thermography of the shell in operation; hammer test.', 'VT aux arrêts ; thermographie IR de l’enveloppe en marche ; test au marteau.'],
    a: 'FIRE', m: { t: 'refr', comp: 'vessel' } });

  add({ s: '3.54', k: 'reheat', f: 'mech', n: ['Stress relaxation (reheat) cracking', 'Fissuration au réchauffage (relaxation)'],
    mat: ['Cr-Mo-V steels, 304H/316H/321/347, Alloy 800H/HT', 'Aciers Cr-Mo-V, 304H/316H/321/347, alliages 800H/HT'],
    where: ['Thick welds during PWHT or hot service: reactors, hot piping', 'Soudures épaisses pendant le détensionnement ou en service chaud : réacteurs, tuyauteries chaudes'],
    st: [['Residual stress relaxes by creep strain at grain boundaries.', 'La contrainte résiduelle se relâche par fluage aux joints de grains.'], ['Intergranular cracks form in the coarse-grained HAZ.', 'Des fissures intergranulaires se forment dans la ZAT à gros grains.'], ['Cracks grow surface-breaking or buried.', 'Les fissures progressent, débouchantes ou internes.']],
    look: ['Intergranular cracks in coarse-grained HAZ, surface or embedded.', 'Fissures intergranulaires en ZAT à gros grains, en surface ou internes.'],
    prev: ['Weld procedure and heat-treatment control; stabilisation; design.', 'Maîtrise des modes opératoires et traitements ; stabilisation ; conception.'],
    insp: 'WFMT:2,MT:2,PT:2,SWUT:2,PAUT:2', focus: ['WFMT or PT for surface; angle UT for buried cracks (special procedures for thick stainless).', 'MT fluorescent ou PT en surface ; UT d’angle pour l’interne (procédures spéciales pour l’inox épais).'],
    a: 'CRACK', m: { t: 'crack', side: 'OD', haz: 1, multi: 2 } });

  add({ s: '3.55', k: 'overheat', f: 'ht', n: ['Short-term overheating (stress rupture)', 'Surchauffe de courte durée (rupture)'],
    mat: ['All heater and boiler tube materials', 'Tous les matériaux de tubes de fours et chaudières'],
    where: ['Fired heater tubes, boiler tubes with steam blanketing or flame impingement', 'Tubes de fours, tubes de chaudières avec caléfaction ou impact de flamme'],
    st: [['A hot spot forms: flame impingement, coke inside, loss of flow.', 'Un point chaud se forme : impact de flamme, coke interne, perte de débit.'], ['The tube bulges quickly, 3–10 % or more.', 'Le tube gonfle rapidement, de 3 à 10 % ou plus.'], ['Fishmouth rupture with thin lips.', 'Rupture en gueule de poisson à lèvres minces.']],
    look: ['Local bulging, then a thin-lipped fishmouth rupture.', 'Gonflement local, puis rupture en gueule de poisson à lèvres minces.'],
    prev: ['Burner management, flow control, avoid coking.', 'Conduite des brûleurs, maîtrise du débit, éviter le coke.'],
    insp: 'VT:2,IRT:2,DIM:2', focus: ['Visual checks for bulges; IR and thermocouples in operation; diameter strapping.', 'Recherche visuelle des gonflements ; IR et thermocouples en marche ; mesure de diamètre.'],
    a: 'FIRE', m: { t: 'bulge', comp: 'tube', rupture: 1 } });

  add({ s: '3.56', k: 'sigma', f: 'metal', n: ['Sigma phase embrittlement', 'Fragilisation par phase sigma'],
    mat: ['300-series stainless (wrought, weld, cast HK/HP), duplex', 'Inox 300 (corroyé, soudé, moulé HK/HP), duplex'],
    where: ['FCC regenerator parts, reformer and heater parts above about 540 °C', 'Pièces de régénérateur FCC, reformeurs et fours au-dessus d’environ 540 °C'],
    st: [['A hard sigma phase forms during long hot exposure.', 'Une phase sigma dure se forme lors d’une longue exposition chaude.'], ['Toughness falls, mostly felt at low temperature.', 'La ténacité chute, surtout ressentie à basse température.'], ['Cracking at shutdown or under impact.', 'Fissuration à l’arrêt ou sous choc.']],
    look: ['Not visible; confirmed by metallography and impact testing.', 'Invisible ; confirmé par métallographie et essais de résilience.'],
    prev: ['Low-ferrite alloys; limit time at temperature; heat treatment can dissolve sigma.', 'Alliages peu ferritiques ; limiter le temps en température ; un traitement peut dissoudre la sigma.'],
    insp: 'DT:2,FMR:1,VT:0,UT:0', focus: ['Remove and lab-test samples; awareness of susceptible equipment.', 'Prélever et tester en laboratoire ; connaître les équipements sensibles.'],
    a: 'MAT', m: { t: 'none', comp: 'ss', micro: 'sigma' } });

  add({ s: '3.57', k: 'soil', f: 'thin', n: ['Soil corrosion', 'Corrosion par les sols'],
    mat: ['Carbon steel, cast and ductile iron', 'Acier au carbone, fontes grise et ductile'],
    where: ['Buried piping, tank bottoms on soil, soil-to-air interfaces', 'Tuyauteries enterrées, fonds de bacs sur sol, interfaces sol-air'],
    st: [['Moist soil reaches the steel where the coating fails.', 'Le sol humide atteint l’acier là où le revêtement cède.'], ['Rough external thinning with deeper local pits.', 'Amincissement externe rugueux avec piqûres locales plus profondes.'], ['Leaks, often found from the surface.', 'Fuites, souvent repérées depuis la surface.']],
    look: ['Rough external thinning and pitting; poor coating is a tell-tale.', 'Amincissement et piqûres externes rugueux ; le mauvais revêtement est un indice.'],
    prev: ['Coatings and cathodic protection; good backfill.', 'Revêtements et protection cathodique ; bon remblai.'],
    insp: 'VT:1,GWT:2,CP:2,UT:2,MON:1', focus: ['Surveys for leaks, CP and coating surveys, GWT and in-line inspection; excavate to confirm.', 'Recherche de fuites, mesures de PC et de revêtement, ondes guidées et racleurs ; excaver pour confirmer.'],
    a: 'LML', m: { t: 'pits', side: 'OD', c: 'soil', rough: 1 } });

  add({ s: '3.58', k: 'sourw', f: 'thin', n: ['Sour water corrosion (acidic)', 'Corrosion par eaux acides (acides)'],
    mat: ['Carbon steel mainly', 'Surtout l’acier au carbone'],
    where: ['Overhead systems of FCC, coker, crude and hydroprocessing; sour water strippers', 'Têtes de colonnes FCC, cokeur, distillation, hydrotraitement ; strippeurs d’eaux acides'],
    st: [['Water with H2S at pH 4.5–7 wets the steel.', 'De l’eau avec H2S à pH 4,5–7 mouille l’acier.'], ['General thinning; local under-deposit attack if oxygen enters.', 'Amincissement général ; attaque sous dépôt si l’oxygène entre.'], ['Wall reaches minimum thickness.', 'La paroi atteint l’épaisseur minimale.']],
    look: ['General thinning, with local attack under deposits.', 'Amincissement général, attaque locale sous dépôts.'],
    prev: ['Keep oxygen out; control pH; alloys for severe service.', 'Empêcher l’oxygène ; maîtriser le pH ; alliages en service sévère.'],
    insp: 'UTS:2,RT:2,MON:2', focus: ['UT scanning and RT of locally thinned areas; corrosion probes.', 'Cartographie UT et RT des zones minces ; sondes de corrosion.'],
    a: 'GML', m: { t: 'uniform', side: 'ID', c: 'black' } });

  add({ s: '3.59', k: 'spheroid', f: 'metal', n: ['Spheroidization (softening)', 'Sphéroïdisation (adoucissement)'],
    mat: ['Carbon steel and Cr-Mo steels', 'Acier au carbone et aciers Cr-Mo'],
    where: ['Hot piping and heater tubes around 440–760 °C', 'Tuyauteries chaudes et tubes de four vers 440–760 °C'],
    st: [['Plate-like carbides start to round up.', 'Les carbures lamellaires commencent à s’arrondir.'], ['Strength and hardness fall slowly.', 'La résistance et la dureté baissent lentement.'], ['Lower creep strength leads to deformation.', 'La résistance au fluage plus faible entraîne des déformations.']],
    look: ['Not visible; only metallography shows rounded carbides.', 'Invisible ; seule la métallographie montre les carbures arrondis.'],
    prev: ['Limit temperature; suitable alloys.', 'Limiter la température ; alliages adaptés.'],
    insp: 'FMR:2,HT:1,DT:2', focus: ['Field replication or samples; hardness may hint, then confirm.', 'Répliques ou prélèvements ; la dureté peut alerter, puis confirmer.'],
    a: 'MAT', m: { t: 'none', comp: 'pipe', micro: 'sphero' } });

  add({ s: '3.60', k: 'strainage', f: 'metal', n: ['Strain aging', 'Vieillissement après déformation'],
    mat: ['Older (pre-1980) carbon steels, C-0.5Mo', 'Aciers au carbone anciens (avant 1980), C-0,5Mo'],
    where: ['Older vessels with cold-formed parts, welds repaired cold', 'Équipements anciens à parties formées à froid, soudures réparées à froid'],
    st: [['Cold deformation, then time at moderate temperature.', 'Déformation à froid, puis temps à température modérée.'], ['Strength rises, toughness falls.', 'La résistance augmente, la ténacité chute.'], ['Brittle fracture under a later load.', 'Rupture fragile sous une charge ultérieure.']],
    look: ['Not identifiable before fracture; metallurgical analysis only.', 'Non identifiable avant rupture ; analyse métallurgique seulement.'],
    prev: ['Modern killed steels; PWHT of cold-formed parts.', 'Aciers calmés modernes ; détensionnement des parties formées à froid.'],
    insp: 'HT:1,DT:2', focus: ['No online method; hardness only for large affected areas.', 'Aucune méthode en ligne ; dureté seulement pour de grandes zones.'],
    a: 'BRIT', m: { t: 'none', comp: 'vessel', micro: 'grain' } });

  add({ s: '3.61', k: 'sulfid', f: 'ht', n: ['Sulfidation', 'Sulfuration'],
    mat: ['Carbon steel, low-alloy, 400- and 300-series stainless (increasing resistance)', 'Acier au carbone, faiblement allié, inox 400 et 300 (résistance croissante)'],
    where: ['Crude, vacuum, FCC, coker hot sections above about 260 °C; heater tubes', 'Sections chaudes de distillation, sous vide, FCC, cokeur au-dessus d’environ 260 °C ; tubes de four'],
    st: [['Sulfur compounds react with hot steel; low-silicon carbon steel is worst.', 'Les composés soufrés réagissent avec l’acier chaud ; l’acier pauvre en silicium est le pire.'], ['Uniform thinning under sulfide scale, or local high-velocity attack.', 'Amincissement uniforme sous calamine sulfurée, ou attaque locale à forte vitesse.'], ['Sudden rupture of a thinned component (can be catastrophic).', 'Rupture soudaine d’un composant aminci (parfois catastrophique).']],
    look: ['Uniform thinning with sulfide scale; individual low-silicon components thinner than neighbours.', 'Amincissement uniforme avec calamine sulfurée ; composants pauvres en silicium plus minces que leurs voisins.'],
    prev: ['Chromium alloys; 100 % component verification of carbon steel silicon content.', 'Alliages au chrome ; vérification à 100 % de la teneur en silicium des composants en acier au carbone.'],
    insp: 'UT:2,RT:2,VT:1,PMI:2', focus: ['UT or RT of every component (each fitting can differ); PMI for silicon.', 'UT ou RT de chaque composant (chaque raccord peut différer) ; analyse de silicium.'],
    a: 'GML', m: { t: 'scale', side: 'ID', c: 'sulfide' } });

  add({ s: '3.62', k: 'h2so4', f: 'thin', n: ['Sulfuric acid corrosion', 'Corrosion par l’acide sulfurique'],
    mat: ['Carbon steel, 316L, Alloy 20, high-silicon iron, Alloys B-2 and C-276 (increasing resistance)', 'Acier au carbone, 316L, alliage 20, fonte au silicium, alliages B-2 et C-276 (résistance croissante)'],
    where: ['Sulfuric acid alkylation units, acid piping, drains and vents', 'Unités d’alkylation à l’acide sulfurique, tuyauteries d’acide, purges et évents'],
    st: [['Diluted or fast-flowing acid removes the protective sulfate film.', 'L’acide dilué ou rapide arrache le film de sulfate protecteur.'], ['General loss; fast attack of carbon steel HAZ; hydrogen grooving at high points.', 'Perte générale ; attaque rapide de la ZAT ; rainurage par l’hydrogène aux points hauts.'], ['Leaks at welds and flow disturbances.', 'Fuites aux soudures et perturbations d’écoulement.']],
    look: ['General or local loss; grooving; HAZ preferential attack.', 'Perte générale ou locale ; rainurage ; attaque préférentielle de la ZAT.'],
    prev: ['Velocity limits; acid strength control; alloys.', 'Limites de vitesse ; maîtrise de la concentration ; alliages.'],
    insp: 'UT:2,RT:2,MON:2', focus: ['UT and RT; coupons and ER probes.', 'UT et RT ; coupons et sondes de résistance.'],
    a: 'LML', m: { t: 'groove', side: 'ID', c: 'grey', haz: 1 } });

  add({ s: '3.63', k: 'temper', f: 'metal', n: ['Temper embrittlement', 'Fragilisation de revenu'],
    mat: ['2.25Cr-1Mo and 3Cr-1Mo steels, especially older heats', 'Aciers 2,25Cr-1Mo et 3Cr-1Mo, surtout anciennes coulées'],
    where: ['Hydroprocessing reactors and exchangers around 345–575 °C', 'Réacteurs et échangeurs d’hydrotraitement vers 345–575 °C'],
    st: [['Impurities migrate to grain boundaries during years at temperature.', 'Les impuretés migrent aux joints de grains pendant des années en température.'], ['The ductile-to-brittle transition temperature rises.', 'La température de transition ductile-fragile augmente.'], ['Brittle fracture risk at start-up and shutdown.', 'Risque de rupture fragile au démarrage et à l’arrêt.']],
    look: ['Not visible; confirmed by impact testing of samples.', 'Invisible ; confirmé par essais de résilience sur échantillons.'],
    prev: ['Low-impurity steels; minimum pressurising temperature procedures.', 'Aciers à faibles impuretés ; procédures de température minimale de mise en pression.'],
    insp: 'DT:2,VT:0,UT:0', focus: ['Surveillance blocks inside the reactor, impact-tested periodically.', 'Blocs témoins dans le réacteur, testés en résilience périodiquement.'],
    a: 'BRIT', m: { t: 'none', comp: 'vessel', micro: 'grain' } });

  add({ s: '3.64', k: 'thermfat', f: 'mech', n: ['Thermal fatigue', 'Fatigue thermique'],
    mat: ['All materials', 'Tous les matériaux'],
    where: ['Mix points of hot and cold streams, desuperheaters, coke drums, heater tubes and supports', 'Points de mélange chaud-froid, désurchauffeurs, ballons de coke, tubes et supports de fours'],
    st: [['Repeated temperature swings make the metal expand and shrink against restraint.', 'Des variations de température répétées dilatent et contractent le métal contre un bridage.'], ['Wide, oxide-filled cracks start on the surface; a crazed network forms.', 'Des fissures larges remplies d’oxyde démarrent en surface ; un faïençage se forme.'], ['Cracks grow through the wall.', 'Les fissures traversent la paroi.']],
    look: ['Wide, oxide-filled surface cracks, single or crazed ("elephant skin").', 'Fissures larges remplies d’oxyde, simples ou en faïençage (« peau d’éléphant »).'],
    prev: ['Reduce temperature swings and restraint; good mixing design.', 'Réduire les variations et le bridage ; bonne conception des mélanges.'],
    insp: 'PT:2,MT:2,WFMT:2,ECT:1,ACFM:1,SWUT:2,TOFD:1', focus: ['Same-side: PT, MT, ECT, ACFM; opposite side: angle UT or TOFD.', 'Même face : PT, MT, courants de Foucault, ACFM ; face opposée : UT d’angle ou TOFD.'],
    a: 'FAT', m: { t: 'craze', side: 'ID' } });

  add({ s: '3.65', k: 'thermshock', f: 'mech', n: ['Thermal shock', 'Choc thermique'],
    mat: ['All metals', 'Tous les métaux'],
    where: ['Hot equipment hit by rain, fire water or a cold liquid upset', 'Équipement chaud frappé par la pluie, l’eau d’incendie ou un liquide froid'],
    st: [['A cold liquid suddenly hits hot restrained metal.', 'Un liquide froid frappe soudain un métal chaud bridé.'], ['Very high thermal stress in one event.', 'Contrainte thermique très élevée en un seul événement.'], ['Local surface cracks, often crazed.', 'Fissures de surface locales, souvent en faïençage.']],
    look: ['Local surface cracking, sometimes craze-cracked.', 'Fissuration superficielle locale, parfois en faïençage.'],
    prev: ['Avoid deluging hot equipment; design for less restraint.', 'Éviter d’arroser l’équipement chaud ; concevoir avec moins de bridage.'],
    insp: 'VT:1,PT:2,MT:2,SWUT:1', focus: ['After the event: PT or MT of the hit zone; VT may show advanced cracks.', 'Après l’événement : PT ou MT de la zone touchée ; le VT peut montrer les fissures avancées.'],
    a: 'CRACK', m: { t: 'craze', side: 'OD', local: 1 } });

  add({ s: '3.66', k: 'tihyd', f: 'metal', n: ['Titanium hydriding', 'Hydruration du titane'],
    mat: ['Titanium and its alloys', 'Titane et ses alliages'],
    where: ['Titanium exchanger tubes in sour water, amine, or galvanically coupled to steel', 'Tubes d’échangeur en titane en eaux acides, amines ou couplés à l’acier'],
    st: [['Hydrogen diffuses into hot titanium (above about 75 °C).', 'L’hydrogène diffuse dans le titane chaud (au-dessus d’environ 75 °C).'], ['Brittle hydrides form inside the metal.', 'Des hydrures fragiles se forment dans le métal.'], ['Cracking or breaking of tubes.', 'Fissuration ou rupture des tubes.']],
    look: ['Not visible; found by metallography or bend tests; cracks found by VT.', 'Invisible ; trouvé par métallographie ou pliage ; fissures vues en VT.'],
    prev: ['Avoid galvanic coupling to steel; temperature and pH limits.', 'Éviter le couplage galvanique avec l’acier ; limites de température et de pH.'],
    insp: 'VT:1,DT:2', focus: ['Sampling and destructive tests confirm; NDT not usually used.', 'Prélèvement et essais destructifs ; le CND est rarement employé.'],
    a: 'MAT', m: { t: 'none', comp: 'ti', micro: 'hydride' } });

  add({ s: '3.67', k: 'weth2s', f: 'h2', n: ['Wet H2S damage (blistering, HIC, SOHIC, SSC)', 'Dommages en H2S humide (cloquage, HIC, SOHIC, SSC)'],
    mat: ['Carbon steel; SSC also affects low-alloy and martensitic steels', 'Acier au carbone ; la SSC touche aussi les aciers faiblement alliés et martensitiques'],
    where: ['Sour water and wet H2S service: FCC, coker, hydroprocessing overheads, amine units', 'Eaux acides et H2S humide : têtes FCC, cokeur, hydrotraitement, unités d’amines'],
    st: [['Corrosion in wet H2S releases atomic hydrogen into the steel.', 'La corrosion en H2S humide libère de l’hydrogène atomique dans l’acier.'], ['Hydrogen collects at inclusions: blisters and stepwise HIC; SOHIC stacks near welds; SSC at hard zones.', 'L’hydrogène s’accumule aux inclusions : cloques et HIC en escalier ; SOHIC empilée près des soudures ; SSC aux zones dures.'], ['Linked cracks run through the wall.', 'Les fissures reliées traversent la paroi.']],
    look: ['ID bulges (blisters); internal stepwise cracks; through-thickness stacked cracks near welds.', 'Bosses côté intérieur (cloques) ; fissures internes en escalier ; fissures empilées près des soudures.'],
    prev: ['HIC-resistant clean steel; PWHT and hardness limits; coatings or cladding; process control.', 'Acier propre résistant HIC ; détensionnement et limites de dureté ; revêtements ou placage ; conduite du procédé.'],
    insp: 'WFMT:2,ACFM:2,SWUT:2,PAUT:2,UT:1,VT:1,MON:1', focus: ['WFMT or ACFM on the ID surface; angle UT/PAUT to find and size HIC and SOHIC; straight beam maps blisters.', 'MT fluorescent ou ACFM côté intérieur ; UT d’angle/PAUT pour détecter et dimensionner HIC et SOHIC ; le faisceau droit cartographie les cloques.'],
    a: 'HIC', m: { t: 'blister', side: 'ID', hic: 1 } });
}());
