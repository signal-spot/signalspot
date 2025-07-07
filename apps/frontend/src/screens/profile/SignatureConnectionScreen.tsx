import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import styled from 'styled-components/native';
import { profileService } from '../../services/profile.service';
import SignatureConnectionPreferences from '../../components/profile/SignatureConnectionPreferences';
import ConnectionMatchCard from '../../components/profile/ConnectionMatchCard';

const Container = styled.View`
  flex: 1;
  background-color: #f8f9fa;
`;

const Header = styled.View`
  background-color: #ffffff;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const HeaderSubtitle = styled.Text`
  font-size: 16px;
  color: #666;
  line-height: 22px;
`;

const StatsContainer = styled.View`
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

const StatsTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const StatItem = styled.View`
  align-items: center;
  flex: 1;
`;

const StatValue = styled.Text<{ color?: string }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.color || '#333'};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: center;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 12px;
  margin: 16px;
`;

const ActionButton = styled.TouchableOpacity<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background-color: ${props => props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'};
  align-items: center;
`;

const ActionButtonText = styled.Text<{ variant: 'primary' | 'secondary' }>`
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#333333'};
  font-size: 16px;
  font-weight: bold;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 16px 16px 8px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const SectionAction = styled.TouchableOpacity`
  padding: 8px 12px;
`;

const SectionActionText = styled.Text`
  color: #ff6b6b;
  font-size: 14px;
  font-weight: 600;
`;

const EmptyState = styled.View`
  background-color: #ffffff;
  margin: 16px;
  border-radius: 12px;
  padding: 40px 20px;
  align-items: center;
`;

const EmptyStateTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
`;

const EmptyStateText = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 20px;
  margin-bottom: 20px;
`;

const EmptyStateButton = styled.TouchableOpacity`
  background-color: #ff6b6b;
  padding: 12px 24px;
  border-radius: 8px;
`;

const EmptyStateButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const LoadingText = styled.Text`
  text-align: center;
  color: #666;
  font-size: 16px;
  margin: 20px;
`;

const SignatureConnectionScreen: React.FC = () => {
  const [preferences, setPreferences] = useState(null);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load preferences, matches, and stats in parallel
      const [prefsResponse, matchesResponse, statsResponse] = await Promise.all([
        profileService.getSignatureConnectionPreferences(),
        profileService.findSignatureConnectionMatches({ limit: 20, offset: 0 }),
        profileService.getSignatureConnectionStats(),
      ]);

      if (prefsResponse.success) {
        setPreferences(prefsResponse.data);
      }

      if (matchesResponse.success) {
        setMatches(matchesResponse.data.matches);
        setHasMore(matchesResponse.data.hasMore);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading signature connection data:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreMatches = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      
      const response = await profileService.findSignatureConnectionMatches({
        limit: 20,
        offset: matches.length,
      });

      if (response.success) {
        setMatches(prev => [...prev, ...response.data.matches]);
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more matches:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [matches.length, hasMore, isLoadingMore]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  }, [loadInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSavePreferences = async (newPreferences: any) => {
    try {
      const response = await profileService.updateSignatureConnectionPreferences(newPreferences);
      
      if (response.success) {
        setPreferences(newPreferences);
        // Reload matches with new preferences
        await loadInitialData();
      } else {
        throw new Error(response.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  const handleViewProfile = (userId: string) => {
    // TODO: Navigate to user profile
    console.log('View profile:', userId);
  };

  const handleConnect = (userId: string) => {
    // TODO: Implement connection logic
    Alert.alert(
      '연결 요청',
      '이 사용자에게 연결 요청을 보내시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결하기',
          onPress: () => {
            // TODO: Send connection request
            Alert.alert('성공', '연결 요청이 전송되었습니다.');
          },
        },
      ]
    );
  };

  const handlePass = (userId: string) => {
    // Remove from current matches
    setMatches(prev => prev.filter((match: any) => match.userId !== userId));
  };

  const renderMatch = ({ item }: { item: any }) => (
    <ConnectionMatchCard
      match={item}
      onViewProfile={handleViewProfile}
      onConnect={handleConnect}
      onPass={handlePass}
    />
  );

  const renderListFooter = () => {
    if (isLoadingMore) {
      return <LoadingText>더 많은 매칭을 불러오는 중...</LoadingText>;
    }
    
    if (!hasMore && matches.length > 0) {
      return <LoadingText>모든 매칭을 확인했습니다.</LoadingText>;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingText>Signature Connection을 불러오는 중...</LoadingText>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container>
        <Header>
          <HeaderTitle>Signature Connection</HeaderTitle>
          <HeaderSubtitle>
            당신과 비슷한 취향을 가진 사람들과 연결되어보세요.
          </HeaderSubtitle>
        </Header>

        <EmptyState>
          <EmptyStateTitle>설정을 완성해보세요</EmptyStateTitle>
          <EmptyStateText>
            Signature Connection 설정을 완성하면 당신과 취향이 비슷한 사람들을 찾아드릴게요.
            음악, 영화, 관심사 등을 설정해보세요.
          </EmptyStateText>
          <EmptyStateButton onPress={() => setShowPreferencesModal(true)}>
            <EmptyStateButtonText>설정 시작하기</EmptyStateButtonText>
          </EmptyStateButton>
        </EmptyState>

        <SignatureConnectionPreferences
          visible={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          onSave={handleSavePreferences}
          initialPreferences={preferences}
        />
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.userId}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreMatches}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderListFooter}
        ListHeaderComponent={
          <>
            <Header>
              <HeaderTitle>Signature Connection</HeaderTitle>
              <HeaderSubtitle>
                {matches.length}개의 매칭을 찾았습니다
              </HeaderSubtitle>
            </Header>

            {stats && (
              <StatsContainer>
                <StatsTitle>매칭 통계</StatsTitle>
                <StatsGrid>
                  <StatItem>
                    <StatValue color="#4CAF50">{stats.highCompatibilityMatches}</StatValue>
                    <StatLabel>높은 매칭{'\n'}(80%+)</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue color="#FF9800">{stats.mediumCompatibilityMatches}</StatValue>
                    <StatLabel>중간 매칭{'\n'}(60-79%)</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue color="#FF5722">{stats.lowCompatibilityMatches}</StatValue>
                    <StatLabel>낮은 매칭{'\n'}(40-59%)</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{stats.averageCompatibilityScore}%</StatValue>
                    <StatLabel>평균 매칭률</StatLabel>
                  </StatItem>
                </StatsGrid>
              </StatsContainer>
            )}

            <ActionButtons>
              <ActionButton
                variant="secondary"
                onPress={() => setShowPreferencesModal(true)}
              >
                <ActionButtonText variant="secondary">설정 수정</ActionButtonText>
              </ActionButton>
              <ActionButton variant="primary" onPress={onRefresh}>
                <ActionButtonText variant="primary">새로고침</ActionButtonText>
              </ActionButton>
            </ActionButtons>

            {matches.length > 0 && (
              <SectionHeader>
                <SectionTitle>추천 매칭</SectionTitle>
                <SectionAction onPress={onRefresh}>
                  <SectionActionText>새로고침</SectionActionText>
                </SectionAction>
              </SectionHeader>
            )}
          </>
        }
      />

      <SignatureConnectionPreferences
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handleSavePreferences}
        initialPreferences={preferences}
      />
    </Container>
  );
};

export default SignatureConnectionScreen;