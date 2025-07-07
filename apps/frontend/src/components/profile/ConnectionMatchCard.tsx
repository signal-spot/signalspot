import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styled from 'styled-components/native';

const Card = styled.TouchableOpacity`
  background-color: #ffffff;
  margin: 8px 16px;
  border-radius: 16px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const Avatar = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  overflow: hidden;
  margin-right: 16px;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const AvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
`;

const AvatarPlaceholderText = styled.Text`
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
`;

const UserInfo = styled.View`
  flex: 1;
`;

const UserName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const UserLocation = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const CompatibilityScore = styled.View<{ score: number }>`
  background-color: ${props => 
    props.score >= 80 ? '#4CAF50' : 
    props.score >= 60 ? '#FF9800' : '#FF5722'
  };
  padding: 6px 12px;
  border-radius: 20px;
  align-self: flex-start;
`;

const CompatibilityText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
`;

const Bio = styled.Text`
  font-size: 14px;
  color: #444;
  line-height: 20px;
  margin-bottom: 16px;
`;

const TagsSection = styled.View`
  margin-bottom: 12px;
`;

const TagsTitle = styled.Text`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.View`
  background-color: #f0f8ff;
  border: 1px solid #e6f3ff;
  padding: 4px 8px;
  border-radius: 12px;
`;

const TagText = styled.Text`
  font-size: 12px;
  color: #0066cc;
  font-weight: 500;
`;

const ConnectionTypes = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const ConnectionType = styled.View`
  background-color: #fff0f0;
  border: 1px solid: #ffe0e0;
  padding: 6px 12px;
  border-radius: 16px;
`;

const ConnectionTypeText = styled.Text`
  font-size: 12px;
  color: #cc0000;
  font-weight: 600;
`;

const MetaInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: #f0f0f0;
`;

const MetaItem = styled.View`
  align-items: center;
`;

const MetaValue = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #333;
`;

const MetaLabel = styled.Text`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled.TouchableOpacity<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: ${props => props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'};
  align-items: center;
`;

const ActionButtonText = styled.Text<{ variant: 'primary' | 'secondary' }>`
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#333333'};
  font-size: 14px;
  font-weight: 600;
`;

interface ConnectionMatch {
  userId: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  distance?: number;
  compatibilityScore: number;
  matchingConnectionTypes: string[];
  commonInterests: string[];
  commonSkills: string[];
  commonMusicGenres: string[];
  commonEntertainment: string[];
  lastActiveAt?: Date;
  hasBeenContacted: boolean;
  mutualConnections: number;
}

interface ConnectionMatchCardProps {
  match: ConnectionMatch;
  onViewProfile: (userId: string) => void;
  onConnect: (userId: string) => void;
  onPass: (userId: string) => void;
}

const CONNECTION_TYPE_LABELS = {
  collaboration: '협업',
  networking: '네트워킹',
  friendship: '친구',
  mentorship: '멘토링',
  romantic: '연애',
};

const ConnectionMatchCard: React.FC<ConnectionMatchCardProps> = ({
  match,
  onViewProfile,
  onConnect,
  onPass,
}) => {
  const getInitials = () => {
    if (match.fullName) {
      return match.fullName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return match.username.charAt(0).toUpperCase();
  };

  const formatDistance = () => {
    if (!match.distance) return '';
    return match.distance < 1 
      ? `${Math.round(match.distance * 1000)}m`
      : `${Math.round(match.distance)}km`;
  };

  const formatLastActive = () => {
    if (!match.lastActiveAt) return '알 수 없음';
    
    const now = new Date();
    const lastActive = new Date(match.lastActiveAt);
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}일 전`;
    return lastActive.toLocaleDateString();
  };

  const getTopCommonElements = (array: string[], limit = 3) => {
    return array.slice(0, limit);
  };

  return (
    <Card onPress={() => onViewProfile(match.userId)}>
      <Header>
        <Avatar>
          {match.avatarUrl ? (
            <AvatarImage source={{ uri: match.avatarUrl }} />
          ) : (
            <AvatarPlaceholder>
              <AvatarPlaceholderText>{getInitials()}</AvatarPlaceholderText>
            </AvatarPlaceholder>
          )}
        </Avatar>
        
        <UserInfo>
          <UserName>{match.fullName || match.username}</UserName>
          <UserLocation>
            {match.location && formatDistance() && `${match.location} • ${formatDistance()}`}
            {match.location && !formatDistance() && match.location}
            {!match.location && formatDistance() && formatDistance()}
          </UserLocation>
          <CompatibilityScore score={match.compatibilityScore}>
            <CompatibilityText>{match.compatibilityScore}% 매칭</CompatibilityText>
          </CompatibilityScore>
        </UserInfo>
      </Header>

      {match.bio && (
        <Bio numberOfLines={2}>{match.bio}</Bio>
      )}

      {match.matchingConnectionTypes.length > 0 && (
        <ConnectionTypes>
          {match.matchingConnectionTypes.map((type) => (
            <ConnectionType key={type}>
              <ConnectionTypeText>
                {CONNECTION_TYPE_LABELS[type] || type}
              </ConnectionTypeText>
            </ConnectionType>
          ))}
        </ConnectionTypes>
      )}

      {match.commonInterests.length > 0 && (
        <TagsSection>
          <TagsTitle>공통 관심사</TagsTitle>
          <TagsContainer>
            {getTopCommonElements(match.commonInterests).map((interest) => (
              <Tag key={interest}>
                <TagText>{interest}</TagText>
              </Tag>
            ))}
            {match.commonInterests.length > 3 && (
              <Tag>
                <TagText>+{match.commonInterests.length - 3}개 더</TagText>
              </Tag>
            )}
          </TagsContainer>
        </TagsSection>
      )}

      {match.commonSkills.length > 0 && (
        <TagsSection>
          <TagsTitle>공통 스킬</TagsTitle>
          <TagsContainer>
            {getTopCommonElements(match.commonSkills).map((skill) => (
              <Tag key={skill}>
                <TagText>{skill}</TagText>
              </Tag>
            ))}
            {match.commonSkills.length > 3 && (
              <Tag>
                <TagText>+{match.commonSkills.length - 3}개 더</TagText>
              </Tag>
            )}
          </TagsContainer>
        </TagsSection>
      )}

      {(match.commonMusicGenres.length > 0 || match.commonEntertainment.length > 0) && (
        <TagsSection>
          <TagsTitle>취향 공유</TagsTitle>
          <TagsContainer>
            {getTopCommonElements([...match.commonMusicGenres, ...match.commonEntertainment], 4).map((item) => (
              <Tag key={item}>
                <TagText>{item}</TagText>
              </Tag>
            ))}
          </TagsContainer>
        </TagsSection>
      )}

      <MetaInfo>
        <MetaItem>
          <MetaValue>{formatLastActive()}</MetaValue>
          <MetaLabel>마지막 활동</MetaLabel>
        </MetaItem>
        
        <MetaItem>
          <MetaValue>{match.mutualConnections}</MetaValue>
          <MetaLabel>공통 연결</MetaLabel>
        </MetaItem>
        
        <MetaItem>
          <MetaValue>{match.hasBeenContacted ? '연락함' : '신규'}</MetaValue>
          <MetaLabel>상태</MetaLabel>
        </MetaItem>
      </MetaInfo>

      <ActionButtons>
        <ActionButton variant="secondary" onPress={() => onPass(match.userId)}>
          <ActionButtonText variant="secondary">패스</ActionButtonText>
        </ActionButton>
        
        <ActionButton variant="primary" onPress={() => onConnect(match.userId)}>
          <ActionButtonText variant="primary">연결하기</ActionButtonText>
        </ActionButton>
      </ActionButtons>
    </Card>
  );
};

export default ConnectionMatchCard;