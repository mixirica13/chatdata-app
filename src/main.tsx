import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PostHogProvider } from "posthog-js/react";
import type { PostHog } from "posthog-js";

/**
 * Get Facebook Click ID (fbc) from URL parameter or cookie
 * Format: fb.1.{timestamp}.{fbclid}
 */
const getFacebookClickId = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");

    if (fbclid) {
        const timestamp = Date.now();
        const fbc = `fb.1.${timestamp}.${fbclid}`;
        // Store in cookie for persistence (90 days)
        const date = new Date();
        date.setTime(date.getTime() + 90 * 24 * 60 * 60 * 1000);
        document.cookie = `_fbc=${fbc};expires=${date.toUTCString()};path=/;SameSite=Lax`;
        return fbc;
    }

    // Try to get from existing _fbc cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "_fbc" && value) {
            return value;
        }
    }
    return null;
};

/**
 * Get Facebook Browser ID (fbp) from cookie
 */
const getFacebookBrowserId = (): string | null => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "_fbp" && value) {
            return value;
        }
    }
    return null;
};

const root = createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <PostHogProvider
            apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
            options={{
                api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
                defaults: "2025-05-24",
                capture_exceptions: true,
                debug: import.meta.env.MODE === "development",
                loaded: (posthog: PostHog) => {
                    // Capture Facebook attribution data
                    const fbc = getFacebookClickId();
                    const fbp = getFacebookBrowserId();

                    if (fbc) {
                        posthog.register({ $fb_fbc: fbc });
                        if (import.meta.env.MODE === "development") {
                            console.log("PostHog: Facebook Click ID captured:", fbc);
                        }
                    }

                    if (fbp) {
                        posthog.register({ $fb_fbp: fbp });
                        if (import.meta.env.MODE === "development") {
                            console.log("PostHog: Facebook Browser ID captured:", fbp);
                        }
                    }
                },
            }}
        >
            <App />
        </PostHogProvider>
    </React.StrictMode>
);