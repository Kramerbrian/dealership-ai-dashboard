/**
 * OpenAI Function Calling Schema
 * 
 * Defines tools/actions GPT can invoke for automotive dealership operations
 */

export interface GPTFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const AUTOMOTIVE_FUNCTIONS: GPTFunction[] = [
  {
    name: "appraiseVehicle",
    description: "Estimate the trade-in or sale value of a user-provided vehicle. Returns NADA/KBB-aligned valuation with market range.",
    parameters: {
      type: "object",
      properties: {
        year: {
          type: "integer",
          description: "Model year (e.g., 2020)"
        },
        make: {
          type: "string",
          description: "Vehicle make (OEM brand like Toyota, Ford, etc.)"
        },
        model: {
          type: "string",
          description: "Model name (e.g., Camry, Explorer)"
        },
        trim: {
          type: "string",
          description: "Trim level or package (e.g., XLE, Limited)"
        },
        mileage: {
          type: "integer",
          description: "Current odometer reading in miles"
        },
        vin: {
          type: "string",
          description: "Optional VIN (17 characters) for precise identification"
        },
        zip: {
          type: "string",
          description: "User location ZIP code for regional pricing"
        },
        condition: {
          type: "string",
          enum: ["excellent", "good", "fair", "poor"],
          description: "Overall vehicle condition"
        },
        features: {
          type: "array",
          items: { type: "string" },
          description: "Special features or options (e.g., 'leather seats', 'sunroof', 'navigation')"
        }
      },
      required: ["year", "make", "model"]
    }
  },
  {
    name: "scheduleTestDrive",
    description: "Book a test drive appointment for a specific vehicle. Creates calendar event and sends confirmation.",
    parameters: {
      type: "object",
      properties: {
        userName: {
          type: "string",
          description: "Customer full name"
        },
        userEmail: {
          type: "string",
          description: "Customer email address"
        },
        userPhone: {
          type: "string",
          description: "Customer phone number"
        },
        vehicleId: {
          type: "string",
          description: "Internal inventory ID or VIN"
        },
        preferredDate: {
          type: "string",
          format: "date-time",
          description: "Preferred test drive date/time (ISO 8601)"
        },
        notes: {
          type: "string",
          description: "Additional notes or special requests"
        }
      },
      required: ["userName", "vehicleId", "preferredDate"]
    }
  },
  {
    name: "fetchInventory",
    description: "Search and list matching vehicles from dealership inventory based on filters. Returns available vehicles with pricing and details.",
    parameters: {
      type: "object",
      properties: {
        make: {
          type: "string",
          description: "Filter by vehicle make"
        },
        model: {
          type: "string",
          description: "Filter by model name"
        },
        yearMin: {
          type: "integer",
          description: "Minimum model year"
        },
        yearMax: {
          type: "integer",
          description: "Maximum model year"
        },
        priceMin: {
          type: "integer",
          description: "Minimum price in USD"
        },
        priceMax: {
          type: "integer",
          description: "Maximum price in USD"
        },
        bodyType: {
          type: "string",
          enum: ["sedan", "suv", "truck", "coupe", "convertible", "van"],
          description: "Vehicle body type"
        },
        fuelType: {
          type: "string",
          enum: ["gas", "electric", "hybrid", "diesel"],
          description: "Fuel type"
        },
        limit: {
          type: "integer",
          description: "Maximum number of results (default: 10, max: 50)"
        }
      }
    }
  },
  {
    name: "submitLead",
    description: "Submit a sales or service lead. Creates CRM entry and triggers follow-up workflow.",
    parameters: {
      type: "object",
      properties: {
        leadType: {
          type: "string",
          enum: ["sales", "service", "parts", "trade-in"],
          description: "Type of lead"
        },
        userName: {
          type: "string",
          description: "Customer name"
        },
        userEmail: {
          type: "string",
          description: "Customer email"
        },
        userPhone: {
          type: "string",
          description: "Customer phone"
        },
        interestVehicleId: {
          type: "string",
          description: "Vehicle ID if interested in specific vehicle"
        },
        message: {
          type: "string",
          description: "Customer message or inquiry"
        },
        source: {
          type: "string",
          description: "Lead source (e.g., 'chat', 'website', 'ai-assistant')"
        }
      },
      required: ["leadType", "userName", "userEmail"]
    }
  },
  {
    name: "getServiceHours",
    description: "Get service department hours and availability for scheduling.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          format: "date",
          description: "Date to check availability (YYYY-MM-DD)"
        },
        serviceType: {
          type: "string",
          enum: ["oil_change", "tire_rotation", "inspection", "repair", "maintenance"],
          description: "Type of service needed"
        }
      }
    }
  },
  {
    name: "checkFinancing",
    description: "Check financing eligibility and get pre-approval estimate.",
    parameters: {
      type: "object",
      properties: {
        vehicleId: {
          type: "string",
          description: "Vehicle ID for financing"
        },
        creditScore: {
          type: "integer",
          description: "Estimated credit score (optional)"
        },
        downPayment: {
          type: "integer",
          description: "Down payment amount in USD"
        },
        loanTerm: {
          type: "integer",
          description: "Desired loan term in months (e.g., 60, 72)"
        }
      },
      required: ["vehicleId"]
    }
  }
];

/**
 * Get function schema in OpenAI format
 */
export function getOpenAIFunctionsSchema(): any[] {
  return AUTOMOTIVE_FUNCTIONS.map(fn => ({
    type: "function",
    function: {
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters
    }
  }));
}

/**
 * Validate function call parameters
 */
export function validateFunctionCall(
  functionName: string,
  parameters: Record<string, any>
): { valid: boolean; errors?: string[] } {
  const fn = AUTOMOTIVE_FUNCTIONS.find(f => f.name === functionName);
  if (!fn) {
    return { valid: false, errors: [`Unknown function: ${functionName}`] };
  }

  const errors: string[] = [];
  const required = fn.parameters.required || [];

  // Check required parameters
  for (const param of required) {
    if (!(param in parameters) || parameters[param] === null || parameters[param] === undefined) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }

  // Validate parameter types
  for (const [key, value] of Object.entries(parameters)) {
    const prop = fn.parameters.properties[key];
    if (!prop) continue; // Unknown parameter, skip

    if (prop.type === "integer" && typeof value !== "number") {
      errors.push(`Parameter ${key} must be an integer`);
    } else if (prop.type === "string" && typeof value !== "string") {
      errors.push(`Parameter ${key} must be a string`);
    } else if (prop.type === "array" && !Array.isArray(value)) {
      errors.push(`Parameter ${key} must be an array`);
    }

    // Validate enums
    if (prop.enum && !prop.enum.includes(value)) {
      errors.push(`Parameter ${key} must be one of: ${prop.enum.join(", ")}`);
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

