import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DesignSystem } from '../../utils/designSystem';
import { ProfileResponseDto } from '../../types/profile.types';

interface ProfilePreviewProps {
  profile: ProfileResponseDto;
  onEdit?: () => void;
  showEditButton?: boolean;
  compact?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  profile,
  onEdit,
  showEditButton = true,
  compact = false,
}) => {
  const calculateAge = (birthDate?: Date): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(profile.birthDate);

  const renderBasicInfo = () => (
    <View style={styles.basicInfoContainer}>
      <View style={styles.avatarContainer}>
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderAvatarText}>
              {profile.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>✓</Text>
          </View>
        )}
      </View>
      
      <View style={styles.nameContainer}>
        <Text style={styles.displayName}>
          {profile.firstName && profile.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : profile.username}
        </Text>
        {age && (
          <Text style={styles.age}>{age}세</Text>
        )}
      </View>
      
      {profile.occupation && (
        <Text style={styles.occupation}>{profile.occupation}</Text>
      )}
      
      {profile.location && (
        <Text style={styles.location}>📍 {profile.location}</Text>
      )}
    </View>
  );

  const renderBio = () => {
    if (!profile.bio && !compact) return null;
    
    return (
      <View style={styles.bioContainer}>
        <Text style={styles.sectionTitle}>자기소개</Text>
        <Text style={styles.bioText}>
          {profile.bio || '아직 자기소개가 없습니다.'}
        </Text>
      </View>
    );
  };

  const renderInterests = () => {
    if (!profile.interests?.length && !compact) return null;
    
    return (
      <View style={styles.interestsContainer}>
        <Text style={styles.sectionTitle}>관심사</Text>
        <View style={styles.tagsContainer}>
          {profile.interests?.length ? (
            profile.interests.slice(0, compact ? 3 : undefined).map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>관심사가 설정되지 않았습니다.</Text>
          )}
          {compact && profile.interests && profile.interests.length > 3 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{profile.interests.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSkills = () => {
    if (!profile.skills?.length && !compact) return null;
    
    return (
      <View style={styles.skillsContainer}>
        <Text style={styles.sectionTitle}>스킬</Text>
        <View style={styles.tagsContainer}>
          {profile.skills?.length ? (
            profile.skills.slice(0, compact ? 3 : undefined).map((skill, index) => (
              <View key={index} style={[styles.tag, styles.skillTag]}>
                <Text style={[styles.tagText, styles.skillTagText]}>{skill}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>스킬이 설정되지 않았습니다.</Text>
          )}
          {compact && profile.skills && profile.skills.length > 3 && (
            <View style={[styles.tag, styles.skillTag]}>
              <Text style={[styles.tagText, styles.skillTagText]}>+{profile.skills.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSignatureConnection = () => {
    if (!profile.signatureConnectionPreferences && !compact) return null;
    
    const prefs = profile.signatureConnectionPreferences;
    if (!prefs) return null;

    return (
      <View style={styles.signatureContainer}>
        <Text style={styles.sectionTitle}>시그니처 커넥션</Text>
        
        {prefs.bio && (
          <Text style={styles.signatureBio}>{prefs.bio}</Text>
        )}
        
        {prefs.lookingFor && (
          <View style={styles.lookingForContainer}>
            <Text style={styles.lookingForLabel}>찾고 있는 만남:</Text>
            <Text style={styles.lookingForText}>{prefs.lookingFor}</Text>
          </View>
        )}
        
        {prefs.interests?.length > 0 && (
          <View style={styles.signatureInterestsContainer}>
            <Text style={styles.signatureInterestsLabel}>관심사:</Text>
            <View style={styles.tagsContainer}>
              {prefs.interests.slice(0, compact ? 3 : 5).map((interest, index) => (
                <View key={index} style={[styles.tag, styles.signatureTag]}>
                  <Text style={[styles.tagText, styles.signatureTagText]}>{interest}</Text>
                </View>
              ))}
              {compact && prefs.interests.length > 3 && (
                <View style={[styles.tag, styles.signatureTag]}>
                  <Text style={[styles.tagText, styles.signatureTagText]}>+{prefs.interests.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEditButton = () => {
    if (!showEditButton || !onEdit) return null;
    
    return (
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <LinearGradient
          colors={[DesignSystem.colors.primary, '#FF8A80']}
          style={styles.editButtonGradient}
        >
          <Text style={styles.editButtonText}>프로필 수정</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {renderBasicInfo()}
        {renderInterests()}
        {renderSignatureConnection()}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          {renderBasicInfo()}
        </View>
      </LinearGradient>
      
      <View style={styles.contentContainer}>
        {renderBio()}
        {renderInterests()}
        {renderSkills()}
        {renderSignatureConnection()}
        {renderEditButton()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  compactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: DesignSystem.spacing.md,
    margin: DesignSystem.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  basicInfoContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: DesignSystem.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  placeholderAvatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#666666',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  age: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  occupation: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: DesignSystem.spacing.xs,
  },
  location: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: DesignSystem.spacing.xs,
  },
  contentContainer: {
    padding: DesignSystem.spacing.md,
  },
  bioContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  bioText: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
  },
  interestsContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  skillsContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  tag: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '500',
  },
  skillTag: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  skillTagText: {
    color: '#1976D2',
  },
  signatureContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  signatureBio: {
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.md,
  },
  lookingForContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  lookingForLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  lookingForText: {
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
  },
  signatureInterestsContainer: {
    marginBottom: DesignSystem.spacing.sm,
  },
  signatureInterestsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.sm,
  },
  signatureTag: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFB74D',
  },
  signatureTagText: {
    color: '#F57C00',
  },
  editButton: {
    marginTop: DesignSystem.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonGradient: {
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
  },
});