/**
 * ReminderPicker — bottom-sheet modal for selecting a reminder time.
 * Restyled to the Pyramid Festival theme (tokens via useTheme). Logic preserved.
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
import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';
import { REMINDER_PRESETS } from '../utils/constants';
import { IconBell } from './ui/Icons';

export default function ReminderPicker({
  visible,
  onClose,
  onSetReminder,
  onRemoveReminder,
  event,
  existingReminder,
}) {
  const { t } = useTheme();
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

  const accentTint = t.accent + '22';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.container, { backgroundColor: t.surface }, t.cardShadow]}>
          <View style={[styles.grabber, { backgroundColor: t.hairlineStrong }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.ink }]}>Set Reminder</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={[styles.closeButton, { color: t.ink3 }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Event info */}
          {event && (
            <View style={[styles.eventInfo, { backgroundColor: t.surface2 }]}>
              <Text style={[styles.eventTitle, { color: t.ink }]} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={[styles.eventCategory, { color: t.ink2 }]}>
                {event.categoryName}
              </Text>
            </View>
          )}

          {/* Existing reminder info */}
          {existingReminder && (
            <View style={[styles.existingReminder, { backgroundColor: accentTint }]}>
              <View style={styles.existingRow}>
                <IconBell size={16} color={t.accent} />
                <Text style={[styles.existingReminderText, { color: t.accent }]}>
                  Reminder set: {existingReminder.minutesBefore} min before
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: t.hot }]}
                onPress={handleRemove}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Preset options */}
          <View style={styles.presets}>
            {(REMINDER_PRESETS || []).map(preset => {
              const active = existingReminder?.minutesBefore === preset.minutes;
              return (
                <TouchableOpacity
                  key={preset.minutes}
                  style={[
                    styles.presetButton,
                    { backgroundColor: t.surface2, borderColor: 'transparent' },
                    active && { backgroundColor: accentTint, borderColor: t.accent },
                  ]}
                  onPress={() => handlePresetSelect(preset.minutes)}
                >
                  <Text style={[styles.presetButtonText, { color: active ? t.accent : t.ink2 }]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom time input */}
          <TouchableOpacity
            style={styles.customToggle}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Text style={[styles.customToggleText, { color: t.accent2 }]}>
              {showCustomInput ? '▼ Custom time' : '▶ Custom time'}
            </Text>
          </TouchableOpacity>

          {showCustomInput && (
            <View style={styles.customInput}>
              <TextInput
                style={[styles.input, { backgroundColor: t.surface2, color: t.ink }]}
                placeholder="Enter minutes"
                placeholderTextColor={t.ink3}
                keyboardType="numeric"
                value={customMinutes}
                onChangeText={setCustomMinutes}
              />
              <TouchableOpacity
                style={[
                  styles.customButton,
                  { backgroundColor: t.accent },
                  !customMinutes && { backgroundColor: t.surface2 },
                ]}
                onPress={handleCustomSubmit}
                disabled={!customMinutes}
              >
                <Text style={[styles.customButtonText, { color: customMinutes ? t.onAccent : t.ink3 }]}>
                  Set
                </Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
  },
  closeButton: {
    fontSize: 22,
    padding: 4,
  },
  eventInfo: {
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  eventTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    marginBottom: 4,
  },
  eventCategory: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
  },
  existingReminder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  existingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  existingReminderText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  removeButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  removeButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.sm,
    borderWidth: 2,
  },
  presetButtonText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  customToggle: {
    paddingVertical: 12,
  },
  customToggleText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  customButton: {
    paddingHorizontal: 24,
    height: 50,
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  customButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
});
