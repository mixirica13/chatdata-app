import posthog from 'posthog-js'

export const initPostHog = () => {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST

  if (!posthogKey) {
    console.warn('PostHog key not found. Analytics will be disabled.')
    return
  }

  posthog.init(posthogKey, {
    api_host: posthogHost || 'https://app.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only', // Only create profiles for logged-in users
    capture_pageview: false, // We'll manually track pageviews for better control
    capture_pageleave: true,
    capture_exceptions: true, // Enable capturing exceptions using Error Tracking
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        console.log('PostHog initialized in development mode')
        // Enable debug mode in development
        posthog.debug()
      }
    },
  })
}

export { posthog }