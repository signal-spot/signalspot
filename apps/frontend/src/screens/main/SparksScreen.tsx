import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../providers/AuthProvider';
import { DesignSystem } from '../../utils/designSystem';
import { Card, Badge, Button } from '../../components/common';
import { notificationService, NotificationType } from '../../services/notification.service';

const { width, height } = Dimensions.get('window');

interface SparkSession {
  id: string;
  isActive: boolean;
  startTime: string;
  duration: number;
  nearbyUsers: number;
  potentialConnections: number;
  activeRadius: number;
  sparkType: 'general' | 'interest' | 'location' | 'activity';
}

interface SparkStats {
  totalSparks: number;
  successfulConnections: number;
  activeTime: number;
  averageRadius: number;
}

const SparksScreen: React.FC = () => {
  const { user } = useAuth();
  
  // Animation values
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rippleAnimation = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;
  
  // State
  const [sparkSession, setSparkSession] = useState<SparkSession>({
    id: '',
    isActive: false,
    startTime: '',
    duration: 0,
    nearbyUsers: 0,
    potentialConnections: 0,
    activeRadius: 50,
    sparkType: 'general',
  });
  
  const [sparkStats, setSparkStats] = useState<SparkStats>({
    totalSparks: 12,
    successfulConnections: 8,
    activeTime: 240,
    averageRadius: 75,
  });
  
  const [loading, setLoading] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);

  // Animation effects
  useEffect(() => {
    if (sparkSession.isActive) {
      // Pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      // Ripple animation
      const rippleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnimation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      
      // Rotation animation
      const rotationLoop = Animated.loop(
        Animated.timing(rotationAnimation, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      
      pulseLoop.start();
      rippleLoop.start();
      rotationLoop.start();
      
      return () => {
        pulseLoop.stop();
        rippleLoop.stop();
        rotationLoop.stop();
      };
    }
  }, [sparkSession.isActive]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sparkSession.isActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        setSparkSession(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sparkSession.isActive]);

  const handleSparkToggle = async () => {
    if (sparkSession.isActive) {
      // Stop spark session
      setLoading(true);
      try {
        // In real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSparkSession(prev => ({
          ...prev,
          isActive: false,
        }));
        
        setSparkStats(prev => ({
          ...prev,
          totalSparks: prev.totalSparks + 1,
          activeTime: prev.activeTime + sessionTimer,
        }));
        
        setSessionTimer(0);
        
        Alert.alert(
          '스파크 비활성화',
          `${Math.floor(sessionTimer / 60)}분 ${sessionTimer % 60}초 동안 활성화되었습니다.`
        );
      } catch (error) {
        Alert.alert('오류', '스파크 비활성화에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    } else {
      // Start spark session
      setLoading(true);
      try {
        // In real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSparkSession(prev => ({
          ...prev,
          id: Date.now().toString(),
          isActive: true,
          startTime: new Date().toISOString(),
          duration: 0,
        }));
        
        setSessionTimer(0);
        
        Alert.alert(
          '스파크 활성화',
          '주변 사람들과 연결할 수 있는 스파크가 활성화되었습니다!'
        );
      } catch (error) {
        Alert.alert('오류', '스파크 활성화에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSparkButtonColor = () => {
    if (sparkSession.isActive) {
      return DesignSystem.colors.danger;
    }
    return DesignSystem.colors.primary;
  };

  const rippleScale = rippleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });

  const rippleOpacity = rippleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const rotation = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✨ 스파크</Text>
        <Text style={styles.subtitle}>
          {sparkSession.isActive ? '활성화됨' : '새로운 연결을 시작하세요'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Central Spark Button */}
        <View style={styles.sparkButtonContainer}>
          {/* Ripple Effect */}
          {sparkSession.isActive && (
            <Animated.View
              style={[
                styles.rippleEffect,
                {
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                  backgroundColor: getSparkButtonColor(),
                },
              ]}
            />
          )}
          
          {/* Rotating Ring */}
          {sparkSession.isActive && (
            <Animated.View
              style={[
                styles.rotatingRing,
                {
                  transform: [{ rotate: rotation }],
                  borderColor: getSparkButtonColor(),
                },
              ]}
            />
          )}
          
          {/* Main Spark Button */}
          <Animated.View
            style={[
              styles.sparkButton,
              {
                backgroundColor: getSparkButtonColor(),
                transform: [{ scale: pulseAnimation }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.sparkButtonInner}
              onPress={handleSparkToggle}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <>
                  <Icon
                    name={sparkSession.isActive ? 'stop' : 'flash'}
                    size={64}
                    color="#FFFFFF"
                  />
                  <Text style={styles.sparkButtonText}>
                    {sparkSession.isActive ? '중지' : '시작'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Session Status */}
        {sparkSession.isActive && (
          <Card style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionIndicator}>
                <View style={styles.pulsingDot} />
                <Text style={styles.sessionStatus}>활성화 중</Text>
              </View>
              <Text style={styles.sessionTime}>{formatTime(sessionTimer)}</Text>
            </View>
            
            <View style={styles.sessionStats}>
              <View style={styles.statItem}>
                <Icon name="people-outline" size={20} color={DesignSystem.colors.text.secondary} />
                <Text style={styles.statValue}>{sparkSession.nearbyUsers}</Text>
                <Text style={styles.statLabel}>근처 사용자</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="link-outline" size={20} color={DesignSystem.colors.text.secondary} />
                <Text style={styles.statValue}>{sparkSession.potentialConnections}</Text>
                <Text style={styles.statLabel}>잠재적 연결</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="radio-outline" size={20} color={DesignSystem.colors.text.secondary} />
                <Text style={styles.statValue}>{sparkSession.activeRadius}m</Text>
                <Text style={styles.statLabel}>활성 반경</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>통계</Text>
            <Badge variant="info" size="small">
              {sparkStats.totalSparks}개 세션
            </Badge>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{sparkStats.successfulConnections}</Text>
              <Text style={styles.statBoxLabel}>성공한 연결</Text>
              <Text style={styles.statBoxRate}>
                {sparkStats.totalSparks > 0 
                  ? Math.round((sparkStats.successfulConnections / sparkStats.totalSparks) * 100)
                  : 0}% 성공률
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{Math.round(sparkStats.activeTime / 60)}분</Text>
              <Text style={styles.statBoxLabel}>총 활성 시간</Text>
              <Text style={styles.statBoxRate}>
                평균 {Math.round(sparkStats.activeTime / sparkStats.totalSparks / 60)}분/세션
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{sparkStats.averageRadius}m</Text>
              <Text style={styles.statBoxLabel}>평균 반경</Text>
              <Text style={styles.statBoxRate}>최적 범위</Text>
            </View>
          </View>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>스파크 사용 방법</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>중앙 버튼을 터치하여 스파크를 활성화하세요</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>근처 사용자들과 자동으로 연결이 시도됩니다</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>매칭된 사용자와 메시지를 주고받을 수 있습니다</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  header: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.light,
  },
  title: {
    ...DesignSystem.typography.title1,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  subtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingVertical: DesignSystem.spacing.lg,
  },
  sparkButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginBottom: DesignSystem.spacing.xl,
    position: 'relative',
  },
  rippleEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
  },
  rotatingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  sparkButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignSystem.shadow.lg,
    elevation: 8,
  },
  sparkButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
  },
  sparkButtonText: {
    ...DesignSystem.typography.headline,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: DesignSystem.spacing.sm,
  },
  sessionCard: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.success,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  sessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignSystem.colors.success,
  },
  sessionStatus: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.success,
    fontWeight: '600',
  },
  sessionTime: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 1,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  statValue: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  statsCard: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  statsTitle: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.md,
  },
  statBoxValue: {
    ...DesignSystem.typography.title2,
    color: DesignSystem.colors.primary,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.xs,
  },
  statBoxLabel: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  statBoxRate: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
  instructionsCard: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  instructionsTitle: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.md,
  },
  instructionsList: {
    gap: DesignSystem.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignSystem.spacing.md,
  },
  instructionNumber: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.primary,
    fontWeight: '700',
    width: 24,
    height: 24,
    textAlign: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 12,
    lineHeight: 24,
  },
  instructionText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default SparksScreen;