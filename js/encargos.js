const ENCARGOS = [
    {
        id: 101,
        nombre: "Ventilador Recargable",
        descripcion: "Con Bateria de Litio",
        precio: 22000.00,
        imagen: "img/ventiNar.jpg",
        categoria: "electrodomesticos",
        abierto: true,
        horario: {
            dias: [1, 2, 3],        // Lunes, Martes, Miércoles
            horaInicio: "00:00",
            horaFin: "23:59"
        },
        variantes: [
            {
                nombre: "Naranja",
                imagen: "img/ventiNar.jpg",
                precio: 22000.00,
                disponible: true
            },
            {
                nombre: "Azul",
                imagen: "img/ventiAzul.jpg",
                precio: 22000.00,
                disponible: true
            },
            {
                nombre: "Amarillo",
                imagen: "img/ventiAmar.jpg",
                precio: 22000.00,
                disponible: true
            },
            {
                nombre: "Negro",
                imagen: "img/VentiNeg.jpg",
                precio: 22000.00,
                disponible: true
            }
        ]
    },
    {
        id: 102,
        nombre: "Ventilador Recargable",
        descripcion: "Ventilador Recarg. con panel solar",
        precio: 20000.00,
        imagen: "img/ventiPanel.jpg",
        categoria: "electrodomesticos",
        abierto: true,
        horario: {
            dias: [1, 2, 3],
            horaInicio: "08:00",
            horaFin: "20:00"
        }
    },
    
    {
        id: 103,
        nombre: "Llavero personalizado",
        descripcion: "Llavero de cuero con inicial",
        precio: 7.99,
        imagen: "img/encargo4.jpg",
        categoria: "BBB ksld",
        abierto: true
    }
    
];