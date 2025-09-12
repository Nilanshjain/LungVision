import React from 'react';
import { Stack } from 'expo-router';

export default function ReportsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="report-editor"
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </Stack>
  );
} 