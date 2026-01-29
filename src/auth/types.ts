export type UserType = Record<string, any> | null;

export type AuthState = {
  user: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
  signInWithCasper?: () => Promise<boolean>;
  signOut?: () => Promise<void>;
};

// ----------------------------------------------------------------------
// Casper Network Specific Types
// ----------------------------------------------------------------------

export type CasperAccountType = {
  publicKey: string;
  accountHash: string;
  provider: string;
};

export type CasperUserType = {
  id: string;
  publicKey: string;
  accountHash: string;
  walletProvider: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
} | null;

export type CasperAuthState = {
  user: CasperUserType;
  loading: boolean;
  isConnected: boolean;
};

export type CasperAuthContextValue = {
  user: CasperUserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  isConnected: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUserSession: () => Promise<void>;
};
