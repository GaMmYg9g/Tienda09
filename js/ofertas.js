// Ofertas globales (para productos sin variantes o como capa base)
const OFERTAS = [
    {
    }
];

function obtenerOfertaVigente(productoId, ofertaVariante = null) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Si la variante tiene su propia oferta, tiene prioridad
    if (ofertaVariante) {
        const inicio = new Date(ofertaVariante.fechaInicio + 'T00:00:00');
        const fin = new Date(ofertaVariante.fechaFin + 'T23:59:59');
        if (hoy >= inicio && hoy <= fin) {
            return ofertaVariante;
        }
        return null;
    }

    // Oferta global
    const oferta = OFERTAS.find(o => o.productoId === productoId);
    if (!oferta) return null;

    const inicio = new Date(oferta.fechaInicio + 'T00:00:00');
    const fin = new Date(oferta.fechaFin + 'T23:59:59');

    if (hoy >= inicio && hoy <= fin) return oferta;
    return null;
}

function calcularPrecioOferta(precioOriginal, oferta) {
    if (!oferta) return precioOriginal;
    if (oferta.tipo === 'porcentaje') {
        const descuento = precioOriginal * (oferta.valor / 100);
        return Math.round((precioOriginal - descuento) * 100) / 100;
    } else if (oferta.tipo === 'fijo') {
        const resultado = precioOriginal - oferta.valor;
        return resultado < 0 ? 0 : Math.round(resultado * 100) / 100;
    }
    return precioOriginal;
}

// Verificar si un producto está en oferta (para filtro de "Ofertas")
function productoEnOferta(producto) {
    // Verificar descuentos por cantidad primero
    if (productoTieneDescuentoCantidad(producto)) return true;

    // Producto sin variantes
    if (!producto.variantes || producto.variantes.length === 0) {
        return obtenerOfertaVigente(producto.id) !== null;
    }
    // Producto con variantes: al menos una variante disponible con oferta vigente
    return producto.variantes.some(v => {
        if (v.disponible === false) return false;
        return obtenerOfertaVigente(producto.id, v.oferta || null) !== null;
    });
}