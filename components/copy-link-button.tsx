"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CopyLinkButtonProps {
  roomId: string;
}

// Компонент кнопки копирования ссылки на комнату
export function CopyLinkButton({ roomId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Сбрасываем состояние через 2 секунды
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy link
        </>
      )}
    </Button>
  );
}
