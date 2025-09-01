import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, View, Text } from 'react-native';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

function WebTopNav() {
  const Item = ({ label, route, icon }: { label: string; route: string; icon: string }) => (
    <Pressable onPress={() => router.replace(route)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12 }}>
      <IconSymbol size={18} name={icon as any} color={'#fff'} />
      <Text style={{ color: '#fff', fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
  return (
    <LinearGradient colors={["#0b3d91", "#1a73e8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingTop: 12, paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>LungVision</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Item label="Home" route="/(tabs)/home" icon="house.fill" />
          <Item label="Reports" route="/(tabs)/reports" icon="doc.text.fill" />
          <Item label="Patient History" route="/(tabs)/history" icon="clock.fill" />
          <Item label="Profile" route="/(tabs)/profile" icon="person.circle.fill" />
        </View>
      </View>
    </LinearGradient>
  );
}

export default function TabLayout() {
  const isWeb = Platform.OS === 'web';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: isWeb,
        header: isWeb ? () => <WebTopNav /> : undefined,
        tabBarButton: HapticTab,
        tabBarBackground: isWeb ? undefined : TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderTopWidth: 0,
            paddingBottom: 20,
            paddingTop: 10,
            height: 80,
          },
          android: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderTopWidth: 0,
            paddingBottom: 10,
            paddingTop: 10,
            height: 70,
          },
          web: {
            display: 'none',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Patient History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
