module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        container: {
            screens: {
                sm: "100%",
                md: "100%",
                lg: "1024px",
                xl: "1280px"
            }
        },
    },
    variants: {
        extend: {
            backgroundColor: ["disabled"]
        },
    },
    plugins: [],
}
