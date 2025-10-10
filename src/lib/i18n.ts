/**
 * Internationalization (i18n) System
 * 
 * Multi-language and locale support for DealershipAI:
 * - Dynamic language switching
 * - Locale-specific formatting
 * - Translation management
 * - RTL language support
 * - Currency and date formatting
 */

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export interface Translation {
  key: string;
  value: string;
  locale: string;
  namespace: string;
  context?: string;
  plural?: {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
  };
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export class I18nManager {
  private currentLocale: string = 'en';
  private fallbackLocale: string = 'en';
  private translations: Map<string, TranslationNamespace> = new Map();
  private locales: Map<string, Locale> = new Map();

  constructor() {
    this.initializeLocales();
    this.initializeTranslations();
  }

  /**
   * Initialize supported locales
   */
  private initializeLocales(): void {
    const supportedLocales: Locale[] = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        numberFormat: {
          decimal: '.',
          thousands: ',',
        },
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        direction: 'ltr',
        currency: 'USD',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: {
          decimal: ',',
          thousands: '.',
        },
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        direction: 'ltr',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: {
          decimal: ',',
          thousands: ' ',
        },
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        direction: 'ltr',
        currency: 'EUR',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: {
          decimal: ',',
          thousands: '.',
        },
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        currency: 'SAR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        numberFormat: {
          decimal: '.',
          thousands: ',',
        },
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        direction: 'ltr',
        currency: 'CNY',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h',
        numberFormat: {
          decimal: '.',
          thousands: ',',
        },
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        direction: 'ltr',
        currency: 'JPY',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h',
        numberFormat: {
          decimal: '.',
          thousands: ',',
        },
      },
    ];

    supportedLocales.forEach(locale => {
      this.locales.set(locale.code, locale);
    });
  }

  /**
   * Initialize translations
   */
  private initializeTranslations(): void {
    // English translations (default)
    this.translations.set('en', {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset',
        clear: 'Clear',
        select: 'Select',
        all: 'All',
        none: 'None',
        required: 'Required',
        optional: 'Optional',
      },
      navigation: {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        reports: 'Reports',
        settings: 'Settings',
        profile: 'Profile',
        help: 'Help',
        support: 'Support',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
      },
      dashboard: {
        title: 'DealershipAI Dashboard',
        subtitle: 'AI Visibility Analytics & Optimization',
        revenueAtRisk: 'Revenue at Risk',
        aiVisibility: 'AI Visibility',
        monthlyLeads: 'Monthly Leads',
        impressionsTrend: 'Impressions Trend',
        trafficSources: 'Traffic Sources',
        ugcHealth: 'UGC Health',
        zeroClickVisibility: 'Zero-Click Visibility',
        liveIntelligence: 'Live Intelligence Feed',
        aiAssistant: 'AI Assistant',
      },
      metrics: {
        overall: 'Overall Score',
        seo: 'SEO Score',
        aeo: 'AI Engine Optimization',
        geo: 'Geographic Visibility',
        reputation: 'Reputation Score',
        social: 'Social Media Score',
        news: 'News Coverage Score',
        customer: 'Customer Satisfaction',
        industry: 'Industry Recognition',
      },
      features: {
        whatIfSimulator: 'What-If Simulator',
        predictiveInsights: 'Predictive Insights',
        reputationEngine: 'Reputation Engine',
        learningCenter: 'Learning Center',
        teamManagement: 'Team Management',
        productTour: 'Product Tour',
      },
      time: {
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        thisYear: 'This Year',
        lastYear: 'Last Year',
        custom: 'Custom Range',
      },
      units: {
        currency: '$',
        percentage: '%',
        count: 'count',
        hours: 'hours',
        days: 'days',
        weeks: 'weeks',
        months: 'months',
        years: 'years',
      },
    });

    // Spanish translations
    this.translations.set('es', {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        import: 'Importar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información',
        yes: 'Sí',
        no: 'No',
        ok: 'OK',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        submit: 'Enviar',
        reset: 'Restablecer',
        clear: 'Limpiar',
        select: 'Seleccionar',
        all: 'Todos',
        none: 'Ninguno',
        required: 'Requerido',
        optional: 'Opcional',
      },
      navigation: {
        dashboard: 'Panel de Control',
        analytics: 'Analíticas',
        reports: 'Reportes',
        settings: 'Configuración',
        profile: 'Perfil',
        help: 'Ayuda',
        support: 'Soporte',
        logout: 'Cerrar Sesión',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
      },
      dashboard: {
        title: 'Panel de Control DealershipAI',
        subtitle: 'Analíticas de Visibilidad IA y Optimización',
        revenueAtRisk: 'Ingresos en Riesgo',
        aiVisibility: 'Visibilidad IA',
        monthlyLeads: 'Leads Mensuales',
        impressionsTrend: 'Tendencia de Impresiones',
        trafficSources: 'Fuentes de Tráfico',
        ugcHealth: 'Salud UGC',
        zeroClickVisibility: 'Visibilidad Cero Clics',
        liveIntelligence: 'Feed de Inteligencia en Vivo',
        aiAssistant: 'Asistente IA',
      },
    });

    // French translations
    this.translations.set('fr', {
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        create: 'Créer',
        update: 'Mettre à jour',
        search: 'Rechercher',
        filter: 'Filtrer',
        export: 'Exporter',
        import: 'Importer',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Avertissement',
        info: 'Information',
        yes: 'Oui',
        no: 'Non',
        ok: 'OK',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        submit: 'Soumettre',
        reset: 'Réinitialiser',
        clear: 'Effacer',
        select: 'Sélectionner',
        all: 'Tous',
        none: 'Aucun',
        required: 'Requis',
        optional: 'Optionnel',
      },
      navigation: {
        dashboard: 'Tableau de Bord',
        analytics: 'Analytiques',
        reports: 'Rapports',
        settings: 'Paramètres',
        profile: 'Profil',
        help: 'Aide',
        support: 'Support',
        logout: 'Déconnexion',
        login: 'Connexion',
        register: 'S\'inscrire',
      },
      dashboard: {
        title: 'Tableau de Bord DealershipAI',
        subtitle: 'Analytiques de Visibilité IA et Optimisation',
        revenueAtRisk: 'Revenus à Risque',
        aiVisibility: 'Visibilité IA',
        monthlyLeads: 'Leads Mensuels',
        impressionsTrend: 'Tendance des Impressions',
        trafficSources: 'Sources de Trafic',
        ugcHealth: 'Santé UGC',
        zeroClickVisibility: 'Visibilité Zéro Clic',
        liveIntelligence: 'Flux d\'Intelligence en Direct',
        aiAssistant: 'Assistant IA',
      },
    });

    // German translations
    this.translations.set('de', {
      common: {
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        create: 'Erstellen',
        update: 'Aktualisieren',
        search: 'Suchen',
        filter: 'Filtern',
        export: 'Exportieren',
        import: 'Importieren',
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
        warning: 'Warnung',
        info: 'Information',
        yes: 'Ja',
        no: 'Nein',
        ok: 'OK',
        close: 'Schließen',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Vorherige',
        submit: 'Absenden',
        reset: 'Zurücksetzen',
        clear: 'Löschen',
        select: 'Auswählen',
        all: 'Alle',
        none: 'Keine',
        required: 'Erforderlich',
        optional: 'Optional',
      },
      navigation: {
        dashboard: 'Dashboard',
        analytics: 'Analytik',
        reports: 'Berichte',
        settings: 'Einstellungen',
        profile: 'Profil',
        help: 'Hilfe',
        support: 'Support',
        logout: 'Abmelden',
        login: 'Anmelden',
        register: 'Registrieren',
      },
      dashboard: {
        title: 'DealershipAI Dashboard',
        subtitle: 'KI-Sichtbarkeitsanalytik und Optimierung',
        revenueAtRisk: 'Umsatz im Risiko',
        aiVisibility: 'KI-Sichtbarkeit',
        monthlyLeads: 'Monatliche Leads',
        impressionsTrend: 'Impressions-Trend',
        trafficSources: 'Traffic-Quellen',
        ugcHealth: 'UGC-Gesundheit',
        zeroClickVisibility: 'Zero-Click-Sichtbarkeit',
        liveIntelligence: 'Live-Intelligence-Feed',
        aiAssistant: 'KI-Assistent',
      },
    });

    // Arabic translations
    this.translations.set('ar', {
      common: {
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        create: 'إنشاء',
        update: 'تحديث',
        search: 'بحث',
        filter: 'تصفية',
        export: 'تصدير',
        import: 'استيراد',
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        warning: 'تحذير',
        info: 'معلومات',
        yes: 'نعم',
        no: 'لا',
        ok: 'موافق',
        close: 'إغلاق',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        submit: 'إرسال',
        reset: 'إعادة تعيين',
        clear: 'مسح',
        select: 'اختيار',
        all: 'الكل',
        none: 'لا شيء',
        required: 'مطلوب',
        optional: 'اختياري',
      },
      navigation: {
        dashboard: 'لوحة التحكم',
        analytics: 'التحليلات',
        reports: 'التقارير',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        help: 'المساعدة',
        support: 'الدعم',
        logout: 'تسجيل الخروج',
        login: 'تسجيل الدخول',
        register: 'التسجيل',
      },
      dashboard: {
        title: 'لوحة تحكم DealershipAI',
        subtitle: 'تحليلات رؤية الذكاء الاصطناعي والتحسين',
        revenueAtRisk: 'الإيرادات المعرضة للخطر',
        aiVisibility: 'رؤية الذكاء الاصطناعي',
        monthlyLeads: 'العملاء المحتملين الشهريين',
        impressionsTrend: 'اتجاه الانطباعات',
        trafficSources: 'مصادر المرور',
        ugcHealth: 'صحة المحتوى المقدم من المستخدمين',
        zeroClickVisibility: 'رؤية النقر الصفري',
        liveIntelligence: 'تغذية الذكاء المباشر',
        aiAssistant: 'مساعد الذكاء الاصطناعي',
      },
    });
  }

  /**
   * Set current locale
   */
  setLocale(locale: string): void {
    if (this.locales.has(locale)) {
      this.currentLocale = locale;
      this.updateDocumentDirection();
      this.updateDocumentLanguage();
    }
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get supported locales
   */
  getSupportedLocales(): Locale[] {
    return Array.from(this.locales.values());
  }

  /**
   * Get locale information
   */
  getLocale(locale: string): Locale | undefined {
    return this.locales.get(locale);
  }

  /**
   * Translate a key
   */
  t(key: string, params?: Record<string, any>, count?: number): string {
    const translation = this.getTranslation(key, this.currentLocale);
    
    if (!translation) {
      // Fallback to English if translation not found
      const fallbackTranslation = this.getTranslation(key, this.fallbackLocale);
      if (fallbackTranslation) {
        return this.interpolate(fallbackTranslation, params);
      }
      
      // Return key if no translation found
      return key;
    }

    // Handle pluralization
    if (count !== undefined && typeof translation === 'object' && 'plural' in translation) {
      const pluralForm = this.getPluralForm(count, this.currentLocale);
      const pluralTranslation = (translation as any).plural[pluralForm] || (translation as any).plural.other;
      return this.interpolate(pluralTranslation, { ...params, count });
    }

    return this.interpolate(translation, params);
  }

  /**
   * Get translation for a key
   */
  private getTranslation(key: string, locale: string): string | null {
    const translations = this.translations.get(locale);
    if (!translations) return null;

    const keys = key.split('.');
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * Interpolate parameters in translation
   */
  private interpolate(translation: string, params?: Record<string, any>): string {
    if (!params) return translation;

    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Get plural form for a count
   */
  private getPluralForm(count: number, locale: string): string {
    // Simplified plural rules - in a real implementation, you'd use a proper pluralization library
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    if (count >= 3 && count <= 10) return 'few';
    if (count > 10) return 'many';
    return 'other';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency?: string): string {
    const locale = this.getLocale(this.currentLocale);
    const currencyCode = currency || locale?.currency || 'USD';
    
    try {
      return new Intl.NumberFormat(this.currentLocale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Format number
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.currentLocale, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format date
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /**
   * Format time
   */
  formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat(this.currentLocale, {
        ...options,
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch (error) {
      return date.toLocaleTimeString();
    }
  }

  /**
   * Format relative time
   */
  formatRelativeTime(date: Date): string {
    try {
      const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });
      const now = new Date();
      const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
      
      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(diffInSeconds, 'second');
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
      }
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /**
   * Update document direction
   */
  private updateDocumentDirection(): void {
    const locale = this.getLocale(this.currentLocale);
    if (locale) {
      document.documentElement.dir = locale.direction;
    }
  }

  /**
   * Update document language
   */
  private updateDocumentLanguage(): void {
    document.documentElement.lang = this.currentLocale;
  }

  /**
   * Load translations from external source
   */
  async loadTranslations(locale: string, namespace: string, translations: TranslationNamespace): Promise<void> {
    const existing = this.translations.get(locale) || {};
    this.translations.set(locale, {
      ...existing,
      [namespace]: translations,
    });
  }

  /**
   * Get all translations for a locale
   */
  getTranslations(locale: string): TranslationNamespace | undefined {
    return this.translations.get(locale);
  }

  /**
   * Check if locale is RTL
   */
  isRTL(locale?: string): boolean {
    const targetLocale = locale || this.currentLocale;
    const localeInfo = this.getLocale(targetLocale);
    return localeInfo?.direction === 'rtl';
  }

  /**
   * Get locale-specific CSS class
   */
  getLocaleClass(): string {
    return `locale-${this.currentLocale} ${this.isRTL() ? 'rtl' : 'ltr'}`;
  }
}

// Export singleton instance
export const i18nManager = new I18nManager();

// Export convenience functions
export const t = (key: string, params?: Record<string, any>, count?: number) => 
  i18nManager.t(key, params, count);

export const setLocale = (locale: string) => i18nManager.setLocale(locale);
export const getCurrentLocale = () => i18nManager.getCurrentLocale();
export const formatCurrency = (amount: number, currency?: string) => 
  i18nManager.formatCurrency(amount, currency);
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => 
  i18nManager.formatNumber(number, options);
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => 
  i18nManager.formatDate(date, options);
export const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions) => 
  i18nManager.formatTime(date, options);
export const formatRelativeTime = (date: Date) => 
  i18nManager.formatRelativeTime(date);