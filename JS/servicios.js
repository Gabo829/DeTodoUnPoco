const serviciosData = [
    {
        id: 1,
        titulo: "Mantenimiento Técnico",
        descripcion: "Limpieza y optimización de dispositivos electrónicos y computadoras.",
        img: "img/Servicios/Mantenimiento_Tecnico.jpg",
        whatsapp: "593963210127"
    },
    {
        id: 2,
        titulo: "Envío Express",
        descripcion: "Entrega prioritaria el mismo día para zonas seleccionadas.",
        img: "img/Servicios/Envio_Express",
        whatsapp: "593963210127"
    }
];

function cargarServicios() {
    const contenedor = document.getElementById('lista-servicios');
    if (!contenedor) return;

    contenedor.innerHTML = "";

    serviciosData.forEach(servicio => {
        const card = document.createElement('div');
        card.className = 'producto card-servicio';
        
        card.innerHTML = `
            <div class="servicio-img-container">
                <img src="${servicio.img}" alt="${servicio.titulo}" loading="lazy">
            </div>
            <div class="servicio-info">
                <h2>${servicio.titulo}</h2>
                <p>${servicio.descripcion}</p>
                <button class="btn-wsp" onclick="contactarServicio('${servicio.titulo}', ${servicio.precio}, '${servicio.whatsapp}')">
                    Contratar
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function contactarServicio(titulo, precio, telefono) {
    const mensaje = `Hola, estoy interesado en contratar el servicio de: *${titulo}*. ¿Podrían darme más información?`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
    cargarServicios();
    // Reutilizamos la función de actualizar contador si existe en productos.js
    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }
});