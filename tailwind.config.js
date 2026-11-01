/** @type{import('tailwindcss').Config} */

export default{
    content:["./index.html","./src/**/*.{js,jsx}"],
    theme:{
        extend:{
            colors:{
                brand:{50:"#eef4ff", 100:"#dbe7ff", 600: "#1a5fe0", 700:"#1450c0"},
                ink:"#1a1a2e"
            },
            fontFamily:{sans:["Inter","ui-sans-serif","system-ui","sans-serif"]},
        },
    },
    plugins:[],
};