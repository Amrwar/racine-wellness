/**
 * Extra content for each service page (what's included, benefits, who it suits, how to prepare).
 * Keyed by the service's web address. Written conservatively: no medical promises. Services added
 * later in the admin simply show their own description and the shared sections.
 */
type Lang = "en" | "fr";
type Text = Record<Lang, string>;
type List = Record<Lang, string[]>;
export type ServiceDetail = { includes: List; benefits: List; suitability: Text; preparation: List };

export const serviceDetails: Record<string, ServiceDetail> = {
  "swedish-relaxation-massage": {
    includes: {
      en: ["A short conversation about your goals, areas of tension and health history", "Long, flowing strokes with pressure adapted to your comfort", "An insurance receipt, on request"],
      fr: ["Une courte discussion sur vos objectifs, vos zones de tension et vos antécédents de santé", "De longs mouvements fluides, avec une pression adaptée à votre confort", "Un reçu pour assurances, sur demande"],
    },
    benefits: {
      en: ["Helps relieve muscle tension and stiffness", "Supports relaxation and recovery after activity", "Can make everyday movement feel more comfortable"],
      fr: ["Aide à soulager les tensions et les raideurs musculaires", "Favorise la détente et la récupération après l'effort", "Peut rendre les mouvements du quotidien plus confortables"],
    },
    suitability: {
      en: "Adults who want to relax, recover from activity or ease muscle tension. Tell Ziad about any injury, health condition or pregnancy before your session.",
      fr: "Les adultes qui veulent se détendre, récupérer après l'effort ou atténuer leurs tensions musculaires. Informez Ziad de toute blessure, condition de santé ou grossesse avant votre séance.",
    },
    preparation: {
      en: ["Wear comfortable clothing", "Drink water and avoid a heavy meal just before your session", "For a home visit, clear a quiet space for the massage table"],
      fr: ["Portez des vêtements confortables", "Buvez de l'eau et évitez un repas copieux juste avant la séance", "Pour une visite à domicile, libérez un espace calme pour la table de massage"],
    },
  },
  "sports-therapeutic-massage": {
    includes: {
      en: ["A short conversation about your goals, activity and areas of tension", "Targeted techniques such as sports massage, deep tissue work, myofascial release and passive stretching", "An insurance receipt, on request"],
      fr: ["Une courte discussion sur vos objectifs, vos activités et vos zones de tension", "Des techniques ciblées comme le massage sportif, les tissus profonds, le relâchement myofascial et les étirements passifs", "Un reçu pour assurances, sur demande"],
    },
    benefits: {
      en: ["Helps ease muscle tension and discomfort", "Supports recovery from training and physical work", "Can help restore comfortable movement"],
      fr: ["Aide à soulager les tensions et l'inconfort musculaires", "Favorise la récupération après l'entraînement et l'effort physique", "Peut aider à retrouver un mouvement confortable"],
    },
    suitability: {
      en: "Active adults, athletes and people with tension from daily activities, repetitive movements or long hours sitting. Tell Ziad about any injury or health condition before your session.",
      fr: "Les adultes actifs, les athlètes et les personnes tendues par les activités quotidiennes, les mouvements répétitifs ou la position assise prolongée. Informez Ziad de toute blessure ou condition de santé avant votre séance.",
    },
    preparation: {
      en: ["Wear comfortable clothing", "Note when and where you feel tension or discomfort", "Avoid an intense workout just before your session"],
      fr: ["Portez des vêtements confortables", "Notez quand et où vous ressentez des tensions ou de l'inconfort", "Évitez un entraînement intense juste avant la séance"],
    },
  },
  "posture-correction": {
    includes: {
      en: ["A look at how you sit, stand and move", "Targeted exercises and stretches", "Simple changes for your desk and daily habits"],
      fr: ["Un examen de votre façon de vous asseoir, de vous tenir et de bouger", "Des exercices et des étirements ciblés", "Des ajustements simples pour votre bureau et vos habitudes"],
    },
    benefits: {
      en: ["Helps reduce strain on the back and neck", "Builds awareness of your posture through the day", "Gives you exercises you can keep doing on your own"],
      fr: ["Aide à réduire les tensions au dos et au cou", "Développe la conscience de votre posture au quotidien", "Vous donne des exercices à poursuivre par vous-même"],
    },
    suitability: {
      en: "People who spend long hours at a desk or notice back and neck strain from daily habits.",
      fr: "Les personnes qui passent de longues heures au bureau ou qui ressentent des tensions au dos et au cou liées à leurs habitudes.",
    },
    preparation: {
      en: ["Wear clothes you can move in", "Think about your typical day and the positions you hold most", "Bring a photo of your desk set-up if you like"],
      fr: ["Portez des vêtements qui permettent de bouger", "Pensez à votre journée type et aux positions que vous gardez le plus", "Apportez une photo de votre poste de travail si vous le souhaitez"],
    },
  },
  mobility: {
    includes: {
      en: ["A range-of-motion check of the joints that feel stiff", "Guided mobility and stretching work", "A short routine to keep progressing between sessions"],
      fr: ["Une évaluation de l'amplitude des articulations raides", "Un travail guidé de mobilité et d'étirement", "Une courte routine pour progresser entre les séances"],
    },
    benefits: {
      en: ["Helps restore range of motion", "Can make daily movements feel easier", "Prepares your body for training and sport"],
      fr: ["Aide à retrouver de l'amplitude de mouvement", "Peut faciliter les mouvements du quotidien", "Prépare votre corps à l'entraînement et au sport"],
    },
    suitability: {
      en: "Anyone who feels stiff, from desk workers to active adults and athletes.",
      fr: "Toute personne qui se sent raide, des travailleurs de bureau aux adultes actifs et aux athlètes.",
    },
    preparation: {
      en: ["Wear comfortable clothes you can move in", "Note which movements feel limited or uncomfortable", "Have a little floor space for a home session"],
      fr: ["Portez des vêtements confortables qui permettent de bouger", "Notez les mouvements limités ou inconfortables", "Prévoyez un peu d'espace au sol pour une séance à domicile"],
    },
  },
  "fitness-and-healthy-lifestyle-coaching": {
    includes: {
      en: ["A review of your level, goals, habits and injury history", "Supervised strength and fitness training", "Practical guidance on healthy daily habits, and a plan that fits your schedule"],
      fr: ["Un portrait de votre niveau, de vos objectifs, de vos habitudes et de vos blessures passées", "Un entraînement supervisé en force et en forme physique", "Des conseils pratiques sur les saines habitudes et un plan adapté à votre horaire"],
    },
    benefits: {
      en: ["Builds functional strength and fitness for daily life", "Helps you build habits you can keep", "Supports long-term health and activity"],
      fr: ["Développe la force et la forme physique pour le quotidien", "Vous aide à adopter des habitudes durables", "Soutient la santé et l'activité à long terme"],
    },
    suitability: {
      en: "Beginners and experienced adults who want safe, structured coaching to get fitter and live more actively.",
      fr: "Les adultes, débutants ou expérimentés, qui veulent un coaching sécuritaire et structuré pour être en meilleure forme et plus actifs.",
    },
    preparation: {
      en: ["Wear athletic clothing and shoes", "Bring water", "Mention any injury or pain before you start"],
      fr: ["Portez des vêtements et des chaussures de sport", "Apportez de l'eau", "Mentionnez toute blessure ou douleur avant de commencer"],
    },
  },
  "active-aging": {
    includes: {
      en: ["A gentle look at your balance, strength and mobility", "Safe exercises adapted to your level", "Progress at your own pace"],
      fr: ["Un regard bienveillant sur votre équilibre, votre force et votre mobilité", "Des exercices sécuritaires adaptés à votre niveau", "Une progression à votre rythme"],
    },
    benefits: {
      en: ["Helps maintain balance and strength", "Supports independence in daily activities", "Keeps you active with confidence"],
      fr: ["Aide à maintenir l'équilibre et la force", "Soutient l'autonomie dans les activités quotidiennes", "Vous garde actif en toute confiance"],
    },
    suitability: {
      en: "Older adults who want to stay active and independent. If you have a medical condition, check with your doctor before starting a new exercise program.",
      fr: "Les aînés qui veulent rester actifs et autonomes. Si vous avez une condition médicale, consultez votre médecin avant de commencer un nouveau programme d'exercice.",
    },
    preparation: {
      en: ["Wear comfortable clothes and supportive shoes", "Have a list of your health conditions and medications to mention", "Keep water nearby"],
      fr: ["Portez des vêtements confortables et des chaussures qui soutiennent bien", "Préparez la liste de vos conditions de santé et de vos médicaments", "Gardez de l'eau à portée de main"],
    },
  },
  "youth-fitness": {
    includes: {
      en: ["Age-appropriate, supervised training", "Coordination, movement and strength basics", "Feedback for parents on progress"],
      fr: ["Un entraînement supervisé adapté à l'âge", "Les bases de la coordination, du mouvement et de la force", "Des retours aux parents sur les progrès"],
    },
    benefits: {
      en: ["Builds good movement habits", "Develops coordination and confidence", "Supports young athletes in their sport"],
      fr: ["Développe de bonnes habitudes de mouvement", "Améliore la coordination et la confiance", "Soutient les jeunes athlètes dans leur sport"],
    },
    suitability: {
      en: "Children and teens who want to move better, get stronger or support their sport.",
      fr: "Les enfants et les adolescents qui veulent mieux bouger, gagner en force ou progresser dans leur sport.",
    },
    preparation: {
      en: ["Wear athletic clothing and shoes", "Bring water", "Tell Ziad about any sport, injury or health condition"],
      fr: ["Portez des vêtements et des chaussures de sport", "Apportez de l'eau", "Informez Ziad de tout sport pratiqué, blessure ou condition de santé"],
    },
  },
};
