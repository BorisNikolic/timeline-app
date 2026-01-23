/**
 * ReminderPicker - Modal for selecting reminder time
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { REMINDER_PRESETS } from '../utils/constants';

export default function ReminderPicker({
  visible,
  onClose,
  onSetReminder,
  onRemoveReminder,
  event,
  existingReminder,
}) {
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handlePresetSelect = (minutes) => {
    onSetReminder(minutes);
    onClose();
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0) {
      onSetReminder(minutes);
      onClose();
    }
  };

  const handleRemove = () => {
    onRemoveReminder();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Reminder</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Event info */}
          {event && (
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.eventCategory}>
                {event.categoryName}
              </Text>
            </View>
          )}

          {/* Existing reminder info */}
          {existingReminder && (
            <View style={styles.existingReminder}>
              <Text style={styles.existingReminderText}>
                🔔 Reminder set: {existingReminder.minutesBefore} min before
              </Text>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Preset options */}
          <View style={styles.presets}>
            {REMINDER_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.minutes}
                style={[
                  styles.presetButton,
                  existingReminder?.minutesBefore === preset.minutes && styles.presetButtonActive,
                ]}
                onPress={() => handlePresetSelect(preset.minutes)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    existingReminder?.minutesBefore === preset.minutes && styles.presetButtonTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom time input */}
          <TouchableOpacity
            style={styles.customToggle}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Text style={styles.customToggleText}>
              {showCustomInput ? '▼ Custom time' : '▶ Custom time'}
            </Text>
          </TouchableOpacity>

          {showCustomInput && (
            <View style={styles.customInput}>
              <TextInput
                style={styles.input}
                placeholder="Enter minutes"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
                value={customMinutes}
                onChangeText={setCustomMinutes}
              />
              <TouchableOpacity
                style={[
                  styles.customButton,
                  !customMinutes && styles.customButtonDisabled,
                ]}
                onPress={handleCustomSubmit}
                disabled={!customMinutes}
              >
                <Text style={styles.customButtonText}>Set</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.alpha.black60,
  },
  container: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.tertiary,
    padding: spacing.sm,
  },
  eventInfo: {
    backgroundColor: colors.neutral.grayLighter,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  eventTitle: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventCategory: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
  existingReminder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.teal + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  existingReminderText: {
    ...typography.textStyles.bodySmall,
    color: colors.teal,
  },
  removeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.coral,
    borderRadius: borderRadius.md,
  },
  removeButtonText: {
    ...typography.textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.grayLighter,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    borderColor: colors.teal,
    backgroundColor: colors.teal + '20',
  },
  presetButtonText: {
    ...typography.textStyles.button,
    color: colors.text.secondary,
    textTransform: 'none',
  },
  presetButtonTextActive: {
    color: colors.teal,
  },
  customToggle: {
    paddingVertical: spacing.sm,
  },
  customToggleText: {
    ...typography.textStyles.bodySmall,
    color: colors.teal,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: colors.neutral.grayLighter,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...typography.textStyles.body,
    color: colors.text.primary,
  },
  customButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
  },
  customButtonDisabled: {
    backgroundColor: colors.neutral.gray,
  },
  customButtonText: {
    ...typography.textStyles.button,
    color: colors.text.inverse,
  },
});
