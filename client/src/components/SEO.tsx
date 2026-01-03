import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

export function SEO({
  title = "Reawakened",
  description = "A digital revival movement - Encounter Jesus, grow in discipleship, and engage in global outreach.",
  image = "/icon-512.png",
  url,
  type = "website",
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title === "Reawakened" ? title : `${title} | Reawakened`;
    
    document.title = fullTitle;

    const updateMeta = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (element) {
        element.content = content;
      } else {
        const meta = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          meta.setAttribute("property", property);
        } else {
          meta.setAttribute("name", property);
        }
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    updateMeta("description", description);
    updateMeta("og:title", fullTitle);
    updateMeta("og:description", description);
    updateMeta("og:type", type);
    if (url) updateMeta("og:url", url);
    if (image) updateMeta("og:image", image);
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    if (image) updateMeta("twitter:image", image);

    return () => {
      document.title = "Reawakened";
    };
  }, [title, description, image, url, type]);

  return null;
}
