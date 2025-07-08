import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedItem, FeedQuery } from '../services/feed.service';
import { useAuth } from '../providers/AuthProvider';
import { useLocation } from './useLocation';

interface UserPreferences {
  contentTypePref: {
    spots: number;
    sparks: number;
  };
  preferredTags: string[];
  preferredRadius: number;
  preferredTimeRange: number;
  notificationPrefs: {
    newContent: boolean;
    trending: boolean;
    recommendations: boolean;
  };
  privacySettings: {
    shareLocation: boolean;
    shareInteractions: boolean;
    showInRecommendations: boolean;
  };
}

interface InteractionHistory {
  itemId: string;
  itemType: 'spot' | 'spark';
  action: 'view' | 'like' | 'comment' | 'share';
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface PersonalizationData {
  preferences: UserPreferences;
  interactions: InteractionHistory[];
  interests: string[];
  lastUpdated: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  contentTypePref: { spots: 0.6, sparks: 0.4 },
  preferredTags: [],
  preferredRadius: 5000,
  preferredTimeRange: 24,
  notificationPrefs: {
    newContent: true,
    trending: true,
    recommendations: true,
  },
  privacySettings: {
    shareLocation: true,
    shareInteractions: true,
    showInRecommendations: true,
  },
};

const STORAGE_KEYS = {
  PREFERENCES: 'user_preferences',
  INTERACTIONS: 'user_interactions',
  INTERESTS: 'user_interests',
};

export const usePersonalization = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [interactions, setInteractions] = useState<InteractionHistory[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load personalization data from storage
  const loadPersonalizationData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load preferences
      const prefsKey = `${STORAGE_KEYS.PREFERENCES}_${user.id}`;
      const storedPrefs = await AsyncStorage.getItem(prefsKey);
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPrefs });
      }

      // Load interactions (keep only last 500)
      const interactionsKey = `${STORAGE_KEYS.INTERACTIONS}_${user.id}`;
      const storedInteractions = await AsyncStorage.getItem(interactionsKey);
      if (storedInteractions) {
        const parsedInteractions: InteractionHistory[] = JSON.parse(storedInteractions);
        // Keep only recent interactions (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentInteractions = parsedInteractions
          .filter(i => i.timestamp > thirtyDaysAgo)
          .slice(-500); // Keep last 500
        setInteractions(recentInteractions);
      }

      // Load interests
      const interestsKey = `${STORAGE_KEYS.INTERESTS}_${user.id}`;
      const storedInterests = await AsyncStorage.getItem(interestsKey);
      if (storedInterests) {
        setInterests(JSON.parse(storedInterests));
      }
    } catch (error) {
      console.error('Error loading personalization data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Save preferences
  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) return;

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      const prefsKey = `${STORAGE_KEYS.PREFERENCES}_${user.id}`;
      await AsyncStorage.setItem(prefsKey, JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [user?.id, preferences]);

  // Track interaction
  const trackInteraction = useCallback(async (
    itemId: string,
    itemType: 'spot' | 'spark',
    action: 'view' | 'like' | 'comment' | 'share',
    additionalData?: any
  ) => {
    if (!user?.id || !preferences.privacySettings.shareInteractions) return;

    const interaction: InteractionHistory = {
      itemId,
      itemType,
      action,
      timestamp: Date.now(),
      location: preferences.privacySettings.shareLocation && location 
        ? { latitude: location.latitude, longitude: location.longitude }
        : undefined,
    };

    try {
      const updatedInteractions = [...interactions, interaction].slice(-500); // Keep last 500
      setInteractions(updatedInteractions);

      const interactionsKey = `${STORAGE_KEYS.INTERACTIONS}_${user.id}`;
      await AsyncStorage.setItem(interactionsKey, JSON.stringify(updatedInteractions));

      // Update preferences based on interaction
      await updatePreferencesFromInteraction(interaction, additionalData);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [user?.id, preferences, interactions, location]);

  // Update preferences based on interaction patterns
  const updatePreferencesFromInteraction = useCallback(async (
    interaction: InteractionHistory,
    additionalData?: any
  ) => {
    try {
      // Update content type preference
      const recentInteractions = interactions.slice(-100); // Last 100 interactions
      const spotInteractions = recentInteractions.filter(i => i.itemType === 'spot').length;
      const sparkInteractions = recentInteractions.filter(i => i.itemType === 'spark').length;
      const total = spotInteractions + sparkInteractions;

      if (total > 0) {
        const newContentTypePref = {
          spots: spotInteractions / total,
          sparks: sparkInteractions / total,
        };

        // Smooth update (weight new data 30%, keep existing 70%)
        const smoothedPref = {
          spots: preferences.contentTypePref.spots * 0.7 + newContentTypePref.spots * 0.3,
          sparks: preferences.contentTypePref.sparks * 0.7 + newContentTypePref.sparks * 0.3,
        };

        await savePreferences({
          contentTypePref: smoothedPref,
        });
      }

      // Update preferred tags if item has tags
      if (additionalData?.tags && Array.isArray(additionalData.tags)) {
        const newTags = additionalData.tags.filter(tag => 
          !preferences.preferredTags.includes(tag)
        );
        
        if (newTags.length > 0) {
          const updatedTags = [...preferences.preferredTags, ...newTags].slice(-20); // Keep top 20
          await savePreferences({
            preferredTags: updatedTags,
          });
        }
      }
    } catch (error) {
      console.error('Error updating preferences from interaction:', error);
    }
  }, [interactions, preferences, savePreferences]);

  // Generate personalized query
  const getPersonalizedQuery = useCallback((baseQuery: FeedQuery = {}): FeedQuery => {
    const personalizedQuery: FeedQuery = { ...baseQuery };

    // Apply preferred content type if not specified
    if (!personalizedQuery.contentType || personalizedQuery.contentType === 'mixed') {
      // Use mixed but with preference weighting handled by the backend
      personalizedQuery.contentType = 'mixed';
    }

    // Apply preferred radius if not specified
    if (!personalizedQuery.radiusMeters) {
      personalizedQuery.radiusMeters = preferences.preferredRadius;
    }

    // Apply preferred time range if not specified
    if (!personalizedQuery.hoursAgo) {
      personalizedQuery.hoursAgo = preferences.preferredTimeRange;
    }

    // Apply preferred tags if not specified
    if (!personalizedQuery.tags && preferences.preferredTags.length > 0) {
      personalizedQuery.tags = preferences.preferredTags.slice(0, 5).join(',');
    }

    // Apply location if allowed
    if (preferences.privacySettings.shareLocation && location && !personalizedQuery.latitude) {
      personalizedQuery.latitude = location.latitude;
      personalizedQuery.longitude = location.longitude;
    }

    return personalizedQuery;
  }, [preferences, location]);

  // Get content recommendations based on history
  const getRecommendations = useCallback((): {
    suggestedTags: string[];
    suggestedRadius: number;
    suggestedTimeRange: number;
  } => {
    // Analyze interaction patterns
    const recentInteractions = interactions.slice(-50);
    
    // Extract tags from interactions
    const tagFrequency: { [tag: string]: number } = {};
    recentInteractions.forEach(interaction => {
      // This would need additional data about the items
      // For now, use preferred tags
    });

    const suggestedTags = preferences.preferredTags.slice(0, 5);

    // Analyze distance patterns
    const distances: number[] = [];
    // This would need location data from interactions
    
    const avgDistance = distances.length > 0 
      ? distances.reduce((a, b) => a + b, 0) / distances.length
      : preferences.preferredRadius;

    const suggestedRadius = Math.max(1000, Math.min(50000, avgDistance));

    // Analyze time patterns
    const hours = recentInteractions.map(i => new Date(i.timestamp).getHours());
    const currentHour = new Date().getHours();
    const isActiveTime = hours.includes(currentHour);
    
    const suggestedTimeRange = isActiveTime ? 6 : preferences.preferredTimeRange;

    return {
      suggestedTags,
      suggestedRadius,
      suggestedTimeRange,
    };
  }, [interactions, preferences]);

  // Calculate user engagement score
  const getEngagementScore = useCallback((): number => {
    const recentInteractions = interactions.slice(-100);
    
    if (recentInteractions.length === 0) return 0;

    // Weight different actions
    const actionWeights = {
      view: 1,
      like: 3,
      comment: 5,
      share: 7,
    };

    const totalScore = recentInteractions.reduce((score, interaction) => {
      return score + (actionWeights[interaction.action] || 1);
    }, 0);

    // Normalize to 0-1 scale
    const maxPossibleScore = recentInteractions.length * actionWeights.share;
    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  }, [interactions]);

  // Load data on mount and user change
  useEffect(() => {
    loadPersonalizationData();
  }, [loadPersonalizationData]);

  return {
    preferences,
    interactions,
    interests,
    loading,
    
    // Actions
    savePreferences,
    trackInteraction,
    getPersonalizedQuery,
    getRecommendations,
    getEngagementScore,
    
    // Computed values
    isHighEngagementUser: getEngagementScore() > 0.7,
    preferredContentType: preferences.contentTypePref.spots > preferences.contentTypePref.sparks ? 'spot' : 'spark',
  };
};