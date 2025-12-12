import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { AlertTriangle, LogOut, Trash2, X } from 'lucide-react-native';

interface ThemedAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: ThemedAlertButton[];
  onDismiss?: () => void;
  icon?: 'logout' | 'delete' | 'warning' | 'none';
}

const PRIMARY_COLOR = '#2563eb';

export function ThemedAlert({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
  icon = 'none',
}: ThemedAlertProps) {
  const handleButtonPress = (button: ThemedAlertButton) => {
    button.onPress?.();
  };

  const getIcon = () => {
    switch (icon) {
      case 'logout':
        return <LogOut size={28} color="#ef4444" />;
      case 'delete':
        return <Trash2 size={28} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={28} color="#f59e0b" />;
      default:
        return null;
    }
  };

  const cancelButton = buttons.find(b => b.style === 'cancel');
  const otherButtons = buttons.filter(b => b.style !== 'cancel');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              {icon !== 'none' && (
                <View style={styles.iconContainer}>
                  {getIcon()}
                </View>
              )}
              
              <Text style={styles.title}>{title}</Text>
              
              {message && (
                <Text style={styles.message}>{message}</Text>
              )}
              
              <View style={styles.buttonContainer}>
                {cancelButton && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleButtonPress(cancelButton)}
                    testID="button-alert-cancel"
                  >
                    <Text style={styles.cancelButtonText}>{cancelButton.text}</Text>
                  </TouchableOpacity>
                )}
                
                {otherButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'default' && styles.defaultButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    testID={`button-alert-${button.text.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1a1a1f',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  defaultButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  destructiveButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});
