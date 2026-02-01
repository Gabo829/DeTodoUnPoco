// --- Datos de los Ganadores  ---
const winnersData = [
    {
        id: 1,
        name: "Bernardo V.",
        ticket: "5757",
        product: "Phantom Rabanne",
        date: "18 Nov 2025",
        image: "img/Perfumes 1.1 para Hombre/Phantom.jpeg"
    },
    {
        id: 2,
        name: "",
        ticket: "",
        product: "Rolex para Hombre",
        date: "",
        image: "img/Relojes 1.1 para Hombre/Rolex_1.jpeg"
    },
    {
        id: 3,
        name: "",
        ticket: "",
        product: "Coach Negra",
        date: "",
        image: "img/Carteras 1.1/Coach_Negro.jpeg"
    }
];

let replayTrigger = 0; // Se mantiene, pero no se usa activamente.

// El array 'numbers' se mueve aquí para que sea accesible globalmente en el script
const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Constante para la altura de un dígito (h-20 en Tailwind es 5rem)
const DIGIT_HEIGHT_REM = 5;

// Función de utilidad para crear elementos HTML con clases
const createElement = (tag, classes = [], content = '') => {
    const element = document.createElement(tag);
    if (classes.length) {
        element.className = classes.join(' ');
    }
    if (content) {
        element.innerHTML = content;
    }
    return element;
};

// --- Componente: Dígito Giratorio (SpinningDigit) ---
const createSpinningDigit = (targetDigit, isSpinning) => {
    
    // Usamos clases h-20 y w-14 directamente de Tailwind
    const container = createElement('div', [
        "relative", "h-20", "w-14", "overflow-hidden", "bg-white/10", "rounded-lg", "mx-0.5", 
        "border", "border-yellow-500/30", "shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" 
    ]);

    // La tira interior (Inner Strip) que contiene todos los números
    const innerStrip = createElement('div', [
        "flex", "flex-col", "items-center", "transition-transform", "duration-[2000ms]", "ease-out", "will-change-transform"
    ]);

    // Crear los números dentro de la tira
    numbers.forEach((num) => {
        const digitEl = createElement('div', [
            "h-20", // ALTURA EXPLÍCITA: 5rem
            "flex", "items-center", "justify-center", 
            "text-4xl", "sm:text-5xl", "font-extrabold", "text-yellow-400" 
        ], num.toString());
        innerStrip.appendChild(digitEl);
    });
    
    // Aplicar el estilo de animación o la posición final
    if (isSpinning) {
        // Inicia el giro con la clase de animación CSS (velocidad definida en winners_section.html style)
        innerStrip.classList.add('animate-slot-spin');
        innerStrip.style.transform = 'translateY(-50%)'; 
    } else {
        // Calcula la posición final para el dígito objetivo
        const targetIndex = targetDigit + 10;
        const shiftFinalRem = targetIndex * DIGIT_HEIGHT_REM; 

        innerStrip.style.transform = `translateY(-${shiftFinalRem}rem)`;
    }

    // Overlay de brillo
    const overlay = createElement('div', [
        "absolute", "inset-0", "bg-gradient-to-b", "from-black/60", "via-transparent", "to-black/60", "pointer-events-none"
    ]);

    container.appendChild(innerStrip);
    container.appendChild(overlay);
    return { element: container, innerStrip };
};

// --- Componente: Tarjeta de Ganador (WinnerCard) ---
const createWinnerCard = (winner) => {
    const card = createElement('div', [
        "bg-gradient-to-b", "from-gray-900", "to-gray-800", "rounded-xl", "overflow-hidden", "border", "border-yellow-500/20", "shadow-2xl", 
        "transform", "hover:scale-105", "transition-all", "duration-300", "flex", "flex-col"
    ]);

    // Asegura que el ticket se rellene con ceros hasta 4 caracteres.
    const formattedTicket = winner.ticket.toString().padStart(4, '0');
    const ticketDigits = formattedTicket.split('').map(Number);
    let spinning = true;

    // --- Encabezado: El Número Ganador (Animado) ---
    const header = createElement('div', [
        "bg-black/50", "p-6", "flex", "flex-col", "items-center", "justify-center", "border-b", "border-yellow-500/10", "relative", "overflow-hidden"
    ]);
    header.innerHTML = `
        <div class="absolute inset-0 bg-yellow-500/5"></div>
        <span class="text-yellow-500 text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2 relative z-10">
            <i data-lucide="star" class="w-3 h-3"></i> N° Ganador <i data-lucide="star" class="w-3 h-3"></i>
        </span>
    `;

    const digitContainer = createElement('div', ["flex", "justify-center", "relative", "z-10"]);
    
    // Array para guardar las tiras internas para su detención
    const innerStrips = [];

    ticketDigits.forEach((digit) => {
        const { element, innerStrip } = createSpinningDigit(digit, true); 
        digitContainer.appendChild(element);
        innerStrips.push({ innerStrip, targetDigit: digit }); // Guardamos la tira y el objetivo
    });

    header.appendChild(digitContainer);
    card.appendChild(header);

    // [REVERTIDO: Lógica de detención instantánea después de un breve delay (100ms)]
    setTimeout(() => {
        innerStrips.forEach(({ innerStrip, targetDigit }) => {
            // 1. Detener la animación de keyframes (spin)
            innerStrip.classList.remove('animate-slot-spin'); 
            
            // 2. Calcular y aplicar la posición final. 
            const targetIndex = targetDigit + 10;
            const shiftFinalRem = targetIndex * DIGIT_HEIGHT_REM;
            
            // La transición CSS se encarga del movimiento suave a la posición final
            innerStrip.style.transform = `translateY(-${shiftFinalRem}rem)`;
        });
    }, 100); // Pequeño delay para asegurar que la animación se inicie visualmente

    // --- Cuerpo: El Producto y el Ganador ---
    const body = createElement('div', [
        "p-6", "flex", "flex-col", "items-center", "text-center", "flex-grow"
    ]);
    
    // [Se mantiene la eliminación de los detalles del ganador bajo el producto]
    body.innerHTML = `
        <!-- Imagen del Producto -->
        <div class="relative mb-4 group">
            <div class="absolute inset-0 bg-yellow-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
            <img 
                src="${winner.image}" 
                alt="${winner.product}" 
                onerror="this.onerror=null;this.src='https://placehold.co/160x160/2c3e50/ffffff?text=Producto'"
                class="w-40 h-40 object-contain relative z-10 drop-shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500"
            />
        </div>

        <h3 class="text-white font-bold text-lg mb-1">${winner.product}</h3>
        
        <!-- Eliminado: Bloque con el nombre del ganador, fecha y estado de 'Entregado'. -->
    `;
    
    card.appendChild(body);

    return card;
};

// --- Renderizado Inicial de la Sección ---
const renderWinnersSection = () => {
    const root = document.getElementById('winners-root');
    root.innerHTML = ''; // Limpiar el contenido anterior

    // Título de la Sección
    const titleSection = createElement('div', ["text-center", "mb-16", "relative"]);
    titleSection.innerHTML = `
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full"></div>
        <h2 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 mb-4 relative z-10">
            Ganadores Recientes
        </h2>
        <p class="text-gray-400 max-w-2xl mx-auto relative z-10">
            Felicidades a los afortunados ganadores de nuestros sorteos exclusivos. ¡Tú podrías ser el siguiente en llevarte un producto de lujo!
        </p>
    `;
    
    // ELIMINADO: El botón de Replay Animación y el espacio de reemplazo fueron removidos.

    root.appendChild(titleSection);


    // Grid de Ganadores
    const grid = createElement('div', [
        "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-8", "max-w-6xl", "mx-auto"
    ]);

    winnersData.forEach(winner => {
        grid.appendChild(createWinnerCard(winner));
    });
    root.appendChild(grid);


    // ELIMINADO: Todo el bloque del Footer Promocional
    
    // Inicializar íconos de Lucide (ya que se cargan después del renderizado)
    lucide.createIcons();
};

// Renderizar la sección cuando la página cargue
document.addEventListener('DOMContentLoaded', renderWinnersSection);