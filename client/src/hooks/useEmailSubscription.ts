/**
 * Email Subscription Hook
 *
 * Manages email subscription form state and submission
 */

import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";

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
      await apiRequest('POST', '/api/subscribe', {
        email: emailInput,
        categories: ['daily-devotional', 'worship', 'testimony'],
      });

      setEmailSuccess(true);
      toast.success("You're subscribed! Check your email for confirmation.");
      setEmailInput('');
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
