/* carrito.js: vista del carrito con botones ➖ / ➕ y compra por WhatsApp */
function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('lista-carrito');
  const totalDiv = document.getElementById('total');
  if (!contenedor || !totalDiv) return;
  contenedor.innerHTML = "";

  let subtotal = 0;
  let totalItems = 0;

  carrito.forEach((producto, index) => {
    subtotal += producto.precio * producto.cantidad;
    totalItems += producto.cantidad;

    const div = document.createElement('div');
    div.classList.add('producto');
    div.innerHTML = `
      <div class="media-container">
        <img src="${producto.img}" alt="${producto.nombre}" loading="lazy" class="media">
        <button class="btn-eliminar-icon" onclick="eliminarCarrito(${index})" aria-label="Eliminar producto del carrito">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M9 3h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2h3V4a1 1 0 0 1 1-1zm-4 6h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9z"></path>
          </svg>
        </button>
      </div>
      <h2>${producto.nombre}</h2>
      <p>$${producto.precio}.00 x ${producto.cantidad} = $${producto.precio * producto.cantidad}.00</p>

      <div class="acciones">
        <button onclick="cambiarCantidad(${index}, -1)">➖</button>
        <span>${producto.cantidad}</span>
        <button onclick="cambiarCantidad(${index}, 1)">➕</button>
      </div>
    `;
    contenedor.appendChild(div);
  });

  // calcular descuento automático del 10% si hay 3 o más items (suma de cantidades)
  let descuento = 0;
  let total = subtotal;
  if (totalItems >= 3) {
    descuento = Math.round(subtotal * 0.10 * 100) / 100; // redondeo a 2 decimales
    total = Math.round((subtotal - descuento) * 100) / 100;
    totalDiv.innerHTML = `Subtotal: <span class="monto-subtotal">$${subtotal.toFixed(2)}</span> | Descuento 10%: <span class="monto-descuento">-$${descuento.toFixed(2)}</span> | Total: <span class="monto-total">$${total.toFixed(2)}</span>`;
  } else {
    totalDiv.innerHTML = `Total: <span class="monto-total">$${subtotal.toFixed(2)}</span>`;
  }

  // botón comprar (asegúrate que tu carrito.html tenga id="btn-comprar")
  const btnComprar = document.getElementById("btn-comprar");
  if (btnComprar) {
    btnComprar.onclick = () => {
      if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
      }
      // exponer carrito y total para el modal
      window.currentCart = carrito;
      window.currentTotal = total;
      openPaymentModal();
    };
  }

  // actualizar contador global
  if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
}

/* --- Funciones para el modal de pago (simulado) --- */
function openPaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  const amountSpan = document.getElementById('pay-amount');
  if (amountSpan && typeof window.currentTotal === 'number') amountSpan.textContent = `$${window.currentTotal.toFixed(2)}`;
  // Reset terms checkbox and disable pay buttons until accepted
  const chk = document.getElementById('accept-terms');
  if (chk) chk.checked = false;
  setPaymentButtonsDisabled(true);
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  const result = document.getElementById('payment-result'); if (result) result.textContent = '';
}

// manejadores iniciales para el modal (se ejecutan una vez)
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('payment-modal');
  if (!modal) return;
  // cerrar
  document.getElementById('payment-close').addEventListener('click', closePaymentModal);
  // checkbox términos
  const chk = document.getElementById('accept-terms');
  if (chk) {
    // inicialmente deshabilitar botones
    setPaymentButtonsDisabled(!chk.checked);
    chk.addEventListener('change', (e) => {
      setPaymentButtonsDisabled(!e.target.checked);
    });
  } else {
    // si no existe la casilla, mantener deshabilitado por defecto
    setPaymentButtonsDisabled(true);
  }
  // cambiar método
  const radios = document.querySelectorAll('input[name="metodo-pago"]');
  radios.forEach(r => r.addEventListener('change', () => {
    const val = document.querySelector('input[name="metodo-pago"]:checked').value;
    document.getElementById('form-card').style.display = val === 'card' ? 'block' : 'none';
    document.getElementById('form-transfer').style.display = val === 'transfer' ? 'block' : 'none';
  }));

  // botones de pago
  document.getElementById('pay-card').addEventListener('click', (e) => {
    e.preventDefault();
    processSimulatedPayment('card');
  });
  document.getElementById('confirm-transfer').addEventListener('click', (e) => {
    e.preventDefault();
    processSimulatedPayment('transfer');
  });
});

function processSimulatedPayment(method) {
  const result = document.getElementById('payment-result');
  if (!result) return;
  // validar aceptación de términos
  const chk = document.getElementById('accept-terms');
  if (chk && !chk.checked) {
    result.textContent = 'Debes aceptar los términos y condiciones antes de pagar.';
    return;
  }
  const total = (typeof window.currentTotal === 'number') ? window.currentTotal : 0;
  result.textContent = 'Procesando pago...';
  // flujo simulado: no hay integración externa aquí
  // simular respuesta asincrónica
  setTimeout(() => {
    if (method === 'transfer') {
        // preparar mensaje con los artículos del carrito y abrir WhatsApp
        const carrito = window.currentCart || JSON.parse(localStorage.getItem('carrito')) || [];
        let mensaje = "Hola, he realizado la transferencia.\n\nPedido:\n";
        carrito.forEach(p => {
          mensaje += `- ${p.nombre} x${p.cantidad} ($${(p.precio * p.cantidad).toFixed(2)})\n`;
        });
        mensaje += `\nTotal: $${total.toFixed(2)}\n\nPor favor confirmar. Gracias.`;
        const telefono = '593963210127';
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    } else {
      result.textContent = `Pago con tarjeta realizado: $${total.toFixed(2)}. Gracias.`;
    }
    // limpiar carrito local (simulación de compra completada)
    localStorage.removeItem('carrito');
    // actualizar vista y contador
    if (typeof cargarCarrito === 'function') cargarCarrito();
    if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
    // cerrar modal después de breve delay
    setTimeout(() => closePaymentModal(), 1200);
  }, 1000);
}

function setPaymentButtonsDisabled(isDisabled) {
  const ids = ['pay-card', 'confirm-transfer'];
  ids.forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.disabled = isDisabled;
    if (isDisabled) b.classList.add('disabled'); else b.classList.remove('disabled');
  });
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