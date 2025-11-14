/**
 * OEM Model Schema
 * Structured JSON schema for extracting model-year updates from OEM pressrooms
 */

export interface OEMPowertrain {
  name: string; // e.g., "i-FORCE", "i-FORCE MAX"
  hp?: number;
  torque_lbft?: number;
  mpg_combined?: number;
  mpg_city?: number;
  mpg_highway?: number;
  transmission?: string;
  drivetrain?: string; // e.g., "4WD", "AWD", "RWD"
}

export interface OEMColor {
  name: string; // e.g., "Heritage Blue", "Wave Maker"
  trim_limitation?: string; // e.g., "TRD Pro only"
  availability?: string; // e.g., "Limited availability"
}

export interface OEMHeadlineChange {
  title: string; // e.g., "Black front logo now on TRD Off-Road"
  detail: string; // Full description
  tag?: string; // e.g., "equipment", "styling", "powertrain", "pricing"
  is_retail_relevant: boolean; // Whether dealers need to act on this
  affected_trims?: string[]; // e.g., ["TRD Off-Road", "TRD Sport"]
}

export interface OEMModelUpdate {
  oem: string; // e.g., "Toyota", "Hyundai", "Ford"
  model: string; // e.g., "Tacoma", "Tucson", "F-150"
  year: number; // e.g., 2026
  headline_changes: OEMHeadlineChange[];
  powertrains?: OEMPowertrain[];
  colors?: OEMColor[];
  equipment_changes?: Array<{
    item: string; // e.g., "Tow hitch"
    change: string; // e.g., "now standard on SR XtraCab"
    affected_trims?: string[];
  }>;
  pricing_changes?: Array<{
    trim: string;
    msrp_delta?: number; // Price change in USD
    note?: string;
  }>;
  availability_window?: {
    start?: string; // ISO date
    end?: string; // ISO date
    note?: string; // e.g., "Limited initial allocation"
  };
  source_url?: string; // Original pressroom URL
  extracted_at?: string; // ISO timestamp
}

/**
 * JSON Schema for OpenAI structured output
 */
export const OEM_MODEL_SCHEMA = {
  type: 'object',
  properties: {
    oem: { type: 'string', description: 'OEM manufacturer name (e.g., "Toyota", "Hyundai")' },
    model: { type: 'string', description: 'Model name (e.g., "Tacoma", "Tucson")' },
    year: { type: 'integer', description: 'Model year (e.g., 2026)' },
    headline_changes: {
      type: 'array',
      description: 'Key changes dealers need to know about',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short headline (e.g., "Black front logo now on TRD Off-Road")' },
          detail: { type: 'string', description: 'Full description of the change' },
          tag: { type: 'string', enum: ['equipment', 'styling', 'powertrain', 'pricing', 'color', 'safety', 'technology'], description: 'Category of change' },
          is_retail_relevant: { type: 'boolean', description: 'Whether dealers need to take action' },
          affected_trims: { type: 'array', items: { type: 'string' }, description: 'Specific trims affected' },
        },
        required: ['title', 'detail', 'is_retail_relevant'],
      },
    },
    powertrains: {
      type: 'array',
      description: 'Powertrain options and specifications',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Powertrain name (e.g., "i-FORCE", "i-FORCE MAX")' },
          hp: { type: 'integer', description: 'Horsepower' },
          torque_lbft: { type: 'integer', description: 'Torque in lb-ft' },
          mpg_combined: { type: 'integer', description: 'Combined MPG' },
          mpg_city: { type: 'integer', description: 'City MPG' },
          mpg_highway: { type: 'integer', description: 'Highway MPG' },
          transmission: { type: 'string', description: 'Transmission type' },
          drivetrain: { type: 'string', description: 'Drivetrain (4WD, AWD, RWD)' },
        },
        required: ['name'],
      },
    },
    colors: {
      type: 'array',
      description: 'New or updated color options',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Color name (e.g., "Heritage Blue", "Wave Maker")' },
          trim_limitation: { type: 'string', description: 'Trim restrictions (e.g., "TRD Pro only")' },
          availability: { type: 'string', description: 'Availability note' },
        },
        required: ['name'],
      },
    },
    equipment_changes: {
      type: 'array',
      description: 'Standard equipment changes',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string', description: 'Equipment item name' },
          change: { type: 'string', description: 'What changed (e.g., "now standard on SR XtraCab")' },
          affected_trims: { type: 'array', items: { type: 'string' }, description: 'Affected trims' },
        },
        required: ['item', 'change'],
      },
    },
    pricing_changes: {
      type: 'array',
      description: 'MSRP changes',
      items: {
        type: 'object',
        properties: {
          trim: { type: 'string', description: 'Trim name' },
          msrp_delta: { type: 'number', description: 'Price change in USD (positive = increase)' },
          note: { type: 'string', description: 'Additional pricing context' },
        },
        required: ['trim'],
      },
    },
    availability_window: {
      type: 'object',
      description: 'When the model becomes available',
      properties: {
        start: { type: 'string', format: 'date', description: 'Start date (ISO format)' },
        end: { type: 'string', format: 'date', description: 'End date (ISO format)' },
        note: { type: 'string', description: 'Availability notes' },
      },
    },
    source_url: { type: 'string', format: 'uri', description: 'Original pressroom URL' },
    extracted_at: { type: 'string', format: 'date-time', description: 'When this data was extracted' },
  },
  required: ['oem', 'model', 'year', 'headline_changes'],
} as const;

