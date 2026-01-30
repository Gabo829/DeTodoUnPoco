/* carrito.js: vista del carrito con botones ➖ / ➕ y compra por WhatsApp */
function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('lista-carrito');
  const totalDiv = document.getElementById('total');
  if (!contenedor || !totalDiv) return;
  contenedor.innerHTML = "";

  let total = 0;

  carrito.forEach((producto, index) => {
    total += producto.precio * producto.cantidad;

    const div = document.createElement('div');
    div.classList.add('producto');
    div.innerHTML = `
      <img src="${producto.img}" alt="${producto.nombre}" loading="lazy">
      <h2>${producto.nombre}</h2>
      <p>$${producto.precio}.00 x ${producto.cantidad} = $${producto.precio * producto.cantidad}.00</p>

      <div class="acciones">
        <button onclick="cambiarCantidad(${index}, -1)">➖</button>
        <span>${producto.cantidad}</span>
        <button onclick="cambiarCantidad(${index}, 1)">➕</button>
      </div>

      <div class="btn-eliminar" onclick="eliminarCarrito(${index})">🗑 Eliminar</div>
    `;
    contenedor.appendChild(div);
  });

  totalDiv.textContent = "Total: $" + total + ".00";

  // botón comprar (asegúrate que tu carrito.html tenga id="btn-comprar")
  const btnComprar = document.getElementById("btn-comprar");
  if (btnComprar) {
    btnComprar.onclick = () => {
      if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
      }
      let mensaje = "Hola! Quiero comprar:\n\n";
      carrito.forEach(p => {
        mensaje += `- ${p.nombre} x${p.cantidad} ($${p.precio * p.cantidad})\n`;
      });
      mensaje += `\nTotal: $${total}.00`;
      window.open(`https://wa.me/593963210127?text=${encodeURIComponent(mensaje)}`, "_blank");
    };
  }

  // actualizar contador global
  if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
}

/* Cambiar cantidad por índice en el carrito (vista carrito) */
function cambiarCantidad(index, delta) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (!carrito[index]) return;
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  cargarCarrito();
  // refrescar otras vistas si existen
  if (typeof cargarFavoritos === "function") cargarFavoritos();
  const categoria = (typeof obtenerCategoriaActual === "function") ? obtenerCategoriaActual() : "";
  if (categoria && typeof generarProductos === "function") generarProductos(categoria);
}

/* Eliminar por índice */
function eliminarCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  cargarCarrito();
  if (typeof cargarFavoritos === "function") cargarFavoritos();
  const categoria = (typeof obtenerCategoriaActual === "function") ? obtenerCategoriaActual() : "";
  if (categoria && typeof generarProductos === "function") generarProductos(categoria);
}

/* inicializar */
document.addEventListener("DOMContentLoaded", cargarCarrito);