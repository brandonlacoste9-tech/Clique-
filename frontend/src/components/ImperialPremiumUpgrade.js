// Premium Upgrade Screen - Louis Vuitton meets Roots Canada
import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/chatsnapStore';
import { colors, spacing, typography } from '../theme/chatsnapTheme';
import { chatsnapPhrases } from '../data/marketingContent';
import ImperialButton from './ImperialButton';
import ImperialCard from './ImperialCard';
import ImperialHeader from './ImperialHeader';
import ImperialLoading from './ImperialLoading';


const PremiumUpgrade = () => {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <ImperialHeader title="L'Élite Access" showBack />,
    });
  }, [navigation]);

  React.useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/subscriptions/plans`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setUpgrading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ planId })
      });
      const data = await response.json();
      
      if (data.url) {
        // In production, this would open Stripe checkout
        Alert.alert(
          phrases.upgradeSuccess,
          phrases.checkoutRedirect,
          [{ text: 'OK', onPress: () => loadPlans() }]
        );
      }
    } catch (error) {
      Alert.alert(phrases.error, error.message || phrases.genericError);
    } finally {
      setUpgrading(false);
    }
  };

  const renderPlan = ({ item }) => {
    const isFree = item.price === 0;
    const isPopular = item.popular;
    
    return (
      <ImperialCard style={{ marginBottom: spacing[4] }}>
        {isPopular && (
          <View style={{
            position: 'absolute',
            top: -spacing[2],
            right: spacing[2],
            backgroundColor: colors.gold,
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[0.5],
            borderRadius: 20,
            zIndex: 1
          }}>
            <Text style={{
              color: colors.black,
              fontWeight: '900',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              {phrases.popular}
            </Text>
          </View>
        )}
        
        <View style={{ alignItems: 'center', marginBottom: spacing[3] }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '900',
            color: colors.gold,
            textTransform: 'uppercase',
            letterSpacing: 2
          }}>
            {item.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.suede,
            marginTop: spacing[1]
          }}>
            {item.description}
          </Text>
        </View>
        
        <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
          <Text style={{
            fontSize: 36,
            fontWeight: '900',
            color: isFree ? colors.suede : colors.gold,
            textShadowColor: isFree ? 'transparent' : colors.gold,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 10
          }}>
            {isFree ? 'GRATUIT' : `$${item.price}`}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.suede,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            {isFree ? 'par mois' : '/mois'}
          </Text>
        </View>
        
        <View style={{ marginBottom: spacing[4] }}>
          {item.features.map((feature, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing[1]
            }}>
              <Text style={{
                fontSize: 16,
                color: isFree ? colors.suede : colors.gold,
                marginRight: spacing[2]
              }}>
                {feature.includes('unlimited') ? '👑' : '✓'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.suede,
                flex: 1
              }}>
                {translateFeature(feature)}
              </Text>
            </View>
          ))}
        </View>
        
        {!isFree && (
          <ImperialButton
            title={phrases.upgradeNow}
            onPress={() => handleUpgrade(item.id)}
            loading={upgrading}
            style={{ marginBottom: spacing[2] }}
          />
        )}
        
        {isFree && (
          <View style={{
            paddingVertical: spacing[2],
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 14,
              color: colors.gold,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              {phrases.currentPlan}
            </Text>
          </View>
        )}
      </ImperialCard>
    );
  };

  const translateFeature = (feature) => {
    const translations = {
      'stories:3_daily': '3 stories par jour',
      'stories:unlimited': 'Stories illimités',
      'messages:5_ephemeral': '5 messages éphémères par jour',
      'messages:unlimited': 'Messages éphémères illimités',
      'cliques:1': '1 vue',
      'cliques:unlimited': 'ChatSnaps illimités',
      'map:basic': 'Carte de base',
      'map:advanced': 'Carte avancée',
      'analytics:basic': 'Statistiques de base',
      'analytics:pro': 'Statistiques Pro',
      'ad_free': 'Sans publicité',
      'priority_support': 'Support prioritaire',
      'verified_badge': 'Badge vérifié'
    };
    return translations[feature] || feature;
  };

  if (loading) {
    return <ImperialLoading />;
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.black,
      paddingHorizontal: spacing[4]
    }}>
      <View style={{
        paddingVertical: spacing[4],
        alignItems: 'center',
        marginBottom: spacing[6]
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '900',
          color: colors.gold,
          textTransform: 'uppercase',
          letterSpacing: 2,
          textAlign: 'center'
        }}>
          {phrases.unlockElite}
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.suede,
          textAlign: 'center',
          marginTop: spacing[2]
        }}>
          {phrases.eliteDescription}
        </Text>
      </View>
      
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlan}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={{
        paddingVertical: spacing[6],
        alignItems: 'center'
      }}>
        <Text style={{
          fontSize: 12,
          color: colors.suede,
          opacity: 0.6,
          textAlign: 'center'
        }}>
          {phrases.cancelAnytime}
        </Text>
      </View>
    </View>
  );
};

export default PremiumUpgrade;
