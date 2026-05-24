const PRODUCTOS = [
    {
        id: 1,
        nombre: "Jabón de Baño - S&C",
        descripcion: "Jabon Natural de Violetas - 75g",
        precio: 160.00,
        imagen: "img/jabonV.jpg",
        categoria: "aceo",
        disponible: true
    },
    {
        id: 2,
        nombre: "Spaghetti",
        descripcion: "Paquete de Spaghetti - 500g",
        precio: 280.00,
        imagen: "img/spaghetti.jpg",
        categoria: "pastas",
        disponible: true
    },
    {
        id: 3,
        nombre: "Azúcar Blanca",
        descripcion: "Bolsa de Azúcar Blanca - 1Kg",
        precio: 770.00,
        imagen: "img/azucar.jpg",
        categoria: "cocina",
        disponible: false
    },
    {
        id: 4,
        nombre: "Pasta Dental",
        descripcion: "Pasta de Dientes Candado - 100g",
        precio: 350.00,
        imagen: "img/pastaC.jpg",
        categoria: "aceo",
        disponible: true
    },
    {
        id: 5,
        nombre: "Aceite",
        descripcion: "Pomo de Aceite - 900ml",
        precio: 1300.00,
        imagen: "img/aceite.jpg",
        categoria: "cocina",
        disponible: false
    },
    {
        id: 6,
        nombre: "Detergente - Rayan",
        descripcion: "Paquete de Detergente - 400g",
        precio: 450.00,
        imagen: "img/detergente.jpg",
        categoria: "aceo",
        disponible: false
    },
    {
        id: 7,
        nombre: "Pasta de Tomate - Rayan",
        descripcion: "Lata de Pasta de Tomate - 400g",
        precio: 450.00,
        imagen: "img/pastaTom.jpg",
        categoria: "cocina",
        disponible: false
    },
    {
        id: 8,
        nombre: "Café Molido",
        descripcion: "Café Casero Molido por Onza",
        precio: 60.00,
        imagen: "img/cafeM.jpg",
        categoria: "cocina",
        disponible: true
    },
    {
        id: 9,
        nombre: "Arroz",
        descripcion: "Bolsa de Arroz - 5Kg",
        precio: 1000.00,
        imagen: "img/arroz.jpg",
        categoria: "alimentos",
        disponible: false
    },
    {
        id: 10,
        nombre: "Jabón de Baño - Royal Lady",
        descripcion: "Jabón de Olor - 80g",
        precio: 180.00,
        imagen: "img/jabonNar.jpg",
        categoria: "aceo",
        disponible: true,
        variantes: [
            {
                nombre: "Naranja",
                imagen: "img/jabNar.jpg",
                precio: 180.00,
                disponible: true
            },
            {
                nombre: "Oliva",
                imagen: "img/jabOliv.jpg",
                precio: 180.00,
                disponible: true,
                oferta: {
                    tipo: 'fijo',
                    valor: 10,
                    fechaInicio: '2026-05-01',
                    fechaFin: '2026-06-30'
                }
            },
            {
                nombre: "Jasmín",
                imagen: "img/jabJasm.jpg",
                precio: 180.00,
                disponible: true
            }
        ]
    },
    {
        id: 11,
        nombre: "Pasta de Tomate - La Casona",
        descripcion: "Lata de Pasta de Tomate - 200g",
        precio: 250.00,
        imagen: "img/tomatCasona.jpg",
        categoria: "cocina",
        disponible: false
    },
];