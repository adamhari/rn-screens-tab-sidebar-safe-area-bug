# react-native-screens: tab bottom safe area includes the detached tab bar while the sidebar shows

Minimal reproduction for a `react-native-screens` bug on iOS 27. Proposed fix:
[software-mansion/react-native-screens#5302](https://github.com/software-mansion/react-native-screens/pull/5302).

## The bug

`Tabs.Host` is configured with the iOS 27 sidebar placement:

```tsx
<Tabs.Host
  ios={{
    tabBarControllerMode: 'tabSidebar',
    tabBarSidebarPreferredPlacement: 'sidebar',
  }}
/>
```

On an iPhone with a regular horizontal size class (landscape), the sidebar
replaces the tab bar. UIKit removes the tab bar from the window but leaves it at
its stale frame, and keeps deriving the selected tab's bottom safe area from it.
While the sidebar shows, and through its show and hide transitions, content
padded by the bottom safe area jumps up by the height of the tab bar.

- **Expected:** with no tab bar on screen, the bottom safe area of the tab is the
  home indicator inset.
- **Actual:** the bottom safe area of the tab still includes the tab bar. In the
  pull request it was measured on an iPhone 11 (iOS 27.2.1) rising from 20 to 83.

## The app

[`App.tsx`](./App.tsx) is the whole example: three tabs, each with a
`SafeAreaView` from `react-native-screens/experimental` and a "composer" pinned
to its bottom edge.

- The red band under the composer is the bottom safe area of the tab.
- Each change of the bottom inset is listed on screen and logged to the console
  with a timestamp (`[tab One] +12.3s  bottom inset = 83`).

## Requirements

- Xcode 27 (the sidebar placement is compiled only with the iOS 27 SDK)
- iOS 27 device or simulator on which an iPhone has a regular horizontal size
  class in landscape, such as iPhone 11 or a Plus, Pro Max or Air model

## Run

```bash
npm install
```

```bash
npx expo run:ios --device
```

## Steps to reproduce

1. Launch the app in portrait. The tab bar is at the bottom and the bottom inset
   includes it, as expected.
2. Rotate to landscape. The sidebar replaces the tab bar.
   - Expected: the bottom inset drops to the home indicator inset.
   - Actual: the bottom inset still includes the height of the tab bar, and the
     red band under the composer is that much taller.
3. Hide the sidebar with the button at the top of the sidebar, then swipe from
   the leading edge of the screen to show it again. The inset changes with each
   show and hide of the sidebar.
4. Select another tab in the sidebar. The new tab starts with the inflated
   inset.
5. Rotate back to portrait. The tab bar returns and its inset is correct.

## Versions

| Package                | Version |
| ---------------------- | ------- |
| `react-native-screens` | 4.30.1  |
| `react-native`         | 0.88.1  |
| `expo`                 | 58      |
