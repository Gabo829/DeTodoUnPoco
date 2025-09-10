// favoritos.js

// 🔹 Cargar favoritos desde localStorage
function cargarFavoritos() {
  const listaFavoritos = document.getElementById("lista-favoritos");
  const vacio = document.getElementById("vacio");
  listaFavoritos.innerHTML = "";

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    vacio.style.display = "block";
    return;
  }

  vacio.style.display = "none";

  favoritos.forEach(id => {
    const producto = productos.find(p => p.id === id);

    if (producto) {
      const div = document.createElement("div");
      div.classList.add("producto");
      div.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h2>${producto.nombre}</h2>
        <p>$${producto.precio.toFixed(2)}</p>
        <button class="btn-eliminar" onclick="eliminarFavorito('${producto.id}')">Eliminar</button>
      `;
      listaFavoritos.appendChild(div);
    } else {
      console.warn("No se encontró producto con id:", id);
    }
  });
}

// 🔹 Eliminar de favoritos
function eliminarFavorito(id) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos = favoritos.filter(item => item !== id);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  cargarFavoritos();
}

// 🔹 Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarFavoritos);
