export default function manifest() {
  return {
    name: "BidLive — বাংলাদেশের নিলাম বাজার",
    short_name: "BidLive",
    description: "Bangladesh's #1 online auction marketplace",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006a4e",
    lang: "bn",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
