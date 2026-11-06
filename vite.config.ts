import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({base:"/project-2411/",plugins:[react(),tailwindcss()],build:{sourcemap:false}});