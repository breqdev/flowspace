module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: false, // or 'media' or 'class'
    variants: {
        extend: {
            backgroundColor: ["disabled"],
            textColor: ["disabled"],
            cursor: ["disabled"]
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
}
