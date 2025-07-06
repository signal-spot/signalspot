import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from 'shared';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: AuthTokens | null }
  | { type: 'SIGN_IN'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'SIGN_OUT' }
  | { type: 'RESTORE_AUTH'; payload: { user: User; tokens: AuthTokens } | null };

interface AuthContextType extends AuthState {
  signIn: (user: User, tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
    case 'SIGN_IN':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'RESTORE_AUTH':
      if (action.payload) {
        return {
          ...state,
          user: action.payload.user,
          tokens: action.payload.tokens,
          isAuthenticated: true,
          isLoading: false,
        };
      }
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const storeAuthData = async (user: User, tokens: AuthTokens) => {
    try {
      await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
      await AsyncStorage.setItem('@auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  };

  const removeAuthData = async () => {
    try {
      await AsyncStorage.removeItem('@auth_user');
      await AsyncStorage.removeItem('@auth_tokens');
    } catch (error) {
      console.error('Failed to remove auth data:', error);
    }
  };

  const restoreAuthData = async () => {
    try {
      const userString = await AsyncStorage.getItem('@auth_user');
      const tokensString = await AsyncStorage.getItem('@auth_tokens');

      if (userString && tokensString) {
        const user = JSON.parse(userString);
        const tokens = JSON.parse(tokensString);
        
        // Check if tokens are still valid (basic check)
        const now = Date.now();
        const tokenExp = tokens.expiresIn * 1000; // Convert to milliseconds
        
        if (now < tokenExp) {
          dispatch({ type: 'RESTORE_AUTH', payload: { user, tokens } });
          return;
        }
      }
      
      // If no valid auth data found
      dispatch({ type: 'RESTORE_AUTH', payload: null });
    } catch (error) {
      console.error('Failed to restore auth data:', error);
      dispatch({ type: 'RESTORE_AUTH', payload: null });
    }
  };

  const signIn = async (user: User, tokens: AuthTokens) => {
    await storeAuthData(user, tokens);
    dispatch({ type: 'SIGN_IN', payload: { user, tokens } });
  };

  const signOut = async () => {
    await removeAuthData();
    dispatch({ type: 'SIGN_OUT' });
  };

  const updateUser = async (user: User) => {
    if (state.tokens) {
      await storeAuthData(user, state.tokens);
    }
    dispatch({ type: 'SET_USER', payload: user });
  };

  useEffect(() => {
    restoreAuthData();
  }, []);

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 