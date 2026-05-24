const COMBOS = [
    {
        id: 201,
        nombre: "Aceo y Limpieza",
        descripcion: "Combo de Productos de Aceo y Limpieza. Jabones de Baño, Deterjente y Pasta Dental.",
        precioCombo: 2550.00,
        fechaInicio: '2026-05-01',
        fechaFin: '2026-08-31',
        productos: [
            { productoId: 1, varianteIndex: null, cantidad: 5 },
            { productoId: 4, varianteIndex: null, cantidad: 1 },
            { productoId: 6, varianteIndex: null, cantidad: 1 },
            { productoId: 10, varianteIndex: 0, cantidad: 2 },
            { productoId: 10, varianteIndex: 1, cantidad: 2 },
            { productoId: 10, varianteIndex: 2, cantidad: 2 }
        ]
    },
    {
        id: 202,
        nombre: "Cocina Italiana",
        descripcion: "Productos de Cocina Rápida. Spaghettis, Pomo de Aceite y Pasta de Tomate.",
        precioCombo: 2470.00,
        fechaInicio: '2026-05-01',
        fechaFin: '2026-07-15',
        productos: [
            { productoId: 2, varianteIndex: null, cantidad: 3 },
            { productoId: 5, varianteIndex: null, cantidad: 1 },
            { productoId: 7, varianteIndex: null, cantidad: 1 },
        ]
    }
];

// Verificar si un combo está vigente
function comboVigente(combo) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(combo.fechaInicio + 'T00:00:00');
    const fin = new Date(combo.fechaFin + 'T23:59:59');
    return hoy >= inicio && hoy <= fin;
}

// Verificar si un combo está disponible (todos sus productos disponibles)
function comboDisponible(combo) {
    return combo.productos.every(item => {
        const prod = PRODUCTOS.find(p => p.id === item.productoId);
        if (!prod) return false;

        if (!prod.variantes || prod.variantes.length === 0) {
            return prod.disponible;
        }

        const vIndex = item.varianteIndex !== null && item.varianteIndex !== undefined ? item.varianteIndex : 0;
        const variante = prod.variantes[vIndex];
        return variante && variante.disponible !== false;
    });
}

// Calcular precio original de un combo (suma de precios individuales)
function calcularPrecioOriginalCombo(combo) {
    return combo.productos.reduce((total, item) => {
        const prod = PRODUCTOS.find(p => p.id === item.productoId);
        if (!prod) return total;

        let precio = prod.precio;
        const vIndex = item.varianteIndex !== null && item.varianteIndex !== undefined ? item.varianteIndex : (prod.variantes && prod.variantes.length > 0 ? 0 : undefined);
        if (prod.variantes && vIndex !== undefined && prod.variantes[vIndex]) {
            precio = prod.variantes[vIndex].precio;
        }

        const oferta = obtenerOfertaVigente(prod.id, null);
        return total + (calcularPrecioOferta(precio, oferta) * item.cantidad);
    }, 0);
}

// Generar descripción automática si no hay descripción manual
function generarDescripcionCombo(combo) {
    return combo.productos.map(item => {
        const prod = PRODUCTOS.find(p => p.id === item.productoId);
        if (!prod) return '';
        const nombreVariante = obtenerNombreVariante(prod, item.varianteIndex);
        const nombreCompleto = nombreVariante ? `${prod.nombre} (${nombreVariante})` : prod.nombre;
        return `${item.cantidad}x ${nombreCompleto}`;
    }).join(' + ');
}

// Obtener descripción del combo (manual o automática)
function obtenerDescripcionCombo(combo) {
    return combo.descripcion || generarDescripcionCombo(combo);
}