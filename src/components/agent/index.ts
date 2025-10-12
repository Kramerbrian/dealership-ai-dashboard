// Agent Components
export { default as AgentButton } from './AgentButton';
export { default as AgentChatModal } from './AgentChatModal';
export { default as FloatingAgentButton } from './FloatingAgentButton';

// Context-aware variants
export { 
  EmergencyAgentTrigger, 
  CompetitorAgentTrigger, 
  AIVisibilityAgentTrigger 
} from './AgentButton';

export { 
  EmergencyFloatingButton, 
  CompetitorFloatingButton, 
  AIVisibilityFloatingButton 
} from './FloatingAgentButton';

// Types
export type { default as AgentButtonProps } from './AgentButton';
export type { default as AgentChatModalProps } from './AgentChatModal';
export type { default as FloatingAgentButtonProps } from './FloatingAgentButton';
