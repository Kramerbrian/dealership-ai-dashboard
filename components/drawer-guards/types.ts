export type Tier = 1 | 2 | 3;

export interface DrawerGuardProps {
  tier: Tier;
  children: React.ReactNode;
  feature?: string;
}

