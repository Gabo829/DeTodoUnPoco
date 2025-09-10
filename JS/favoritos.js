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

// Cargar al iniciar
cargarFavoritos();
