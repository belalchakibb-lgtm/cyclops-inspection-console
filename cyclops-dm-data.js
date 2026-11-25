/* CYCLOPS damage-mechanism catalogue, part 1 of 2 (API RP 571, 3rd edition 2020, sections 3.1–3.34).
   Short training summaries written for CYCLOPS, not the text of RP 571: read the standard itself for the full
   description, critical factors, figures and references. RP 571 explains mechanisms; it does not set acceptance limits.
   Fields: s = RP 571 section, f = family, n = name, mat = materials, where = typical equipment, st = how it starts /
   grows / ends (3 stages), look = appearance, prev = prevention, insp = methods ("CODE:0-2"), focus = inspection focus,
   a = assessment key (see ASSESS in cyclops-dmlab.js), m = 3D morphology. */
(function () {
  'use strict';
  const DM = window.CYDM_DATA = window.CYDM_DATA || [];
  const add = (o) => DM.push(o);

  add({ s: '3.1', k: 'e885', f: 'metal', n: ['885 °F (475 °C) embrittlement', 'Fragilisation à 475 °C (885 °F)'],
    mat: ['Ferritic and duplex stainless steels, ferrite in 300-series weld metal', 'Inox ferritiques et duplex, ferrite du métal fondu des inox 300'],
    where: ['Fractionator internals, heater parts and duplex equipment running about 315–540 °C', 'Internes de colonnes, pièces de four et équipements duplex vers 315–540 °C'],
    st: [['A fine phase forms inside the ferrite during long service in the hot range.', 'Une phase fine se forme dans la ferrite pendant un long service dans la plage chaude.'], ['Hardness rises and toughness falls; nothing shows on the surface.', 'La dureté augmente et la ténacité chute ; rien ne se voit en surface.'], ['At start-up or when cold, a sudden brittle crack can run with little warning.', 'Au démarrage ou à froid, une fissure fragile soudaine peut se propager sans prévenir.']],
    look: ['No visible change. Higher hardness; brittle fracture at low temperature.', 'Aucun changement visible. Dureté plus élevée ; rupture fragile à basse température.'],
    prev: ['Use low-ferrite or non-ferritic alloys; avoid long exposure in the range; heat treatment can restore toughness.', 'Alliages peu ou pas ferritiques ; éviter l’exposition prolongée ; un traitement thermique peut restaurer la ténacité.'],
    insp: 'HT:1,DT:2,VT:0,UT:0', focus: ['Not found by routine NDT: impact or bend test of a removed sample; hardness may hint.', 'Non détectable par CND courant : essai de résilience ou de pliage sur prélèvement ; la dureté peut alerter.'],
    a: 'MAT', m: { t: 'none', comp: 'vessel', micro: 'precip' } });

  add({ s: '3.2', k: 'amine', f: 'thin', n: ['Amine corrosion', 'Corrosion par les amines'],
    mat: ['Carbon steel mainly; stainless steels resist better', 'Surtout l’acier au carbone ; les inox résistent mieux'],
    where: ['Amine regenerators, reboilers, hot lean/rich amine piping, flow turbulence spots', 'Régénérateurs, rebouilleurs, conduites d’amine chaude, zones turbulentes'],
    st: [['Dissolved acid gas and degraded amine attack the steel where flow is turbulent or hot.', 'Les gaz acides dissous et l’amine dégradée attaquent l’acier là où l’écoulement est turbulent ou chaud.'], ['Local thinning and under-deposit attack grow at bends, welds and interfaces.', 'Amincissement local et attaque sous dépôt progressent aux coudes, soudures et interfaces.'], ['Wall loss reaches minimum thickness and may leak.', 'La perte d’épaisseur atteint le minimum et peut fuir.']],
    look: ['Local thinning or under-deposit attack; smoother general loss at low velocity.', 'Amincissement local ou attaque sous dépôt ; perte plus uniforme à faible vitesse.'],
    prev: ['Control acid-gas loading, heat-stable salts and velocity; upgrade to stainless where needed.', 'Maîtriser la charge en gaz acides, les sels stables et la vitesse ; passer en inox si besoin.'],
    insp: 'VT:2,UT:2,UTS:2,RT:1,MON:1', focus: ['Internal VT at impingement and turbulent areas, then UT scanning of thin areas.', 'VT interne aux zones d’impact et turbulentes, puis cartographie UT des zones minces.'],
    a: 'LML', m: { t: 'local', side: 'ID', c: 'black' } });

  add({ s: '3.3', k: 'amscc', f: 'scc', n: ['Amine stress corrosion cracking', 'Corrosion sous contrainte par les amines'],
    mat: ['Carbon and low-alloy steels', 'Aciers au carbone et faiblement alliés'],
    where: ['Non-PWHT welds in amine absorbers, regenerators, lean amine piping', 'Soudures non détensionnées des absorbeurs, régénérateurs et conduites d’amine pauvre'],
    st: [['Tensile residual stress near a non-stress-relieved weld meets lean amine.', 'La contrainte résiduelle près d’une soudure non détensionnée rencontre l’amine pauvre.'], ['Fine branched cracks grow from the process side, parallel to the weld.', 'De fines fissures ramifiées progressent côté procédé, parallèles à la soudure.'], ['Cracks link up through the wall and leak.', 'Les fissures se rejoignent à travers la paroi et fuient.']],
    look: ['Tight intergranular cracks, oxide-filled, in the high residual stress zone near welds.', 'Fissures intergranulaires serrées, remplies d’oxyde, dans la zone de contrainte résiduelle près des soudures.'],
    prev: ['PWHT carbon steel welds; use stainless or clad where justified; water-wash before hot work.', 'Détensionner les soudures ; inox ou plaqué si justifié ; laver avant travaux à chaud.'],
    insp: 'WFMT:2,ACFM:2,ECT:1,SWUT:2,PT:0,VT:0', focus: ['Clean the surface, then WFMT or ACFM at welds; angle-beam UT to size depth.', 'Nettoyer la surface, puis MT fluorescent ou ACFM aux soudures ; UT d’angle pour la profondeur.'],
    a: 'CRACK', m: { t: 'scc', side: 'ID', branch: 2 } });

  add({ s: '3.4', k: 'nh3scc', f: 'scc', n: ['Ammonia stress corrosion cracking', 'Corrosion sous contrainte par l’ammoniac'],
    mat: ['Brasses and copper alloys (wet ammonia); carbon steel (anhydrous ammonia)', 'Laitons et alliages de cuivre (ammoniac humide) ; acier au carbone (ammoniac anhydre)'],
    where: ['Brass exchanger tubes, rolled tube ends; ammonia storage spheres and tanks', 'Tubes d’échangeur en laiton, dudgeonnages ; sphères et réservoirs d’ammoniac'],
    st: [['Ammonia plus oxygen and stress attack the alloy surface.', 'L’ammoniac, l’oxygène et la contrainte attaquent la surface.'], ['Single or branched cracks spread, often at rolled or cold-worked zones.', 'Des fissures simples ou ramifiées se propagent, souvent aux zones dudgeonnées ou écrouies.'], ['Tubes crack through and leak.', 'Les tubes fissurent de part en part et fuient.']],
    look: ['Brass: cracks with bluish corrosion products. Steel: cracks at welds in storage vessels.', 'Laiton : fissures avec produits de corrosion bleutés. Acier : fissures aux soudures des réservoirs.'],
    prev: ['Control oxygen and pH; resistant alloys; PWHT of steel storage; stress relief of tube ends.', 'Maîtriser oxygène et pH ; alliages résistants ; détensionnement des réservoirs et des tubes.'],
    insp: 'ECT:2,VT:1,PT:1,WFMT:2', focus: ['ECT of exchanger tubes; PT at rolled ends; WFMT of tank and sphere welds.', 'Courants de Foucault des tubes ; PT aux dudgeonnages ; MT fluorescent des soudures de réservoirs.'],
    a: 'CRACK', m: { t: 'scc', side: 'OD', comp: 'brass', branch: 2 } });

  add({ s: '3.5', k: 'nh4hs', f: 'thin', n: ['Ammonium bisulfide corrosion (alkaline sour water)', 'Corrosion par bisulfure d’ammonium (eau acide alcaline)'],
    mat: ['Carbon steel; stainless, duplex and nickel alloys resist better', 'Acier au carbone ; inox, duplex et alliages de nickel résistent mieux'],
    where: ['Hydroprocessing reactor effluent air coolers and piping, sour water units', 'Aéroréfrigérants et conduites d’effluent d’hydrotraitement, unités d’eaux acides'],
    st: [['Concentrated bisulfide water meets high velocity at a bend or tube inlet.', 'L’eau concentrée en bisulfure rencontre une forte vitesse à un coude ou une entrée de tube.'], ['Very fast local wall loss at turbulence and impingement points.', 'Perte d’épaisseur locale très rapide aux zones turbulentes et d’impact.'], ['Sudden thinning to leak, sometimes far from expected spots.', 'Amincissement brutal jusqu’à la fuite, parfois loin des zones attendues.']],
    look: ['Localized, sometimes extreme, metal loss at changes of direction and tube inlets.', 'Perte locale parfois extrême aux changements de direction et entrées de tubes.'],
    prev: ['Limit concentration and velocity; good wash-water injection design; alloy upgrades.', 'Limiter concentration et vitesse ; bien concevoir l’injection d’eau ; alliages supérieurs.'],
    insp: 'UTS:2,RT:2,ECT:1,UT:1,VT:1', focus: ['Scan turbulent and low-flow areas and downstream of water injection; tube inspection by ECT or IRIS.', 'Cartographier zones turbulentes et calmes, en aval de l’injection d’eau ; tubes par courants de Foucault ou IRIS.'],
    a: 'LML', m: { t: 'groove', side: 'ID', c: 'black' } });

  add({ s: '3.6', k: 'nh4cl', f: 'thin', n: ['Ammonium chloride and amine hydrochloride corrosion', 'Corrosion par chlorure d’ammonium et chlorhydrates d’amine'],
    mat: ['All common alloys; carbon steel most affected', 'Tous les alliages courants ; acier au carbone le plus touché'],
    where: ['Crude tower overheads, hydroprocessing effluent, reformer and FCC fractionator tops', 'Têtes de colonnes de distillation, effluents d’hydrotraitement, sommets de fractionnateurs'],
    st: [['Salts deposit from the gas before any water condenses.', 'Des sels se déposent à partir du gaz avant la condensation de l’eau.'], ['The salts absorb water and attack locally underneath.', 'Les sels absorbent l’eau et attaquent localement en dessous.'], ['Deep local pits and thinning, which can leak quickly.', 'Piqûres et amincissements locaux profonds pouvant fuir rapidement.']],
    look: ['White, green or brown salt deposits; very local pitting underneath (washing removes the evidence).', 'Dépôts de sels blancs, verts ou bruns ; piqûres très locales dessous (le lavage efface les traces).'],
    prev: ['Keep metal above the salt deposition temperature; water wash; limit chlorides and ammonia.', 'Maintenir le métal au-dessus de la température de dépôt ; lavage à l’eau ; limiter chlorures et ammoniac.'],
    insp: 'UTS:2,RT:2,VT:1,MON:1', focus: ['Scanning UT or RT where salts can form or collect; salts move, so cover wide areas.', 'UT par balayage ou RT là où les sels se forment ou s’accumulent ; ils migrent, couvrir large.'],
    a: 'PIT', m: { t: 'pits', side: 'ID', c: 'salt', dep: 1 } });

  add({ s: '3.7', k: 'orgacid', f: 'thin', n: ['Aqueous organic acid corrosion', 'Corrosion par acides organiques aqueux'],
    mat: ['Carbon and low-alloy steels', 'Aciers au carbone et faiblement alliés'],
    where: ['Crude and vacuum overheads, first condensing water', 'Têtes de colonnes atmosphérique et sous vide, premières condensations'],
    st: [['Light organic acids from the crude dissolve in the first water drops.', 'Les acides organiques légers du brut se dissolvent dans les premières gouttes d’eau.'], ['General and local loss where water condenses or separates.', 'Perte générale et locale là où l’eau se condense ou se sépare.'], ['Wall reaches minimum thickness.', 'La paroi atteint l’épaisseur minimale.']],
    look: ['General or local thinning at condensation and water-separation points.', 'Amincissement général ou local aux points de condensation et de séparation d’eau.'],
    prev: ['Neutralizer and filming inhibitor programmes; alloy upgrade of the condensing zone.', 'Neutralisants et inhibiteurs filmogènes ; alliage supérieur dans la zone de condensation.'],
    insp: 'UT:2,UTS:2,RT:2,GWT:1,MON:2', focus: ['UT and RT of the condensing zone; corrosion probes with water analysis.', 'UT et RT de la zone de condensation ; sondes de corrosion avec analyse d’eau.'],
    a: 'GML', m: { t: 'uniform', side: 'ID', c: 'black' } });

  add({ s: '3.8', k: 'atmos', f: 'thin', n: ['Atmospheric corrosion', 'Corrosion atmosphérique'],
    mat: ['Carbon and low-alloy steels, copper-alloyed aluminium', 'Aciers au carbone et faiblement alliés, aluminium allié au cuivre'],
    where: ['Unpainted or damaged-coating piping, supports, marine and humid industrial sites', 'Tuyauteries non peintes ou au revêtement endommagé, supports, sites marins et industriels humides'],
    st: [['Moisture and airborne salts or pollutants wet the bare steel where the coating fails.', 'L’humidité et les sels ou polluants mouillent l’acier nu là où le revêtement cède.'], ['Rust spreads; trapped water at supports concentrates attack.', 'La rouille s’étend ; l’eau piégée aux supports concentre l’attaque.'], ['General or local loss reduces wall and load capacity.', 'La perte générale ou locale réduit l’épaisseur et la capacité.']],
    look: ['Rust, general or local thinning, worst where water is trapped or coating is broken.', 'Rouille, amincissement général ou local, pire là où l’eau stagne ou le revêtement est cassé.'],
    prev: ['Maintain coatings; design to drain water; avoid crevices at supports.', 'Entretenir les revêtements ; concevoir pour drainer ; éviter les interstices aux supports.'],
    insp: 'VT:2,UT:2,UTS:1,RT:1,GWT:1,EMAT:1', focus: ['Visual survey of coating condition, then UT where rust or crevices are found.', 'Inspection visuelle des revêtements, puis UT là où se trouvent rouille ou interstices.'],
    a: 'GML', m: { t: 'uniform', side: 'OD', c: 'rust' } });

  add({ s: '3.9', k: 'boiler', f: 'thin', n: ['Boiler water and steam condensate corrosion', 'Corrosion par eau de chaudière et condensats'],
    mat: ['Carbon and low-alloy steels', 'Aciers au carbone et faiblement alliés'],
    where: ['Boiler feedwater, deaerators, economizers, condensate return lines', 'Eau alimentaire, dégazeurs, économiseurs, retours de condensats'],
    st: [['Dissolved oxygen or CO2 enters the water through leaks or poor treatment.', 'De l’oxygène ou du CO2 dissous entre par des fuites ou un mauvais traitement.'], ['Oxygen gives pits; carbonic acid gives grooving and thinning in condensate.', 'L’oxygène donne des piqûres ; l’acide carbonique donne rainurage et amincissement dans les condensats.'], ['Pits or grooves perforate tubes and lines.', 'Piqûres ou rainures perforent tubes et lignes.']],
    look: ['Oxygen pits (often under tubercles); smooth grooving in condensate lines.', 'Piqûres d’oxygène (souvent sous tubercules) ; rainures lisses dans les condensats.'],
    prev: ['Deaeration, oxygen scavenging and amine treatment; monitor water chemistry.', 'Dégazage, réducteurs d’oxygène et traitement aux amines ; suivre la chimie de l’eau.'],
    insp: 'MON:2,UT:1,UTS:1,VT:1', focus: ['Water chemistry monitoring is the first control; UT where loss is suspected.', 'Le suivi de la chimie de l’eau est le premier contrôle ; UT là où une perte est suspectée.'],
    a: 'PIT', m: { t: 'tuber', side: 'ID', c: 'rust' } });

  add({ s: '3.10', k: 'brine', f: 'thin', n: ['Brine corrosion', 'Corrosion par saumure'],
    mat: ['Carbon steel mostly; stainless and aluminium also', 'Surtout l’acier au carbone ; aussi inox et aluminium'],
    where: ['Desalter water, produced water, cooling and brine systems', 'Eau de dessaleur, eau de production, systèmes de refroidissement et de saumure'],
    st: [['Chloride salts in water break down protective films, often with oxygen.', 'Les chlorures dans l’eau détruisent les films protecteurs, souvent avec l’oxygène.'], ['Heavy scale and tubercles form; wide pits grow beneath.', 'Calamine épaisse et tubercules se forment ; de larges piqûres grandissent dessous.'], ['Pits perforate; stainless may pit or crack.', 'Les piqûres percent ; l’inox peut piquer ou fissurer.']],
    look: ['Scale and tubercles on carbon steel; large wide pits after cleaning.', 'Calamine et tubercules sur acier au carbone ; larges piqûres après nettoyage.'],
    prev: ['Exclude oxygen; inhibitors; coatings and resistant alloys.', 'Exclure l’oxygène ; inhibiteurs ; revêtements et alliages résistants.'],
    insp: 'UT:2,UTS:2,RT:2,GWT:1,MON:1', focus: ['UT scanning from outside; GWT to screen long lines, then local follow-up.', 'Cartographie UT de l’extérieur ; ondes guidées pour dépister, puis contrôle local.'],
    a: 'PIT', m: { t: 'tuber', side: 'ID', c: 'rust' } });

  add({ s: '3.11', k: 'brittle', f: 'mech', n: ['Brittle fracture', 'Rupture fragile'],
    mat: ['Carbon and low-alloy steels, especially older steels; 400-series stainless', 'Aciers au carbone et faiblement alliés, surtout anciens ; inox série 400'],
    where: ['Thick vessels during hydrotest, start-up, auto-refrigeration or cold weather', 'Équipements épais en épreuve, au démarrage, en auto-réfrigération ou par grand froid'],
    st: [['A crack-like flaw exists, and the metal is below its toughness transition temperature.', 'Un défaut de type fissure existe et le métal est sous sa température de transition.'], ['Stress (test pressure or thermal) reaches a critical level at the flaw.', 'La contrainte (pression d’épreuve ou thermique) atteint un niveau critique au défaut.'], ['The crack runs almost instantly, with little deformation.', 'La fissure se propage presque instantanément, avec peu de déformation.']],
    look: ['Straight, non-branched fracture with chevron marks pointing to the origin; little deformation.', 'Rupture droite, non ramifiée, avec chevrons pointant l’origine ; peu de déformation.'],
    prev: ['Correct material toughness; minimum pressurising temperature; avoid cold upsets.', 'Ténacité adaptée ; température minimale de mise en pression ; éviter les excursions froides.'],
    insp: 'SWUT:1,MT:1,PT:1,VT:0', focus: ['Not found by routine inspection: check susceptible vessels for pre-existing crack-like flaws.', 'Non détectable en routine : rechercher les défauts préexistants sur les équipements sensibles.'],
    a: 'BRIT', m: { t: 'crack', side: 'OD', straight: 1, chevron: 1 } });

  add({ s: '3.12', k: 'carbscc', f: 'scc', n: ['Carbonate stress corrosion cracking', 'Corrosion sous contrainte par carbonates'],
    mat: ['Carbon and low-alloy steels, welds and cold-worked areas', 'Aciers au carbone et faiblement alliés, soudures et zones écrouies'],
    where: ['FCC main fractionator overhead, sour water, CO2 removal units', 'Têtes de fractionnateur FCC, eaux acides, unités de décarbonatation'],
    st: [['Alkaline sour water with carbonate touches a stressed, non-PWHT weld.', 'L’eau acide alcaline carbonatée touche une soudure contrainte non détensionnée.'], ['Spider-web or parallel branched cracks grow near the weld.', 'Des fissures ramifiées en toile ou parallèles progressent près de la soudure.'], ['Through-wall cracks leak.', 'Les fissures traversantes fuient.']],
    look: ['Surface cracks parallel to the weld in the HAZ or nearby base metal, oxide-filled.', 'Fissures de surface parallèles à la soudure, en ZAT ou métal de base voisin, remplies d’oxyde.'],
    prev: ['PWHT; resistant cladding; control pH and carbonate.', 'Détensionnement ; placage résistant ; maîtriser pH et carbonates.'],
    insp: 'MON:2,WFMT:2,ACFM:2,SWUT:2', focus: ['Monitor water pH and carbonate; WFMT or ACFM of welds; angle UT for depth.', 'Suivre pH et carbonates ; MT fluorescent ou ACFM des soudures ; UT d’angle pour la profondeur.'],
    a: 'CRACK', m: { t: 'scc', side: 'ID', branch: 3 } });

  add({ s: '3.13', k: 'carbur', f: 'ht', n: ['Carburization', 'Carburation'],
    mat: ['Carbon and low-alloy steels, stainless, nickel alloys with iron, cast HK/HP', 'Aciers au carbone et faiblement alliés, inox, alliages de nickel ferreux, fontes HK/HP'],
    where: ['Heater tubes in coking or carburizing service, ethylene furnaces', 'Tubes de four en service cokéfiant, fours d’éthylène'],
    st: [['Carbon diffuses into the hot metal surface.', 'Le carbone diffuse dans la surface du métal chaud.'], ['A hard, brittle carbide layer deepens into the wall.', 'Une couche de carbures dure et fragile s’approfondit dans la paroi.'], ['Loss of ductility; cracking or bulging under stress.', 'Perte de ductilité ; fissuration ou déformation sous contrainte.']],
    look: ['No visible change early; harder, magnetic layer later; cracks in advanced stages.', 'Pas de changement visible au début ; couche plus dure et magnétique ensuite ; fissures en stade avancé.'],
    prev: ['Resistant alloys; control coking and decoking practices.', 'Alliages résistants ; maîtriser cokéfaction et décokage.'],
    insp: 'HT:1,FMR:1,DT:2,ECT:1,VT:0,UT:0', focus: ['Destructive sampling confirms depth; hardness, magnetic or eddy-current checks may indicate.', 'Le prélèvement confirme la profondeur ; dureté, magnétisme ou courants de Foucault peuvent signaler.'],
    a: 'MAT', m: { t: 'layer', comp: 'tube', side: 'ID', c: 'grey' } });

  add({ s: '3.14', k: 'caustic', f: 'thin', n: ['Caustic corrosion (gouging)', 'Corrosion caustique (gougeage)'],
    mat: ['Carbon steel, low-alloy steel, 400-series stainless', 'Acier au carbone, faiblement allié, inox série 400'],
    where: ['Boiler tubes under deposits, caustic injection points, high heat-flux zones', 'Tubes de chaudière sous dépôts, injections de soude, zones à fort flux thermique'],
    st: [['Caustic concentrates under a deposit where water boils away.', 'La soude se concentre sous un dépôt là où l’eau s’évapore.'], ['The protective oxide dissolves; a groove or gouge forms.', 'L’oxyde protecteur se dissout ; une rainure ou un gougeage se forme.'], ['Local wall loss to rupture or leak.', 'Perte locale jusqu’à rupture ou fuite.']],
    look: ['Local grooves or gouges, often filled with deposits that hide the damage.', 'Rainures ou gougeages locaux, souvent remplis de dépôts qui masquent le dommage.'],
    prev: ['Boiler water control; proper injection design; avoid concentration.', 'Maîtrise de l’eau de chaudière ; bonne conception des injections ; éviter la concentration.'],
    insp: 'UT:2,UTS:2,SWUT:1,RT:1,VT:1', focus: ['UT scanning; angle beam or TOFD for local gouges; RT within its limits.', 'Cartographie UT ; faisceau d’angle ou TOFD pour les gougeages ; RT dans ses limites.'],
    a: 'LML', m: { t: 'groove', side: 'ID', c: 'black', dep: 1 } });

  add({ s: '3.15', k: 'causcc', f: 'scc', n: ['Caustic stress corrosion cracking', 'Corrosion sous contrainte caustique'],
    mat: ['Carbon steel, low-alloy steel, 300-series stainless', 'Acier au carbone, faiblement allié, inox série 300'],
    where: ['Non-PWHT welds and bends in caustic service, steam-traced lines', 'Soudures et cintrages non détensionnés en service caustique, lignes tracées vapeur'],
    st: [['Hot caustic contacts a weld with high residual stress.', 'La soude chaude touche une soudure à forte contrainte résiduelle.'], ['Fine branched cracks grow, mainly parallel to the weld.', 'De fines fissures ramifiées progressent, surtout parallèles à la soudure.'], ['Through-wall cracking and leaks.', 'Fissuration traversante et fuites.']],
    look: ['Spider-web of fine, oxide-filled cracks next to welds.', 'Réseau de fines fissures remplies d’oxyde près des soudures.'],
    prev: ['PWHT of steel welds; temperature limits; nickel alloys for hot service.', 'Détensionnement ; limites de température ; alliages de nickel pour le service chaud.'],
    insp: 'WFMT:2,ACFM:2,ECT:1,SWUT:2,PT:1', focus: ['Careful surface preparation without smearing; WFMT, ACFM, then angle UT for depth.', 'Préparation sans écrouissage ; MT fluorescent, ACFM, puis UT d’angle pour la profondeur.'],
    a: 'CRACK', m: { t: 'scc', side: 'ID', branch: 3 } });

  add({ s: '3.16', k: 'cavit', f: 'thin', n: ['Cavitation', 'Cavitation'],
    mat: ['Most metals: copper alloys, cast iron, steels, stainless, nickel alloys', 'La plupart des métaux : cuivreux, fonte, aciers, inox, nickel'],
    where: ['Pump impellers and casings, downstream of control valves and orifices', 'Roues et volutes de pompes, en aval des vannes de régulation et orifices'],
    st: [['Pressure drops below vapour pressure; bubbles form.', 'La pression descend sous la tension de vapeur ; des bulles se forment.'], ['Bubbles collapse on the metal, hammering tiny craters.', 'Les bulles implosent sur le métal et martèlent de petits cratères.'], ['Sharp-edged pits merge into deep, rough holes.', 'Les piqûres à bords vifs fusionnent en trous profonds et rugueux.']],
    look: ['Sharp-edged, rough pitting localized in the low-pressure zone.', 'Piqûres rugueuses à bords vifs localisées dans la zone de basse pression.'],
    prev: ['Enough suction head (NPSH); streamlined flow; harder alloys.', 'Charge à l’aspiration suffisante (NPSH) ; écoulement profilé ; alliages plus durs.'],
    insp: 'VT:2,UT:1,UTS:1,RT:1', focus: ['VT (borescope if needed) at shutdown; UT where the surface allows.', 'VT (endoscope si besoin) à l’arrêt ; UT là où la surface le permet.'],
    a: 'PIT', m: { t: 'pits', side: 'ID', sharp: 1, c: 'grey' } });

  add({ s: '3.17', k: 'clscc', f: 'scc', n: ['Chloride stress corrosion cracking', 'Corrosion sous contrainte par chlorures'],
    mat: ['300-series stainless, some nickel alloys', 'Inox série 300, certains alliages de nickel'],
    where: ['Stainless piping under wet insulation, exchangers, water-wetted hot equipment', 'Tuyauteries inox sous calorifuge humide, échangeurs, équipements chauds mouillés'],
    st: [['Chlorides concentrate on hot stainless under tensile stress (often under wet insulation).', 'Les chlorures se concentrent sur l’inox chaud sous contrainte (souvent sous calorifuge humide).'], ['Highly branched, fine cracks spread without visible corrosion.', 'Des fissures fines très ramifiées progressent sans corrosion visible.'], ['Cracks go through the wall; leaks appear suddenly.', 'Les fissures traversent ; des fuites apparaissent brutalement.']],
    look: ['Many branched cracks like a lightning pattern; no general corrosion.', 'Nombreuses fissures ramifiées en éclair ; pas de corrosion générale.'],
    prev: ['Keep insulation dry; low-chloride water; resistant duplex or nickel alloys.', 'Garder le calorifuge sec ; eau pauvre en chlorures ; duplex ou alliages de nickel.'],
    insp: 'PT:2,ECT:1,SWUT:2,VT:1', focus: ['PT is the main method (surface must be clean); angle UT or PAUT for depth.', 'Le PT est la méthode principale (surface propre) ; UT d’angle ou PAUT pour la profondeur.'],
    a: 'CRACK', m: { t: 'scc', side: 'OD', branch: 3, comp: 'ss', insul: 1 } });

  add({ s: '3.18', k: 'co2', f: 'thin', n: ['CO2 corrosion', 'Corrosion par le CO2'],
    mat: ['Carbon and low-alloy steels (below 12 % Cr)', 'Aciers au carbone et faiblement alliés (moins de 12 % Cr)'],
    where: ['Condensate systems, hydrogen plants, crude overheads, CO2 removal', 'Condensats, unités d’hydrogène, têtes de colonnes, décarbonatation'],
    st: [['CO2 dissolves in water and forms carbonic acid.', 'Le CO2 se dissout dans l’eau et forme de l’acide carbonique.'], ['Local thinning and pitting where water wets the steel, faster at turbulence.', 'Amincissement local et piqûres là où l’eau mouille l’acier, plus vite aux turbulences.'], ['Grooves or pits perforate.', 'Rainures ou piqûres percent.']],
    look: ['Smooth-walled pits, grooves and thinning where water condenses; weld preferential attack.', 'Piqûres à parois lisses, rainures et amincissement là où l’eau se condense ; attaque préférentielle des soudures.'],
    prev: ['Inhibitors and pH control; 12 % Cr or stainless upgrades.', 'Inhibiteurs et contrôle du pH ; inox 12 % Cr ou plus.'],
    insp: 'VT:1,UT:2,UTS:2,RT:2,SWUT:1', focus: ['Profile RT and UT where water wets; angle beam or RT for weld preferential attack.', 'RT de profil et UT là où l’eau mouille ; faisceau d’angle ou RT pour l’attaque des soudures.'],
    a: 'LML', m: { t: 'groove', side: 'ID', c: 'grey' } });

  add({ s: '3.19', k: 'conccell', f: 'thin', n: ['Concentration cell corrosion', 'Corrosion par pile de concentration'],
    mat: ['Carbon steel most; all aqueous-corrodible alloys', 'Surtout l’acier au carbone ; tout alliage corrodable en milieu aqueux'],
    where: ['Under deposits, in crevices, flange faces, under gaskets and tubercles', 'Sous dépôts, dans les interstices, portées de brides, sous joints et tubercules'],
    st: [['A deposit or crevice creates a small zone with different chemistry.', 'Un dépôt ou un interstice crée une petite zone de chimie différente.'], ['The shielded zone becomes the anode and corrodes faster.', 'La zone abritée devient anode et se corrode plus vite.'], ['Uneven, pitted loss under the shield.', 'Perte irrégulière et piquée sous l’abri.']],
    look: ['Uneven pitted surface under deposits or in crevices.', 'Surface irrégulière et piquée sous dépôts ou dans les interstices.'],
    prev: ['Avoid crevices; keep surfaces clean; good flow.', 'Éviter les interstices ; surfaces propres ; bon écoulement.'],
    insp: 'VT:2,UT:2,UTS:2,RT:1', focus: ['VT with pit gauge where accessible; UT from the opposite side.', 'VT avec jauge de piqûres si accessible ; UT depuis l’autre face.'],
    a: 'PIT', m: { t: 'pits', side: 'ID', dep: 1, c: 'rust' } });

  add({ s: '3.20', k: 'coolw', f: 'thin', n: ['Cooling water corrosion', 'Corrosion par eau de refroidissement'],
    mat: ['Carbon steel, stainless, copper, aluminium, titanium, nickel alloys', 'Acier au carbone, inox, cuivre, aluminium, titane, nickel'],
    where: ['Exchanger tubes and shells, cooling water piping', 'Tubes et calandres d’échangeurs, conduites d’eau de refroidissement'],
    st: [['Oxygen, salts or microbes in cooling water attack the metal.', 'Oxygène, sels ou microbes de l’eau attaquent le métal.'], ['Pits, fouling and under-deposit attack grow at low flow and hot spots.', 'Piqûres, encrassement et attaque sous dépôt progressent aux zones lentes et chaudes.'], ['Tubes perforate and leak process to water.', 'Les tubes percent et fuient.']],
    look: ['General corrosion, pits, tubercles, fouling.', 'Corrosion générale, piqûres, tubercules, encrassement.'],
    prev: ['Water treatment, velocity control, resistant tube alloys.', 'Traitement de l’eau, maîtrise de la vitesse, tubes en alliage résistant.'],
    insp: 'MON:2,ECT:2,UT:1,VT:1', focus: ['Monitor water chemistry; inspect exchanger tubes by ECT or IRIS.', 'Suivre la chimie de l’eau ; tubes par courants de Foucault ou IRIS.'],
    a: 'PIT', m: { t: 'tuber', side: 'ID', c: 'rust' } });

  add({ s: '3.21', k: 'corrfat', f: 'mech', n: ['Corrosion fatigue', 'Fatigue-corrosion'],
    mat: ['All metals', 'Tous les métaux'],
    where: ['Deaerators, rotating equipment, cyclically loaded parts in water', 'Dégazeurs, machines tournantes, pièces chargées cycliquement en milieu aqueux'],
    st: [['Corrosion pits form where cyclic stress is high.', 'Des piqûres se forment là où la contrainte cyclique est forte.'], ['Straight cracks start from the pits and grow with each cycle.', 'Des fissures droites partent des piqûres et progressent à chaque cycle.'], ['Several parallel cracks; final fracture.', 'Plusieurs fissures parallèles ; rupture finale.']],
    look: ['Straight, unbranched, often multiple parallel cracks, starting at pits; oxide-filled.', 'Fissures droites, non ramifiées, souvent parallèles, partant de piqûres ; remplies d’oxyde.'],
    prev: ['Reduce cyclic stress and corrosion; coatings; good water treatment.', 'Réduire la contrainte cyclique et la corrosion ; revêtements ; bon traitement de l’eau.'],
    insp: 'WFMT:2,MT:2,PT:1,SWUT:2,VT:1', focus: ['Focus on welds; WFMT is widely used; cracks are tight.', 'Cibler les soudures ; le MT fluorescent est très utilisé ; fissures serrées.'],
    a: 'CRACK', m: { t: 'crack', side: 'ID', multi: 3, pits: 1 } });

  add({ s: '3.22', k: 'cui', f: 'thin', n: ['Corrosion under insulation (CUI)', 'Corrosion sous calorifuge (CSC)'],
    mat: ['Carbon and low-alloy steels; stainless can crack (chloride SCC)', 'Aciers au carbone et faiblement alliés ; l’inox peut fissurer (CSC chlorures)'],
    where: ['Insulated lines and vessels at about -4 to 175 °C, near supports, nozzles, damaged jackets', 'Lignes et capacités calorifugées vers -4 à 175 °C, près des supports, piquages, jaquettes abîmées'],
    st: [['Water enters through damaged jacketing or seals and soaks the insulation.', 'L’eau entre par une jaquette ou un joint endommagé et imbibe le calorifuge.'], ['Wet insulation keeps the steel wet; rough corrosion and scale grow, hidden.', 'Le calorifuge humide garde l’acier mouillé ; corrosion rugueuse et calamine progressent, cachées.'], ['Heavy local loss is found only when the insulation is removed, or by a leak.', 'Une forte perte locale n’est découverte qu’en retirant le calorifuge, ou par une fuite.']],
    look: ['Rough, uneven pitted loss under flaky scale, at wet spots; damaged jacketing outside.', 'Perte rugueuse et piquée sous calamine écailleuse, aux zones humides ; jaquette abîmée.'],
    prev: ['Good coatings under insulation, sealed jacketing, avoid operating in the risk range.', 'Bon revêtement sous calorifuge, jaquette étanche, éviter la plage de risque.'],
    insp: 'VT:2,RT:2,GWT:1,IRT:1,UT:1,UTS:2', focus: ['Plan with API 510/570 and API 583: remove insulation at likely spots; profile RT or real-time RT; GWT screening.', 'Planifier avec API 510/570 et API 583 : décalorifuger aux zones probables ; RT de profil ou temps réel ; dépistage par ondes guidées.'],
    a: 'LML', m: { t: 'cui', side: 'OD', c: 'rust', insul: 1 } });

  add({ s: '3.23', k: 'creep', f: 'ht', n: ['Creep and stress rupture', 'Fluage et rupture par fluage'],
    mat: ['All metals at high temperature', 'Tous les métaux à haute température'],
    where: ['Heater tubes, reformer tubes, hot piping and supports, hot reactor parts', 'Tubes de four, de reformeur, tuyauteries et supports chauds, pièces de réacteurs chaudes'],
    st: [['Above about half the melting temperature, the metal slowly stretches under load.', 'Au-dessus d’environ la moitié de la température de fusion, le métal s’allonge lentement sous charge.'], ['Voids form at grain boundaries, then link into microcracks; the tube bulges.', 'Des cavités se forment aux joints de grains puis se relient en microfissures ; le tube gonfle.'], ['Cracks run through; the tube ruptures (thick-lipped).', 'Les fissures traversent ; le tube se rompt (lèvres épaisses).']],
    look: ['Bulging and diameter growth; voids and fissures only seen by metallography; thick-lip rupture.', 'Gonflement et augmentation du diamètre ; cavités et fissures visibles en métallographie ; rupture à lèvres épaisses.'],
    prev: ['Stay below design temperature; burner management; creep-resistant alloys.', 'Rester sous la température de calcul ; conduite des brûleurs ; alliages résistant au fluage.'],
    insp: 'DIM:2,FMR:2,IRT:2,UT:1,DT:2,VT:1', focus: ['No single method: diameter strapping, tube-skin temperatures, replication and sampling together.', 'Aucune méthode seule : mesure de diamètre, températures de peau, répliques et prélèvements ensemble.'],
    a: 'CREEP', m: { t: 'bulge', comp: 'tube', voids: 1 } });

  add({ s: '3.24', k: 'dealloy', f: 'thin', n: ['Dealloying', 'Corrosion sélective (désalliage)'],
    mat: ['Copper alloys (brass, bronze, Cu-Ni), Alloy 400', 'Alliages de cuivre (laiton, bronze, Cu-Ni), alliage 400'],
    where: ['Brass exchanger tubes, valves and fittings in water', 'Tubes d’échangeur en laiton, robinetterie en milieu aqueux'],
    st: [['One element (zinc in brass) is removed selectively.', 'Un élément (le zinc du laiton) est dissous sélectivement.'], ['A porous, weak, copper-coloured layer grows inward.', 'Une couche poreuse, fragile, couleur cuivre, progresse vers l’intérieur.'], ['The part keeps its shape but has little strength; it breaks or leaks.', 'La pièce garde sa forme mais n’a plus de résistance ; elle casse ou fuit.']],
    look: ['Colour change: brass turns reddish copper; dull, porous surface.', 'Changement de couleur : le laiton devient rouge cuivre ; surface terne et poreuse.'],
    prev: ['Inhibited brasses; alloy selection; water chemistry.', 'Laitons inhibés ; choix d’alliage ; chimie de l’eau.'],
    insp: 'VT:2,HT:1,DT:2,ECT:1', focus: ['Colour change after scale removal; metallography confirms depth; hardness drops.', 'Couleur après décapage ; la métallographie confirme la profondeur ; la dureté chute.'],
    a: 'LML', m: { t: 'color', comp: 'brass', c: 'copper' } });

  add({ s: '3.25', k: 'decarb', f: 'ht', n: ['Decarburization', 'Décarburation'],
    mat: ['Carbon and low-alloy steels', 'Aciers au carbone et faiblement alliés'],
    where: ['Hot hydrogen service, fired heater tubes, fire-exposed steel', 'Service hydrogène chaud, tubes de four, acier exposé au feu'],
    st: [['At high temperature, carbon leaves the steel surface.', 'À haute température, le carbone quitte la surface de l’acier.'], ['A soft, carbide-free iron layer deepens.', 'Une couche de fer doux sans carbures s’approfondit.'], ['Loss of strength in the layer.', 'Perte de résistance dans la couche.']],
    look: ['No visible change; softer surface layer seen by metallography or hardness.', 'Pas de changement visible ; couche superficielle plus douce vue en métallographie ou dureté.'],
    prev: ['Control atmosphere and temperature; suitable alloys.', 'Maîtriser atmosphère et température ; alliages adaptés.'],
    insp: 'HT:1,FMR:1,DT:2,VT:0', focus: ['Hardness and replication; often inconclusive; sampling confirms.', 'Dureté et répliques ; souvent peu concluantes ; le prélèvement confirme.'],
    a: 'MAT', m: { t: 'layer', side: 'OD', c: 'grey', soft: 1 } });

  add({ s: '3.26', k: 'dmw', f: 'mech', n: ['Dissimilar metal weld cracking', 'Fissuration des soudures hétérogènes'],
    mat: ['Ferritic steel welded to austenitic stainless or nickel alloy', 'Acier ferritique soudé à de l’inox austénitique ou alliage de nickel'],
    where: ['Hot transition joints in heaters, boilers and hydroprocessing piping', 'Joints de transition chauds de fours, chaudières et tuyauteries d’hydrotraitement'],
    st: [['Different thermal expansion strains the fusion line at every heat-up.', 'Les dilatations différentes sollicitent la ligne de fusion à chaque montée en température.'], ['Creep and carbon migration weaken the ferritic side; cracks start at the toe.', 'Fluage et migration du carbone fragilisent le côté ferritique ; des fissures partent du pied.'], ['Cracks run along the fusion line and can separate the joint.', 'Les fissures suivent la ligne de fusion et peuvent séparer le joint.']],
    look: ['Cracks at the toe or along the fusion line on the ferritic side.', 'Fissures au pied ou le long de la ligne de fusion côté ferritique.'],
    prev: ['Nickel-based fillers; locate joints in cooler zones; good design.', 'Métal d’apport base nickel ; placer les joints en zone plus froide ; bonne conception.'],
    insp: 'PT:2,PAUT:2,TOFD:1,RT:1', focus: ['PT for surface; PAUT or TOFD at the fusion line; expert procedure for mixed materials.', 'PT en surface ; PAUT ou TOFD à la ligne de fusion ; procédure experte pour matériaux mixtes.'],
    a: 'CRACK', m: { t: 'crack', side: 'OD', fusion: 1, dmw: 1 } });

  add({ s: '3.27', k: 'erosion', f: 'thin', n: ['Erosion / erosion-corrosion', 'Érosion / érosion-corrosion'],
    mat: ['All metals, mostly carbon steel and copper alloys; refractories', 'Tous les métaux, surtout acier au carbone et cuivreux ; réfractaires'],
    where: ['Elbows, tees, reducers, downstream of valves and orifices, pump casings', 'Coudes, tés, réductions, aval des vannes et orifices, corps de pompes'],
    st: [['Fast flow, droplets or particles strip the protective film at a change of direction.', 'Un écoulement rapide, des gouttes ou particules arrachent le film protecteur à un changement de direction.'], ['Directional grooves, horseshoes and waves deepen along the flow.', 'Des rainures, fers à cheval et vagues orientés s’approfondissent dans le sens du flux.'], ['The outer radius of the elbow thins to a hole.', 'L’extrados du coude s’amincit jusqu’au trou.']],
    look: ['Grooves, gullies, waves and rounded holes following the flow; smooth and clean.', 'Rainures, ravines, vagues et trous arrondis suivant le flux ; lisses et propres.'],
    prev: ['Lower velocity; larger radius; harder alloys or wear-resistant liners.', 'Réduire la vitesse ; plus grand rayon ; alliages durs ou revêtements anti-usure.'],
    insp: 'UTS:2,UT:2,RT:2,VT:1,IRT:1', focus: ['UT grids or scans at changes of direction; random spot readings can miss it.', 'Grilles ou cartographies UT aux changements de direction ; les mesures ponctuelles au hasard peuvent la manquer.'],
    a: 'LML', m: { t: 'groove', side: 'ID', c: 'grey', flow: 1 } });

  add({ s: '3.28', k: 'ethscc', f: 'scc', n: ['Ethanol stress corrosion cracking', 'Corrosion sous contrainte par l’éthanol'],
    mat: ['Carbon steel', 'Acier au carbone'],
    where: ['Fuel-grade ethanol tanks, piping, blending and loading facilities', 'Réservoirs, tuyauteries, mélange et chargement d’éthanol carburant'],
    st: [['Ethanol with dissolved oxygen touches a stressed weld.', 'L’éthanol avec oxygène dissous touche une soudure contrainte.'], ['Tight branched cracks grow near welds, parallel or transverse.', 'Des fissures serrées ramifiées progressent près des soudures, parallèles ou transversales.'], ['Leaks, often found after the fact.', 'Fuites, souvent découvertes après coup.']],
    look: ['Tight, branched, product-filled cracks near welds.', 'Fissures serrées, ramifiées, remplies de produit, près des soudures.'],
    prev: ['PWHT; limit oxygen; coatings; prevention rather than inspection.', 'Détensionnement ; limiter l’oxygène ; revêtements ; la prévention plutôt que l’inspection.'],
    insp: 'WFMT:2,ACFM:2,SWUT:2,PT:1', focus: ['Where cracking is suspected: WFMT or ACFM of welds, angle UT for depth.', 'Si la fissuration est suspectée : MT fluorescent ou ACFM des soudures, UT d’angle pour la profondeur.'],
    a: 'CRACK', m: { t: 'scc', side: 'ID', branch: 2 } });

  add({ s: '3.29', k: 'dewpt', f: 'thin', n: ['Flue gas dew point corrosion', 'Corrosion au point de rosée des fumées'],
    mat: ['Carbon steel, low-alloy steel, 300-series stainless', 'Acier au carbone, faiblement allié, inox série 300'],
    where: ['Economizers, air preheaters, stacks, coolest heater and boiler sections', 'Économiseurs, réchauffeurs d’air, cheminées, zones les plus froides des fours et chaudières'],
    st: [['Flue gas cools below its acid dew point on a cold surface.', 'Les fumées se refroidissent sous leur point de rosée acide sur une surface froide.'], ['Sulfuric or hydrochloric acid condenses and attacks.', 'De l’acide sulfurique ou chlorhydrique se condense et attaque.'], ['General wastage with broad shallow pits; stainless may crack.', 'Perte générale avec larges piqûres peu profondes ; l’inox peut fissurer.']],
    look: ['General wastage and broad shallow pits on the cold-end surfaces.', 'Perte générale et larges piqûres peu profondes aux surfaces froides.'],
    prev: ['Keep metal above the dew point; low-sulfur fuel; resistant alloys.', 'Maintenir le métal au-dessus du point de rosée ; combustible pauvre en soufre ; alliages résistants.'],
    insp: 'UT:2,VT:1,RT:1', focus: ['UT thickness of tubes and stack; fins must often be removed locally.', 'UT d’épaisseur des tubes et de la cheminée ; ailettes souvent à retirer localement.'],
    a: 'GML', m: { t: 'uniform', side: 'OD', c: 'black', shallow: 1 } });

  add({ s: '3.30', k: 'fuelash', f: 'ht', n: ['Fuel ash corrosion', 'Corrosion par cendres de combustible'],
    mat: ['All usual heater and boiler alloys; 50Cr-50Ni resists better', 'Tous les alliages de fours et chaudières ; le 50Cr-50Ni résiste mieux'],
    where: ['Fired heater tubes, supports and hangers; boiler superheaters', 'Tubes, supports et suspentes de fours ; surchauffeurs de chaudières'],
    st: [['Vanadium, sodium and sulfur in the fuel form deposits on hot metal.', 'Vanadium, sodium et soufre du combustible forment des dépôts sur le métal chaud.'], ['The deposits melt and dissolve the oxide; severe wastage starts.', 'Les dépôts fondent et dissolvent l’oxyde ; une perte sévère commence.'], ['Deep wastage under a glassy slag; tube failure.', 'Perte profonde sous un laitier vitreux ; rupture du tube.']],
    look: ['Severe metal loss under a hard, glassy slag; deep rounded pits.', 'Perte sévère sous un laitier dur et vitreux ; piqûres profondes arrondies.'],
    prev: ['Fuel quality, additives, keep metal temperature below the slag melting point.', 'Qualité du combustible, additifs, métal sous la température de fusion du laitier.'],
    insp: 'VT:2,UT:1', focus: ['VT is usually enough (grit-blast the slag); UT to measure thickness.', 'Le VT suffit souvent (sabler le laitier) ; UT pour mesurer l’épaisseur.'],
    a: 'GML', m: { t: 'scale', comp: 'tube', side: 'OD', c: 'slag' } });

  add({ s: '3.31', k: 'galvanic', f: 'thin', n: ['Galvanic corrosion', 'Corrosion galvanique'],
    mat: ['All metals, the more active one corrodes', 'Tous les métaux, le plus actif se corrode'],
    where: ['Joints of dissimilar metals: bolted, welded or rolled, in water or wet soil', 'Assemblages de métaux différents : boulonnés, soudés ou dudgeonnés, dans l’eau ou un sol humide'],
    st: [['Two different metals are connected in an electrolyte.', 'Deux métaux différents sont reliés dans un électrolyte.'], ['The anodic metal corrodes faster next to the joint.', 'Le métal anodique se corrode plus vite près du joint.'], ['Local thinning on the anode side leads to leaks.', 'L’amincissement local côté anode conduit à la fuite.']],
    look: ['Groove or thinning on the more active metal right next to the joint.', 'Rainure ou amincissement sur le métal le plus actif juste à côté du joint.'],
    prev: ['Insulating kits; coat the cathode; avoid small anodes and large cathodes.', 'Kits isolants ; revêtir la cathode ; éviter petite anode et grande cathode.'],
    insp: 'VT:2,UT:2', focus: ['VT and UT thickness on the active side of the joint.', 'VT et UT d’épaisseur côté actif du joint.'],
    a: 'LML', m: { t: 'galv', side: 'OD', c: 'rust' } });

  add({ s: '3.32', k: 'o2fire', f: 'mech', n: ['Gaseous oxygen-enhanced ignition and combustion', 'Inflammation et combustion favorisées par l’oxygène gazeux'],
    mat: ['Steels and most metals in oxygen-rich service; nonmetals (seals, lubricants)', 'Aciers et la plupart des métaux en service oxygène ; non-métalliques (joints, lubrifiants)'],
    where: ['Oxygen piping, valves and regulators, especially at high velocity and impact points', 'Tuyauteries, vannes et détendeurs d’oxygène, surtout aux fortes vitesses et points d’impact'],
    st: [['A particle impact, friction or fast pressurisation heats a contaminant or seal.', 'Un impact de particule, un frottement ou une mise en pression rapide échauffe un contaminant ou un joint.'], ['The small fire ignites the metal itself in oxygen.', 'Le petit feu enflamme le métal lui-même dans l’oxygène.'], ['The pressure boundary burns through — sudden and destructive.', 'L’enveloppe brûle de part en part — soudain et destructeur.']],
    look: ['Burnt, melted metal and external heat damage; often catastrophic.', 'Métal brûlé et fondu, traces de chaleur externes ; souvent catastrophique.'],
    prev: ['Oxygen-clean systems, velocity limits, compatible materials, slow valve opening.', 'Nettoyage oxygène, limites de vitesse, matériaux compatibles, ouverture lente des vannes.'],
    insp: 'VT:1', focus: ['Cannot be inspected for in advance; look for tell-tale heat marks and faulty components.', 'Non détectable à l’avance ; chercher traces de chaleur et composants défaillants.'],
    a: 'FIRE', m: { t: 'burn', side: 'OD' } });

  add({ s: '3.33', k: 'graphcorr', f: 'thin', n: ['Graphitic corrosion of cast irons', 'Corrosion graphitique des fontes'],
    mat: ['Grey cast iron mainly; nodular and malleable irons', 'Surtout fonte grise ; fontes nodulaires et malléables'],
    where: ['Buried cast-iron water and fire-water pipe, pump casings, valves', 'Conduites enterrées d’eau et d’incendie en fonte, corps de pompes, vannes'],
    st: [['The iron matrix corrodes, leaving a graphite network.', 'La matrice de fer se corrode, laissant un réseau de graphite.'], ['A soft, charcoal-grey layer grows while the shape stays.', 'Une couche molle gris charbon progresse alors que la forme reste.'], ['The weak layer breaks under pressure or impact.', 'La couche fragile cède sous la pression ou un choc.']],
    look: ['Charcoal-grey, soft layer that can be cut with a knife; surface may look sound.', 'Couche gris charbon, molle, qui se taille au couteau ; la surface peut paraître saine.'],
    prev: ['Coatings, cathodic protection, alloy cast irons.', 'Revêtements, protection cathodique, fontes alliées.'],
    insp: 'VT:0,HT:1,DT:2,UT:1', focus: ['VT alone is misleading: probe for soft areas; sampling confirms.', 'Le VT seul trompe : sonder les zones molles ; le prélèvement confirme.'],
    a: 'LML', m: { t: 'color', comp: 'cast', c: 'charcoal' } });

  add({ s: '3.34', k: 'graphitiz', f: 'ht', n: ['Graphitization', 'Graphitisation'],
    mat: ['Some carbon and C-Mo steels', 'Certains aciers au carbone et C-Mo'],
    where: ['Hot piping and welds around 425–595 °C, FCC and boiler components', 'Tuyauteries et soudures chaudes vers 425–595 °C, FCC et chaudières'],
    st: [['Over years, carbides break down into graphite nodules.', 'Au fil des ans, les carbures se transforment en nodules de graphite.'], ['Graphite lines up in chains, often along the HAZ edge.', 'Le graphite s’aligne en chaînes, souvent au bord de la ZAT.'], ['A weak plane forms; brittle cracking at a weld.', 'Un plan faible se forme ; fissuration fragile à une soudure.']],
    look: ['Not visible; only metallography shows graphite nodules and chains.', 'Invisible ; seule la métallographie montre nodules et chaînes de graphite.'],
    prev: ['Use chromium-containing steels above about 425 °C.', 'Utiliser des aciers au chrome au-dessus d’environ 425 °C.'],
    insp: 'DT:2,FMR:1,VT:0,UT:0', focus: ['Full-thickness samples for metallography; replicas may miss mid-wall damage.', 'Prélèvements pleine épaisseur pour métallographie ; les répliques peuvent manquer le cœur.'],
    a: 'MAT', m: { t: 'none', comp: 'pipe', micro: 'graphite' } });
}());
