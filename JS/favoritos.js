/* favoritos.js: lista de favoritos con botones ➖ / ➕ sincronizados */
function cargarFavoritos() {
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('lista-favoritos');
  const vacio = document.getElementById('vacio');
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (favoritos.length === 0) {
    if (vacio) vacio.style.display = "block";
    return;
  }
  if (vacio) vacio.style.display = "none";

  favoritos.forEach((producto, index) => {
    const productoEnCarrito = carrito.find(p => p.nombre === producto.nombre);
    const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

    const div = document.createElement('div');
    div.classList.add('producto');
    div.innerHTML = `
      <div class="media-container">
        <img src="${producto.img}" alt="${producto.nombre}" loading="lazy" class="media">
        <button class="btn-eliminar-icon" onclick="eliminarFavorito(${index})" aria-label="Eliminar favorito">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M9 3h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2h3V4a1 1 0 0 1 1-1zm-4 6h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9z"></path>
          </svg>
        </button>
      </div>
      <h2>${producto.nombre}</h2>
      <p>$${producto.precio}.00</p>

      <div class="acciones">
        <button class="btn-restar" data-nombre="${producto.nombre}">➖</button>
        <span class="cantidad-display" data-nombre="${producto.nombre}">${cantidad}</span>
        <button class="btn-sumar" data-nombre="${producto.nombre}">➕</button>
      </div>
    `;
    contenedor.appendChild(div);
  });

  // Asignar eventos de suma/resta en favoritos (llama a cambiarCantidadPorNombre)
  document.querySelectorAll("#lista-favoritos .btn-sumar").forEach(btn => {
    btn.addEventListener("click", () => {
      const nombre = btn.getAttribute("data-nombre");
      cambiarCantidadPorNombre(nombre, 1);
    });
  });
  document.querySelectorAll("#lista-favoritos .btn-restar").forEach(btn => {
    btn.addEventListener("click", () => {
      const nombre = btn.getAttribute("data-nombre");
      cambiarCantidadPorNombre(nombre, -1);
    });
  });

  // actualizar contador
  if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
}

function eliminarFavorito(index) {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  favoritos.splice(index, 1);
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  cargarFavoritos();
}

/* Si quieres añadir desde favoritos a favoritos (toggle), usa este helper
   (se puede llamar desde catálogo también si quieres declarar favoritos ahí) */
function toggleFavoritoPorNombre(nombre) {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const producto = Object.values(productos).flat().find(p => p.nombre === nombre);
  if (!producto) return;
  const idx = favoritos.findIndex(f => f.nombre === nombre);
  if (idx !== -1) favoritos.splice(idx, 1);
  else favoritos.push(producto);
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  cargarFavoritos();
}

/* Inicializar */
document.addEventListener("DOMContentLoaded", cargarFavoritos);