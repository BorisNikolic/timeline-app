import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, componentStyles } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PYRAMID</Text>
        <Text style={styles.headerSubtitle}>FESTIVAL</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Pyramid Festival</Text>
          <Text style={styles.welcomeSubtitle}>3-9 August, 2026 • Rtanj Mountain, Serbia</Text>
        </View>

        {/* Color Palette Preview */}
        <Text style={styles.sectionTitle}>Brand Colors</Text>
        <View style={styles.colorRow}>
          <ColorSwatch color={colors.primary.navy} name="Navy" />
          <ColorSwatch color={colors.primary.teal} name="Teal" />
          <ColorSwatch color={colors.accent.coral} name="Coral" />
          <ColorSwatch color={colors.accent.golden} name="Golden" />
        </View>

        {/* Button Examples */}
        <Text style={styles.sectionTitle}>Buttons</Text>
        <TouchableOpacity style={componentStyles.buttonPrimary}>
          <Text style={componentStyles.buttonPrimaryText}>Buy Tickets</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.md }} />

        <TouchableOpacity style={componentStyles.buttonSecondary}>
          <Text style={componentStyles.buttonSecondaryText}>Learn More</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.md }} />

        <TouchableOpacity style={componentStyles.buttonAccent}>
          <Text style={componentStyles.buttonAccentText}>Join Us</Text>
        </TouchableOpacity>

        {/* Card Example */}
        <Text style={styles.sectionTitle}>Cards</Text>
        <View style={componentStyles.card}>
          <Text style={styles.cardTitle}>Festival Program</Text>
          <Text style={styles.cardText}>
            Experience music, art, and culture in the mystical surroundings of Rtanj Mountain.
          </Text>
        </View>

        {/* Typography Preview */}
        <Text style={styles.sectionTitle}>Typography</Text>
        <Text style={[typography.textStyles.h1, { color: colors.text.primary }]}>Heading 1</Text>
        <Text style={[typography.textStyles.h2, { color: colors.text.primary }]}>Heading 2</Text>
        <Text style={[typography.textStyles.h3, { color: colors.text.primary }]}>Heading 3</Text>
        <Text style={[typography.textStyles.body, { color: colors.text.secondary }]}>
          Body text for paragraphs and descriptions
        </Text>
        <Text style={[typography.textStyles.caption, { color: colors.text.tertiary }]}>
          Caption text for small details
        </Text>
      </ScrollView>
    </View>
  );
}

// Color swatch component
function ColorSwatch({ color, name }) {
  return (
    <View style={styles.swatchContainer}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.swatchName}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    backgroundColor: colors.primary.navyDark,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral.white,
    letterSpacing: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary.teal,
    letterSpacing: 6,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  welcomeSection: {
    backgroundColor: colors.primary.navy,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...typography.textStyles.h3,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.textStyles.subtitle,
    color: colors.accent.golden,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  swatchContainer: {
    alignItems: 'center',
  },
  swatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  swatchName: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
  cardTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
  },
});
