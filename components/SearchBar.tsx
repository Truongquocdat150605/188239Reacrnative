import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export const SearchBar: React.FC<Props> = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={COLORS.subText} />
      <TextInput
        placeholder="Tìm kiếm trang sức..."
        placeholderTextColor={COLORS.subText}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },
});
