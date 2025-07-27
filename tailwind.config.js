/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts,scss}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3b82f6',
                    50: '#eff6ff',
                    500: '#3b82f6',
                    900: '#1e3a8a',
                },
            }
        },
    },
    plugins: [],
}