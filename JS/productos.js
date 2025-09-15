const productos = {
  perfumes: [
    {nombre: "Invictus Victory", precio: 30, img: "img/Perfumes 1.1/Invictus.jpeg"},
    {nombre: "Bad Boy", precio: 30, img: "img/Perfumes 1.1/Bad_Boy.jpeg"},
    {nombre: "Phantom Rabanne", precio: 30, img: "img/Perfumes 1.1/Phantom.jpeg"},
    {nombre: "212 Men", precio: 30, img: "img/Perfumes 1.1/212_Men.jpeg"},
    {nombre: "1 Million", precio: 30, img: "img/Perfumes 1.1/1_Million_Eau_de_Toilette.jpeg"},
    {nombre: "1 Million Privé", precio: 30, img: "img/Perfumes 1.1/1_Million_Privé.jpeg"},
    {nombre: "1 Million Royal", precio: 30, img: "img/Perfumes 1.1/1_Million_Royal.jpeg"},
    {nombre: "Montblanc Legend", precio: 30, img: "img/Perfumes 1.1/Montblanc_Legend.jpeg"},
    {nombre: "Montblanc Starwalker", precio: 30, img: "img/Perfumes 1.1/Montblanc_Starwalker.jpeg"},
    {nombre: "Polo Red", precio: 30, img: "img/Perfumes 1.1/Polo_Red.jpeg"},
    {nombre: "Polo Blue", precio: 30, img: "img/Perfumes 1.1/Polo_Blue.jpeg"},
    {nombre: "Dior Sauvage", precio: 30, img: "img/Perfumes 1.1/Dior_Sauvage.jpeg"},
    {nombre: "Hugo Boss", precio: 30, img: "img/Perfumes 1.1/Hugo_Boss_Red.jpeg"},
    {nombre: "Valentino Uomo", precio: 30, img: "img/Perfumes 1.1/Valentino_Uomo_Born_in_Roma.jpeg"},
    {nombre: "Lacoste L.12.12", precio: 30, img: "img/Perfumes 1.1/Lacoste_L.12.12_Blanc_Pure.jpeg"},
    {nombre: "Versace Eros", precio: 30, img: "img/Perfumes 1.1/Versace_Eros.jpeg"},
    {nombre: "Versace Pour Homme", precio: 30, img: "img/Perfumes 1.1/Versace_Pour_Homme.jpeg"},
    {nombre: "Versace Eros Flame", precio: 30, img: "img/Perfumes 1.1/Versace_Eros_Flame.jpeg"}
  ],
  relojes: [
    {nombre: "Rolex Dorado", precio: 30, img: "img/Relojes 1.1/Reloj_D.jpeg"},
    {nombre: "Rolex Plateado con Dorado", precio: 30, img: "img/Relojes 1.1/Reloj_P_con_D.jpeg"},
    {nombre: "Rolex Plateado", precio: 30, img: "img/Relojes 1.1/Reloj_P.jpeg"}
  ],
  edredones: [
    {nombre: "Edredon de 2 Plazas Tropical 1", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical1.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 2", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical2.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 3", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical3.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 4", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical4.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 5", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical5.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 6", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical6.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 7", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical7.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 8", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical8.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 9", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical9.jpeg"},
    {nombre: "Edredon de 2 Plazas Tropical 10", precio: 20, img: "img/Edredones/Edredon_de_2_Plazas_Tropical10.jpeg"},

    {nombre: "Edredon llano Negro", precio: 30, img: "img/Edredones/Edredon_LLano_Negro.jpeg"},
    {nombre: "Edredon llano Beige", precio: 30, img: "img/Edredones/Edredon_LLano_Beige.jpeg"},
    {nombre: "Edredon llano Cyan", precio: 30, img: "img/Edredones/Edredon_LLano_Cyan.jpeg"},
    {nombre: "Edredon llano Azul", precio: 30, img: "img/Edredones/Edredon_LLano_Azul.jpeg"},
    {nombre: "Edredon llano Blanco", precio: 30, img: "img/Edredones/Edredon_LLano_Blanco.jpeg"},
    {nombre: "Edredon llano Blanco Hueso", precio: 30, img: "img/Edredones/Edredon_LLano_Blanco_Hueso.jpeg"},
    {nombre: "Edredon llano Celeste Claro", precio: 30, img: "img/Edredones/Edredon_LLano_Celeste_Claro.jpeg"},
    {nombre: "Edredon llano Gris", precio: 30, img: "img/Edredones/Edredon_LLano_Gris.jpeg"},
    {nombre: "Edredon llano Morado", precio: 30, img: "img/Edredones/Edredon_LLano_Morado.jpeg"},
    {nombre: "Edredon llano Morado Claro", precio: 30, img: "img/Edredones/Edredon_LLano_Morado_Claro.jpeg"},
    {nombre: "Edredon llano Rojo", precio: 30, img: "img/Edredones/Edredon_LLano_Rojo.jpeg"},
    {nombre: "Edredon llano Verde Claro", precio: 30, img: "img/Edredones/Edredon_LLano_Verde_Claro.jpeg"},

    {nombre: "Edredon Estampado 1", precio: 39, img: "img/Edredones/Edredon_Estampado1.jpeg"},
    {nombre: "Edredon Estampado 2", precio: 39, img: "img/Edredones/Edredon_Estampado2.jpeg"},
    {nombre: "Edredon Estampado 3", precio: 39, img: "img/Edredones/Edredon_Estampado3.jpeg"},
    {nombre: "Edredon Estampado 4", precio: 39, img: "img/Edredones/Edredon_Estampado4.jpeg"},
    {nombre: "Edredon Estampado 5", precio: 39, img: "img/Edredones/Edredon_Estampado5.jpeg"},
    {nombre: "Edredon Estampado 6", precio: 39, img: "img/Edredones/Edredon_Estampado6.jpeg"},
    {nombre: "Edredon Estampado 7", precio: 39, img: "img/Edredones/Edredon_Estampado7.jpeg"},
  ],
  carteras: [
    {nombre: "Coach Blanco", precio: 35, img: "img/Carteras 1.1/Coach_Blanco.jpeg"},
    {nombre: "Coach Negro", precio: 35, img: "img/Carteras 1.1/Coach_Negro.jpeg"},
    {nombre: "Coach de Cerezas", precio: 35, img: "img/Carteras 1.1/Coach_con_Diseño_de_Cerezas.jpeg"},
    {nombre: "Coach Nolita 1", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Blanco.jpeg"},
    {nombre: "Coach Nolita 2", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Cafe.jpeg"},
    {nombre: "Coach Nolita 3", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Gris.jpeg"},
    {nombre: "Coach Nolita 4", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Marron.jpeg"},
    {nombre: "Coach Nolita 5", precio: 35, img: "img/Carteras 1.1/Coach_Nolita_Negro.jpeg"},

    {nombre: "The Tote Bag", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag.jpeg"},
    {nombre: "The Tote Bag Snoopy 1", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Blanco1.jpeg"},
    {nombre: "The Tote Bag Snoopy 2", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Blanco2.jpeg"},
    {nombre: "The Tote Bag Snoopy 3", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Negro1.jpeg"},
    {nombre: "The Tote Bag Snoopy 4", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Negro2.jpeg"},
    {nombre: "The Tote Bag Snoopy 5", precio: 35, img: "img/Carteras 1.1/The_Tote_Bag_Snoopy_Verde.jpeg"},
  ],
  sabanas: [
    {nombre: "Sabana con Estampado 1", precio: 35, img: "img/Sabanas/Sabana_Estampado1.jpeg"},
    {nombre: "Sabana con Estampado 2", precio: 35, img: "img/Sabanas/Sabana_Estampado2.jpeg"},
    {nombre: "Sabana con Estampado 3", precio: 35, img: "img/Sabanas/Sabana_Estampado3.jpeg"},
    {nombre: "Sabana con Estampado 4", precio: 35, img: "img/Sabanas/Sabana_Estampado4.jpeg"}
  ]
};

// Función para generar productos
function generarProductos(categoria) {
  const catalogo = document.querySelector(".catalogo");
  catalogo.innerHTML = "";

  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  productos[categoria].forEach(p => {
    const div = document.createElement("div");
    div.classList.add("producto");

    const esFavorito = favoritos.some(fav => fav.nombre === p.nombre) ? "❤️" : "🤍";

    div.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <h2>${p.nombre}</h2>
      ${p.precio > 0 ? `<p>$${p.precio}.00</p>` : ""}
      ${p.precio > 0 ? `<a class="btn-wsp" href="https://wa.me/593963210127?text=Hola! Quiero comprar el ${encodeURIComponent(p.nombre)}" target="_blank">Comprar</a>` : ""}
      <button class="btn-favorito" data-nombre="${p.nombre}">${esFavorito}</button>
    `;

    catalogo.appendChild(div);
  });

  asignarEventosFavoritos();
}

// Función para asignar eventos a botones de favoritos
function asignarEventosFavoritos() {
  document.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", () => {
      const nombre = btn.getAttribute("data-nombre");
      let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

      // Buscar el producto
      const producto = Object.values(productos).flat().find(p => p.nombre === nombre);

      // Revisar si ya existe en favoritos
      const index = favoritos.findIndex(fav => fav.nombre === nombre);

      if (index !== -1) {
        // Quitar de favoritos
        favoritos.splice(index, 1);
        btn.textContent = "🤍";
      } else {
        // Agregar objeto completo
        favoritos.push(producto);
        btn.textContent = "❤️";
      }

      localStorage.setItem('favoritos', JSON.stringify(favoritos));
    });
  });
}

// Función para el buscador
function buscarProductos(categoria) {
  const input = document.getElementById("buscador");
  if (!input) return;

  input.addEventListener("input", () => {
    const filter = input.value.toLowerCase();
    const catalogo = document.querySelector(".catalogo");
    catalogo.innerHTML = "";

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    productos[categoria]
      .filter(p => p.nombre.toLowerCase().includes(filter))
      .forEach(p => {
        const div = document.createElement("div");
        div.classList.add("producto");

        const esFavorito = favoritos.some(fav => fav.nombre === p.nombre) ? "❤️" : "🤍";

        div.innerHTML = `
          <img src="${p.img}" alt="${p.nombre}" loading="lazy">
          <h2>${p.nombre}</h2>
          ${p.precio > 0 ? `<p>$${p.precio}.00</p>` : ""}
          ${p.precio > 0 ? `<a class="btn-wsp" href="https://wa.me/593963210127?text=Hola! Quiero comprar el ${encodeURIComponent(p.nombre)}" target="_blank">Comprar</a>` : ""}
          <button class="btn-favorito" data-nombre="${p.nombre}">${esFavorito}</button>
        `;

        catalogo.appendChild(div);
      });

    asignarEventosFavoritos();
  });
}

// Detecta la categoría según la página
document.addEventListener("DOMContentLoaded", () => {
  const pagina = window.location.pathname.split("/").pop(); // ejemplo: "perfumes.html"
  let categoria = "";

  if (pagina.includes("perfumes")) categoria = "perfumes";
  else if (pagina.includes("relojes")) categoria = "relojes";
  else if (pagina.includes("edredones")) categoria = "edredones";
  else if (pagina.includes("sabanas")) categoria = "sabanas";
  else if (pagina.includes("carteras")) categoria = "carteras";

  if (categoria) {
    generarProductos(categoria);
    buscarProductos(categoria);
  }
});
