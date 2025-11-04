export const ga = (name: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', name, params);
    } catch (error) {
      // Silently fail if gtag is not available
      console.debug('GA tracking failed:', error);
    }
  }
};

// Common event tracking functions
export const trackPageView = (url: string) => {
  ga('page_view', { page_location: url });
};

export const trackCTA = (id: string, location: string) => {
  ga('cta_click', { id, location });
};

export const trackModalOpen = (id: string) => {
  ga('modal_open', { id });
};

export const trackModalClose = (id: string) => {
  ga('modal_close', { id });
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  ga('form_submit', { form_name: formName, success });
};

export const trackShare = (type: string, url: string) => {
  ga('share', { method: type, content_type: 'report', item_id: url });
};

export const trackDownload = (fileName: string, fileType: string) => {
  ga('file_download', { file_name: fileName, file_type: fileType });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  ga('search', { search_term: searchTerm, results_count: resultsCount });
};

export const trackError = (errorType: string, errorMessage: string) => {
  ga('exception', { description: `${errorType}: ${errorMessage}`, fatal: false });
};

export const trackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
  ga(eventName, parameters);
};
