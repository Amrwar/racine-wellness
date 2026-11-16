import type { Dictionary } from "./en";

export const fr: Dictionary = {
  nav: {
    services: "Services",
    pricing: "Tarifs",
    about: "À propos",
    blog: "Blogue",
    contact: "Contact",
  },
  header: {
    book: "Prendre rendez-vous",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    switchShort: "EN",
    switchTitle: "View this site in English",
    skip: "Aller au contenu",
    home: "Accueil HealthyZone",
  },
  tagline: "Massothérapie & Entraînement en santé active",
  credentialsLine: "Massothérapeute agréé · Entraîneur personnel",
  meta: {
    titleDefault: "HealthyZone · Massothérapie et entraînement en santé active dans l'Ouest-de-l'Île, Montréal",
    description:
      "Massothérapie personnalisée, correction posturale, mobilité et entraînement en force avec Ziad Bik, massothérapeute agréé et entraîneur personnel. Basé à Saint-Jean, dans l'Ouest-de-l'Île, avec des séances mobiles dans tout le Grand Montréal.",
    keywords: [
      "massothérapeute Ouest-de-l'Île",
      "massothérapie à domicile Montréal",
      "correction posturale Montréal",
      "entraîneur personnel Ouest-de-l'Île",
      "vieillissement actif",
      "conditionnement physique jeunesse",
    ],
    blog: {
      title: "Blogue",
      description:
        "Articles pratiques sur la massothérapie, la récupération, la posture et la mobilité par Ziad Bik, massothérapeute agréé et entraîneur personnel dans l'Ouest-de-l'Île, Montréal.",
    },
    privacy: {
      title: "Politique de confidentialité",
      description: "Comment HealthyZone recueille, utilise et protège vos renseignements personnels.",
    },
  },
  og: { line1: "Santé active personnalisée.", sub: "Massothérapie et entraînement · Ouest-de-l'Île, QC" },

  hero: {
    eyebrow: "Ouest-de-l'Île · Grand Montréal",
    title: "Sentez-vous mieux. Bougez mieux. Restez actif.",
    lead: "Profitez d'une expérience unique et personnalisée adaptée à vos besoins, que ce soit à domicile ou au travail. Massothérapie et santé active avec Ziad Bik.",
    call: "Appelez-nous",
    book: "Prendre rendez-vous",
    imageAlt: "Ziad donnant un massage du dos à un client sur une table de traitement",
  },

  services: {
    eyebrow: "Services",
    title: "Des soins adaptés à votre corps",
    lead: "Chaque séance part de vos objectifs et de votre façon de bouger aujourd'hui. Choisissez un service ou combinez-les.",
    items: [
      {
        icon: "hands" as const,
        title: "Massothérapie",
        text: "Massage thérapeutique pour soulager la douleur et les tensions, accélérer la récupération, améliorer la circulation sanguine et vous détendre. Reçus pour assurances fournis.",
      },
      {
        icon: "posture" as const,
        title: "Correction posturale",
        text: "Évaluation et exercices ciblés pour soulager le dos et la nuque, souvent sollicités par le travail de bureau.",
      },
      {
        icon: "mobility" as const,
        title: "Mobilité",
        text: "Retrouvez l'amplitude de vos articulations et bougez au quotidien avec plus de liberté et moins d'inconfort.",
      },
      {
        icon: "strength" as const,
        title: "Force",
        text: "Un entraînement en force progressif et sécuritaire, adapté à votre niveau, vos blessures et votre horaire.",
      },
      {
        icon: "heart" as const,
        title: "Vieillissement actif",
        text: "Un entraînement doux et efficace pour garder équilibre, force et autonomie à tout âge.",
      },
      {
        icon: "youth" as const,
        title: "Conditionnement jeunesse",
        text: "Un entraînement supervisé qui développe de bonnes habitudes de mouvement, la coordination et la confiance chez les jeunes.",
      },
    ],
  },

  pricing: {
    eyebrow: "Tarifs",
    title: "Tarifs de massothérapie",
    lead: "Choisissez le soin et la durée qui répondent le mieux à vos besoins. Un reçu pour assurances est remis pour chaque séance de massage.",
    duration: "{n} min",
    book: "Prendre rendez-vous",
  },

  booking: {
    metaTitle: "Prendre rendez-vous",
    metaDescription:
      "Demandez un rendez-vous de massothérapie avec Ziad Bik, massothérapeute agréé, au bureau de Saint-Jean dans l'Ouest-de-l'Île ou à domicile.",
    eyebrow: "Réservation en ligne",
    title: "Réserver une séance de massage",
    lead: "Choisissez votre soin, puis la date et l'heure qui vous conviennent. Ziad examine chaque demande et confirme votre rendez-vous par courriel.",
    steps: ["Soin", "Date et heure", "Vos coordonnées"],
    chooseService: "Choisissez un soin",
    chooseDuration: "Durée de la séance",
    chooseDay: "Choisissez une date",
    chooseTime: "Heures disponibles",
    loading: "Chargement des disponibilités…",
    noDays: "Aucune plage n'est ouverte à la réservation en ligne pour le moment. Communiquez avec nous et nous trouverons un moment qui vous convient.",
    pickDay: "Sélectionnez une date pour voir les heures disponibles.",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    where: "Lieu",
    office: "Au bureau",
    officeNote: "Saint-Jean, Ouest-de-l'Île",
    home: "À domicile ou au travail",
    homeNote: "Des frais de déplacement s'ajoutent selon votre emplacement.",
    address: "Adresse de la visite",
    addressPlaceholder: "Rue, ville, code postal",
    notes: "Informations utiles pour Ziad (facultatif)",
    notesPlaceholder: "Zones de tension, blessures, conditions de santé ou préférences.",
    email: "Courriel",
    summary: "Votre rendez-vous",
    change: "Modifier",
    back: "Retour",
    next: "Continuer",
    submit: "Demander ce rendez-vous",
    sending: "Envoi…",
    pendingNote: "Votre rendez-vous est confirmé une fois que Ziad a examiné votre demande.",
    successTitle: "Demande reçue",
    success: "Merci {name}. Votre demande pour le {when} a été envoyée. Vous recevrez un courriel dès que Ziad aura confirmé votre rendez-vous.",
    taken: "Cette plage vient d'être réservée. Veuillez choisir une autre heure.",
    errors: {
      address: "Veuillez indiquer l'adresse de la visite.",
      slot: "Veuillez choisir un soin, une date et une heure.",
    },
    emails: {
      requestSubject: "Votre demande de rendez-vous HealthyZone",
      request:
        "Bonjour {name},\n\nMerci pour votre demande. En voici les détails :\n\n{when}\n{service}\n{where}\n\nZiad examinera votre demande et confirmera votre rendez-vous par courriel. Pour toute question, composez le {phone} ou répondez à ce courriel.\n\nHealthyZone",
      confirmedSubject: "Votre rendez-vous HealthyZone est confirmé",
      confirmed:
        "Bonjour {name},\n\nVotre rendez-vous est confirmé :\n\n{when}\n{service}\n{where}\n\nPour le modifier ou l'annuler, composez le {phone} ou répondez à ce courriel.\n\nÀ bientôt,\nZiad, HealthyZone",
      declinedSubject: "Concernant votre demande de rendez-vous HealthyZone",
      declined:
        "Bonjour {name},\n\nMalheureusement, la plage demandée ({when}) n'est pas disponible. Choisissez une autre heure sur {link} ou composez le {phone}, et nous trouverons un moment qui vous convient.\n\nHealthyZone",
      cancelledSubject: "Votre rendez-vous HealthyZone a été annulé",
      cancelled:
        "Bonjour {name},\n\nVotre rendez-vous du {when} a été annulé. Pour réserver une nouvelle plage, rendez-vous sur {link} ou composez le {phone}.\n\nHealthyZone",
      updatedSubject: "Votre rendez-vous HealthyZone a été modifié",
      updated:
        "Bonjour {name},\n\nLes détails de votre rendez-vous ont été modifiés :\n\n{when}\n{service}\n{where}\n\nPour toute question, composez le {phone} ou répondez à ce courriel.\n\nHealthyZone",
      reminderSubject: "Rappel : votre rendez-vous HealthyZone demain",
      reminder:
        "Bonjour {name},\n\nNous vous rappelons votre rendez-vous de demain :\n\n{when}\n{service}\n{where}\n\nPour le modifier ou l'annuler, composez le {phone} ou répondez à ce courriel dès que possible.\n\nÀ bientôt,\nZiad, HealthyZone",
    },
  },

  about: {
    eyebrow: "À propos",
    title: "Bonjour, je suis Ziad",
    text1:
      "Je suis massothérapeute agréé et entraîneur personnel dans l'Ouest-de-l'Île de Montréal. J'aide les gens à soulager leurs douleurs, corriger leur posture et rester forts et actifs, peu importe leur âge.",
    text2:
      "Je me déplace avec tout le nécessaire pour le traitement ou l'entraînement, à domicile, au bureau ou à votre gym, et je bâtis chaque plan selon votre corps et votre horaire.",
    portraitAlt: "Portrait de Ziad, massothérapeute et entraîneur personnel",
    credentials: [
      "Massothérapeute agréé · membre RMQ",
      "Entraîneur personnel certifié",
      "Service mobile dans le Grand Montréal",
      "Reçus d'assurance disponibles",
    ],
  },

  contact: {
    eyebrow: "Contact",
    title: "Prenez rendez-vous ou posez une question",
    lead: "Envoyez-moi un message et je vous répondrai d'ici un jour ouvrable.",
    phone: "Téléphone",
    email: "Courriel",
    area: "Bureau",
    office: "Saint-Jean, Ouest-de-l'Île",
    areaNote: "Service mobile dans le Grand Montréal",
    formTitle: "Envoyer un message",
  },

  form: {
    name: "Nom complet",
    namePlaceholder: "Marie Tremblay",
    email: "Courriel (facultatif)",
    emailPlaceholder: "vous@exemple.com",
    phone: "Téléphone",
    phonePlaceholder: "+1 438 225 8859",
    message: "Message (facultatif)",
    messagePlaceholder: "Comment puis-je vous aider? Parlez-moi de vos objectifs ou de vos douleurs.",
    receipt: "J'aimerais un reçu d'assurance",
    receiptNote: "Reçus d'assurance disponibles",
    consent: "En soumettant ce formulaire, vous acceptez d'être contacté au sujet de votre demande. Vos renseignements ne sont jamais partagés.",
    submit: "Envoyer le message",
    sending: "Envoi en cours…",
    successTitle: "Message reçu",
    success: "Merci {name}! Votre message est en route. Attendez-vous à une réponse d'ici un jour ouvrable.",
    fixFields: "Veuillez corriger les champs en surbrillance.",
    required: "obligatoire",
    failed: "Une erreur est survenue lors de l'envoi. Veuillez écrire directement à {email}.",
    errors: {
      name: "Veuillez entrer votre nom.",
      phone: "Veuillez entrer un numéro de téléphone valide.",
      email: "Veuillez entrer une adresse courriel valide.",
    },
  },

  blog: {
    eyebrow: "Le blogue HealthyZone",
    title: "Pour mieux bouger et se sentir mieux",
    lead: "Des articles pratiques et sans détour sur la massothérapie, la récupération, la posture et la mobilité, écrits par Ziad.",
    featured: "À la une",
    readArticle: "Lire l'article",
    minRead: "{n} min de lecture",
    by: "Par",
    author: "Ziad",
    authorRole: "Massothérapeute agréé · Entraîneur personnel",
    authorBio:
      "Ziad est massothérapeute agréé (RMQ) et entraîneur personnel dans l'Ouest-de-l'Île de Montréal. Il traite ses clients à domicile, au travail et au gym dans tout le Grand Montréal.",
    backToBlog: "Tous les articles",
    related: "À lire aussi",
    latestEyebrow: "Du blogue",
    latestTitle: "Des conseils pour un corps qui se sent mieux",
    viewAll: "Voir tous les articles",
    ctaTitle: "Prêt à sentir la différence?",
    ctaText: "Réservez une séance à domicile, au travail ou au gym. On commence par vos objectifs et on bâtit à partir de là.",
    ctaButton: "Prendre rendez-vous",
    disclaimer:
      "Cet article est fourni à titre informatif et ne remplace pas un avis médical. En cas de douleur, de blessure ou de problème de santé, consultez un professionnel de la santé qualifié.",
  },

  footer: {
    rights: "Tous droits réservés.",
    privacy: "Politique de confidentialité",
  },

  privacy: {
    eyebrow: "Mentions légales",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : octobre 2026.",
    intro:
      "HealthyZone (« nous ») respecte votre vie privée et se conforme à la Loi sur la protection des renseignements personnels dans le secteur privé du Québec (Loi 25) ainsi qu'à la LPRPDE du Canada. Cette politique explique ce que nous recueillons, pourquoi, et quels sont vos droits.",
    sections: [
      {
        title: "Ce que nous recueillons",
        items: [
          "Les coordonnées que vous soumettez via notre formulaire de contact (nom, courriel, téléphone).",
          "Les renseignements que vous partagez sur vos objectifs, votre santé et votre mode de vie lors des séances.",
        ],
      },
      {
        title: "Comment nous les utilisons",
        text: "Pour répondre à votre demande, offrir les services de massothérapie et d'entraînement, émettre des reçus et vous envoyer l'information que vous avez demandée. Nous ne vendons jamais vos données et ne partageons jamais de renseignements de santé sans votre consentement explicite, sauf si la loi l'exige.",
      },
      {
        title: "Conservation et sécurité",
        text: "Les dossiers clients sont conservés dans des systèmes sécurisés à accès contrôlé. Les soumissions du formulaire sont transmises par HTTPS et livrées à notre courriel d'affaires.",
      },
      {
        title: "Vos droits",
        text: "Vous pouvez demander l'accès, la rectification ou la suppression de vos renseignements personnels en tout temps en écrivant à {email}. Notre responsable de la protection des renseignements personnels est Ziad Bik.",
      },
      {
        title: "Témoins (cookies)",
        text: "Ce site n'utilise que des témoins strictement nécessaires.",
      },
    ],
  },

  notFound: {
    title: "Page introuvable",
    lead: "La page que vous cherchez n'existe pas ou a été déplacée.",
    backHome: "Retour à l'accueil",
  },
};
