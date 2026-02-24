/* =====================================================
  productos.js
  - Definición de catálogo, generación de tarjetas y utilidades
  - Secciones: datos, generación UI, eventos, animaciones
  ===================================================== */

const productos = {
  perfumes: [
    { nombre: "Invictus Victory", precio: 30, img: "img/Perfumes 1.1 para Hombre/Invictus.jpeg" },
    { nombre: "Bad Boy", precio: 30, img: "img/Perfumes 1.1 para Hombre/Bad_Boy.jpeg" },
    { nombre: "Phantom Rabanne", precio: 30, img: "img/Perfumes 1.1 para Hombre/Phantom.jpeg" },
    { nombre: "212 Men", precio: 30, img: "img/Perfumes 1.1 para Hombre/212_Men.jpeg" },
    { nombre: "1 Million", precio: 30, img: "img/Perfumes 1.1 para Hombre/1_Million_Eau_de_Toilette.jpeg" },
    { nombre: "1 Million Privé", precio: 30, img: "img/Perfumes 1.1 para Hombre/1_Million_Privé.jpeg" },
    { nombre: "1 Million Royal", precio: 30, img: "img/Perfumes 1.1 para Hombre/1_Million_Royal.jpeg" },
    { nombre: "Montblanc Legend", precio: 30, img: "img/Perfumes 1.1 para Hombre/Montblanc_Legend.jpeg" },
    { nombre: "Montblanc Starwalker", precio: 30, img: "img/Perfumes 1.1 para Hombre/Montblanc_Starwalker.jpeg" },
    { nombre: "Polo Red", precio: 30, img: "img/Perfumes 1.1 para Hombre/Polo_Red.jpeg" },
    { nombre: "Polo Blue", precio: 30, img: "img/Perfumes 1.1 para Hombre/Polo_Blue.jpeg" },
    { nombre: "Dior Sauvage", precio: 30, img: "img/Perfumes 1.1 para Hombre/Dior_Sauvage.jpeg" },
    { nombre: "Hugo Boss", precio: 30, img: "img/Perfumes 1.1 para Hombre/Hugo_Boss_Red.jpeg" },
    { nombre: "Valentino Uomo", precio: 30, img: "img/Perfumes 1.1 para Hombre/Valentino_Uomo_Born_in_Roma.jpeg" },
    { nombre: "Lacoste L.12.12", precio: 30, img: "img/Perfumes 1.1 para Hombre/Lacoste_L.12.12_Blanc_Pure.jpeg" },
    { nombre: "Versace Eros", precio: 30, img: "img/Perfumes 1.1 para Hombre/Versace_Eros.jpeg" },
    { nombre: "Versace Pour Homme", precio: 30, img: "img/Perfumes 1.1 para Hombre/Versace_Pour_Homme.jpeg" },
    { nombre: "Versace Eros Flame", precio: 30, img: "img/Perfumes 1.1 para Hombre/Versace_Eros_Flame.jpeg" }
  ],
  tecnologia: [
    { nombre: "Airpods Pro 2", precio: 30, img: "img/Tecnologia/Airpods_2_Pro_1.1.jpeg" }
  ],
  relojes: [
    { nombre: "", img: "img/Relojes 1.1 para Hombre/Demostracion.mp4" },
    { nombre: "Rolex de Hombre 1", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_1.jpeg" },
    { nombre: "Rolex de Hombre 2", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_2.jpeg" },
    { nombre: "Rolex de Hombre 3", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_3.jpeg" },
    { nombre: "Rolex de Hombre 4", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_4.jpeg" },
    { nombre: "Rolex de Hombre 5", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_5.jpeg" },
    { nombre: "Rolex de Hombre 6", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_6.jpeg" },
    { nombre: "Rolex de Hombre 7", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_7.jpeg" },
    { nombre: "Rolex de Hombre 8", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_8.jpeg" },
    { nombre: "Rolex de Hombre 9", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_9.jpeg" },
    { nombre: "Rolex de Hombre 10", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_10.jpeg" },
    { nombre: "Rolex de Hombre 11", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_11.jpeg" },
    { nombre: "Rolex de Hombre 12", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_12.jpeg" },
    { nombre: "Rolex de Hombre 13", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_13.jpeg" },
    { nombre: "Rolex de Hombre 14", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_14.jpeg" },
    { nombre: "Rolex de Hombre 15", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_15.jpeg" },
    { nombre: "Rolex de Hombre 16", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_16.jpeg" },
    { nombre: "Rolex de Hombre 17", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_17.jpeg" },
    { nombre: "Rolex de Hombre 18", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_18.jpeg" },
    { nombre: "Rolex de Hombre 19", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_19.jpeg" },
    { nombre: "Rolex de Hombre 20", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_20.jpeg" },
    { nombre: "Rolex de Hombre 21", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_21.jpeg" },
    { nombre: "Rolex de Hombre 22", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_22.jpeg" },
    { nombre: "Rolex de Hombre 23", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_23.jpeg" },
    { nombre: "Rolex de Hombre 24", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_24.jpeg" },
    { nombre: "Rolex de Hombre 25", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_25.jpeg" },
    { nombre: "Rolex de Hombre 26", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_26.jpeg" },
    { nombre: "Rolex de Hombre 27", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_27.jpeg" },
    { nombre: "Rolex de Hombre 28", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_28.jpeg" },
    { nombre: "Rolex de Hombre 29", precio: 35, img: "img/Relojes 1.1 para Hombre/Rolex_29.jpeg" }
  ],
  edredones: [
    { nombre: "Edredon Tropical 1 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical1.jpeg" },
    { nombre: "Edredon Tropical 2 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical2.jpeg" },
    { nombre: "Edredon Tropical 3 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical3.jpeg" },
    { nombre: "Edredon Tropical 4 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical4.jpeg" },
    { nombre: "Edredon Tropical 5 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical5.jpeg" },
    { nombre: "Edredon Tropical 6 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical6.jpeg" },
    { nombre: "Edredon Tropical 7 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical7.jpeg" },
    { nombre: "Edredon Tropical 8 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical8.jpeg" },
    { nombre: "Edredon Tropical 9 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical9.jpeg" },
    { nombre: "Edredon Tropical 10 | 2 ½", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical10.jpeg" },
    { nombre: "Edredon llano Negro", precio: 30, img: "img/Edredones/Edredon_LLano_Negro.jpeg" },
    { nombre: "Edredon llano Beige", precio: 30, img: "img/Edredones/Edredon_LLano_Beige.jpeg" },
    { nombre: "Edredon llano Cyan", precio: 30, img: "img/Edredones/Edredon_LLano_Cyan.jpeg" },
    { nombre: "Edredon llano Azul", precio: 30, img: "img/Edredones/Edredon_LLano_Azul.jpeg" },
    { nombre: "Edredon llano Blanco", precio: 30, img: "img/Edredones/Edredon_LLano_Blanco.jpeg" },
    { nombre: "Edredon llano Blanco Hueso", precio: 30, img: "img/Edredones/Edredon_LLano_Blanco_Hueso.jpeg" },
    { nombre: "Edredon llano Celeste Claro", precio: 30, img: "img/Edredones/Edredon_LLano_Celeste_Claro.jpeg" },
    { nombre: "Edredon llano Gris", precio: 30, img: "img/Edredones/Edredon_LLano_Gris.jpeg" },
    { nombre: "Edredon llano Morado", precio: 30, img: "img/Edredones/Edredon_LLano_Morado.jpeg" },
    { nombre: "Edredon llano Morado Claro", precio: 30, img: "img/Edredones/Edredon_LLano_Morado_Claro.jpeg" },
    { nombre: "Edredon llano Rojo", precio: 30, img: "img/Edredones/Edredon_LLano_Rojo.jpeg" },
    { nombre: "Edredon llano Verde Claro", precio: 30, img: "img/Edredones/Edredon_LLano_Verde_Claro.jpeg" },
    { nombre: "Edredon Estampado 1", precio: 39, img: "img/Edredones/Edredon_Estampado1.jpeg" },
    { nombre: "Edredon Estampado 2", precio: 39, img: "img/Edredones/Edredon_Estampado2.jpeg" },
    { nombre: "Edredon Estampado 3", precio: 39, img: "img/Edredones/Edredon_Estampado3.jpeg" },
    { nombre: "Edredon Estampado 4", precio: 39, img: "img/Edredones/Edredon_Estampado4.jpeg" },
    { nombre: "Edredon Estampado 5", precio: 39, img: "img/Edredones/Edredon_Estampado5.jpeg" },
    { nombre: "Edredon Estampado 6", precio: 39, img: "img/Edredones/Edredon_Estampado6.jpeg" },
    { nombre: "Edredon Estampado 7", precio: 39, img: "img/Edredones/Edredon_Estampado7.jpeg" }
  ],
  carteras: [
    { nombre: "Coach Blanco", precio: 35, img: "img/Carteras 1.1/Coach_Blanco.jpeg" },
    { nombre: "Coach Negro", precio: 35, img: "img/Carteras 1.1/Coach_Negro.jpeg" },
    { nombre: "Coach de Cerezas", precio: 35, img: "img/Carteras 1.1/Coach_con_Diseño_de_Cerezas.jpeg" },
    { nombre: "Coach Nolita 1", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Blanco.jpeg" },
    { nombre: "Coach Nolita 2", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Cafe.jpeg" },
    { nombre: "Coach Nolita 3", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Gris.jpeg" },
    { nombre: "Coach Nolita 4", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Marron.jpeg" },
    { nombre: "Coach Nolita 5", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Negro.jpeg" },
    { nombre: "The Tote Bag", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag.jpeg" },
    { nombre: "The Tote Bag Snoopy 1", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Blanco1.jpeg" },
    { nombre: "The Tote Bag Snoopy 2", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Blanco2.jpeg" },
    { nombre: "The Tote Bag Snoopy 3", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Negro1.jpeg" },
    { nombre: "The Tote Bag Snoopy 4", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Negro2.jpeg" },
    { nombre: "The Tote Bag Snoopy 5", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Verde.jpeg" }
  ],
  sabanas: [
    { nombre: "Sabana con Estampado 1 | 2 ½", precio: 35, img: "img/Sabanas/Sabana_Estampado1.jpeg" },
    { nombre: "Sabana con Estampado 2 | 2 ½", precio: 35, img: "img/Sabanas/Sabana_Estampado2.jpeg" },
    { nombre: "Sabana con Estampado 3 | 2 ½", precio: 35, img: "img/Sabanas/Sabana_Estampado3.jpeg" },
    { nombre: "Sabana con Estampado 4 | 2 ½", precio: 35, img: "img/Sabanas/Sabana_Estampado4.jpeg" }
  ],
  rifas: [
    { nombre: "Rifa 2 - Rolex para Hombre", precio: 2, img: "img/Relojes 1.1 para Hombre/Rolex_1.jpeg" },
    { nombre: "Rifa 3 - Coach Negra", precio: 2, img: "img/Carteras 1.1/Coach_Negro.jpeg" }
  ],
  servicios: [
    {
      nombre: "Desarrollador Web",
      descripcion: "Creación y mantenimiento de sitios web personalizados.",
      img: "img/Servicios/Developer/Logo.jpeg",
      esServicio: true,
      whatsapp: "593963210127"
    },
    {
      nombre: "Mantenimiento Técnico",
      descripcion: "Limpieza y optimización de dispositivos electrónicos y computadoras.",
      img: "img/Servicios/Tecnico/Logo.jpeg",
        images: [
        "img/Servicios/Tecnico/Logo.jpeg",
        "img/Servicios/Tecnico/Mantenimiento_Tecnico_O1.jpg"
      ],
      esServicio: true,
      whatsapp: "593992816761"
    },
    {
      nombre: "MorenaMia",
      descripcion: "Postres de autor y tortas personalizadas. Diseños que roban miradas y sabores que crean momentos.",
      img: "img/Servicios/MorenaMia/Logo.jpeg",
        images: [
        "img/Servicios/MorenaMia/Logo.jpeg",
        "img/Servicios/MorenaMia/Torta_1.jpeg",
        "img/Servicios/MorenaMia/Torta_2.jpeg",
        "img/Servicios/MorenaMia/Torta_3.jpeg",
        "img/Servicios/MorenaMia/Torta_4.jpeg",
        "img/Servicios/MorenaMia/Torta_5.jpeg",
        "img/Servicios/MorenaMia/Torta_6.jpeg",
        "img/Servicios/MorenaMia/Torta_7.jpeg",
        "img/Servicios/MorenaMia/Torta_8.jpeg",
        "img/Servicios/MorenaMia/Torta_9.jpeg",
        "img/Servicios/MorenaMia/Torta_10.jpeg",
        "img/Servicios/MorenaMia/Torta_11.jpeg",
        "img/Servicios/MorenaMia/Mini_Torta_1.jpeg",
        "img/Servicios/MorenaMia/Mini_Torta_2.jpeg",
        "img/Servicios/MorenaMia/Mini_Torta_3.jpeg",
        "img/Servicios/MorenaMia/Cupcakes_1.jpeg",
        "img/Servicios/MorenaMia/Combo_1.jpeg",
      ],
      esServicio: true,
      whatsapp: "593968432543"
    },
    {
      nombre: "Envío Express",
      descripcion: "Entrega prioritaria el mismo día para zonas seleccionadas.",
      img: "img/Servicios/Rider/Envio_Express",
      esServicio: true,
      whatsapp: "593963210127"
    }
  ]
};

/* =====================================================
  Contador global en navbar
  - Actualiza el número visible en la barra superior
  ===================================================== */
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const span = document.getElementById("contador-carrito");
  if (span) span.textContent = totalItems > 0 ? `(${totalItems})` : "";
}

/* =====================================================
  Menú Dropdown "Más"
  - Controla la apertura/cierre del menú desplegable del nav
  ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const btnMas = document.getElementById('btnMas');
    const menuMas = document.getElementById('menuMas');
    const container = document.getElementById('navDropdown');

    if (btnMas && menuMas) {
        btnMas.addEventListener('click', (e) => {
            e.stopPropagation();
            menuMas.classList.toggle('show');
            container.classList.toggle('active');
        });

        window.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                menuMas.classList.remove('show');
                container.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                menuMas.classList.remove('show');
                container.classList.remove('active');
            }
        });
    }
});

/* =====================================================
  Generar catálogo
  - Renderiza productos/servicios según categoría y filtro
  ===================================================== */
function generarProductos(categoria, filtro = "") {
  const catalogo = document.querySelector(".catalogo");
  if (!catalogo || !productos[categoria]) return;
  catalogo.innerHTML = "";

  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  productos[categoria]
    .filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .forEach(p => {
      const esVideo = p.img.endsWith(".mp4");
      const div = document.createElement("div");
      div.classList.add("producto");

      // Si es un servicio, mostramos diseño especial
      if (p.esServicio) {
        div.classList.add("card-servicio");
        // carousel markup: arrows hidden by default (CSS will show on hover)
        const firstImg = (p.images && p.images.length) ? p.images[0] : p.img;
        const dataImages = p.images && p.images.length ? JSON.stringify(p.images) : JSON.stringify([p.img]);
        div.innerHTML = `
          <div class="media-container">
            <div class="carousel" data-images='${dataImages}' tabindex="0">
              <button class="carousel-arrow left" aria-label="Anterior">‹</button>
              <img src="${firstImg}" alt="${p.nombre}" loading="lazy" class="media carousel-img">
              <button class="carousel-arrow right" aria-label="Siguiente">›</button>
            </div>
          </div>
          <h2>${p.nombre}</h2>
          <p style="color:#ccc; font-size:0.9rem; padding:0 10px;">${p.descripcion}</p>
          <a href="#" class="btn-wsp" onclick="contactarServicio('${p.nombre}', '${p.whatsapp}')">Contratar</a>
        `;
      }
      // Si es producto normal
      else {
        if (esVideo) {
          // Mostrar video: forzar tamaño y hacer loop. Ajustar object-fit a cover
          // para que el video llene la tarjeta de forma similar a las imágenes.
          div.innerHTML = `
            <div class="media-container">
              <video controls autoplay muted playsinline loop class="media">
                <source src="${p.img}" type="video/mp4">
                Tu navegador no soporta el video.
              </video>
            </div>
            <h2 style="margin-top: 10px;">${p.nombre || "&nbsp;"}</h2>
          `;
        }
        else {
          const esFavorito = favoritos.some(fav => fav.nombre === p.nombre) ? "❤️" : "🤍";
          const productoEnCarrito = carrito.find(item => item.nombre === p.nombre);
          const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

          // Si el producto tiene varias imágenes, renderizamos un carrusel igual que en servicios
          if (p.images && p.images.length) {
            const firstImg = p.images[0];
            const dataImages = JSON.stringify(p.images);
            div.innerHTML = `
              <div class="media-container">
                <div class="carousel" data-images='${dataImages}' tabindex="0">
                  <button class="carousel-arrow left" aria-label="Anterior">‹</button>
                  <img src="${firstImg}" alt="${p.nombre}" loading="lazy" class="media carousel-img" data-nombre="${p.nombre}">
                  <button class="carousel-arrow right" aria-label="Siguiente">›</button>
                </div>
                <button type="button" class="btn-favorito" data-nombre="${p.nombre}">${esFavorito}</button>
              </div>
              <h2>${p.nombre}</h2>
              ${p.precio > 0 ? `<p>$${p.precio}.00</p>` : ""}
              <div class="acciones">
                <button type="button" class="btn-restar" data-nombre="${p.nombre}">➖</button>
                <span class="cantidad-display" data-nombre="${p.nombre}">${cantidad}</span>
                <button type="button" class="btn-sumar" data-nombre="${p.nombre}">➕</button>
              </div>
            `;
          } else {
            // Producto con imagen única
            div.innerHTML = `
              <div class="media-container">
                  <img src="${p.img}" alt="${p.nombre}" loading="lazy" class="media" data-nombre="${p.nombre}">
                  <button type="button" class="btn-favorito" data-nombre="${p.nombre}">${esFavorito}</button>
                </div>
              <h2>${p.nombre}</h2>
              ${p.precio > 0 ? `<p>$${p.precio}.00</p>` : ""}
              <div class="acciones">
                <button type="button" class="btn-restar" data-nombre="${p.nombre}">➖</button>
                <span class="cantidad-display" data-nombre="${p.nombre}">${cantidad}</span>
                <button type="button" class="btn-sumar" data-nombre="${p.nombre}">➕</button>
              </div>
            `;
          }
        }
      }
      catalogo.appendChild(div);
          // inicializar carrusel si existe
          const carousel = div.querySelector('.carousel');
          if (carousel) initCarousel(carousel);
    });

  asignarEventosFavoritos();
  asignarEventosAcciones();
  actualizarContadorCarrito();
}

/* =====================================================
  Animación: añadir al carrito
  - Clona la imagen y la anima hacia el ícono del carrito
  ===================================================== */
function animateAddToCart(nombre) {
  try {
     // Respeta la preferencia de reducir movimiento
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const img = document.querySelector(`img.media[data-nombre="${CSS.escape(nombre)}"]`);
    const cart = document.querySelector('.nav-carrito-link');
    if (!img || !cart) return;

    if (reduce) {
      // Animación reducida: solo rebote en el ícono
      cart.classList.add('cart-bounce');
      setTimeout(() => cart.classList.remove('cart-bounce'), 300);
      return;
    }

    const imgRect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const clone = img.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = 9999;
    clone.classList.add('fly-image');
    document.body.appendChild(clone);

    // ajustar duración y escala según ancho de pantalla
    const isSmall = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
    const duration = isSmall ? 450 : 700; // ms
    const scale = isSmall ? 0.16 : 0.2;
    clone.style.transition = `transform ${duration}ms cubic-bezier(0.2,0.8,0.2,1), opacity ${duration}ms`;

    const deltaX = cartRect.left + (cartRect.width/2) - (imgRect.left + (imgRect.width/2));
    const deltaY = cartRect.top + (cartRect.height/2) - (imgRect.top + (imgRect.height/2));

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
      clone.style.opacity = '0.6';
    });

    clone.addEventListener('transitionend', () => {
      clone.remove();
      // pequeño rebote en el ícono del carrito
      cart.classList.add('cart-bounce');
      setTimeout(() => cart.classList.remove('cart-bounce'), 300);
    }, { once: true });
  } catch (e) {
    // si falla, no interrumpir la experiencia
    console.warn('animateAddToCart error', e);
  }
}

/* =====================================================
  Eventos: favoritos
  - Toggle favoritos y almacenamiento local
  ===================================================== */
function asignarEventosFavoritos() {
  document.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const nombre = btn.getAttribute("data-nombre");
      let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      const producto = Object.values(productos).flat().find(p => p.nombre === nombre);
      const idx = favoritos.findIndex(fav => fav.nombre === nombre);

      if (idx !== -1) {
        favoritos.splice(idx, 1);
        btn.textContent = "🤍";
      } else if (producto) {
        favoritos.push(producto);
        btn.textContent = "❤️";
      }
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
      if (typeof cargarFavoritos === "function") cargarFavoritos();
    });
  });
}

/* ---------------------------
   Acciones (+ / -) en catálogo y favoritos
   --------------------------- */
function asignarEventosAcciones() {
  document.querySelectorAll(".btn-sumar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const nombre = btn.getAttribute("data-nombre");
      cambiarCantidadPorNombre(nombre, 1);
    });
  });

  document.querySelectorAll(".btn-restar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const nombre = btn.getAttribute("data-nombre");
      cambiarCantidadPorNombre(nombre, -1);
    });
  });
}

/* ---------------------------
   Buscar productos (filtro)
   --------------------------- */
function buscarProductos(categoria) {
  const input = document.getElementById("buscador");
  if (!input) return;

  input.addEventListener("input", () => {
    generarProductos(categoria, input.value);
  });
}

/* ---------------------------
   Inicializar carrusel simple
   --------------------------- */
function initCarousel(root) {
  try {
    const images = JSON.parse(root.getAttribute('data-images') || '[]');
    if (!images || !images.length) return;
    const imgEl = root.querySelector('.carousel-img');
    const btnPrev = root.querySelector('.carousel-arrow.left');
    const btnNext = root.querySelector('.carousel-arrow.right');
    root._ci = 0; // index

    function showIndex(i) {
      root._ci = (i + images.length) % images.length;
      if (imgEl) imgEl.src = images[root._ci];
    }

    // Ocultar flechas si sólo hay una imagen
    if (images.length <= 1) {
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
    } else {
      if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); showIndex(root._ci - 1); });
      if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); showIndex(root._ci + 1); });

      // keyboard support cuando está enfocado
      root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { showIndex(root._ci - 1); }
        if (e.key === 'ArrowRight') { showIndex(root._ci + 1); }
      });

      // swipe support (básico)
      let touchStartX = null;
      root.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
      root.addEventListener('touchend', (e) => {
        if (touchStartX == null) return;
        const dx = (e.changedTouches[0].clientX - touchStartX);
        if (Math.abs(dx) > 40) {
          if (dx < 0) showIndex(root._ci + 1); else showIndex(root._ci - 1);
        }
        touchStartX = null;
      });
    }
  } catch (err) {
    console.warn('initCarousel error', err);
  }
}

/* ---------------------------
   Cambiar cantidad por nombre
   --------------------------- */
function cambiarCantidadPorNombre(nombre, delta) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const idx = carrito.findIndex(p => p.nombre === nombre);

  if (idx !== -1) {
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
  } else if (delta > 0) {
    const producto = Object.values(productos).flat().find(p => p.nombre === nombre);
    if (!producto) return;
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();

  // animación solo cuando se agrega (delta > 0)
  if (delta > 0) animateAddToCart(nombre);

  const displays = document.querySelectorAll(`.cantidad-display[data-nombre="${nombre}"]`);
  displays.forEach(display => {
    const productoEnCarrito = carrito.find(p => p.nombre === nombre);
    display.textContent = productoEnCarrito ? productoEnCarrito.cantidad : 0;
  });

  if (typeof cargarFavoritos === "function") cargarFavoritos();
  if (typeof cargarCarrito === "function") cargarCarrito();
}

/* ---------------------------
   Utilidades
   --------------------------- */
function obtenerCategoriaActual() {
  const pagina = window.location.pathname.split("/").pop();
  if (pagina.includes("perfumes")) return "perfumes";
  if (pagina.includes("tecnologia")) return "tecnologia";
  if (pagina.includes("relojes")) return "relojes";
  if (pagina.includes("edredones")) return "edredones";
  if (pagina.includes("sabanas")) return "sabanas";
  if (pagina.includes("carteras")) return "carteras";
  if (pagina.includes("rifas")) return "rifas";
  if (pagina.includes("servicios")) return "servicios";
  return "";
}

/* ---------------------------
   Inicialización al cargar
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const categoria = obtenerCategoriaActual();
  if (categoria) {
    generarProductos(categoria);
    buscarProductos(categoria);
  }
  actualizarContadorCarrito();
});

/* ---------------------------
   Contactar servicio vía WhatsApp
   --------------------------- */
function contactarServicio(titulo, telefono) {
  const mensaje = `Hola, estoy interesado en contratar el servicio de: *${titulo}*. ¿Podrían darme más información?`;
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}