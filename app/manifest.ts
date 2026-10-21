
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {

  return {

    id: "/",
    name: "Tarjetas Digitales",
    short_name: "Tarjetas",
    description: "Tarjetas digitales de contacto de nuestros vendedores",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#142b45",
    icons: [

      {
        src: "/Balsas.png",
        sizes: "192x192",
        type: "image/png",
      },

      {
        src: "/Balsas.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

