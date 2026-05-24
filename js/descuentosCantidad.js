const DESCUENTOS_CANTIDAD = [
    {
        productoId: 1,
        // Sin varianteIndex → aplica a TODAS las variantes
        fechaInicio: '2026-05-01',
        fechaFin: '2026-12-31',
        tramos: [
            { desde: 1, hasta: 9, precio: 160.00},
            { desde: 10, hasta: 999, precio: 150.00 },
        ]
    },
    {
        productoId: 2,
        fechaInicio: '2026-06-01',
        fechaFin: '2026-08-31',
        tramos: [
            { desde: 1, hasta: 9, precio: 12.50 },
            { desde: 10, hasta: 999, precio: 9.99 }
        ]
    },
    {
        productoId: 10,
        varianteIndex: 2,
        fechaInicio: '2026-05-01',
        fechaFin: '2026-12-31',
        tramos: [
            { desde: 1, hasta: 9, precio: 180.00 },
            { desde: 10, hasta: 999, precio: 170.00 },
        ]
    }
];

function obtenerDescuentoCantidad(productoId, varianteIndex) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar primero un descuento específico para esta variante
    let descuento = DESCUENTOS_CANTIDAD.find(d => {
        if (d.productoId !== productoId) return false;
        if (d.varianteIndex !== undefined && d.varianteIndex !== null) {
            return d.varianteIndex === varianteIndex;
        }
        return false;
    });

    if (descuento) {
        const inicio = new Date(descuento.fechaInicio + 'T00:00:00');
        const fin = new Date(descuento.fechaFin + 'T23:59:59');
        if (hoy >= inicio && hoy <= fin) return descuento;
    }

    // Si no hay específico, buscar uno general (varianteIndex undefined = aplica a todas)
    descuento = DESCUENTOS_CANTIDAD.find(d => {
        if (d.productoId !== productoId) return false;
        return d.varianteIndex === undefined;
    });

    if (descuento) {
        const inicio = new Date(descuento.fechaInicio + 'T00:00:00');
        const fin = new Date(descuento.fechaFin + 'T23:59:59');
        if (hoy >= inicio && hoy <= fin) return descuento;
    }

    return null;
}

function obtenerPrecioPorCantidad(descuento, cantidad) {
    if (!descuento) return null;
    const tramo = descuento.tramos.find(t => cantidad >= t.desde && cantidad <= t.hasta);
    return tramo ? tramo.precio : null;
}

function obtenerPrecioBase(producto, varianteIndex) {
    if (producto.variantes && varianteIndex !== undefined && varianteIndex !== null && producto.variantes[varianteIndex]) {
        return producto.variantes[varianteIndex].precio;
    }
    return producto.precio;
}

function productoTieneDescuentoCantidad(producto) {
    if (!producto.variantes || producto.variantes.length === 0) {
        return obtenerDescuentoCantidad(producto.id, undefined) !== null;
    }
    return producto.variantes.some((v, i) => {
        if (v.disponible === false) return false;
        return obtenerDescuentoCantidad(producto.id, i) !== null;
    });
}

function obtenerPrecioFinalCompleto(producto, varianteIndex, esTienda, cantidad = 1) {
    const precioBase = obtenerPrecioBase(producto, varianteIndex);

    if (!esTienda) return precioBase;

    // 1. Verificar descuento por cantidad (tiene prioridad sobre ofertas)
    const descuentoCantidad = obtenerDescuentoCantidad(producto.id, varianteIndex);
    if (descuentoCantidad) {
        const precioCantidad = obtenerPrecioPorCantidad(descuentoCantidad, cantidad);
        if (precioCantidad !== null && precioCantidad < precioBase) {
            return precioCantidad;
        }
    }

    // 2. Verificar oferta de variante
    let ofertaVariante = null;
    if (producto.variantes && varianteIndex !== undefined && varianteIndex !== null && producto.variantes[varianteIndex]) {
        ofertaVariante = producto.variantes[varianteIndex].oferta || null;
    }

    const oferta = obtenerOfertaVigente(producto.id, ofertaVariante);
    return calcularPrecioOferta(precioBase, oferta);
}

function obtenerInfoDescuentoCantidad(producto, varianteIndex = null) {
    // Si no tiene variantes
    if (!producto.variantes || producto.variantes.length === 0) {
        const d = obtenerDescuentoCantidad(producto.id, undefined);
        if (d && d.tramos.length > 1) {
            const primerTramo = d.tramos.find(t => t.desde > 1);
            if (primerTramo) {
                return `${primerTramo.desde}+ unid: $${primerTramo.precio.toFixed(2)} c/u`;
            }
        }
        return null;
    }

    // Si se especifica varianteIndex, buscar solo para esa
    if (varianteIndex !== null && varianteIndex !== undefined) {
        if (producto.variantes[varianteIndex] && producto.variantes[varianteIndex].disponible !== false) {
            const d = obtenerDescuentoCantidad(producto.id, varianteIndex);
            if (d && d.tramos.length > 1) {
                const primerTramo = d.tramos.find(t => t.desde > 1);
                if (primerTramo) {
                    return `${primerTramo.desde}+ unid: $${primerTramo.precio.toFixed(2)} c/u`;
                }
            }
        }
        return null;
    }

    // Si no se especifica, buscar en todas (para renderizado inicial)
    for (let i = 0; i < producto.variantes.length; i++) {
        if (producto.variantes[i].disponible === false) continue;
        const d = obtenerDescuentoCantidad(producto.id, i);
        if (d && d.tramos.length > 1) {
            const primerTramo = d.tramos.find(t => t.desde > 1);
            if (primerTramo) {
                return `${primerTramo.desde}+ unid: $${primerTramo.precio.toFixed(2)} c/u`;
            }
        }
    }
    return null;
}