import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  author?: string;
  keywords?: string[];
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = "/icon-512.png",
  ogType = "website",
  publishedTime,
  author,
  keywords,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("Reawakened") ? title : `${title} | Reawakened`;
    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", description, true);
    
    if (ogImage) {
      setMeta("og:image", ogImage.startsWith("http") ? ogImage : window.location.origin + ogImage, true);
      setMeta("twitter:image", ogImage.startsWith("http") ? ogImage : window.location.origin + ogImage, true);
    }
    
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical.startsWith("http") ? canonical : window.location.origin + canonical;
      setMeta("og:url", link.href, true);
    }
    
    if (publishedTime) {
      setMeta("article:published_time", publishedTime, true);
    }
    
    if (author) {
      setMeta("author", author);
      setMeta("article:author", author, true);
    }
    
    if (keywords && keywords.length > 0) {
      setMeta("keywords", keywords.join(", "));
    }

    return () => {
      document.title = "Reawakened";
    };
  }, [title, description, canonical, ogImage, ogType, publishedTime, author, keywords]);

  return null;
}

interface JsonLdProps {
  type: "Organization" | "Article" | "Event" | "WebPage";
  data: Record<string, any>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-${type.toLowerCase()}`;
    
    const existingScript = document.getElementById(script.id);
    if (existingScript) {
      existingScript.remove();
    }
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    };
    
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    
    return () => {
      const toRemove = document.getElementById(script.id);
      if (toRemove) toRemove.remove();
    };
  }, [type, data]);

  return null;
}

export const organizationJsonLd = {
  name: "Reawakened",
  description: "A digital revival movement - Encounter Jesus, grow in discipleship, and engage in global outreach.",
  url: "https://reawakened.replit.app",
  logo: "https://reawakened.replit.app/icon-512.png",
  sameAs: [
    "https://www.instagram.com/reawakened",
    "https://www.youtube.com/@reawakened",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@reawakened.org",
  },
};
