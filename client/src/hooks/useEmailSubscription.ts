/**
 * Email Subscription Hook
 *
 * Manages email subscription form state and submission
 */

import { useState } from "react";
import { toast } from "sonner";

export function useEmailSubscription() {
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput || !emailInput.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setEmailSubmitting(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          categories: ['daily-devotional', 'worship', 'testimony'],
        }),
      });

      if (response.ok) {
        setEmailSuccess(true);
        toast.success("You're subscribed! Check your email for confirmation.");
        setEmailInput('');
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setEmailSubmitting(false);
    }
  };

  return {
    emailInput,
    setEmailInput,
    emailSubmitting,
    emailSuccess,
    handleEmailSubscribe,
  };
}
