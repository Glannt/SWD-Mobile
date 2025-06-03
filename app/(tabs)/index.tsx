import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <>
      {/* Screen List */}
      <ThemedView style={{ margin: 16 }}>
        <ThemedText type='title'>Screen List</ThemedText>
        <ThemedText>- Home</ThemedText>
        <ThemedText>- Explore</ThemedText>
        <ThemedText>- Settings</ThemedText>
      </ThemedView>

      {/* Screen Map */}
      <ThemedView style={{ margin: 16 }}>
        <ThemedText type='title'>Screen Map</ThemedText>
        <ThemedText>
          {`
            Home: /
            Explore: /explore
            Settings: /settings
          `}
        </ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
