/**
 * Internationalization (i18n) System
 * Multi-language support for DealershipAI
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export type Locale = 'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE';

export interface LocaleConfig {
  code: Locale;
  name: string;
  flag: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    flag: '🇺🇸',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
  },
  'en-GB': {
    code: 'en-GB',
    name: 'English (UK)',
    flag: '🇬🇧',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'GBP',
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Español',
    flag: '🇪🇸',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'Français',
    flag: '🇫🇷',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
  },
  'de-DE': {
    code: 'de-DE',
    name: 'Deutsch',
    flag: '🇩🇪',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    currency: 'EUR',
  },
};

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    sort: string;
    next: string;
    previous: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
  };
  
  // Navigation
  navigation: {
    dashboard: string;
    onboarding: string;
    learning: string;
    team: string;
    settings: string;
    profile: string;
    signOut: string;
  };
  
  // Onboarding
  onboarding: {
    welcome: string;
    dealershipInfo: string;
    connections: string;
    team: string;
    plan: string;
    preferences: string;
    success: string;
    skip: string;
    complete: string;
    next: string;
    previous: string;
  };
  
  // Dashboard
  dashboard: {
    overview: string;
    reputation: string;
    insights: string;
    whatIf: string;
    quickActions: string;
    metrics: string;
    forecasts: string;
    recommendations: string;
  };
  
  // Reputation Engine
  reputation: {
    autoReply: string;
    engageLudicrousMode: string;
    deployResponse: string;
    responseTone: string;
    professional: string;
    friendly: string;
    witty: string;
    autoReplyEnabled: string;
    threshold: string;
    stars: string;
  };
  
  // Learning Center
  learning: {
    title: string;
    progress: string;
    completed: string;
    remaining: string;
    avgRating: string;
    searchContent: string;
    featured: string;
    categories: string;
    difficulty: string;
    duration: string;
    rating: string;
  };
  
  // Team Management
  team: {
    title: string;
    createTask: string;
    inviteMember: string;
    pendingTasks: string;
    inProgress: string;
    overdue: string;
    completed: string;
    taskManagement: string;
    teamMembers: string;
    assignTo: string;
    priority: string;
    dueDate: string;
    category: string;
    estimatedHours: string;
  };
}

const TRANSLATIONS: Record<Locale, Translations> = {
  'en-US': {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    navigation: {
      dashboard: 'Dashboard',
      onboarding: 'Onboarding',
      learning: 'Learning',
      team: 'Team',
      settings: 'Settings',
      profile: 'Profile',
      signOut: 'Sign Out',
    },
    onboarding: {
      welcome: 'Welcome to DealershipAI',
      dealershipInfo: 'Tell Us About Your Dealership',
      connections: 'Connect Your Data Sources',
      team: 'Invite Your Team',
      plan: 'Choose Your Power Level',
      preferences: 'Customize Your Experience',
      success: 'Welcome Aboard, Commander!',
      skip: 'Skip',
      complete: 'Complete',
      next: 'Next',
      previous: 'Previous',
    },
    dashboard: {
      overview: 'Overview',
      reputation: 'Reputation Engine',
      insights: 'AI Insights',
      whatIf: 'What-If Simulator',
      quickActions: 'Quick Actions',
      metrics: 'Metrics',
      forecasts: 'Forecasts',
      recommendations: 'Recommendations',
    },
    reputation: {
      autoReply: 'Auto-Reply Engine',
      engageLudicrousMode: 'Engage Ludicrous Mode',
      deployResponse: 'Deploy Response',
      responseTone: 'Response Tone',
      professional: 'Professional',
      friendly: 'Friendly',
      witty: 'Witty',
      autoReplyEnabled: 'Enable auto-reply',
      threshold: 'Threshold',
      stars: 'stars',
    },
    learning: {
      title: 'Learning Center',
      progress: 'Your Learning Progress',
      completed: 'Completed',
      remaining: 'Remaining',
      avgRating: 'Avg Rating',
      searchContent: 'Search learning content...',
      featured: 'Featured This Week',
      categories: 'Categories',
      difficulty: 'Difficulty',
      duration: 'Duration',
      rating: 'Rating',
    },
    team: {
      title: 'Team Management',
      createTask: 'Create Task',
      inviteMember: 'Invite Member',
      pendingTasks: 'Pending Tasks',
      inProgress: 'In Progress',
      overdue: 'Overdue',
      completed: 'Completed',
      taskManagement: 'Task Management',
      teamMembers: 'Team Members',
      assignTo: 'Assign To',
      priority: 'Priority',
      dueDate: 'Due Date',
      category: 'Category',
      estimatedHours: 'Estimated Hours',
    },
  },
  'en-GB': {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    navigation: {
      dashboard: 'Dashboard',
      onboarding: 'Onboarding',
      learning: 'Learning',
      team: 'Team',
      settings: 'Settings',
      profile: 'Profile',
      signOut: 'Sign Out',
    },
    onboarding: {
      welcome: 'Welcome to DealershipAI',
      dealershipInfo: 'Tell Us About Your Dealership',
      connections: 'Connect Your Data Sources',
      team: 'Invite Your Team',
      plan: 'Choose Your Power Level',
      preferences: 'Customise Your Experience',
      success: 'Welcome Aboard, Commander!',
      skip: 'Skip',
      complete: 'Complete',
      next: 'Next',
      previous: 'Previous',
    },
    dashboard: {
      overview: 'Overview',
      reputation: 'Reputation Engine',
      insights: 'AI Insights',
      whatIf: 'What-If Simulator',
      quickActions: 'Quick Actions',
      metrics: 'Metrics',
      forecasts: 'Forecasts',
      recommendations: 'Recommendations',
    },
    reputation: {
      autoReply: 'Auto-Reply Engine',
      engageLudicrousMode: 'Engage Ludicrous Mode',
      deployResponse: 'Deploy Response',
      responseTone: 'Response Tone',
      professional: 'Professional',
      friendly: 'Friendly',
      witty: 'Witty',
      autoReplyEnabled: 'Enable auto-reply',
      threshold: 'Threshold',
      stars: 'stars',
    },
    learning: {
      title: 'Learning Centre',
      progress: 'Your Learning Progress',
      completed: 'Completed',
      remaining: 'Remaining',
      avgRating: 'Avg Rating',
      searchContent: 'Search learning content...',
      featured: 'Featured This Week',
      categories: 'Categories',
      difficulty: 'Difficulty',
      duration: 'Duration',
      rating: 'Rating',
    },
    team: {
      title: 'Team Management',
      createTask: 'Create Task',
      inviteMember: 'Invite Member',
      pendingTasks: 'Pending Tasks',
      inProgress: 'In Progress',
      overdue: 'Overdue',
      completed: 'Completed',
      taskManagement: 'Task Management',
      teamMembers: 'Team Members',
      assignTo: 'Assign To',
      priority: 'Priority',
      dueDate: 'Due Date',
      category: 'Category',
      estimatedHours: 'Estimated Hours',
    },
  },
  'es-ES': {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
    },
    navigation: {
      dashboard: 'Panel',
      onboarding: 'Configuración',
      learning: 'Aprendizaje',
      team: 'Equipo',
      settings: 'Configuración',
      profile: 'Perfil',
      signOut: 'Cerrar Sesión',
    },
    onboarding: {
      welcome: 'Bienvenido a DealershipAI',
      dealershipInfo: 'Cuéntanos sobre tu concesionario',
      connections: 'Conecta tus fuentes de datos',
      team: 'Invita a tu equipo',
      plan: 'Elige tu nivel de potencia',
      preferences: 'Personaliza tu experiencia',
      success: '¡Bienvenido a bordo, Comandante!',
      skip: 'Omitir',
      complete: 'Completar',
      next: 'Siguiente',
      previous: 'Anterior',
    },
    dashboard: {
      overview: 'Resumen',
      reputation: 'Motor de Reputación',
      insights: 'Insights de IA',
      whatIf: 'Simulador Qué Pasa Si',
      quickActions: 'Acciones Rápidas',
      metrics: 'Métricas',
      forecasts: 'Pronósticos',
      recommendations: 'Recomendaciones',
    },
    reputation: {
      autoReply: 'Motor de Respuesta Automática',
      engageLudicrousMode: 'Activar Modo Lúdico',
      deployResponse: 'Desplegar Respuesta',
      responseTone: 'Tono de Respuesta',
      professional: 'Profesional',
      friendly: 'Amigable',
      witty: 'Ingenioso',
      autoReplyEnabled: 'Habilitar respuesta automática',
      threshold: 'Umbral',
      stars: 'estrellas',
    },
    learning: {
      title: 'Centro de Aprendizaje',
      progress: 'Tu Progreso de Aprendizaje',
      completed: 'Completado',
      remaining: 'Restante',
      avgRating: 'Calificación Promedio',
      searchContent: 'Buscar contenido de aprendizaje...',
      featured: 'Destacado Esta Semana',
      categories: 'Categorías',
      difficulty: 'Dificultad',
      duration: 'Duración',
      rating: 'Calificación',
    },
    team: {
      title: 'Gestión de Equipo',
      createTask: 'Crear Tarea',
      inviteMember: 'Invitar Miembro',
      pendingTasks: 'Tareas Pendientes',
      inProgress: 'En Progreso',
      overdue: 'Vencidas',
      completed: 'Completadas',
      taskManagement: 'Gestión de Tareas',
      teamMembers: 'Miembros del Equipo',
      assignTo: 'Asignar A',
      priority: 'Prioridad',
      dueDate: 'Fecha de Vencimiento',
      category: 'Categoría',
      estimatedHours: 'Horas Estimadas',
    },
  },
  'fr-FR': {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      next: 'Suivant',
      previous: 'Précédent',
      close: 'Fermer',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
    },
    navigation: {
      dashboard: 'Tableau de bord',
      onboarding: 'Intégration',
      learning: 'Apprentissage',
      team: 'Équipe',
      settings: 'Paramètres',
      profile: 'Profil',
      signOut: 'Déconnexion',
    },
    onboarding: {
      welcome: 'Bienvenue sur DealershipAI',
      dealershipInfo: 'Parlez-nous de votre concession',
      connections: 'Connectez vos sources de données',
      team: 'Invitez votre équipe',
      plan: 'Choisissez votre niveau de puissance',
      preferences: 'Personnalisez votre expérience',
      success: 'Bienvenue à bord, Commandant !',
      skip: 'Ignorer',
      complete: 'Terminer',
      next: 'Suivant',
      previous: 'Précédent',
    },
    dashboard: {
      overview: 'Aperçu',
      reputation: 'Moteur de Réputation',
      insights: 'Insights IA',
      whatIf: 'Simulateur Et Si',
      quickActions: 'Actions Rapides',
      metrics: 'Métriques',
      forecasts: 'Prévisions',
      recommendations: 'Recommandations',
    },
    reputation: {
      autoReply: 'Moteur de Réponse Automatique',
      engageLudicrousMode: 'Activer le Mode Ludique',
      deployResponse: 'Déployer la Réponse',
      responseTone: 'Ton de Réponse',
      professional: 'Professionnel',
      friendly: 'Amical',
      witty: 'Spirituel',
      autoReplyEnabled: 'Activer la réponse automatique',
      threshold: 'Seuil',
      stars: 'étoiles',
    },
    learning: {
      title: 'Centre d\'Apprentissage',
      progress: 'Votre Progrès d\'Apprentissage',
      completed: 'Terminé',
      remaining: 'Restant',
      avgRating: 'Note Moyenne',
      searchContent: 'Rechercher du contenu d\'apprentissage...',
      featured: 'En Vedette Cette Semaine',
      categories: 'Catégories',
      difficulty: 'Difficulté',
      duration: 'Durée',
      rating: 'Note',
    },
    team: {
      title: 'Gestion d\'Équipe',
      createTask: 'Créer une Tâche',
      inviteMember: 'Inviter un Membre',
      pendingTasks: 'Tâches en Attente',
      inProgress: 'En Cours',
      overdue: 'En Retard',
      completed: 'Terminées',
      taskManagement: 'Gestion des Tâches',
      teamMembers: 'Membres de l\'Équipe',
      assignTo: 'Assigner À',
      priority: 'Priorité',
      dueDate: 'Date d\'Échéance',
      category: 'Catégorie',
      estimatedHours: 'Heures Estimées',
    },
  },
  'de-DE': {
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      filter: 'Filtern',
      sort: 'Sortieren',
      next: 'Weiter',
      previous: 'Zurück',
      close: 'Schließen',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein',
    },
    navigation: {
      dashboard: 'Dashboard',
      onboarding: 'Einführung',
      learning: 'Lernen',
      team: 'Team',
      settings: 'Einstellungen',
      profile: 'Profil',
      signOut: 'Abmelden',
    },
    onboarding: {
      welcome: 'Willkommen bei DealershipAI',
      dealershipInfo: 'Erzählen Sie uns von Ihrem Autohaus',
      connections: 'Verbinden Sie Ihre Datenquellen',
      team: 'Laden Sie Ihr Team ein',
      plan: 'Wählen Sie Ihr Leistungsniveau',
      preferences: 'Passen Sie Ihre Erfahrung an',
      success: 'Willkommen an Bord, Kommandant!',
      skip: 'Überspringen',
      complete: 'Abschließen',
      next: 'Weiter',
      previous: 'Zurück',
    },
    dashboard: {
      overview: 'Übersicht',
      reputation: 'Reputations-Engine',
      insights: 'KI-Insights',
      whatIf: 'Was-Wäre-Wenn-Simulator',
      quickActions: 'Schnellaktionen',
      metrics: 'Metriken',
      forecasts: 'Prognosen',
      recommendations: 'Empfehlungen',
    },
    reputation: {
      autoReply: 'Auto-Antwort-Engine',
      engageLudicrousMode: 'Ludicrous-Modus aktivieren',
      deployResponse: 'Antwort bereitstellen',
      responseTone: 'Antwortton',
      professional: 'Professionell',
      friendly: 'Freundlich',
      witty: 'Geistreich',
      autoReplyEnabled: 'Auto-Antwort aktivieren',
      threshold: 'Schwellenwert',
      stars: 'Sterne',
    },
    learning: {
      title: 'Lernzentrum',
      progress: 'Ihr Lernfortschritt',
      completed: 'Abgeschlossen',
      remaining: 'Verbleibend',
      avgRating: 'Durchschnittsbewertung',
      searchContent: 'Lerninhalte suchen...',
      featured: 'Diese Woche im Fokus',
      categories: 'Kategorien',
      difficulty: 'Schwierigkeit',
      duration: 'Dauer',
      rating: 'Bewertung',
    },
    team: {
      title: 'Team-Management',
      createTask: 'Aufgabe erstellen',
      inviteMember: 'Mitglied einladen',
      pendingTasks: 'Ausstehende Aufgaben',
      inProgress: 'In Bearbeitung',
      overdue: 'Überfällig',
      completed: 'Abgeschlossen',
      taskManagement: 'Aufgabenverwaltung',
      teamMembers: 'Teammitglieder',
      assignTo: 'Zuweisen an',
      priority: 'Priorität',
      dueDate: 'Fälligkeitsdatum',
      category: 'Kategorie',
      estimatedHours: 'Geschätzte Stunden',
    },
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  formatDate: (date: Date) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (number: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en-US');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = TRANSLATIONS[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const formatDate = (date: Date): string => {
    const config = LOCALES[locale];
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number): string => {
    const config = LOCALES[locale];
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.currency,
    }).format(amount);
  };

  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(locale).format(number);
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatCurrency,
        formatNumber,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
