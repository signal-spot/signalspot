import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const Card = styled.View`
  background-color: #ffffff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const PercentageText = styled.Text<{ percentage: number }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.percentage >= 80 ? '#4CAF50' : props.percentage >= 50 ? '#FF9800' : '#FF5722'};
`;

const ProgressBarContainer = styled.View`
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 12px;
`;

const ProgressBar = styled.View<{ percentage: number }>`
  height: 100%;
  background-color: ${props => props.percentage >= 80 ? '#4CAF50' : props.percentage >= 50 ? '#FF9800' : '#FF5722'};
  border-radius: 4px;
  width: ${props => props.percentage}%;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #666;
  line-height: 20px;
  margin-bottom: 16px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: #ff6b6b;
  padding: 12px 20px;
  border-radius: 8px;
  align-items: center;
`;

const ActionButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const SuggestionsList = styled.View`
  margin-top: 12px;
`;

const SuggestionItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const SuggestionBullet = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #ff6b6b;
  margin-right: 12px;
`;

const SuggestionText = styled.Text`
  font-size: 14px;
  color: #555;
  flex: 1;
`;

interface ProfileCompletionCardProps {
  percentage: number;
  onEditProfile: () => void;
  missingFields?: string[];
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  percentage,
  onEditProfile,
  missingFields = [],
}) => {
  const getCompletionMessage = () => {
    if (percentage >= 90) {
      return '프로필이 완성되었습니다! 다른 사용자들에게 더 잘 보일 수 있어요.';
    } else if (percentage >= 70) {
      return '프로필이 거의 완성되었어요. 몇 가지만 더 추가해보세요.';
    } else if (percentage >= 50) {
      return '프로필을 더 완성해서 다른 사용자들과 더 잘 연결되어보세요.';
    } else {
      return '프로필을 완성하면 더 많은 사람들과 연결될 수 있어요.';
    }
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (missingFields.includes('bio')) {
      suggestions.push('자기소개 작성하기');
    }
    if (missingFields.includes('interests')) {
      suggestions.push('관심사 추가하기');
    }
    if (missingFields.includes('avatarUrl')) {
      suggestions.push('프로필 사진 업로드하기');
    }
    if (missingFields.includes('location')) {
      suggestions.push('위치 정보 추가하기');
    }
    if (missingFields.includes('socialLinks')) {
      suggestions.push('소셜 미디어 링크 연결하기');
    }

    return suggestions.slice(0, 3); // Show max 3 suggestions
  };

  const suggestions = getSuggestions();

  if (percentage >= 95) {
    return null; // Don't show the card if profile is almost complete
  }

  return (
    <Card>
      <Header>
        <Title>프로필 완성도</Title>
        <PercentageText percentage={percentage}>{percentage}%</PercentageText>
      </Header>

      <ProgressBarContainer>
        <ProgressBar percentage={percentage} />
      </ProgressBarContainer>

      <Description>{getCompletionMessage()}</Description>

      {suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem key={index}>
              <SuggestionBullet />
              <SuggestionText>{suggestion}</SuggestionText>
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}

      <ActionButton onPress={onEditProfile}>
        <ActionButtonText>프로필 편집하기</ActionButtonText>
      </ActionButton>
    </Card>
  );
};

export default ProfileCompletionCard;