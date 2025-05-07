import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { FONTS, SPACING } from '@/constants/Layout';
import { useProgram } from '@/context/ProgramContext';
import ProgramCard from '@/components/ProgramCard';

export default function PathsScreen() {
  const { programs } = useProgram();
  
  const discoveryPrograms = programs.filter(p => p.category === 'discovery');
  const premiumPrograms = programs.filter(p => p.category === 'premium');
  
  const handleProgramPress = (programId: string) => {
    router.push({
      pathname: '/(app)/program/[id]',
      params: { id: programId }
    });
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>LES VOIES</Text>
        <Text style={styles.subtitle}>Choisissez votre parcours de transformation</Text>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>DÉCOUVERTE</Text>
        <Text style={styles.sectionDescription}>
          Programmes courts pour explorer les fondamentaux du mouvement ancestral.
        </Text>
        
        {discoveryPrograms.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            onPress={handleProgramPress}
          />
        ))}
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>LA VOIE MOHERO</Text>
        <Text style={styles.sectionDescription}>
          Programme complet de transformation physique et mentale.
        </Text>
        
        {premiumPrograms.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            onPress={handleProgramPress}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...FONTS.heading,
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: 2,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...FONTS.subheading,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  sectionDescription: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});