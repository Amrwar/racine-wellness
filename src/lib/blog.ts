import type { Locale } from "@/i18n/config";

/**
 * Blog posts, written in English and French. Article bodies are a list of simple blocks so
 * they can be rendered with the site's own typography (no Markdown pipeline needed).
 * Photos live in public/images/blog and are built by design/blog-photos.py.
 */

export type Photo = { src: string; width: number; height: number };

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "image"; photo: Photo; alt: string; caption?: string; diagram?: boolean };

type Localized = {
  title: string;
  excerpt: string;
  category: string;
  coverAlt: string;
  body: Block[];
};

export type Post = {
  slug: string;
  date: string; // ISO date
  readMinutes: number;
  cover: Photo;
  /** Diagrams are shown whole on a white card instead of cropped like photos. */
  coverDiagram?: boolean;
  en: Localized;
  fr: Localized;
};

const img = (name: string, width: number, height: number): Photo => ({
  src: `/images/blog/${name}.webp`,
  width,
  height,
});

const P = {
  deepTissue: img("deep-tissue", 1600, 1600),
  swedish: img("swedish", 1400, 1400),
  upperBack: img("upper-back", 1600, 1600),
  sports: img("sports-massage", 1600, 1600),
  anatomySketch: img("anatomy-sketch", 1060, 1060),
  anatomyStudy: img("anatomy-study", 816, 1200),
  postureChain: img("posture-chain", 898, 439),
  footImbalance: img("foot-imbalance", 816, 1200),
  shoulderRom: img("shoulder-rom", 816, 1200),
  studioTable: img("studio-table", 1600, 1600),
  studioTableSide: img("studio-table-side", 1400, 1400),
  ziadStudio: img("ziad-studio", 1400, 1086),
};

export const posts: Post[] = [
  {
    slug: "deep-tissue-vs-swedish-massage",
    date: "2026-10-06",
    readMinutes: 5,
    cover: P.deepTissue,
    en: {
      title: "Deep tissue or Swedish massage: which one do you need?",
      excerpt:
        "Both are effective, but they do different jobs. Here is how to choose the right treatment for how your body feels today.",
      category: "Massage therapy",
      coverAlt: "Ziad working on a client's upper back during a deep tissue massage",
      body: [
        {
          type: "p",
          text: "It's the question I hear most often when someone books for the first time: “Should I get a deep tissue or a Swedish massage?” The honest answer is that it depends less on the name of the technique and more on what you want to feel when you get off the table.",
        },
        { type: "h2", text: "Swedish massage: calm the system" },
        {
          type: "p",
          text: "Swedish massage uses long, flowing strokes, kneading and gentle rhythm. Its main goal is to help the nervous system shift out of “go mode”, and it also improves blood circulation. Many clients use it to manage stress, improve sleep quality or simply reset after a demanding week.",
        },
        {
          type: "image",
          photo: P.swedish,
          alt: "Long, flowing strokes across the back during a Swedish massage",
          caption: "Swedish massage relies on long, rhythmic strokes that help the body relax.",
        },
        { type: "h2", text: "Deep tissue massage: work where it's stuck" },
        {
          type: "p",
          text: "Deep tissue massage uses slow, sustained pressure to reach the deeper layers of muscle and the surrounding fascia. It is directed at specific areas of chronic tension or restricted movement, such as the upper back, neck, hips and lower back, and pressure is increased progressively according to the client's tolerance. Research supports this approach for persistent pain: in a 2014 randomized trial of 59 adults with chronic low back pain, published in The Scientific World Journal, two weeks of deep tissue massage significantly reduced pain and disability, with results comparable to deep tissue massage combined with anti-inflammatory medication.",
        },
        {
          type: "list",
          items: [
            "Swedish massage is best suited to relaxation, stress relief, sleep quality and blood circulation.",
            "Deep tissue massage is best suited to chronic muscle tension, stiffness and localized pain.",
            "Many sessions combine both: Swedish techniques to prepare the tissue, followed by targeted deep tissue work where it is needed.",
          ],
        },
        { type: "h2", text: "What about soreness afterwards?" },
        {
          type: "p",
          text: "Some mild tenderness for a day or two after deep work is common, a bit like after a good workout. Drinking water, gentle movement and a warm shower usually help. Sharp pain is never the goal: tell your therapist during the session so pressure can be adjusted.",
        },
        {
          type: "quote",
          text: "The best treatment is the one that matches how your body feels today, and that can change from one visit to the next.",
        },
        {
          type: "p",
          text: "During your session we talk about your goals first and adapt the technique as we go. If you're unsure which to book, choose a regular massage therapy session and we'll decide together.",
        },
      ],
    },
    fr: {
      title: "Massage profond ou suédois : lequel vous convient?",
      excerpt:
        "Les deux sont efficaces, mais ils n'ont pas le même rôle. Voici comment choisir le bon traitement selon votre état du moment.",
      category: "Massothérapie",
      coverAlt: "Ziad travaillant le haut du dos d'un client lors d'un massage en profondeur",
      body: [
        {
          type: "p",
          text: "C'est la question qu'on me pose le plus souvent lors d'une première réservation : « Est-ce que je prends un massage profond ou un massage suédois? » La vraie réponse dépend moins du nom de la technique que de ce que vous voulez ressentir en vous relevant de la table.",
        },
        { type: "h2", text: "Le massage suédois : apaiser le système" },
        {
          type: "p",
          text: "Le massage suédois utilise de longs mouvements fluides, du pétrissage et un rythme doux. Son objectif principal est d'aider le système nerveux à sortir du « mode alerte », tout en améliorant la circulation sanguine. Plusieurs clients l'utilisent pour gérer le stress, mieux dormir ou simplement décompresser après une semaine chargée.",
        },
        {
          type: "image",
          photo: P.swedish,
          alt: "Longs mouvements fluides sur le dos pendant un massage suédois",
          caption: "Le massage suédois repose sur de longs mouvements rythmés qui aident le corps à se détendre.",
        },
        { type: "h2", text: "Le massage profond : travailler là où ça bloque" },
        {
          type: "p",
          text: "Le massage profond utilise une pression lente et soutenue pour atteindre les couches profondes des muscles et le fascia qui les entoure. Il cible des zones précises de tension chronique ou de mobilité réduite, comme le haut du dos, le cou, les hanches et le bas du dos, et la pression est augmentée progressivement selon la tolérance du client. La recherche appuie cette approche pour les douleurs persistantes : dans un essai randomisé publié en 2014 dans The Scientific World Journal, auprès de 59 adultes souffrant de lombalgie chronique, deux semaines de massage profond ont réduit de façon significative la douleur et l'incapacité, avec des résultats comparables à ceux du massage profond combiné à un anti-inflammatoire.",
        },
        {
          type: "list",
          items: [
            "Le massage suédois convient particulièrement à la détente, à la gestion du stress, à la qualité du sommeil et à la circulation sanguine.",
            "Le massage profond convient particulièrement aux tensions musculaires chroniques, à la raideur et aux douleurs localisées.",
            "Plusieurs séances combinent les deux : des techniques suédoises pour préparer les tissus, suivies d'un travail profond ciblé là où c'est nécessaire.",
          ],
        },
        { type: "h2", text: "Et les courbatures après?" },
        {
          type: "p",
          text: "Une légère sensibilité pendant un jour ou deux après un travail en profondeur est fréquente, un peu comme après un bon entraînement. Boire de l'eau, bouger doucement et prendre une douche chaude aident généralement. Une douleur vive n'est jamais l'objectif : dites-le pendant la séance pour que la pression soit ajustée.",
        },
        {
          type: "quote",
          text: "Le meilleur traitement est celui qui correspond à l'état de votre corps aujourd'hui, et cela peut changer d'une visite à l'autre.",
        },
        {
          type: "p",
          text: "Pendant votre séance, on commence par parler de vos objectifs et j'adapte la technique en cours de route. Si vous hésitez, réservez une séance de massothérapie régulière et on décidera ensemble.",
        },
      ],
    },
  },
  {
    slug: "mobile-massage-therapy",
    date: "2026-10-02",
    readMinutes: 3,
    cover: P.upperBack,
    en: {
      title: "Mobile massage therapy: the treatment comes to you",
      excerpt:
        "No traffic, no waiting room, no rushing back to the car afterwards. How a mobile session works at home, at the office or at your gym.",
      category: "Getting started",
      coverAlt: "Ziad giving a back massage on a professional table set up on location",
      body: [
        {
          type: "p",
          text: "One of the biggest benefits of massage is the calm you feel afterwards, and it disappears quickly when you have to drive home through traffic. That's why most HealthyZone sessions happen where you already are: at home, at the office or at your gym, anywhere in Montréal.",
        },
        { type: "h2", text: "What I bring" },
        {
          type: "list",
          items: [
            "A professional, padded massage table and face cradle.",
            "Clean sheets, towels and a blanket for every client.",
            "Unscented or lightly scented oils and lotions, with options for sensitive skin.",
          ],
        },
        { type: "h2", text: "What you need" },
        {
          type: "p",
          text: "Just a quiet room with enough space to walk around a table, roughly two by three metres, and a nearby outlet if you'd like the table warmer. Dim the lights if you can, silence your phone, and that's it. Set-up and packing take about ten minutes and aren't counted in your treatment time.",
        },
        { type: "h2", text: "At the office or the gym" },
        {
          type: "p",
          text: "Workplace sessions are a simple way to help a team manage stress and desk-related tension, and they fit easily into a lunch hour. At the gym, a session right after training or on a rest day helps recovery without an extra trip.",
        },
        {
          type: "quote",
          text: "The best place to relax is the one you don't have to leave.",
        },
        {
          type: "p",
          text: "Mobile sessions are the same registered massage therapy you'd receive in a clinic, with an insurance receipt after every visit. Send a message with your neighbourhood and preferred times, and we'll set it up.",
        },
      ],
    },
    fr: {
      title: "La massothérapie mobile : le traitement vient à vous",
      excerpt:
        "Pas de trafic, pas de salle d'attente, pas de course pour reprendre la voiture. Comment se déroule une séance mobile à domicile, au bureau ou au gym.",
      category: "Pour commencer",
      coverAlt: "Ziad donnant un massage du dos sur une table professionnelle installée sur place",
      body: [
        {
          type: "p",
          text: "L'un des grands bienfaits du massage, c'est le calme qu'on ressent ensuite, et il disparaît vite quand il faut rentrer dans le trafic. C'est pourquoi la plupart des séances HealthyZone ont lieu là où vous êtes déjà : à la maison, au bureau ou au gym, partout à Montréal.",
        },
        { type: "h2", text: "Ce que j'apporte" },
        {
          type: "list",
          items: [
            "Une table de massage professionnelle rembourrée, avec appui-tête.",
            "Des draps, serviettes et une couverture propres pour chaque client.",
            "Des huiles et lotions non parfumées ou légèrement parfumées, avec des options pour peaux sensibles.",
          ],
        },
        { type: "h2", text: "Ce dont vous avez besoin" },
        {
          type: "p",
          text: "Simplement une pièce calme avec assez d'espace pour circuler autour d'une table, environ deux mètres sur trois, et une prise de courant à proximité si vous souhaitez le chauffe-table. Tamisez la lumière si possible, mettez votre téléphone en silencieux, et c'est tout. L'installation et le rangement prennent une dizaine de minutes et ne sont pas comptés dans votre temps de traitement.",
        },
        { type: "h2", text: "Au bureau ou au gym" },
        {
          type: "p",
          text: "Les séances en entreprise sont une façon simple d'aider une équipe à gérer le stress et les tensions liées au travail de bureau, et elles s'intègrent facilement à une heure de dîner. Au gym, une séance juste après l'entraînement ou un jour de repos aide à la récupération sans déplacement supplémentaire.",
        },
        {
          type: "quote",
          text: "Le meilleur endroit pour se détendre, c'est celui qu'on n'a pas besoin de quitter.",
        },
        {
          type: "p",
          text: "Les séances mobiles offrent la même massothérapie agréée qu'en clinique, avec un reçu d'assurance après chaque visite. Envoyez un message avec votre quartier et vos disponibilités, et on organise le tout.",
        },
      ],
    },
  },
  {
    slug: "sports-massage-recovery",
    date: "2026-09-29",
    readMinutes: 4,
    cover: P.sports,
    en: {
      title: "Sports massage: a smarter way to recover",
      excerpt:
        "Training hard is only half the work. How targeted massage fits into a recovery routine for runners, lifters and weekend athletes.",
      category: "Recovery",
      coverAlt: "Ziad working on a client's shoulder and neck during a sports massage",
      body: [
        {
          type: "p",
          text: "Whether you lift, run, play hockey on weekends or chase your kids around the park, your muscles adapt between sessions, not during them. Recovery is where progress happens, and sports massage is one of the tools that can support it.",
        },
        { type: "h2", text: "What makes it “sports” massage?" },
        {
          type: "p",
          text: "Sports massage is less about a single technique and more about intent. The session is built around the demands of your activity: shoulders and upper back for swimmers and lifters, calves, hamstrings and hips for runners, forearms for climbers. We combine deeper work, stretching and mobility so you leave moving better, not just feeling looser.",
        },
        { type: "h2", text: "When to book" },
        {
          type: "list",
          items: [
            "Maintenance: every two to four weeks during a training block keeps small restrictions from building up.",
            "Before an event: a lighter session a few days before, never a deep one the day before.",
            "After an event: wait 24 to 48 hours, then focus on gentle work to help you feel normal again.",
          ],
        },
        {
          type: "p",
          text: "Massage complements, but doesn't replace, sleep, nutrition and a well-planned training load. If you're dealing with an acute injury, sudden swelling or sharp pain, see a physician or physiotherapist first.",
        },
        {
          type: "quote",
          text: "Recovery isn't a break from training. It's part of the plan.",
        },
        {
          type: "p",
          text: "As a massage therapist and personal trainer, I look at how you train as well as where it hurts, so each session supports the work you're doing in the gym or on the field.",
        },
      ],
    },
    fr: {
      title: "Le massage sportif : mieux récupérer",
      excerpt:
        "S'entraîner fort, ce n'est que la moitié du travail. Comment le massage ciblé s'intègre à une routine de récupération pour coureurs, sportifs et athlètes du dimanche.",
      category: "Récupération",
      coverAlt: "Ziad travaillant l'épaule et le cou d'un client lors d'un massage sportif",
      body: [
        {
          type: "p",
          text: "Que vous fassiez de la musculation, de la course, du hockey la fin de semaine ou que vous couriez après vos enfants au parc, vos muscles s'adaptent entre les séances, pas pendant. C'est pendant la récupération que le progrès se fait, et le massage sportif est l'un des outils qui peut la soutenir.",
        },
        { type: "h2", text: "Qu'est-ce qui le rend « sportif »?" },
        {
          type: "p",
          text: "Le massage sportif est moins une technique qu'une intention. La séance est construite selon les exigences de votre activité : épaules et haut du dos pour les nageurs et les adeptes de musculation, mollets, ischiojambiers et hanches pour les coureurs, avant-bras pour les grimpeurs. On combine travail en profondeur, étirements et mobilité pour que vous repartiez en bougeant mieux, pas seulement plus détendu.",
        },
        { type: "h2", text: "Quand réserver" },
        {
          type: "list",
          items: [
            "Entretien : toutes les deux à quatre semaines pendant un bloc d'entraînement, pour éviter que les petites restrictions s'accumulent.",
            "Avant une compétition : une séance légère quelques jours avant, jamais un massage profond la veille.",
            "Après une compétition : attendez 24 à 48 heures, puis privilégiez un travail doux pour retrouver vos sensations.",
          ],
        },
        {
          type: "p",
          text: "Le massage complète, sans les remplacer, le sommeil, l'alimentation et une charge d'entraînement bien planifiée. En cas de blessure aiguë, d'enflure soudaine ou de douleur vive, consultez d'abord un médecin ou un physiothérapeute.",
        },
        {
          type: "quote",
          text: "La récupération n'est pas une pause dans l'entraînement. Elle fait partie du plan.",
        },
        {
          type: "p",
          text: "En tant que massothérapeute et entraîneur personnel, je regarde votre façon de vous entraîner autant que l'endroit où ça fait mal, pour que chaque séance soutienne le travail que vous faites au gym ou sur le terrain.",
        },
      ],
    },
  },
  {
    slug: "myofascial-release-explained",
    date: "2026-09-22",
    readMinutes: 4,
    cover: P.anatomySketch,
    coverDiagram: true,
    en: {
      title: "Myofascial release, explained simply",
      excerpt:
        "Fascia wraps every muscle in your body. What it is, why it can feel tight, and what a myofascial release session actually involves.",
      category: "Massage therapy",
      coverAlt: "Anatomy sketch of the human muscular system, front, back and side views",
      body: [
        {
          type: "p",
          text: "If you've ever pulled the thin white film off a piece of chicken, you've seen fascia. In your body, this connective tissue wraps around and between every muscle, linking them into long chains from head to toe.",
        },
        {
          type: "image",
          photo: P.anatomyStudy,
          alt: "Anatomy study of the muscles of the body",
          caption: "Muscles don't work alone: fascia connects them into continuous chains.",
          diagram: true,
        },
        { type: "h2", text: "Why does fascia feel tight?" },
        {
          type: "p",
          text: "Healthy fascia glides. Long hours in the same position, repetitive movements, old injuries or stress can make an area feel stiff and less mobile. Because everything is connected, tension in one spot can be felt somewhere else: a tight upper back that seems to pull on the neck, or hips that affect the lower back.",
        },
        { type: "h2", text: "What happens in a session" },
        {
          type: "list",
          items: [
            "Slow, sustained pressure, usually without much oil, so the skin and tissue can be gently stretched.",
            "Holding a position for a minute or more while the area softens, rather than quick strokes.",
            "Working along the chain, not only where you feel it, to restore movement between layers.",
          ],
        },
        {
          type: "p",
          text: "Myofascial release should feel like a deep, sometimes intense stretch, never sharp. Many clients describe a sense of space or lightness afterwards. Combining it with simple mobility exercises at home helps the results last.",
        },
        {
          type: "quote",
          text: "Where you feel it isn't always where it starts.",
        },
      ],
    },
    fr: {
      title: "Le relâchement myofascial, expliqué simplement",
      excerpt:
        "Le fascia enveloppe chacun de vos muscles. Ce que c'est, pourquoi il peut sembler tendu et ce qu'implique vraiment une séance de relâchement myofascial.",
      category: "Massothérapie",
      coverAlt: "Croquis anatomique du système musculaire humain, vues de face, de dos et de profil",
      body: [
        {
          type: "p",
          text: "Si vous avez déjà retiré la fine pellicule blanche d'un morceau de poulet, vous avez vu du fascia. Dans votre corps, ce tissu conjonctif enveloppe chaque muscle et s'insère entre eux, les reliant en longues chaînes de la tête aux pieds.",
        },
        {
          type: "image",
          photo: P.anatomyStudy,
          alt: "Étude anatomique des muscles du corps",
          caption: "Les muscles ne travaillent pas seuls : le fascia les relie en chaînes continues.",
          diagram: true,
        },
        { type: "h2", text: "Pourquoi le fascia semble-t-il tendu?" },
        {
          type: "p",
          text: "Un fascia en santé glisse. De longues heures dans la même position, des mouvements répétitifs, d'anciennes blessures ou le stress peuvent rendre une zone raide et moins mobile. Comme tout est relié, une tension à un endroit peut se ressentir ailleurs : un haut du dos tendu qui semble tirer sur le cou, ou des hanches qui influencent le bas du dos.",
        },
        { type: "h2", text: "Le déroulement d'une séance" },
        {
          type: "list",
          items: [
            "Une pression lente et soutenue, généralement avec peu d'huile, pour étirer doucement la peau et les tissus.",
            "Maintenir une position une minute ou plus pendant que la zone se relâche, plutôt que des mouvements rapides.",
            "Travailler le long de la chaîne, pas seulement là où vous le sentez, pour redonner du mouvement entre les couches.",
          ],
        },
        {
          type: "p",
          text: "Le relâchement myofascial devrait ressembler à un étirement profond, parfois intense, mais jamais vif. Plusieurs clients décrivent ensuite une sensation d'espace ou de légèreté. Le combiner à de simples exercices de mobilité à la maison aide à faire durer les résultats.",
        },
        {
          type: "quote",
          text: "L'endroit où vous le sentez n'est pas toujours l'endroit où ça commence.",
        },
      ],
    },
  },
  {
    slug: "posture-and-desk-work",
    date: "2026-09-15",
    readMinutes: 5,
    cover: P.footImbalance,
    coverDiagram: true,
    en: {
      title: "Posture and desk work: what's really going on with your back",
      excerpt:
        "Your spine is part of a chain that starts at your feet. Why posture problems rarely come from one place, and small changes that help.",
      category: "Posture",
      coverAlt: "HealthyZone diagram showing the effects of a foot imbalance on the spine",
      body: [
        {
          type: "p",
          text: "“I have bad posture” is something I hear every week, usually from people who spend most of the day at a desk. The good news: there's no single perfect posture to hold all day. The goal is a body that can move well in and out of many positions.",
        },
        { type: "h2", text: "It's a chain, not a single joint" },
        {
          type: "p",
          text: "Your body adapts as a whole. When one link shifts, the others compensate. A small imbalance at the feet, like an arch that collapses on one side, can tilt the pelvis, which in turn changes the curves of the spine and the position of the shoulders and head.",
        },
        {
          type: "image",
          photo: P.postureChain,
          alt: "Side-view diagrams of common posture patterns and how the body compensates",
          caption: "Common posture patterns: each segment compensates for the one below it.",
          diagram: true,
        },
        { type: "h2", text: "Small changes that make a difference" },
        {
          type: "list",
          items: [
            "Change position often. Every 30 to 45 minutes, stand up, walk, or simply shift how you sit.",
            "Set your screen at eye level and keep your keyboard close so your shoulders can relax.",
            "Strengthen the back of the body: upper back, glutes and core support you far better than willpower.",
            "Move your feet and ankles: walking barefoot at home and calf mobility count too.",
          ],
        },
        { type: "h2", text: "How we work on posture" },
        {
          type: "p",
          text: "A posture assessment looks at how you stand, sit and move, from the feet up. From there, we combine massage to release the areas that are overworked with targeted exercises to strengthen the ones that aren't doing enough. That combination is what makes changes last.",
        },
        {
          type: "quote",
          text: "Your best posture is your next posture.",
        },
      ],
    },
    fr: {
      title: "Posture et travail de bureau : ce qui se passe vraiment dans votre dos",
      excerpt:
        "Votre colonne fait partie d'une chaîne qui commence aux pieds. Pourquoi les problèmes de posture viennent rarement d'un seul endroit, et de petits changements qui aident.",
      category: "Posture",
      coverAlt: "Schéma HealthyZone montrant les effets d'un déséquilibre du pied sur la colonne",
      body: [
        {
          type: "p",
          text: "« J'ai une mauvaise posture » : je l'entends chaque semaine, surtout de la part de personnes qui passent la journée au bureau. Bonne nouvelle : il n'existe pas de posture parfaite à tenir toute la journée. L'objectif est un corps capable de bien bouger dans plusieurs positions.",
        },
        { type: "h2", text: "Une chaîne, pas une seule articulation" },
        {
          type: "p",
          text: "Votre corps s'adapte dans son ensemble. Quand un maillon se déplace, les autres compensent. Un petit déséquilibre aux pieds, comme une arche qui s'affaisse d'un côté, peut faire basculer le bassin, ce qui modifie les courbes de la colonne ainsi que la position des épaules et de la tête.",
        },
        {
          type: "image",
          photo: P.postureChain,
          alt: "Schémas de profil de postures courantes et des compensations du corps",
          caption: "Postures courantes : chaque segment compense celui du dessous.",
          diagram: true,
        },
        { type: "h2", text: "De petits changements qui font une différence" },
        {
          type: "list",
          items: [
            "Changez souvent de position. Toutes les 30 à 45 minutes, levez-vous, marchez ou changez simplement votre façon de vous asseoir.",
            "Placez l'écran à la hauteur des yeux et gardez le clavier près de vous pour relâcher les épaules.",
            "Renforcez l'arrière du corps : le haut du dos, les fessiers et le tronc vous soutiennent bien mieux que la volonté.",
            "Bougez les pieds et les chevilles : marcher pieds nus à la maison et la mobilité des mollets comptent aussi.",
          ],
        },
        { type: "h2", text: "Comment on travaille la posture" },
        {
          type: "p",
          text: "Une évaluation posturale regarde comment vous vous tenez, vous assoyez et bougez, à partir des pieds. Ensuite, on combine le massage pour relâcher les zones surutilisées et des exercices ciblés pour renforcer celles qui n'en font pas assez. C'est cette combinaison qui fait durer les changements.",
        },
        {
          type: "quote",
          text: "Votre meilleure posture, c'est la prochaine.",
        },
      ],
    },
  },
  {
    slug: "shoulder-mobility-range-of-motion",
    date: "2026-09-08",
    readMinutes: 4,
    cover: P.shoulderRom,
    coverDiagram: true,
    en: {
      title: "Shoulder mobility: understanding your range of motion",
      excerpt:
        "Reaching overhead, behind your back, across your body: a quick guide to how the shoulder moves, and how to keep it moving well.",
      category: "Mobility",
      coverAlt: "HealthyZone chart of shoulder range of motion in flexion, extension, abduction and rotation",
      body: [
        {
          type: "p",
          text: "The shoulder is the most mobile joint in the body, which is exactly why it's prone to stiffness and discomfort. Long days at a computer, carrying kids or bags on one side, and a lack of overhead movement can all slowly reduce how far your arm can travel.",
        },
        { type: "h2", text: "A simple self-check" },
        {
          type: "list",
          items: [
            "Raise both arms overhead with your back against a wall. Can your thumbs reach the wall without arching your lower back?",
            "Reach one hand behind your back and the other over your shoulder. How close do your hands get, and is one side very different?",
            "With elbows at your sides bent to 90 degrees, rotate your forearms outward. Do both sides move equally?",
          ],
        },
        {
          type: "p",
          text: "Big differences between sides, or pain during these movements, are worth having assessed. Stiffness alone is common and usually improves with consistent work.",
        },
        { type: "h2", text: "Keeping your shoulders moving" },
        {
          type: "p",
          text: "Mobility improves with a mix of releasing what's tight and strengthening through the new range. In a session, massage around the shoulder blade, chest and neck is paired with simple drills, like wall slides, band rotations and controlled arm circles, that you can repeat at home a few minutes a day.",
        },
        {
          type: "quote",
          text: "Use it or lose it: range of motion you never visit slowly disappears.",
        },
      ],
    },
    fr: {
      title: "Mobilité de l'épaule : comprendre votre amplitude de mouvement",
      excerpt:
        "Lever les bras, atteindre derrière le dos, croiser devant soi : un guide rapide sur les mouvements de l'épaule et sur la façon de la garder mobile.",
      category: "Mobilité",
      coverAlt: "Tableau HealthyZone de l'amplitude de l'épaule en flexion, extension, abduction et rotation",
      body: [
        {
          type: "p",
          text: "L'épaule est l'articulation la plus mobile du corps, et c'est justement pourquoi elle est sujette à la raideur et à l'inconfort. Les longues journées à l'ordinateur, porter enfants ou sacs d'un seul côté et le manque de mouvements au-dessus de la tête peuvent lentement réduire l'amplitude de votre bras.",
        },
        { type: "h2", text: "Un petit test maison" },
        {
          type: "list",
          items: [
            "Levez les deux bras au-dessus de la tête, dos contre un mur. Vos pouces touchent-ils le mur sans cambrer le bas du dos?",
            "Passez une main derrière le dos et l'autre par-dessus l'épaule. Vos mains se rapprochent-elles, et un côté est-il très différent?",
            "Coudes au corps pliés à 90 degrés, tournez les avant-bras vers l'extérieur. Les deux côtés bougent-ils également?",
          ],
        },
        {
          type: "p",
          text: "De grandes différences entre les côtés, ou de la douleur pendant ces mouvements, méritent une évaluation. La raideur seule est fréquente et s'améliore généralement avec un travail régulier.",
        },
        { type: "h2", text: "Garder vos épaules en mouvement" },
        {
          type: "p",
          text: "La mobilité s'améliore en combinant le relâchement de ce qui est tendu et le renforcement dans la nouvelle amplitude. En séance, le massage autour de l'omoplate, de la poitrine et du cou est jumelé à des exercices simples, comme les glissements au mur, les rotations avec élastique et les cercles de bras contrôlés, à refaire quelques minutes par jour à la maison.",
        },
        {
          type: "quote",
          text: "Une amplitude qu'on n'utilise jamais finit par disparaître.",
        },
      ],
    },
  },
  {
    slug: "your-first-massage-therapy-session",
    date: "2026-09-01",
    readMinutes: 4,
    cover: P.studioTable,
    en: {
      title: "Your first massage therapy session: what to expect",
      excerpt:
        "From the first questions to what to wear, here's how a session works, so you can simply relax and let your body do the rest.",
      category: "Getting started",
      coverAlt: "The HealthyZone treatment room with a professional massage table",
      body: [
        {
          type: "p",
          text: "Booking your first massage can come with a few questions: what do I wear, what will you ask me, will it hurt? Knowing what happens makes it much easier to relax, so here's how a typical HealthyZone session works.",
        },
        { type: "h2", text: "1. A short conversation" },
        {
          type: "p",
          text: "We start with a quick health questionnaire and a conversation about why you came in: pain, stress, recovery, posture or simply relaxation. I'll ask about past injuries, medical conditions and medications, so the treatment is safe and adapted to you.",
        },
        {
          type: "image",
          photo: P.ziadStudio,
          alt: "Ziad in the HealthyZone treatment room",
          caption: "Every session begins with a conversation about your goals.",
        },
        { type: "h2", text: "2. Your comfort comes first" },
        {
          type: "list",
          items: [
            "You undress to your level of comfort; underwear stays on.",
            "You're always covered by a sheet, and only the area being treated is uncovered.",
            "Pressure is adjusted throughout. You can ask for more, less, or to skip an area at any time.",
          ],
        },
        {
          type: "image",
          photo: P.studioTableSide,
          alt: "Professional massage table set up in the treatment room",
          caption: "Mobile sessions bring the same professional table to your home or office.",
        },
        { type: "h2", text: "3. After the session" },
        {
          type: "p",
          text: "Take a moment before getting up, drink some water, and notice how you feel over the next day. If useful, I'll suggest a couple of simple stretches or exercises. You'll receive a receipt you can submit to your insurance plan; check your coverage for massage therapy before your visit.",
        },
        {
          type: "quote",
          text: "There are no wrong questions. The more you share, the better the treatment fits you.",
        },
        {
          type: "p",
          text: "Sessions are available at home, at your office or at the gym, in French or English. When you're ready, send a message or call and we'll find a time that works.",
        },
      ],
    },
    fr: {
      title: "Votre première séance de massothérapie : à quoi s'attendre",
      excerpt:
        "Des premières questions à la tenue à porter, voici comment se déroule une séance, pour que vous puissiez simplement vous détendre.",
      category: "Pour commencer",
      coverAlt: "La salle de traitement HealthyZone avec une table de massage professionnelle",
      body: [
        {
          type: "p",
          text: "Réserver un premier massage peut soulever quelques questions : quoi porter, quelles questions me seront posées, est-ce que ça fera mal? Savoir ce qui se passe aide beaucoup à se détendre. Voici comment se déroule une séance typique chez HealthyZone.",
        },
        { type: "h2", text: "1. Une courte discussion" },
        {
          type: "p",
          text: "On commence par un bref questionnaire de santé et une discussion sur la raison de votre visite : douleur, stress, récupération, posture ou simple détente. Je vous questionne sur vos blessures passées, vos conditions médicales et vos médicaments, pour que le traitement soit sécuritaire et adapté.",
        },
        {
          type: "image",
          photo: P.ziadStudio,
          alt: "Ziad dans la salle de traitement HealthyZone",
          caption: "Chaque séance commence par une discussion sur vos objectifs.",
        },
        { type: "h2", text: "2. Votre confort avant tout" },
        {
          type: "list",
          items: [
            "Vous vous dévêtez selon votre niveau de confort; les sous-vêtements restent en place.",
            "Vous êtes toujours couvert d'un drap, et seule la zone traitée est découverte.",
            "La pression est ajustée tout au long de la séance. Vous pouvez demander plus, moins, ou d'éviter une zone en tout temps.",
          ],
        },
        {
          type: "image",
          photo: P.studioTableSide,
          alt: "Table de massage professionnelle installée dans la salle de traitement",
          caption: "Les séances mobiles apportent la même table professionnelle chez vous ou au bureau.",
        },
        { type: "h2", text: "3. Après la séance" },
        {
          type: "p",
          text: "Prenez un moment avant de vous lever, buvez un peu d'eau et observez comment vous vous sentez le lendemain. Au besoin, je vous suggère quelques étirements ou exercices simples. Vous recevez un reçu à soumettre à votre assurance; vérifiez votre couverture en massothérapie avant votre visite.",
        },
        {
          type: "quote",
          text: "Il n'y a pas de mauvaises questions. Plus vous en partagez, plus le traitement vous correspond.",
        },
        {
          type: "p",
          text: "Les séances sont offertes à domicile, au bureau ou au gym, en français ou en anglais. Quand vous êtes prêt, envoyez un message ou appelez et on trouvera un moment qui vous convient.",
        },
      ],
    },
  },
];

export function getPosts() {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
