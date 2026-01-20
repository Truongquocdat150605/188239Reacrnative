// utils/alertHelper.ts
import { Alert, AlertButton, Platform } from 'react-native';

type AlertOptions = {
  title?: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  onCancel?: () => void;
};

export const showAlert = (options: AlertOptions) => {
  const {
    title = 'Thông báo',
    message,
    onConfirm,
    confirmText = 'OK',
    cancelText,
    onCancel
  } = options;

  if (Platform.OS === 'web') {
    if (onCancel || cancelText) {
      // Có nút Cancel (confirm dialog)
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
    } else {
      // Chỉ có nút OK (alert dialog)
      alert(`${title}\n${message}`);
      onConfirm?.();
    }
  } else {
    // Mobile (iOS/Android)
    const buttons: AlertButton[] = [];
    
    if (cancelText || onCancel) {
      buttons.push({
        text: cancelText || 'Hủy',
        style: 'cancel',  // 👈 ĐÃ SỬA: string literal thay vì string
        onPress: onCancel
      });
    }
    
    buttons.push({
      text: confirmText,
      onPress: onConfirm,
      style: cancelText ? 'default' : 'cancel'  // 👈 ĐÃ SỬA
    });
    
    Alert.alert(title, message, buttons);
  }
};

// Helper cho các trường hợp thông dụng
export const showError = (message: string) => {
  showAlert({ title: 'Lỗi', message });
};

export const showSuccess = (message: string) => {
  showAlert({ title: 'Thành công', message });
};

export const showConfirm = (
  message: string, 
  onConfirm: () => void, 
  title: string = 'Xác nhận'
) => {
  showAlert({
    title,
    message,
    onConfirm,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy'
  });
};

// Helper cho delete confirmation
export const showDeleteConfirm = (
  itemName: string,
  onConfirm: () => void
) => {
  showAlert({
    title: 'Xóa',
    message: `Bạn có chắc muốn xóa "${itemName}"?`,
    onConfirm,
    confirmText: 'Xóa',
    cancelText: 'Hủy'
  });
};