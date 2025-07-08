import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';
import { SignatureConnectionPreferencesDto } from '../../types/profile.types';

interface SignatureConnectionFormProps {
  initialData?: SignatureConnectionPreferencesDto;
  onSubmit: (preferences: SignatureConnectionPreferencesDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const INTEREST_OPTIONS = [
  '음악', '영화', '독서', '운동', '요리', '여행', '사진', '게임',
  '미술', '댄스', '등산', '카페', '맛집', '쇼핑', '페스티벌', '전시회'
];

const PERSONALITY_TRAITS = [
  '외향적', '내향적', '활발한', '조용한', '유머러스', '진지한',
  '모험적', '안정적', '창의적', '논리적', '감성적', '이성적'
];

const LIFESTYLE_OPTIONS = [
  '아침형', '저녁형', '운동애호가', '홈트레이닝', '카페러버', '맥주애호가',
  '비건', '소식가', '대식가', '쇼핑러버', '독서광', '영화광'
];

export const SignatureConnectionForm: React.FC<SignatureConnectionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [preferences, setPreferences] = useState<SignatureConnectionPreferencesDto>({
    interests: [],
    personalityTraits: [],
    lifestyle: [],
    bio: '',
    lookingFor: '',
    dealBreakers: '',
    ageRange: { min: 20, max: 40 },
    maxDistance: 10,
    isActive: true,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setPreferences({ ...preferences, ...initialData });
    }
  }, [initialData]);

  const toggleSelection = (
    category: 'interests' | 'personalityTraits' | 'lifestyle',
    item: string
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (preferences.interests.length < 3) {
      newErrors.interests = '최소 3개의 관심사를 선택해주세요';
    }

    if (preferences.personalityTraits.length < 2) {
      newErrors.personalityTraits = '최소 2개의 성격 특성을 선택해주세요';
    }

    if (!preferences.bio.trim()) {
      newErrors.bio = '자기소개를 작성해주세요';
    } else if (preferences.bio.length < 20) {
      newErrors.bio = '자기소개는 20자 이상 작성해주세요';
    }

    if (!preferences.lookingFor.trim()) {
      newErrors.lookingFor = '원하는 만남의 형태를 작성해주세요';
    }

    if (preferences.ageRange.min >= preferences.ageRange.max) {
      newErrors.ageRange = '연령 범위를 올바르게 설정해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('입력 오류', '모든 필수 항목을 올바르게 입력해주세요.');
      return;
    }

    try {
      await onSubmit(preferences);
    } catch (error) {
      Alert.alert('저장 실패', '설정을 저장하는 중 오류가 발생했습니다.');
    }
  };

  const renderSelectionSection = (
    title: string,
    options: string[],
    selected: string[],
    category: 'interests' | 'personalityTraits' | 'lifestyle',
    maxSelection?: number
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {errors[category] && (
        <Text style={styles.errorText}>{errors[category]}</Text>
      )}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          const isDisabled = maxSelection && !isSelected && selected.length >= maxSelection;

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionChip,
                isSelected && styles.selectedChip,
                isDisabled && styles.disabledChip,
              ]}
              onPress={() => !isDisabled && toggleSelection(category, option)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedText,
                  isDisabled && styles.disabledText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderTextInput = (
    title: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline = false,
    maxLength?: number,
    errorKey?: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {errorKey && errors[errorKey] && (
        <Text style={styles.errorText}>{errors[errorKey]}</Text>
      )}
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        maxLength={maxLength}
        numberOfLines={multiline ? 4 : 1}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );

  const renderAgeRangeInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>선호 연령대</Text>
      {errors.ageRange && (
        <Text style={styles.errorText}>{errors.ageRange}</Text>
      )}
      <View style={styles.rangeContainer}>
        <View style={styles.rangeInputContainer}>
          <Text style={styles.rangeLabel}>최소</Text>
          <TextInput
            style={styles.rangeInput}
            value={preferences.ageRange.min.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 18;
              setPreferences(prev => ({
                ...prev,
                ageRange: { ...prev.ageRange, min: Math.max(18, Math.min(num, 99)) },
              }));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.rangeLabel}>세</Text>
        </View>
        <Text style={styles.rangeSeparator}>~</Text>
        <View style={styles.rangeInputContainer}>
          <Text style={styles.rangeLabel}>최대</Text>
          <TextInput
            style={styles.rangeInput}
            value={preferences.ageRange.max.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 99;
              setPreferences(prev => ({
                ...prev,
                ageRange: { ...prev.ageRange, max: Math.max(18, Math.min(num, 99)) },
              }));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.rangeLabel}>세</Text>
        </View>
      </View>
    </View>
  );

  const renderDistanceInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>최대 거리 ({preferences.maxDistance}km)</Text>
      <View style={styles.distanceContainer}>
        {[5, 10, 20, 30, 50].map((distance) => (
          <TouchableOpacity
            key={distance}
            style={[
              styles.distanceChip,
              preferences.maxDistance === distance && styles.selectedChip,
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, maxDistance: distance }))}
          >
            <Text
              style={[
                styles.optionText,
                preferences.maxDistance === distance && styles.selectedText,
              ]}
            >
              {distance}km
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>시그니처 커넥션 설정</Text>
      <Text style={styles.description}>
        나와 비슷한 취향을 가진 사람들과 만날 수 있도록 선호사항을 설정해주세요.
      </Text>

      {renderSelectionSection(
        '관심사 (최소 3개)',
        INTEREST_OPTIONS,
        preferences.interests,
        'interests',
        8
      )}

      {renderSelectionSection(
        '성격 특성 (최소 2개)',
        PERSONALITY_TRAITS,
        preferences.personalityTraits,
        'personalityTraits',
        5
      )}

      {renderSelectionSection(
        '라이프스타일',
        LIFESTYLE_OPTIONS,
        preferences.lifestyle,
        'lifestyle',
        6
      )}

      {renderTextInput(
        '자기소개 *',
        preferences.bio,
        (text) => setPreferences(prev => ({ ...prev, bio: text })),
        '나를 소개하는 글을 작성해주세요...',
        true,
        300,
        'bio'
      )}

      {renderTextInput(
        '원하는 만남 *',
        preferences.lookingFor,
        (text) => setPreferences(prev => ({ ...prev, lookingFor: text })),
        '어떤 만남을 원하시나요? (예: 친구, 연인, 취미친구 등)',
        true,
        200,
        'lookingFor'
      )}

      {renderTextInput(
        '절대 안 되는 것들',
        preferences.dealBreakers,
        (text) => setPreferences(prev => ({ ...prev, dealBreakers: text })),
        '피하고 싶은 것들이 있다면 작성해주세요 (선택사항)',
        true,
        200
      )}

      {renderAgeRangeInput()}
      {renderDistanceInput()}

      <View style={styles.activeToggleContainer}>
        <TouchableOpacity
          style={styles.activeToggle}
          onPress={() => setPreferences(prev => ({ ...prev, isActive: !prev.isActive }))}
        >
          <View style={[styles.checkbox, preferences.isActive && styles.checkedBox]}>
            {preferences.isActive && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.activeToggleText}>시그니처 커넥션 활성화</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
    padding: DesignSystem.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.lg,
    lineHeight: 24,
  },
  section: {
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: DesignSystem.spacing.sm,
  },
  optionChip: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  selectedChip: {
    backgroundColor: DesignSystem.colors.primary,
  },
  disabledChip: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  optionText: {
    fontSize: 14,
    color: DesignSystem.colors.primary,
    fontWeight: '500' as const,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#999999',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: DesignSystem.spacing.md,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top' as const,
  },
  characterCount: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'right' as const,
    marginTop: DesignSystem.spacing.xs,
  },
  rangeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: DesignSystem.spacing.md,
  },
  rangeInputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  rangeLabel: {
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
  },
  rangeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: DesignSystem.spacing.sm,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center' as const,
    width: 50,
  },
  rangeSeparator: {
    fontSize: 18,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '600' as const,
  },
  distanceContainer: {
    flexDirection: 'row' as const,
    gap: DesignSystem.spacing.sm,
    flexWrap: 'wrap' as const,
  },
  distanceChip: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  activeToggleContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  activeToggle: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: DesignSystem.colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: DesignSystem.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  activeToggleText: {
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500' as const,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: DesignSystem.colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.secondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: DesignSystem.spacing.xs,
  },
};