import { useCallback } from 'react'
import { posthog } from '@/lib/posthog'
import { useAuth } from './useAuth'

// Event property types for better type safety
export interface BaseEventProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface PageViewProperties extends BaseEventProperties {
  page_version?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export interface CTAClickedProperties extends BaseEventProperties {
  cta_text: string
  cta_location: string
}

export interface RegistrationProperties extends BaseEventProperties {
  whatsapp_provided: boolean
  email_domain?: string
}

export interface ConnectionProperties extends BaseEventProperties {
  ad_accounts_count?: number
  permissions_granted?: string[]
  phone_number_hash?: string
  error_type?: string
}

export interface SubscriptionProperties extends BaseEventProperties {
  plan_tier: 'basic' | 'pro' | 'agency'
  plan_price: number
  is_trial: boolean
  payment_method?: string
  from_tier?: string
  to_tier?: string
  price_difference?: number
  days_as_customer?: number
  cancel_reason?: string
  renewal_count?: number
}

export interface EngagementProperties extends BaseEventProperties {
  insight_type?: 'performance' | 'audience' | 'recommendation' | 'alert' | 'opportunity'
  date_range_selected?: string
  date_range_type?: 'today' | 'yesterday' | '7days' | '30days' | 'custom'
  ad_account_id?: string
  field_updated?: string
  question_text?: string
}

/**
 * Custom hook for tracking events with PostHog
 * Automatically enriches events with user properties when available
 */
export const useTracking = () => {
  const { profile, isAuthenticated, isSubscribed, subscriptionTier, metaConnected, whatsappConnected } = useAuth()

  /**
   * Track a custom event
   */
  const trackEvent = useCallback(
    (eventName: string, properties?: BaseEventProperties) => {
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded yet')
        return
      }

      // Enrich event with user context if authenticated
      const enrichedProperties = {
        ...properties,
        // User status properties
        is_authenticated: isAuthenticated,
        is_subscribed: isSubscribed,
        subscription_tier: subscriptionTier,
        meta_connected: metaConnected,
        whatsapp_connected: whatsappConnected,
        // Add user email domain for segmentation
        email_domain: profile?.email ? profile.email.split('@')[1] : undefined,
      }

      posthog.capture(eventName, enrichedProperties)
    },
    [isAuthenticated, isSubscribed, subscriptionTier, metaConnected, whatsappConnected, profile]
  )

  /**
   * Track page view with optional properties
   */
  const trackPageView = useCallback(
    (pageName: string, properties?: PageViewProperties) => {
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded yet')
        return
      }

      posthog.capture('$pageview', {
        page_name: pageName,
        ...properties,
      })
    },
    []
  )

  /**
   * Identify user - call this after login/registration
   */
  const identifyUser = useCallback(
    (userId: string, userProperties?: Record<string, any>) => {
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded yet')
        return
      }

      posthog.identify(userId, {
        email: profile?.email,
        name: profile?.name,
        whatsapp: profile?.whatsapp,
        subscription_tier: subscriptionTier,
        meta_connected: metaConnected,
        whatsapp_connected: whatsappConnected,
        ...userProperties,
      })
    },
    [profile, subscriptionTier, metaConnected, whatsappConnected]
  )

  /**
   * Reset user - call this on logout
   */
  const resetUser = useCallback(() => {
    if (!posthog.__loaded) {
      console.warn('PostHog not loaded yet')
      return
    }

    posthog.reset()
  }, [])

  /**
   * Set user properties (for updates after identification)
   */
  const setUserProperties = useCallback((properties: Record<string, any>) => {
    if (!posthog.__loaded) {
      console.warn('PostHog not loaded yet')
      return
    }

    posthog.setPersonProperties(properties)
  }, [])

  /**
   * Track feature flag viewed
   */
  const trackFeatureFlag = useCallback((flagKey: string, flagValue: boolean | string) => {
    if (!posthog.__loaded) {
      console.warn('PostHog not loaded yet')
      return
    }

    posthog.capture('$feature_flag_called', {
      $feature_flag: flagKey,
      $feature_flag_response: flagValue,
    })
  }, [])

  return {
    trackEvent,
    trackPageView,
    identifyUser,
    resetUser,
    setUserProperties,
    trackFeatureFlag,
    posthog, // Expose posthog instance for advanced usage
  }
}
