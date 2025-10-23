"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function EmailTestButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        toast.error(data.error || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTestEmail}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? "Sending..." : "Test Email"}
    </Button>
  );
}






