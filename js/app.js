// ===== DOM =====
const listaProductos = document.getElementById('listaProductos');
const buscador = document.getElementById('buscador');
const btnClearBusqueda = document.getElementById('btnClearBusqueda');
const categoriasScroll = document.getElementById('categoriasScroll');
const contadorCarrito = document.getElementById('contadorCarrito');
const contadorEncargos = document.getElementById('contadorEncargos');

const bannerNovedades = document.getElementById('bannerNovedades');
const bannerNovedadesTexto = document.getElementById('bannerNovedadesTexto');
const btnCerrarBanner = document.getElementById('btnCerrarBanner');

const modalImg = document.getElementById('modalImg');
const imgAmpliada = document.getElementById('imgAmpliada');
const btnCerrarModalImg = document.getElementById('btnCerrarModalImg');

const modalPerfil = document.getElementById('modalPerfil');
const btnPerfil = document.getElementById('btnPerfil');
const btnCerrarPerfil = document.getElementById('btnCerrarPerfil');
const formPerfil = document.getElementById('formPerfil');
const perfilNombre = document.getElementById('perfilNombre');
const perfilTelefono = document.getElementById('perfilTelefono');

const modalCarrito = document.getElementById('modalCarrito');
const btnCarrito = document.getElementById('btnCarrito');
const btnCerrarCarrito = document.getElementById('btnCerrarCarrito');
const modalTituloCarrito = document.getElementById('modalTituloCarrito');
const carritoLista = document.getElementById('carritoLista');
const carritoFooter = document.getElementById('carritoFooter');
const carritoTotal = document.getElementById('carritoTotal');
const carritoAhorro = document.getElementById('carritoAhorro');
const carritoAhorroValor = document.getElementById('carritoAhorroValor');
const carritoDatosUsuario = document.getElementById('carritoDatosUsuario');
const btnEnviarWhatsApp = document.getElementById('btnEnviarWhatsApp');
const textoBotonEnvio = document.getElementById('textoBotonEnvio');
const btnVaciar = document.getElementById('btnVaciar');

const navTabs = document.getElementById('navTabs');
const toast = document.getElementById('toast');

// ===== ESTADO =====
let carrito = [];
let encargosLista = [];

try {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carritoGuardado.filter(item => item.clave && item.productoId);
    if (carrito.length !== carritoGuardado.length) localStorage.setItem('carrito', JSON.stringify(carrito));
} catch(e) { carrito = []; }

try {
    const encargosGuardados = JSON.parse(localStorage.getItem('encargosLista')) || [];
    encargosLista = encargosGuardados.filter(item => item.clave && item.productoId);
    if (encargosLista.length !== encargosGuardados.length) localStorage.setItem('encargosLista', JSON.stringify(encargosLista));
} catch(e) { encargosLista = []; }

let categoriaActiva = 'todas';
let busqueda = '';
let tabActivo = 'tienda';
let modalModo = 'carrito';

let idsNuevos = {
    productos: [],
    encargos: [],
    combos: [],
    ofertas: []
};

// ===== UTILIDADES =====
function guardarCarrito() { localStorage.setItem('carrito', JSON.stringify(carrito)); }
function guardarEncargos() { localStorage.setItem('encargosLista', JSON.stringify(encargosLista)); }

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('mostrar');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('mostrar'), 2000);
}

function formatearPrecio(num) {
    return '$' + num.toFixed(2).replace('.', ',');
}

function obtenerDatosPerfil() {
    return {
        nombre: localStorage.getItem('perfilNombre') || '',
        telefono: localStorage.getItem('perfilTelefono') || ''
    };
}

function guardarDatosPerfil(nombre, telefono) {
    localStorage.setItem('perfilNombre', nombre);
    localStorage.setItem('perfilTelefono', telefono);
}

function claveLinea(productoId, varianteIndex) {
    return varianteIndex !== undefined && varianteIndex !== null ? `${productoId}_${varianteIndex}` : `${productoId}`;
}

function obtenerProductoPorId(id, lista) {
    return lista.find(p => p.id === id);
}

function obtenerPrecioFinal(producto, varianteIndex, esTienda) {
    return obtenerPrecioFinalCompleto(producto, varianteIndex, esTienda, 1);
}

function obtenerNombreVariante(producto, varianteIndex) {
    if (producto.variantes && varianteIndex !== undefined && varianteIndex !== null && producto.variantes[varianteIndex]) {
        return producto.variantes[varianteIndex].nombre;
    }
    return null;
}

function obtenerImagenActual(producto, varianteIndex) {
    if (producto.variantes && varianteIndex !== undefined && varianteIndex !== null && producto.variantes[varianteIndex]) {
        return producto.variantes[varianteIndex].imagen;
    }
    return producto.imagen;
}

function varianteDisponible(producto, varianteIndex) {
    if (!producto.variantes || varianteIndex === undefined || varianteIndex === null) return true;
    const v = producto.variantes[varianteIndex];
    return v ? v.disponible !== false : true;
}

// ===== VERIFICAR HORARIO ENCARGOS =====
function encargoEnHorario(encargo) {
    if (!encargo.horario) return true;
    const ahora = new Date();
    const diaSemana = ahora.getDay();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const [hIniH, hIniM] = encargo.horario.horaInicio.split(':').map(Number);
    const [hFinH, hFinM] = encargo.horario.horaFin.split(':').map(Number);
    const minInicio = hIniH * 60 + hIniM;
    const minFin = hFinH * 60 + hFinM;
    return encargo.horario.dias.includes(diaSemana) && horaActual >= minInicio && horaActual <= minFin;
}

// ===== NOVEDADES =====
function novedadesVigentes() {
    const snapshot = JSON.parse(localStorage.getItem('snapshotNovedades') || '{}');
    if (!snapshot.fechaNovedades) return false;
    const horasTranscurridas = (Date.now() - snapshot.fechaNovedades) / (1000 * 60 * 60);
    return horasTranscurridas < 24;
}

function obtenerSnapshotActual() {
    return {
        productos: PRODUCTOS.map(p => p.id),
        encargos: ENCARGOS.map(e => e.id),
        combos: COMBOS.filter(c => comboVigente(c)).map(c => c.id),
        ofertas: PRODUCTOS.filter(p => productoEnOferta(p)).map(p => p.id)
    };
}

function detectarNovedades() {
    const actual = obtenerSnapshotActual();
    const anterior = JSON.parse(localStorage.getItem('snapshotNovedades') || '{}');

    idsNuevos.productos = actual.productos.filter(id => !(anterior.productos || []).includes(id));
    idsNuevos.encargos = actual.encargos.filter(id => !(anterior.encargos || []).includes(id));
    idsNuevos.combos = actual.combos.filter(id => !(anterior.combos || []).includes(id));
    idsNuevos.ofertas = actual.ofertas.filter(id => !(anterior.ofertas || []).includes(id));

    const hayNovedades = idsNuevos.productos.length > 0 || idsNuevos.encargos.length > 0 ||
                          idsNuevos.combos.length > 0 || idsNuevos.ofertas.length > 0;

    const snapshotConFecha = {
        ...actual,
        fechaNovedades: hayNovedades ? Date.now() : (anterior.fechaNovedades || null)
    };
    localStorage.setItem('snapshotNovedades', JSON.stringify(snapshotConFecha));

    return hayNovedades;
}

function mostrarBannerNovedades() {
    const partes = [];
    if (idsNuevos.productos.length > 0) partes.push(`${idsNuevos.productos.length} productos nuevos en la tienda`);
    if (idsNuevos.encargos.length > 0) partes.push(`${idsNuevos.encargos.length} encargos nuevos`);
    if (idsNuevos.combos.length > 0) partes.push(`${idsNuevos.combos.length} combos nuevos`);
    if (idsNuevos.ofertas.length > 0) partes.push(`nuevas ofertas`);

    if (partes.length === 0) return;

    const mensaje = '✨ ¡Novedades! ' + partes.join(', ') + '. ¡Échales un vistazo!';
    bannerNovedadesTexto.textContent = mensaje;
    bannerNovedades.style.display = 'flex';
}

btnCerrarBanner.addEventListener('click', () => {
    bannerNovedades.style.display = 'none';
});

// ===== NAVEGACIÓN TABS =====
navTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    tabActivo = tab.dataset.tab;
    categoriaActiva = 'todas';
    busqueda = '';
    buscador.value = '';
    btnClearBusqueda.classList.remove('visible');
    cargarCategorias();
    renderizarProductos();
});

// ===== CATEGORÍAS =====
function cargarCategorias() {
    categoriasScroll.innerHTML = '';

    if (tabActivo === 'tienda' || tabActivo === 'combos') {
        const chipOfertas = document.createElement('button');
        chipOfertas.className = 'cat-chip cat-chip-ofertas';
        if (categoriaActiva === 'ofertas') chipOfertas.classList.add('active');
        chipOfertas.dataset.categoria = 'ofertas';
        chipOfertas.innerHTML = '<i class="fa-solid fa-tag"></i> Ofertas';
        categoriasScroll.appendChild(chipOfertas);
    }

    const chipTodas = document.createElement('button');
    chipTodas.className = 'cat-chip';
    if (categoriaActiva === 'todas') chipTodas.classList.add('active');
    chipTodas.dataset.categoria = 'todas';
    chipTodas.textContent = 'Todas';
    categoriasScroll.appendChild(chipTodas);

    if (tabActivo === 'combos') return;

    const lista = tabActivo === 'tienda' ? PRODUCTOS : ENCARGOS;
    const categoriasSet = new Set(lista.map(p => p.categoria));
    categoriasSet.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = 'cat-chip';
        if (categoriaActiva === cat) chip.classList.add('active');
        chip.dataset.categoria = cat;
        chip.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoriasScroll.appendChild(chip);
    });
}

categoriasScroll.addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-chip')) {
        document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        categoriaActiva = e.target.dataset.categoria;
        renderizarProductos();
    }
});

// ===== BUSCADOR =====
buscador.addEventListener('input', () => {
    busqueda = buscador.value.trim().toLowerCase();
    btnClearBusqueda.classList.toggle('visible', !!busqueda);
    renderizarProductos();
});

btnClearBusqueda.addEventListener('click', () => {
    buscador.value = '';
    busqueda = '';
    btnClearBusqueda.classList.remove('visible');
    renderizarProductos();
    buscador.focus();
});

// ===== MENSAJE CONTEXTUAL VACÍO =====
function obtenerMensajeVacio() {
    if (busqueda) return 'No se encontraron resultados para tu búsqueda.';
    if (tabActivo === 'tienda') {
        if (categoriaActiva === 'ofertas') return 'No hay ofertas disponibles por ahora.';
        if (categoriaActiva !== 'todas') return `No hay productos en "${categoriaActiva}" por ahora.`;
        return 'No hay productos disponibles por ahora.';
    }
    if (tabActivo === 'encargos') {
        if (categoriaActiva !== 'todas') return `No hay encargos en "${categoriaActiva}" por ahora.`;
        return 'No hay encargos disponibles por ahora.';
    }
    if (tabActivo === 'combos') {
        return 'No hay combos disponibles por ahora.';
    }
    return 'No se encontraron productos.';
}

// ===== RENDERIZAR PRODUCTOS =====
function renderizarProductos() {
    if (tabActivo === 'combos') {
        renderizarCombos();
        return;
    }

    const lista = tabActivo === 'tienda' ? PRODUCTOS : ENCARGOS;
    let filtrados = lista;

    if (categoriaActiva === 'ofertas') {
        if (tabActivo === 'tienda') {
            filtrados = filtrados.filter(p => productoEnOferta(p));
        }
    } else if (categoriaActiva !== 'todas') {
        filtrados = filtrados.filter(p => p.categoria === categoriaActiva);
    }

    if (busqueda) {
        filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(busqueda));
    }

    if (filtrados.length === 0) {
        listaProductos.innerHTML = `<p class="sin-resultados">${obtenerMensajeVacio()}</p>`;
        return;
    }

    const badgesVigentes = novedadesVigentes();

    listaProductos.innerHTML = filtrados.map(p => {
        const esTienda = tabActivo === 'tienda';
        const tieneVariantes = p.variantes && p.variantes.length > 0;

        let varianteIndexDefault = 0;
        if (tieneVariantes) {
            const primeraDisponible = p.variantes.findIndex(v => v.disponible !== false);
            varianteIndexDefault = primeraDisponible >= 0 ? primeraDisponible : 0;
        }
        const varianteIndex = tieneVariantes ? varianteIndexDefault : undefined;
        const imagenActual = obtenerImagenActual(p, varianteIndex);
        const precioFinal = obtenerPrecioFinalCompleto(p, varianteIndex, esTienda, 1);

        let ofertaActual = null;
        const precioBase = obtenerPrecioBase(p, varianteIndex);
        if (esTienda && tieneVariantes && p.variantes[varianteIndexDefault] && p.variantes[varianteIndexDefault].oferta) {
            ofertaActual = obtenerOfertaVigente(p.id, p.variantes[varianteIndexDefault].oferta);
        } else if (esTienda && !tieneVariantes) {
            ofertaActual = obtenerOfertaVigente(p.id, null);
        }

        const descuentoCantidad = esTienda ? obtenerDescuentoCantidad(p.id, varianteIndexDefault) : null;
        const hayDescuentoCantidad = descuentoCantidad && obtenerPrecioPorCantidad(descuentoCantidad, 1) !== null && obtenerPrecioPorCantidad(descuentoCantidad, 1) < precioBase;
        const hayOferta = (ofertaActual && precioFinal < precioBase) || hayDescuentoCantidad;

        const esNuevo = badgesVigentes && (
            idsNuevos.productos.includes(p.id) ||
            (esTienda && hayOferta && idsNuevos.ofertas.includes(p.id))
        );
        const badgeNuevoHTML = esNuevo ? '<span class="badge-nuevo">Nuevo</span>' : '';

        let badgeSuperiorHTML = '';
        if (hayOferta) {
            if (hayDescuentoCantidad) {
                badgeSuperiorHTML = '<span class="badge-oferta">x cant</span>';
            } else if (ofertaActual) {
                const textoOferta = ofertaActual.tipo === 'porcentaje' ? `-${ofertaActual.valor}%` : `-$${ofertaActual.valor}`;
                badgeSuperiorHTML = `<span class="badge-oferta">${textoOferta}</span>`;
            }
        }

        let noDisponible = false;
        let badgeNoDispHTML = '';

        if (esTienda) {
            if (!p.disponible) {
                noDisponible = true;
                badgeNoDispHTML = '<span class="badge-agotado">Agotado</span>';
            } else if (tieneVariantes && !varianteDisponible(p, varianteIndexDefault)) {
                noDisponible = true;
                badgeNoDispHTML = '<span class="badge-agotado">Agotado</span>';
            }
        } else {
            if (!p.abierto || !encargoEnHorario(p)) {
                noDisponible = true;
                badgeNoDispHTML = '<span class="badge-encargo-cerrado">Cerrado</span>';
            } else if (tieneVariantes && !varianteDisponible(p, varianteIndexDefault)) {
                noDisponible = true;
                badgeNoDispHTML = '<span class="badge-encargo-cerrado">Cerrado</span>';
            }
        }

        const overlayClass = noDisponible ? ' agotado-overlay' : '';

        const precioHTML = hayOferta
            ? `<span class="precio-original">${formatearPrecio(precioBase)}</span>
               <span class="precio-actual">${formatearPrecio(precioFinal)}</span>
               <span class="ahorro">Ahorras ${formatearPrecio(precioBase - precioFinal)}</span>`
            : `<span class="precio-actual">${formatearPrecio(precioFinal)}</span>`;

        const infoDescuentoCantidad = obtenerInfoDescuentoCantidad(p, varianteIndexDefault);
        const descuentoCantidadHTML = infoDescuentoCantidad
            ? `<span class="descuento-cantidad-info"><i class="fa-solid fa-boxes-stacked"></i> ${infoDescuentoCantidad}</span>`
            : '';

        let selectorHTML = '';
        if (tieneVariantes) {
            selectorHTML = `
                <div class="variantes-selector" data-producto-id="${p.id}">
                    ${p.variantes.map((v, i) => {
                        const disp = v.disponible !== false;
                        return `
                            <span class="variante-chip${i === varianteIndexDefault ? ' active' : ''}${!disp ? ' agotada' : ''}"
                                  data-variante-index="${i}"
                                  data-precio="${v.precio}"
                                  data-imagen="${v.imagen}"
                                  data-disponible="${disp}"
                                  data-oferta='${JSON.stringify(v.oferta || null)}'>
                                ${v.nombre}
                            </span>
                        `;
                    }).join('')}
                </div>
            `;
        }

        let btnHTML = '';
        if (noDisponible) {
            const texto = esTienda ? 'Agotado' : 'Cerrado';
            btnHTML = `<button class="btn-accion agotado" disabled>${texto}</button>`;
        } else {
            const textoBoton = esTienda ? 'Agregar' : 'Encargar';
            btnHTML = `<button class="btn-accion" data-id="${p.id}" data-es-tienda="${esTienda}">${textoBoton}</button>`;
        }

        return `
            <div class="producto-card" data-producto-id="${p.id}">
                <div class="producto-img-wrapper${overlayClass}" data-img="${imagenActual}">
                    <img src="${imagenActual}" alt="${p.nombre}" loading="lazy">
                    ${badgeNoDispHTML}
                    ${badgeSuperiorHTML}
                    ${badgeNuevoHTML}
                </div>
                <div class="producto-info">
                    <span class="producto-nombre">${p.nombre}</span>
                    ${p.descripcion ? `<span class="producto-desc">${p.descripcion}</span>` : ''}
                    <div class="producto-precios">${precioHTML}</div>
                    ${descuentoCantidadHTML}
                    ${selectorHTML}
                    ${btnHTML}
                </div>
            </div>
        `;
    }).join('');

    bindearEventos();
}

// ===== RENDERIZAR COMBOS =====
function renderizarCombos() {
    let combosFiltrados = COMBOS.filter(c => comboVigente(c));

    if (busqueda) {
        combosFiltrados = combosFiltrados.filter(c =>
            c.nombre.toLowerCase().includes(busqueda) ||
            obtenerDescripcionCombo(c).toLowerCase().includes(busqueda)
        );
    }

    if (combosFiltrados.length === 0) {
        listaProductos.innerHTML = `<p class="sin-resultados">${obtenerMensajeVacio()}</p>`;
        return;
    }

    const badgesVigentes = novedadesVigentes();

    listaProductos.innerHTML = combosFiltrados.map(combo => {
        const disponible = comboDisponible(combo);
        const precioOriginal = calcularPrecioOriginalCombo(combo);
        const ahorro = precioOriginal - combo.precioCombo;
        const esNuevo = badgesVigentes && idsNuevos.combos.includes(combo.id);
        const descripcion = obtenerDescripcionCombo(combo);

        const miniaturasHTML = combo.productos.map(item => {
            const prod = PRODUCTOS.find(p => p.id === item.productoId);
            if (!prod) return '';
            const img = obtenerImagenActual(prod, item.varianteIndex);
            return `
                <span class="combo-mini-img-wrapper">
                    <img src="${img}" alt="${prod.nombre}" class="combo-mini-img">
                    ${item.cantidad > 1 ? `<span class="combo-mini-badge">x${item.cantidad}</span>` : ''}
                </span>
            `;
        }).join('');

        const btnHTML = disponible
            ? `<button class="btn-accion" data-combo-id="${combo.id}">Agregar combo</button>`
            : `<button class="btn-accion agotado" disabled>No disponible</button>`;

        return `
            <div class="combo-card">
                ${esNuevo ? '<span class="badge-nuevo">Nuevo</span>' : ''}
                <div class="combo-header">
                    <span class="combo-badge">COMBO</span>
                    <span class="combo-nombre">${combo.nombre}</span>
                </div>
                <span class="combo-desc">${descripcion}</span>
                <div class="combo-productos-mini">${miniaturasHTML}</div>
                <div class="combo-precios">
                    <span class="precio-original">${formatearPrecio(precioOriginal)}</span>
                    <span class="precio-actual">${formatearPrecio(combo.precioCombo)}</span>
                    <span class="ahorro">Ahorras ${formatearPrecio(ahorro)}</span>
                </div>
                <div class="combo-footer">${btnHTML}</div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.btn-accion[data-combo-id]').forEach(btn => {
        btn.onclick = function() {
            const comboId = parseInt(this.dataset.comboId);
            agregarComboAlCarrito(comboId);
        };
    });
}

// ===== AGREGAR COMBO AL CARRITO =====
let comboCounter = Date.now();

function agregarComboAlCarrito(comboId) {
    const combo = COMBOS.find(c => c.id === comboId);
    if (!combo || !comboDisponible(combo)) {
        mostrarToast('Combo no disponible');
        return;
    }

    const grupoId = 'combo_' + comboId + '_' + (comboCounter++);

    combo.productos.forEach(item => {
        const prod = PRODUCTOS.find(p => p.id === item.productoId);
        if (!prod) return;

        const vIndex = item.varianteIndex !== null ? item.varianteIndex : (prod.variantes && prod.variantes.length > 0 ? 0 : undefined);

        if (prod.variantes && vIndex !== undefined && !varianteDisponible(prod, vIndex)) return;
        if (!prod.disponible) return;

        const clave = claveLinea(item.productoId, vIndex);
        carrito.push({
            clave: clave,
            productoId: item.productoId,
            varianteIndex: vIndex !== undefined ? vIndex : null,
            cantidad: item.cantidad || 1,
            esTienda: true,
            comboId: grupoId,
            comboNombre: combo.nombre,
            precioComboIndividual: null
        });
    });

    guardarCarrito();
    actualizarContadores();
    mostrarToast('Combo agregado al carrito');
}

// ===== EVENTOS TARJETAS =====
function bindearEventos() {
    document.querySelectorAll('.producto-img-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG' || this.classList.contains('agotado-overlay')) {
                abrirModalImagen(this.dataset.img);
            }
        });
    });

    document.querySelectorAll('.variante-chip:not(.agotada)').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            const selector = this.parentElement;
            const card = selector.closest('.producto-card');
            const productoId = parseInt(selector.dataset.productoId);
            const varianteIndex = parseInt(this.dataset.varianteIndex);
            const nuevoPrecio = parseFloat(this.dataset.precio);
            const nuevaImagen = this.dataset.imagen;
            const ofertaData = this.dataset.oferta !== 'null' ? JSON.parse(this.dataset.oferta) : null;

            selector.querySelectorAll('.variante-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            const imgEl = card.querySelector('.producto-img-wrapper img');
            if (imgEl) {
                imgEl.style.opacity = '0';
                setTimeout(() => {
                    imgEl.src = nuevaImagen;
                    imgEl.style.opacity = '1';
                }, 150);
            }
            card.querySelector('.producto-img-wrapper').dataset.img = nuevaImagen;

            const descuentoCantidad = tabActivo === 'tienda' ? obtenerDescuentoCantidad(productoId, varianteIndex) : null;
            const oferta = obtenerOfertaVigente(productoId, ofertaData);
            let precioFinal = calcularPrecioOferta(nuevoPrecio, oferta);
            let hayDescuentoCantidad = false;

            if (descuentoCantidad) {
                const precioCantidad = obtenerPrecioPorCantidad(descuentoCantidad, 1);
                if (precioCantidad !== null && precioCantidad < nuevoPrecio) {
                    precioFinal = precioCantidad;
                    hayDescuentoCantidad = true;
                }
            }

            const hayOferta = (oferta && precioFinal < nuevoPrecio) || hayDescuentoCantidad;

            const preciosDiv = card.querySelector('.producto-precios');
            if (hayOferta) {
                const ahorro = nuevoPrecio - precioFinal;
                preciosDiv.innerHTML = `
                    <span class="precio-original">${formatearPrecio(nuevoPrecio)}</span>
                    <span class="precio-actual">${formatearPrecio(precioFinal)}</span>
                    <span class="ahorro">Ahorras ${formatearPrecio(ahorro)}</span>
                `;
            } else {
                preciosDiv.innerHTML = `<span class="precio-actual">${formatearPrecio(precioFinal)}</span>`;
            }

            const badgeOferta = card.querySelector('.badge-oferta');
            if (badgeOferta) badgeOferta.remove();
            if (hayOferta) {
                let textoOferta = '';
                if (hayDescuentoCantidad) {
                    textoOferta = 'x cant';
                } else if (oferta) {
                    textoOferta = oferta.tipo === 'porcentaje' ? `-${oferta.valor}%` : `-$${oferta.valor}`;
                }
                const badgeNuevo = card.querySelector('.badge-nuevo');
                if (badgeNuevo) {
                    badgeNuevo.insertAdjacentHTML('beforebegin', `<span class="badge-oferta">${textoOferta}</span>`);
                } else {
                    card.querySelector('.producto-img-wrapper').insertAdjacentHTML('beforeend', `<span class="badge-oferta">${textoOferta}</span>`);
                }
            }

            const lista = tabActivo === 'tienda' ? PRODUCTOS : ENCARGOS;
            const prod = obtenerProductoPorId(productoId, lista);
            const esTienda = tabActivo === 'tienda';

            let noDisponible = false;
            if (esTienda) {
                if (!prod.disponible || !varianteDisponible(prod, varianteIndex)) {
                    noDisponible = true;
                }
            } else {
                if (!prod.abierto || !encargoEnHorario(prod) || !varianteDisponible(prod, varianteIndex)) {
                    noDisponible = true;
                }
            }

            const wrapper = card.querySelector('.producto-img-wrapper');
            const badgeNoDisp = wrapper.querySelector('.badge-agotado, .badge-encargo-cerrado');
            if (badgeNoDisp) badgeNoDisp.remove();

            if (noDisponible) {
                wrapper.classList.add('agotado-overlay');
                const texto = esTienda ? 'Agotado' : 'Cerrado';
                const clase = esTienda ? 'badge-agotado' : 'badge-encargo-cerrado';
                wrapper.insertAdjacentHTML('beforeend', `<span class="${clase}">${texto}</span>`);
            } else {
                wrapper.classList.remove('agotado-overlay');
            }

            const btnAccion = card.querySelector('.btn-accion');
            if (btnAccion) {
                if (noDisponible) {
                    btnAccion.className = 'btn-accion agotado';
                    btnAccion.disabled = true;
                    btnAccion.textContent = esTienda ? 'Agotado' : 'Cerrado';
                } else {
                    btnAccion.className = 'btn-accion';
                    btnAccion.disabled = false;
                    btnAccion.textContent = esTienda ? 'Agregar' : 'Encargar';
                    btnAccion.dataset.id = productoId;
                    btnAccion.dataset.esTienda = esTienda;
                    btnAccion.onclick = function() {
                        agregarAlCarrito(productoId, varianteIndex, esTienda);
                    };
                }
            }

            const descCantInfo = card.querySelector('.descuento-cantidad-info');
            if (descCantInfo) descCantInfo.remove();
            if (esTienda) {
                const prodActual = obtenerProductoPorId(productoId, PRODUCTOS);
                if (prodActual) {
                    const infoDesc = obtenerInfoDescuentoCantidad(prodActual, varianteIndex);
                    if (infoDesc) {
                        const preciosDivActual = card.querySelector('.producto-precios');
                        preciosDivActual.insertAdjacentHTML('afterend', `<span class="descuento-cantidad-info"><i class="fa-solid fa-boxes-stacked"></i> ${infoDesc}</span>`);
                    }
                }
            }
        });
    });

    document.querySelectorAll('.btn-accion:not(.agotado):not(.cerrado)').forEach(btn => {
        if (btn.dataset.comboId) return;
        btn.onclick = function() {
            const id = parseInt(this.dataset.id);
            const esTienda = this.dataset.esTienda === 'true';
            const card = this.closest('.producto-card');
            const varianteChipActivo = card ? card.querySelector('.variante-chip.active') : null;
            const varianteIndex = varianteChipActivo ? parseInt(varianteChipActivo.dataset.varianteIndex) : undefined;
            agregarAlCarrito(id, varianteIndex, esTienda);
        };
    });
}

// ===== MODAL IMAGEN =====
function abrirModalImagen(src) {
    imgAmpliada.src = src;
    modalImg.classList.add('activo');
    document.body.style.overflow = 'hidden';
}
function cerrarModalImagen() {
    modalImg.classList.remove('activo');
    document.body.style.overflow = '';
}
btnCerrarModalImg.addEventListener('click', cerrarModalImagen);
modalImg.addEventListener('click', function(e) { if (e.target === modalImg) cerrarModalImagen(); });

// ===== AGREGAR AL CARRITO / ENCARGOS =====
function agregarAlCarrito(productoId, varianteIndex, esTienda) {
    const lista = esTienda ? PRODUCTOS : ENCARGOS;
    const producto = obtenerProductoPorId(productoId, lista);
    if (!producto) return;

    if (esTienda) {
        if (!producto.disponible) { mostrarToast('Producto agotado'); return; }
        if (!varianteDisponible(producto, varianteIndex)) { mostrarToast('Variante agotada'); return; }
    } else {
        if (!producto.abierto || !encargoEnHorario(producto)) { mostrarToast('Encargo cerrado'); return; }
        if (!varianteDisponible(producto, varianteIndex)) { mostrarToast('Variante no disponible'); return; }
    }

    const almacen = esTienda ? carrito : encargosLista;
    const clave = claveLinea(productoId, varianteIndex);
    const itemExistente = almacen.find(item => item.clave === clave && !item.comboId);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        almacen.push({
            clave: clave,
            productoId: productoId,
            varianteIndex: varianteIndex !== undefined ? varianteIndex : null,
            cantidad: 1,
            esTienda: esTienda,
            comboId: null,
            comboNombre: null
        });
    }

    if (esTienda) {
        guardarCarrito();
        mostrarToast('Agregado al carrito');
    } else {
        guardarEncargos();
        mostrarToast('Añadido a encargos');
    }
    actualizarContadores();
}

function eliminarDelCarrito(clave) {
    const item = carrito.find(i => i.clave === clave) || encargosLista.find(i => i.clave === clave);
    const esTienda = item ? item.esTienda : true;
    if (esTienda) {
        carrito = carrito.filter(i => i.clave !== clave);
        guardarCarrito();
    } else {
        encargosLista = encargosLista.filter(i => i.clave !== clave);
        guardarEncargos();
    }
    actualizarContadores();
    renderizarCarrito();
}

function eliminarCombo(grupoId) {
    carrito = carrito.filter(i => i.comboId !== grupoId);
    guardarCarrito();
    actualizarContadores();
    renderizarCarrito();
    mostrarToast('Combo eliminado');
}

function cambiarCantidad(clave, delta) {
    const esCarrito = carrito.some(i => i.clave === clave);
    const almacen = esCarrito ? carrito : encargosLista;
    const item = almacen.find(i => i.clave === clave);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        if (item.comboId) {
            eliminarCombo(item.comboId);
        } else {
            eliminarDelCarrito(clave);
        }
        return;
    }
    if (esCarrito) guardarCarrito();
    else guardarEncargos();
    actualizarContadores();
    renderizarCarrito();
}

function vaciarLista() {
    if (modalModo === 'carrito') {
        carrito = [];
        guardarCarrito();
    } else {
        encargosLista = [];
        guardarEncargos();
    }
    actualizarContadores();
    renderizarCarrito();
    mostrarToast(modalModo === 'carrito' ? 'Carrito vaciado' : 'Encargos vaciados');
}

function actualizarContadores() {
    const totalCarrito = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    contadorCarrito.textContent = totalCarrito;
    contadorCarrito.style.display = totalCarrito > 0 ? 'flex' : 'none';

    const totalEncargos = encargosLista.reduce((sum, i) => sum + i.cantidad, 0);
    contadorEncargos.textContent = totalEncargos;
    contadorEncargos.style.display = totalEncargos > 0 ? 'flex' : 'none';
    contadorEncargosModal.textContent = totalEncargos;
    contadorEncargosModal.style.display = totalEncargos > 0 ? 'flex' : 'none';
}

function calcularTotales(listaItems) {
    let totalOriginal = 0;
    let totalFinal = 0;

    const cantidades = {};
    listaItems.forEach(item => {
        if (!item.esTienda || item.comboId) return;
        const claveCantidad = item.productoId + '_' + (item.varianteIndex !== null ? item.varianteIndex : '');
        cantidades[claveCantidad] = (cantidades[claveCantidad] || 0) + item.cantidad;
    });

    listaItems.forEach(item => {
        const listaOrigen = item.esTienda ? PRODUCTOS : ENCARGOS;
        const prod = obtenerProductoPorId(item.productoId, listaOrigen);
        if (!prod) return;

        const precioBase = obtenerPrecioBase(prod, item.varianteIndex);
        totalOriginal += precioBase * item.cantidad;

        if (item.comboId) {
            totalFinal += 0;
        } else {
            const claveCantidad = item.productoId + '_' + (item.varianteIndex !== null ? item.varianteIndex : '');
            const cantidadTotal = cantidades[claveCantidad] || item.cantidad;
            const precioIndividual = obtenerPrecioFinalCompleto(prod, item.varianteIndex, item.esTienda, cantidadTotal);
            totalFinal += precioIndividual * item.cantidad;
        }
    });

    const gruposCombo = {};
    listaItems.forEach(item => {
        if (item.comboId) {
            if (!gruposCombo[item.comboId]) {
                gruposCombo[item.comboId] = { items: [] };
            }
            gruposCombo[item.comboId].items.push(item);
        }
    });

    Object.keys(gruposCombo).forEach(grupoId => {
        const grupo = gruposCombo[grupoId];
        const primerItem = grupo.items[0];
        const combo = COMBOS.find(c => c.nombre === primerItem.comboNombre);
        if (combo) {
            totalFinal += combo.precioCombo;
            totalOriginal += calcularPrecioOriginalCombo(combo);
        }
    });

    return {
        totalFinal: Math.round(totalFinal * 100) / 100,
        totalOriginal: Math.round(totalOriginal * 100) / 100,
        ahorro: Math.round((totalOriginal - totalFinal) * 100) / 100
    };
}

// ===== RENDERIZAR CARRITO / ENCARGOS EN MODAL =====
function abrirModalLista(modo) {
    modalModo = modo;
    renderizarCarrito();
    modalCarrito.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

btnCarrito.addEventListener('click', () => abrirModalLista('carrito'));

const btnEncargosHeader = document.createElement('button');
btnEncargosHeader.className = 'icon-btn';
btnEncargosHeader.id = 'btnEncargosModal';
btnEncargosHeader.setAttribute('aria-label', 'Encargos');
btnEncargosHeader.innerHTML = '<i class="fa-solid fa-box-open"></i><span class="contador-encargos" id="contadorEncargosModal">0</span>';
document.querySelector('.header-icons').insertBefore(btnEncargosHeader, btnCarrito);

const contadorEncargosModal = document.getElementById('contadorEncargosModal');
btnEncargosHeader.addEventListener('click', () => abrirModalLista('encargos'));

function renderizarCarrito() {
    const listaItems = modalModo === 'carrito' ? carrito : encargosLista;
    const tituloIcono = modalModo === 'carrito'
        ? '<i class="fa-solid fa-bag-shopping"></i> Tu carrito'
        : '<i class="fa-solid fa-box-open"></i> Tus encargos';
    modalTituloCarrito.innerHTML = tituloIcono;
    textoBotonEnvio.textContent = modalModo === 'carrito'
        ? 'Enviar pedido por WhatsApp'
        : 'Enviar encargo por WhatsApp';

    if (listaItems.length === 0) {
        carritoLista.innerHTML = '<p class="carrito-vacio">No hay nada aquí.</p>';
        carritoFooter.style.display = 'none';
        btnVaciar.style.display = 'none';
    } else {
        const gruposCombo = {};
        const itemsSueltos = [];

        listaItems.forEach(item => {
            if (item.comboId) {
                if (!gruposCombo[item.comboId]) gruposCombo[item.comboId] = [];
                gruposCombo[item.comboId].push(item);
            } else {
                itemsSueltos.push(item);
            }
        });

        let html = '';

        Object.keys(gruposCombo).forEach(grupoId => {
            const items = gruposCombo[grupoId];
            const primerItem = items[0];
            const combo = COMBOS.find(c => c.nombre === primerItem.comboNombre);
            const precioOriginalCombo = combo ? calcularPrecioOriginalCombo(combo) : 0;
            const precioCombo = combo ? combo.precioCombo : 0;
            const ahorroCombo = precioOriginalCombo - precioCombo;
            const descripcionCombo = combo ? obtenerDescripcionCombo(combo) : '';

            const miniaturasHTML = items.map(item => {
                const prod = PRODUCTOS.find(p => p.id === item.productoId);
                if (!prod) return '';
                const img = obtenerImagenActual(prod, item.varianteIndex);
                return `
                    <span class="combo-mini-img-wrapper">
                        <img src="${img}" alt="${prod.nombre}" class="combo-mini-img">
                        ${item.cantidad > 1 ? `<span class="combo-mini-badge">x${item.cantidad}</span>` : ''}
                    </span>
                `;
            }).join('');

            html += `
                <div class="combo-grupo">
                    <div class="combo-grupo-header">
                        <span class="combo-grupo-titulo">
                            <i class="fa-solid fa-gift"></i> ${primerItem.comboNombre}
                        </span>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span class="combo-grupo-ahorro">Ahorras ${formatearPrecio(ahorroCombo)}</span>
                            <button class="combo-grupo-eliminar" onclick="eliminarCombo('${grupoId}')" title="Eliminar combo">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;padding:4px 10px;flex-wrap:wrap;">${miniaturasHTML}</div>
                    ${descripcionCombo ? `<div style="padding:0 10px 4px;font-size:0.7rem;color:var(--texto-claro);">${descripcionCombo}</div>` : ''}
                    <div class="combo-grupo-productos">
                        ${items.map(item => {
                            const prod = PRODUCTOS.find(p => p.id === item.productoId);
                            if (!prod) return '';
                            const nombreVariante = obtenerNombreVariante(prod, item.varianteIndex);
                            return `
                                <div class="carrito-item" style="border-bottom:none;padding:4px 0;">
                                    <div class="carrito-item-info">
                                        <span class="carrito-item-nombre">${prod.nombre}</span>
                                        ${nombreVariante ? `<span class="carrito-item-variante">${nombreVariante}</span>` : ''}
                                    </div>
                                    <span style="font-size:0.78rem;color:var(--texto-claro);">x${item.cantidad}</span>
                                </div>
                            `;
                        }).join('')}
                        <div style="text-align:right;font-weight:700;color:var(--verde);font-size:0.85rem;padding:4px 0;">
                            Precio combo: ${formatearPrecio(precioCombo)}
                        </div>
                    </div>
                </div>
            `;
        });

        itemsSueltos.forEach(item => {
            const listaOrigen = item.esTienda ? PRODUCTOS : ENCARGOS;
            const prod = obtenerProductoPorId(item.productoId, listaOrigen);
            if (!prod) return;

            const claveCantidad = item.productoId + '_' + (item.varianteIndex !== null ? item.varianteIndex : '');
            const cantidadTotal = listaItems
                .filter(i => !i.comboId && i.productoId === item.productoId && i.varianteIndex === item.varianteIndex)
                .reduce((sum, i) => sum + i.cantidad, 0);
            const precio = obtenerPrecioFinalCompleto(prod, item.varianteIndex, item.esTienda, cantidadTotal);
            const nombreVariante = obtenerNombreVariante(prod, item.varianteIndex);
            const imagen = obtenerImagenActual(prod, item.varianteIndex);

            html += `
                <div class="carrito-item">
                    <img src="${imagen}" alt="${prod.nombre}" class="carrito-item-img">
                    <div class="carrito-item-info">
                        <span class="carrito-item-nombre">${prod.nombre}</span>
                        ${nombreVariante ? `<span class="carrito-item-variante">${nombreVariante}</span>` : ''}
                        <span class="carrito-item-precio">${formatearPrecio(precio)} c/u</span>
                        <div class="carrito-cantidad">
                            <button onclick="cambiarCantidad('${item.clave}', -1)">−</button>
                            <span>${item.cantidad}</span>
                            <button onclick="cambiarCantidad('${item.clave}', 1)">+</button>
                        </div>
                    </div>
                    <button class="carrito-item-eliminar" onclick="eliminarDelCarrito('${item.clave}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });

        carritoLista.innerHTML = html;
        carritoFooter.style.display = 'block';
        btnVaciar.style.display = 'block';

        const totales = calcularTotales(listaItems);
        carritoTotal.textContent = formatearPrecio(totales.totalFinal);

        if (totales.ahorro > 0) {
            carritoAhorro.style.display = 'flex';
            carritoAhorroValor.textContent = formatearPrecio(totales.ahorro);
        } else {
            carritoAhorro.style.display = 'none';
        }

        const datos = obtenerDatosPerfil();
        if (datos.nombre && datos.telefono) {
            carritoDatosUsuario.innerHTML = `
                <div class="datos-guardados">
                    <p><strong>Cliente:</strong> ${datos.nombre}</p>
                    <p><strong>Teléfono:</strong> ${datos.telefono}</p>
                    <span class="editar-perfil-link" id="editarDesdeCarrito">
                        <i class="fa-solid fa-pen"></i> Editar en perfil
                    </span>
                </div>
            `;
            document.getElementById('editarDesdeCarrito').addEventListener('click', () => {
                cerrarModalLista();
                abrirModalPerfil();
            });
        } else {
            carritoDatosUsuario.innerHTML = `
                <p style="font-size:0.8rem;color:var(--texto-claro);margin-bottom:6px;">
                    <i class="fa-solid fa-circle-info"></i> Tus datos solo se usarán para contactarte sobre tu pedido.
                </p>
                <input type="text" id="tempNombre" placeholder="Tu nombre *" required>
                <input type="tel" id="tempTelefono" placeholder="612345678 *" required>
            `;
        }
    }
}

// ===== ENVIAR WHATSAPP =====
btnEnviarWhatsApp.addEventListener('click', () => {
    const listaItems = modalModo === 'carrito' ? carrito : encargosLista;
    if (listaItems.length === 0) {
        mostrarToast('No hay nada que enviar');
        return;
    }

    let nombre, telefono;
    const datos = obtenerDatosPerfil();
    if (datos.nombre && datos.telefono) {
        nombre = datos.nombre;
        telefono = datos.telefono;
    } else {
        const tempNombre = document.getElementById('tempNombre');
        const tempTelefono = document.getElementById('tempTelefono');
        if (!tempNombre || !tempTelefono || !tempNombre.value.trim() || !tempTelefono.value.trim()) {
            mostrarToast('Por favor, completa nombre y teléfono');
            return;
        }
        nombre = tempNombre.value.trim();
        telefono = tempTelefono.value.trim();
        guardarDatosPerfil(nombre, telefono);
    }

    const ahora = new Date();
    const fechaStr = ahora.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const titulo = modalModo === 'carrito' ? 'Nuevo Pedido' : 'Nueva Solicitud de Encargo';

    let mensaje = `**${titulo}**\n`;
    mensaje += `-------------------------\n`;
    mensaje += `**Fecha:** ${fechaStr} - ${horaStr}\n`;
    mensaje += `**Cliente:** ${nombre}\n`;
    mensaje += `**Teléfono:** ${telefono}\n`;
    mensaje += `-------------------------\n`;
    mensaje += `**Productos:**\n`;

    const gruposCombo = {};
    const itemsSueltos = [];

    listaItems.forEach(item => {
        if (item.comboId) {
            if (!gruposCombo[item.comboId]) gruposCombo[item.comboId] = [];
            gruposCombo[item.comboId].push(item);
        } else {
            itemsSueltos.push(item);
        }
    });

    Object.keys(gruposCombo).forEach(grupoId => {
        const items = gruposCombo[grupoId];
        const primerItem = items[0];
        const combo = COMBOS.find(c => c.nombre === primerItem.comboNombre);
        const precioCombo = combo ? combo.precioCombo : 0;
        const descripcionCombo = combo ? obtenerDescripcionCombo(combo) : '';
        mensaje += `\n*${primerItem.comboNombre}*\n`;
        if (descripcionCombo) mensaje += `  ${descripcionCombo}\n`;
        items.forEach(item => {
            const prod = PRODUCTOS.find(p => p.id === item.productoId);
            if (!prod) return;
            const nombreVariante = obtenerNombreVariante(prod, item.varianteIndex);
            const nombreCompleto = nombreVariante ? `${prod.nombre} - ${nombreVariante}` : prod.nombre;
            mensaje += `  - ${nombreCompleto} (x${item.cantidad})\n`;
        });
        mensaje += `  *Precio combo: ${formatearPrecio(precioCombo)}*\n`;
    });

    itemsSueltos.forEach(item => {
        const listaOrigen = item.esTienda ? PRODUCTOS : ENCARGOS;
        const prod = obtenerProductoPorId(item.productoId, listaOrigen);
        if (!prod) return;
        const claveCantidad = item.productoId + '_' + (item.varianteIndex !== null ? item.varianteIndex : '');
        const cantidadTotal = listaItems
            .filter(i => !i.comboId && i.productoId === item.productoId && i.varianteIndex === item.varianteIndex)
            .reduce((sum, i) => sum + i.cantidad, 0);
        const precio = obtenerPrecioFinalCompleto(prod, item.varianteIndex, item.esTienda, cantidadTotal);
        const nombreVariante = obtenerNombreVariante(prod, item.varianteIndex);
        const nombreCompleto = nombreVariante ? `${prod.nombre} - ${nombreVariante}` : prod.nombre;
        mensaje += `- ${nombreCompleto} (x${item.cantidad}) - ${formatearPrecio(precio)} c/u\n`;
    });

    const totales = calcularTotales(listaItems);
    mensaje += `-------------------------\n`;
    mensaje += `**TOTAL: ${formatearPrecio(totales.totalFinal)}**\n`;
    if (totales.ahorro > 0) {
        mensaje += `**Ahorras: ${formatearPrecio(totales.ahorro)}**\n`;
    }

    const mensajeEncoded = encodeURIComponent(mensaje);
    const numeroWhatsApp = '5356502201'; // ← CAMBIA POR TU NÚMERO
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensajeEncoded}`;
    window.open(url, '_blank');

    // Vaciar carrito/encargos después de enviar
    if (modalModo === 'carrito') {
        carrito = [];
        guardarCarrito();
    } else {
        encargosLista = [];
        guardarEncargos();
    }
    actualizarContadores();
    renderizarCarrito();
    mostrarToast(modalModo === 'carrito' ? 'Pedido enviado' : 'Encargo enviado');
});

// ===== VACIAR =====
btnVaciar.addEventListener('click', vaciarLista);

// ===== MODALES =====
function cerrarModalLista() {
    modalCarrito.classList.remove('activo');
    document.body.style.overflow = '';
}
btnCerrarCarrito.addEventListener('click', cerrarModalLista);
modalCarrito.addEventListener('click', function(e) { if (e.target === modalCarrito) cerrarModalLista(); });

function abrirModalPerfil() {
    const datos = obtenerDatosPerfil();
    perfilNombre.value = datos.nombre || '';
    perfilTelefono.value = datos.telefono || '';
    modalPerfil.classList.add('activo');
    document.body.style.overflow = 'hidden';
}
function cerrarModalPerfil() {
    modalPerfil.classList.remove('activo');
    document.body.style.overflow = '';
}
btnPerfil.addEventListener('click', abrirModalPerfil);
btnCerrarPerfil.addEventListener('click', cerrarModalPerfil);
modalPerfil.addEventListener('click', function(e) { if (e.target === modalPerfil) cerrarModalPerfil(); });

formPerfil.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = perfilNombre.value.trim();
    const telefono = perfilTelefono.value.trim();
    if (!nombre || !telefono) {
        mostrarToast('Completa todos los campos');
        return;
    }
    guardarDatosPerfil(nombre, telefono);
    cerrarModalPerfil();
    mostrarToast('Perfil guardado');
});

// ===== CIERRE CON ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModalImagen();
        cerrarModalLista();
        cerrarModalPerfil();
    }
});

// ===== INICIALIZACIÓN =====
function init() {
    const hayNovedades = detectarNovedades();
    cargarCategorias();
    renderizarProductos();
    actualizarContadores();
    contadorCarrito.style.display = carrito.length > 0 ? 'flex' : 'none';
    contadorEncargos.style.display = encargosLista.length > 0 ? 'flex' : 'none';
    contadorEncargosModal.style.display = encargosLista.length > 0 ? 'flex' : 'none';

    if (hayNovedades) {
        setTimeout(() => mostrarBannerNovedades(), 500);
    }
}
init();
