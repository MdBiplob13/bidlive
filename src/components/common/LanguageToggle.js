"use client";
import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      aria-label="Toggle language"
      className="gap-1.5 font-semibold"
    >
      <Languages className="size-4" />
      {locale === "bn" ? "বাংলা" : "EN"}
    </Button>
  );
}
