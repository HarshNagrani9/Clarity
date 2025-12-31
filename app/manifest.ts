import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Clarity | Productivity Dashboard",
        short_name: "Clarity",
        description: "All-in-one productivity tool for habits, goals, and tasks.",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#a3e635",
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
