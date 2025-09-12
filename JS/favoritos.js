function cargarFavoritos() {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  let contenedor = document.getElementById('lista-favoritos');
  let vacio = document.getElementById('vacio');
  contenedor.innerHTML = "";

  if (favoritos.length === 0) {
    vacio.style.display = "block";
    return;
  }
  vacio.style.display = "none";

  favoritos.forEach((producto, index) => {
    let div = document.createElement('div');
    div.classList.add('producto');
    div.innerHTML = `
      <img src="${producto.img}" alt="${producto.nombre}">
      <h2>${producto.nombre}</h2>
      <p>$${producto.precio}.00</p>
      
      <!-- Botón comprar directo por WhatsApp -->
      ${producto.precio > 0 ? `
        <a class="btn-wsp" 
           href="https://wa.me/593963210127?text=Hola! Quiero comprar el ${encodeURIComponent(producto.nombre)}" 
           target="_blank">Comprar</a>
        </a>
      ` : ""}
      
      <!-- Botón eliminar -->
      <div class="btn-eliminar" onclick="eliminarFavorito(${index})">🗑 Eliminar</div>
    `;
    contenedor.appendChild(div);
  });
}

function eliminarFavorito(index) {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  favoritos.splice(index, 1);
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  cargarFavoritos();
}

cargarFavoritos();