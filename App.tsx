import { useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Tabs,
  type TabSelectedEvent,
  type TabsHostNavStateRequest,
} from 'react-native-screens';
import { SafeAreaView } from 'react-native-screens/experimental';

const TAB_NAMES = ['One', 'Two', 'Three'];
const START = Date.now();

function TabContent({ name }: { name: string }) {
  const containerHeight = useRef(0);
  const safeAreaFrame = useRef({ y: 0, height: 0 });
  const lastBottomInset = useRef<number | null>(null);
  const pendingFrame = useRef<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // `SafeAreaView` applies the insets as margins, so the bottom inset is the
  // gap between the bottom of the container and the bottom of `SafeAreaView`.
  const recordBottomInset = () => {
    pendingFrame.current = null;
    const { y, height } = safeAreaFrame.current;
    const bottomInset = Math.round(containerHeight.current - y - height);
    if (bottomInset === lastBottomInset.current) {
      return;
    }
    lastBottomInset.current = bottomInset;
    const seconds = ((Date.now() - START) / 1000).toFixed(1);
    const entry = `+${seconds}s  bottom inset = ${bottomInset}`;
    console.log(`[tab ${name}] ${entry}`);
    setHistory(previous => [...previous.slice(-7), entry]);
  };

  // Both views are laid out in the same pass but report separately. Wait a
  // frame so that the inset is computed from frames of the same pass.
  const scheduleRecord = () => {
    if (pendingFrame.current === null) {
      pendingFrame.current = requestAnimationFrame(recordBottomInset);
    }
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    containerHeight.current = event.nativeEvent.layout.height;
    scheduleRecord();
  };

  const onSafeAreaLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    safeAreaFrame.current = { y, height };
    scheduleRecord();
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <SafeAreaView
        edges={{ top: true, bottom: true, left: true, right: true }}
        style={styles.safeArea}
        onLayout={onSafeAreaLayout}>
        <View style={styles.log}>
          <Text style={styles.title}>Tab {name}: bottom safe area inset</Text>
          {history.map(entry => (
            <Text key={entry} style={styles.entry}>
              {entry}
            </Text>
          ))}
        </View>
        <View style={styles.composer}>
          <Text style={styles.composerText}>
            Composer: the red band below is the bottom safe area
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  const [navStateRequest, setNavStateRequest] =
    useState<TabsHostNavStateRequest>({
      selectedScreenKey: TAB_NAMES[0],
      baseProvenance: 0,
    });

  const onTabSelected = (event: NativeSyntheticEvent<TabSelectedEvent>) => {
    const { selectedScreenKey, provenance } = event.nativeEvent;
    setNavStateRequest({ selectedScreenKey, baseProvenance: provenance });
  };

  return (
    <Tabs.Host
      navStateRequest={navStateRequest}
      onTabSelected={onTabSelected}
      ios={{
        tabBarControllerMode: 'tabSidebar',
        tabBarSidebarPreferredPlacement: 'sidebar',
      }}>
      {TAB_NAMES.map(name => (
        <Tabs.Screen
          key={name}
          screenKey={name}
          title={name}
          ios={{ icon: { type: 'sfSymbol', name: 'circle' } }}>
          <TabContent name={name} />
        </Tabs.Screen>
      ))}
    </Tabs.Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff3b30',
  },
  safeArea: {
    backgroundColor: '#ffffff',
  },
  log: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  entry: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  composer: {
    padding: 12,
    backgroundColor: '#e5e5ea',
  },
  composerText: {
    fontSize: 15,
  },
});
