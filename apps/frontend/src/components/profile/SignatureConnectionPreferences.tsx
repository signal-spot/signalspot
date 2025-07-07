import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';

const Container = styled.ScrollView`
  flex: 1;
  background-color: #f8f9fa;
`;

const Section = styled.View`
  background-color: #ffffff;
  margin: 16px;
  border-radius: 12px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
`;

const SectionDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 20px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const Tag = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${props => props.selected ? '#ff6b6b' : '#f0f0f0'};
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${props => props.selected ? '#ff6b6b' : '#e0e0e0'};
`;

const TagText = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  color: ${props => props.selected ? '#ffffff' : '#333333'};
  font-weight: ${props => props.selected ? '600' : '400'};
`;

const CustomTagInput = styled.TextInput`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  margin-top: 12px;
`;

const AddButton = styled.TouchableOpacity`
  background-color: #4CAF50;
  padding: 8px 16px;
  border-radius: 20px;
  margin-top: 8px;
  align-self: flex-start;
`;

const AddButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const RangeContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

const RangeInput = styled.TextInput`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
  width: 80px;
  text-align: center;
  font-size: 16px;
`;

const RangeLabel = styled.Text`
  font-size: 16px;
  color: #333;
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#cccccc' : '#ff6b6b'};
  margin: 20px 16px;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
`;

const SaveButtonText = styled.Text<{ disabled?: boolean }>`
  color: ${props => props.disabled ? '#888888' : '#ffffff'};
  font-size: 16px;
  font-weight: bold;
`;

interface SignatureConnectionPreferencesProps {
  visible: boolean;
  onClose: () => void;
  onSave: (preferences: any) => Promise<void>;
  initialPreferences?: any;
  isLoading?: boolean;
}

const CONNECTION_TYPES = [
  { value: 'collaboration', label: '협업' },
  { value: 'networking', label: '네트워킹' },
  { value: 'friendship', label: '친구' },
  { value: 'mentorship', label: '멘토링' },
  { value: 'romantic', label: '연애' },
];

const CREATIVE_INTERESTS = [
  '음악', '그림', '사진', '영상편집', '글쓰기', '디자인', '춤', '연기',
  '패션', '요리', '공예', '건축', '웹디자인', '애니메이션', '게임개발'
];

const MUSIC_GENRES = [
  'K-POP', '힙합', '록', '재즈', '클래식', '인디', '팝', 'R&B',
  '일렉트로닉', '트로트', '발라드', '포크', '펑크', '레게', '컨트리'
];

const ENTERTAINMENT_GENRES = [
  '액션', '로맨스', '코미디', '드라마', '스릴러', '호러', 'SF',
  '판타지', '다큐멘터리', '애니메이션', '뮤지컬', '예능', '여행'
];

const TECH_INTERESTS = [
  'AI/ML', '블록체인', '웹개발', '모바일개발', '게임개발', 'IoT',
  '클라우드', '사이버보안', 'UI/UX', '데이터분석', '로보틱스'
];

const SignatureConnectionPreferences: React.FC<SignatureConnectionPreferencesProps> = ({
  visible,
  onClose,
  onSave,
  initialPreferences,
  isLoading = false,
}) => {
  const [preferences, setPreferences] = useState({
    connectionTypes: [],
    creativeInterests: [],
    musicGenres: [],
    entertainmentGenres: [],
    techInterests: [],
    ageRangeMin: 20,
    ageRangeMax: 35,
    maxDistance: 10,
    connectionBio: '',
    availabilityLevel: 'moderate',
    meetingPreference: 'both',
  });

  const [customInputs, setCustomInputs] = useState({
    creative: '',
    music: '',
    entertainment: '',
    tech: '',
  });

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(prev => ({ ...prev, ...initialPreferences }));
    }
  }, [initialPreferences]);

  const toggleSelection = (category: string, item: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter((i: string) => i !== item)
        : [...prev[category], item],
    }));
  };

  const addCustomItem = (category: string, inputKey: string) => {
    const customValue = customInputs[inputKey].trim();
    if (!customValue) return;

    if (preferences[category].includes(customValue)) {
      Alert.alert('알림', '이미 선택된 항목입니다.');
      return;
    }

    setPreferences(prev => ({
      ...prev,
      [category]: [...prev[category], customValue],
    }));

    setCustomInputs(prev => ({ ...prev, [inputKey]: '' }));
  };

  const handleSave = async () => {
    try {
      await onSave(preferences);
      onClose();
      Alert.alert('성공', 'Signature Connection 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const renderTagSection = (
    title: string,
    description: string,
    category: string,
    options: string[],
    inputKey?: string,
  ) => (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <SectionDescription>{description}</SectionDescription>
      <TagsContainer>
        {options.map((option) => (
          <Tag
            key={option}
            selected={preferences[category].includes(option)}
            onPress={() => toggleSelection(category, option)}
          >
            <TagText selected={preferences[category].includes(option)}>
              {option}
            </TagText>
          </Tag>
        ))}
        {preferences[category]
          .filter((item: string) => !options.includes(item))
          .map((customItem: string) => (
            <Tag key={customItem} selected={true}>
              <TagText selected={true}>{customItem}</TagText>
            </Tag>
          ))}
      </TagsContainer>
      {inputKey && (
        <View>
          <CustomTagInput
            value={customInputs[inputKey]}
            onChangeText={(text) =>
              setCustomInputs(prev => ({ ...prev, [inputKey]: text }))
            }
            placeholder="직접 입력..."
            maxLength={20}
          />
          <AddButton onPress={() => addCustomItem(category, inputKey)}>
            <AddButtonText>추가</AddButtonText>
          </AddButton>
        </View>
      )}
    </Section>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <Container showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Section>
          <SectionTitle>Signature Connection 설정</SectionTitle>
          <SectionDescription>
            당신과 비슷한 취향을 가진 사람들과 연결되기 위한 설정을 완성해보세요.
            더 자세한 정보를 입력할수록 더 정확한 매칭이 가능합니다.
          </SectionDescription>
        </Section>

        {/* Connection Types */}
        <Section>
          <SectionTitle>원하는 연결 유형</SectionTitle>
          <SectionDescription>어떤 종류의 연결을 원하시나요?</SectionDescription>
          <TagsContainer>
            {CONNECTION_TYPES.map((type) => (
              <Tag
                key={type.value}
                selected={preferences.connectionTypes.includes(type.value)}
                onPress={() => toggleSelection('connectionTypes', type.value)}
              >
                <TagText selected={preferences.connectionTypes.includes(type.value)}>
                  {type.label}
                </TagText>
              </Tag>
            ))}
          </TagsContainer>
        </Section>

        {/* Creative Interests */}
        {renderTagSection(
          '창작 관심사',
          '어떤 창작 활동에 관심이 있으신가요?',
          'creativeInterests',
          CREATIVE_INTERESTS,
          'creative'
        )}

        {/* Music Genres */}
        {renderTagSection(
          '음악 취향',
          '좋아하는 음악 장르를 선택해주세요.',
          'musicGenres',
          MUSIC_GENRES,
          'music'
        )}

        {/* Entertainment */}
        {renderTagSection(
          '엔터테인먼트 취향',
          '좋아하는 영화/드라마 장르를 선택해주세요.',
          'entertainmentGenres',
          ENTERTAINMENT_GENRES,
          'entertainment'
        )}

        {/* Tech Interests */}
        {renderTagSection(
          '기술 관심사',
          '관심 있는 기술 분야를 선택해주세요.',
          'techInterests',
          TECH_INTERESTS,
          'tech'
        )}

        {/* Age Range */}
        <Section>
          <SectionTitle>선호 연령대</SectionTitle>
          <SectionDescription>연결을 원하는 상대방의 연령대를 설정해주세요.</SectionDescription>
          <RangeContainer>
            <RangeInput
              value={preferences.ageRangeMin.toString()}
              onChangeText={(text) =>
                setPreferences(prev => ({ ...prev, ageRangeMin: parseInt(text) || 18 }))
              }
              keyboardType="numeric"
              maxLength={2}
            />
            <RangeLabel>세 부터</RangeLabel>
            <RangeInput
              value={preferences.ageRangeMax.toString()}
              onChangeText={(text) =>
                setPreferences(prev => ({ ...prev, ageRangeMax: parseInt(text) || 100 }))
              }
              keyboardType="numeric"
              maxLength={2}
            />
            <RangeLabel>세 까지</RangeLabel>
          </RangeContainer>
        </Section>

        {/* Max Distance */}
        <Section>
          <SectionTitle>최대 거리</SectionTitle>
          <SectionDescription>몇 km 반경 내의 사람들과 연결되고 싶으신가요?</SectionDescription>
          <RangeContainer>
            <RangeInput
              value={preferences.maxDistance.toString()}
              onChangeText={(text) =>
                setPreferences(prev => ({ ...prev, maxDistance: parseInt(text) || 1 }))
              }
              keyboardType="numeric"
              maxLength={3}
            />
            <RangeLabel>km 이내</RangeLabel>
          </RangeContainer>
        </Section>

        {/* Connection Bio */}
        <Section>
          <SectionTitle>소개 메시지</SectionTitle>
          <SectionDescription>
            다른 사람들에게 보여질 간단한 소개를 작성해주세요.
          </SectionDescription>
          <CustomTagInput
            value={preferences.connectionBio}
            onChangeText={(text) =>
              setPreferences(prev => ({ ...prev, connectionBio: text }))
            }
            placeholder="예: 함께 음악을 만들거나 카페에서 대화 나누고 싶어요!"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4, textAlign: 'right' }}>
            {preferences.connectionBio.length}/200
          </Text>
        </Section>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, margin: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
              취소
            </Text>
          </TouchableOpacity>
          
          <SaveButton
            style={{ flex: 2 }}
            onPress={handleSave}
            disabled={isLoading}
          >
            <SaveButtonText disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장하기'}
            </SaveButtonText>
          </SaveButton>
        </View>
      </Container>
    </Modal>
  );
};

export default SignatureConnectionPreferences;