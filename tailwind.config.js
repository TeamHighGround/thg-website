/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts,scss}",
    ],
    theme: {
        extend: {
            colors: {
                thgGreen: {
                    DEFAULT: "#AED4AC",
                    50: "#f6fdf6",
                    100: "#e8f7e7",
                    200: "#d4f0d2",
                    300: "#b8e5b5",
                    400: "#9dd99a",
                    500: "#AED4AC",
                    600: "#8bc188",
                    700: "#6ba968",
                    800: "#4f8a4d",
                    900: "#3d6b3b",
                    950: "#0d110d"
                },
                thgDark: "#0a0d0a",
            }
        },
    },
    plugins: [],
}