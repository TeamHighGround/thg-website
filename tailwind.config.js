/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts,scss}",
    ],
    theme: {
        extend: {
            colors: {
                thgGreen: "#AED4AC",
                thgDark: "#0a0d0a",
                thgGrey: "#0d110d"
            }
        },
    },
    plugins: [],
}