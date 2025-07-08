import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';
import { CreateSpotRequest } from '../../services/signalSpot.service';

const { height: screenHeight } = Dimensions.get('window');

interface CreateSpotModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSpot: (spotData: CreateSpotRequest) => Promise<void>;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isLoading?: boolean;
}

const SPOT_TYPES = [
  { key: 'social', label: '💬', name: '소셜', description: '친구들과 만나서 대화하기' },
  { key: 'help', label: '🆘', name: '도움', description: '도움이 필요하거나 도움을 주기' },
  { key: 'event', label: '🎉', name: '이벤트', description: '행사나 모임 알리기' },
  { key: 'info', label: 'ℹ️', name: '정보', description: '유용한 정보 공유하기' },
  { key: 'alert', label: '⚠️', name: '알림', description: '중요한 알림이나 주의사항' },
] as const;

const VISIBILITY_OPTIONS = [
  { key: 'public', label: '🌍', name: '전체 공개', description: '모든 사람이 볼 수 있음' },
  { key: 'friends', label: '👥', name: '친구만', description: '친구들만 볼 수 있음' },
  { key: 'private', label: '🔒', name: '비공개', description: '나만 볼 수 있음' },
] as const;

const DURATION_OPTIONS = [
  { hours: 1, label: '1시간' },
  { hours: 3, label: '3시간' },
  { hours: 6, label: '6시간' },
  { hours: 12, label: '12시간' },
  { hours: 24, label: '1일' },
  { hours: 72, label: '3일' },
  { hours: 168, label: '1주일' },
] as const;

export const CreateSpotModal: React.FC<CreateSpotModalProps> = ({
  visible,
  onClose,
  onCreateSpot,
  currentLocation,
  isLoading = false,
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<'social' | 'help' | 'event' | 'info' | 'alert'>('social');
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedDuration, setSelectedDuration] = useState(24);
  const [customRadius, setCustomRadius] = useState('100');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(stepAnim, {
          toValue: step - 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: screenHeight,
        useNativeDriver: true,
      }).start();
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(stepAnim, {
      toValue: step - 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setContent('');
    setSelectedType('social');
    setSelectedVisibility('public');
    setSelectedDuration(24);
    setCustomRadius('100');
    setTags([]);
    setTagInput('');
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        if (!title.trim()) {
          Alert.alert('입력 오류', '제목을 입력해주세요.');
          return false;
        }
        if (!content.trim()) {
          Alert.alert('입력 오류', '내용을 입력해주세요.');
          return false;
        }
        return true;
      case 2:
        return true; // Type and visibility selection
      case 3: {
        const radius = parseInt(customRadius);
        if (isNaN(radius) || radius < 10 || radius > 1000) {
          Alert.alert('입력 오류', '반경은 10m ~ 1000m 사이로 설정해주세요.');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleCreateSpot();
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateSpot = async () => {
    if (!currentLocation) {
      Alert.alert('위치 오류', '현재 위치를 확인할 수 없습니다.');
      return;
    }

    const spotData: CreateSpotRequest = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      title: title.trim(),
      content: content.trim(),
      type: selectedType,
      visibility: selectedVisibility,
      radius: parseInt(customRadius),
      maxDuration: selectedDuration,
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      await onCreateSpot(spotData);
      onClose();
    } catch (error) {
      // Error is handled in parent component
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNumber) => (
        <View
          key={stepNumber}
          style={[
            styles.stepDot,
            step >= stepNumber && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>시그널 스팟 만들기</Text>
      <Text style={styles.stepDescription}>
        어떤 시그널을 남기고 싶나요?
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>제목 *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="시그널 제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <Text style={styles.characterCount}>{title.length}/100</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>내용 *</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="전달하고 싶은 메시지를 작성하세요..."
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>{content.length}/500</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>태그 (최대 5개)</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder="태그를 입력하고 추가 버튼을 누르세요"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAddTag}
            maxLength={20}
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={handleAddTag}
            disabled={!tagInput.trim() || tags.length >= 5}
          >
            <Text style={styles.addTagButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
        
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.tagText}>#{tag}</Text>
                <Text style={styles.removeTagText}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>타입 및 공개 설정</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>시그널 타입</Text>
        <View style={styles.optionsGrid}>
          {SPOT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.optionCard,
                selectedType === type.key && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedType(type.key as typeof selectedType)}
            >
              <Text style={styles.optionIcon}>{type.label}</Text>
              <Text style={styles.optionName}>{type.name}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>공개 범위</Text>
        <View style={styles.visibilityOptions}>
          {VISIBILITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.visibilityOption,
                selectedVisibility === option.key && styles.visibilityOptionSelected,
              ]}
              onPress={() => setSelectedVisibility(option.key as typeof selectedVisibility)}
            >
              <Text style={styles.visibilityIcon}>{option.label}</Text>
              <View style={styles.visibilityInfo}>
                <Text style={styles.visibilityName}>{option.name}</Text>
                <Text style={styles.visibilityDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>상세 설정</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>지속 시간</Text>
        <View style={styles.durationOptions}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.hours}
              style={[
                styles.durationOption,
                selectedDuration === option.hours && styles.durationOptionSelected,
              ]}
              onPress={() => setSelectedDuration(option.hours)}
            >
              <Text style={[
                styles.durationText,
                selectedDuration === option.hours && styles.durationTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>영향 반경</Text>
        <View style={styles.radiusInputContainer}>
          <TextInput
            style={styles.radiusInput}
            placeholder="100"
            value={customRadius}
            onChangeText={setCustomRadius}
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.radiusUnit}>미터</Text>
        </View>
        <Text style={styles.radiusDescription}>
          10m ~ 1000m 사이로 설정할 수 있습니다
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>요약</Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>제목:</Text> {title}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>타입:</Text> {SPOT_TYPES.find(t => t.key === selectedType)?.name}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>공개범위:</Text> {VISIBILITY_OPTIONS.find(v => v.key === selectedVisibility)?.name}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>지속시간:</Text> {DURATION_OPTIONS.find(d => d.hours === selectedDuration)?.label}
        </Text>
        {tags.length > 0 && (
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>태그:</Text> {tags.map(tag => `#${tag}`).join(', ')}
          </Text>
        )}
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />
          
          {renderStepIndicator()}
          
          {renderStepContent()}
          
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handlePrevious}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>이전</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                step === 1 && styles.fullWidthButton,
              ]}
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {step === 3 ? '만들기' : '다음'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.9,
    paddingBottom: 34, // Safe area bottom
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginTop: 12,
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: DesignSystem.colors.primary,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top' as const,
  },
  characterCount: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'right' as const,
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  addTagButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tagsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: DesignSystem.colors.text.primary,
  },
  removeTagText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600' as const,
  },
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%' as const,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: DesignSystem.colors.primary,
    backgroundColor: '#FFF3F3',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center' as const,
  },
  visibilityOptions: {
    gap: 12,
  },
  visibilityOption: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  visibilityOptionSelected: {
    borderColor: DesignSystem.colors.primary,
    backgroundColor: '#FFF3F3',
  },
  visibilityIcon: {
    fontSize: 24,
  },
  visibilityInfo: {
    flex: 1,
  },
  visibilityName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  visibilityDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
  },
  durationOptions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  durationOptionSelected: {
    borderColor: DesignSystem.colors.primary,
    backgroundColor: DesignSystem.colors.primary,
  },
  durationText: {
    fontSize: 14,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500' as const,
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  radiusInputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
  },
  radiusInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    width: 80,
    textAlign: 'center' as const,
  },
  radiusUnit: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
  },
  radiusDescription: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: '600' as const,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    padding: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  fullWidthButton: {
    flex: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DesignSystem.colors.text.primary,
  },
};