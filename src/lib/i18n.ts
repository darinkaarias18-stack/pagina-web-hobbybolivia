/**
 * Diccionario bilingüe (Español / Inglés) para Hobby Bolivia
 * Traducciones oficiales de navegación, catálogo, filtros, carrito y secciones.
 */

export type Language = 'es' | 'en';

export const translations = {
  es: {
    // TopBar
    'topbar.announcement': 'Hobby Bolivia: Productos y componentes de precisión para aviones a escala | Envíos seguros a toda Bolivia',
    'topbar.location': 'La Paz, Bolivia',
    'topbar.policies': 'Políticas',
    'topbar.help': 'Ayuda',

    // Header
    'header.home': 'Inicio',
    'header.catalog': 'Catálogo de Productos',
    'header.categories': 'Categorías',
    'header.deals': 'Ofertas',
    'header.contact': 'Contacto',
    'header.my_cart': 'Mi Carrito',
    'header.shop_now': 'Comprar Ahora',
    'header.favorites': 'Mis Favoritos',
    'header.open_menu': 'Abrir menú',

    // Hero Section
    'hero.badge': 'PRODUCTOS DE PRECISIÓN. INVERSIÓN INTELIGENTE.',
    'hero.title_line1': 'PRODUCTOS DE PRECISIÓN',
    'hero.title_line2': 'AEROMODELISMO A ESCALA',

    // Banner / Category Showcase
    'banner.badge': 'PLANEA · CONSTRUYE · VUELA',
    'banner.discover': 'Descubre. Arma. Vuela.',
    'banner.title_line1': 'PRODUCTOS A ESCALA',
    'banner.title_line2': 'PRECISIÓN EN VUELO',
    'banner.subtitle': 'La mayor variedad de productos mecánicos, varillajes templados, hélices balanceadas y componentes electrónicos para aeronaves a radio control en Bolivia.',
    'banner.cta': 'VER CATÁLOGO COMPLETO',
    'banner.fleet_title': 'MANTÉN TU FLOTA EN EL AIRE',
    'banner.fleet_desc': 'Envíos blindados con entrega rápida a toda Bolivia (La Paz, Santa Cruz, Cochabamba y el resto del país).',
    'banner.fleet_btn': 'Explorar Catálogo',
    'brands.title': 'Marcas Oficiales',

    // Catalog Section
    'catalog.title': 'CATÁLOGO DE PRODUCTOS DE AVIONES A ESCALA',
    'catalog.subtitle': 'Filtra por sistema, material o escala y arma tu cotización directa.',
    'catalog.search_placeholder': 'Buscar por producto, SKU, marca (Dubro, Great Planes)...',
    'catalog.filter_all': 'Todos los Productos',
    'catalog.sort_label': 'Ordenar por:',
    'catalog.sort_relevance': 'Relevancia',
    'catalog.sort_price_asc': 'Precio: Menor a Mayor',
    'catalog.sort_price_desc': 'Precio: Mayor a Menor',
    'catalog.sort_name_asc': 'Nombre A-Z',
    'catalog.filter_stock': 'Solo en stock',
    'catalog.active_filters': 'Filtros activos',
    'catalog.reset_filters': 'Restablecer Filtros',
    'catalog.no_results': 'No encontramos productos que coincidan con tu búsqueda',
    'catalog.clear_filters': 'Limpiar Filtros',
    'catalog.viewing': 'Mostrando',
    'catalog.of': 'de',
    'catalog.products': 'productos',

    // Product Card
    'card.sku': 'SKU',
    'card.quick_view': 'Vista rápida del producto',
    'card.add_to_cart': 'Añadir a mi pedido',
    'card.added': '¡Añadido al carrito!',
    'card.popular': 'Popular',
    'card.new': 'Nuevo',
    'card.in_stock': 'En Stock',
    'card.out_of_stock': 'Agotado',

    // Trust Ribbon
    'trust.shipping_title': 'Envíos a Toda Bolivia',
    'trust.shipping_desc': 'Despachos protegidos en tubos de PVC por encomienda y courier',
    'trust.payment_title': 'Pagos QR Inmediatos',
    'trust.payment_desc': 'Transferencia bancaria directa en Bolivianos (Bs.) sin comisiones',
    'trust.warranty_title': 'Garantía de Compatibilidad',
    'trust.warranty_desc': 'Soporte preventa y reemplazo directo si el paso de rosca no calza',
    'trust.genuine_title': 'Piezas 100% Genuinas',
    'trust.genuine_desc': 'Componentes importados oficiales Dubro, Great Planes y APC',

    // Testimonials
    'testimonials.badge': 'PILOTOS Y CONSTRUCTORES EN BOLIVIA',
    'testimonials.title': 'TESTIMONIOS DE LA COMUNIDAD RC',
    'testimonials.subtitle': 'Aeromodelistas que confían en nuestros repuestos y accesorios de precisión en cada vuelo.',

    // Contact Section
    'contact.badge': 'ATENCIÓN DIRECTA',
    'contact.title': 'CONTÁCTANOS',
    'contact.subtitle': '¿Tienes dudas sobre compatibilidad o necesitas repuestos específicos? Estamos para asesorarte.',
    'contact.whatsapp_title': 'Atención por WhatsApp',
    'contact.whatsapp_desc': 'Consultas técnicas y pedidos',
    'contact.email_title': 'Correo Electrónico',
    'contact.email_desc': 'Cotizaciones formales y consultas',
    'contact.form_title': 'Envíanos un mensaje',
    'contact.form_name': 'Nombre Completo *',
    'contact.form_name_placeholder': 'Ej. Mario Velasco',
    'contact.form_phone': 'Teléfono / WhatsApp *',
    'contact.form_phone_placeholder': 'Ej. 77012345',
    'contact.form_city': 'Ciudad *',
    'contact.form_city_placeholder': 'Ej. Santa Cruz',
    'contact.form_message': 'Mensaje o Consulta *',
    'contact.form_message_placeholder': 'Cuéntanos qué producto o repuesto necesitas...',
    'contact.form_btn_wa': 'Enviar por WhatsApp',
    'contact.response_time': 'Respuesta rápida en horario de atención',

    // Footer
    'footer.description': 'Especialistas en componentes mecánicos, varillajes templados, hélices balanceadas y electrónica de precisión para aviones a radio control en Bolivia.',
    'footer.quick_links': 'Enlaces Rápidos',
    'footer.policies_title': 'Políticas & Garantías',
    'footer.contact_title': 'Contacto',
    'footer.rights': 'Todos los derechos reservados.',

    // Quick Specs Modal
    'modal.price': 'Precio:',
    'modal.scale': 'Escala:',
    'modal.material': 'Material:',
    'modal.specs': 'Especificaciones:',
    'modal.compatibility': 'Compatibilidad:',
    'modal.quantity': 'Cantidad:',
    'modal.add_to_cart': 'Añadir a mi pedido',
    'modal.in_stock': 'Stock disponible en almacén para entrega o despacho inmediato',

    // Cart Drawer
    'cart.title': 'Datos de la compra',
    'cart.item_selected': 'pieza seleccionada',
    'cart.items_selected': 'piezas seleccionadas',
    'cart.empty_cart': 'Vaciar',
    'cart.empty_title': 'Tu carrito aún está vacío',
    'cart.empty_desc': 'Elige los conectores, varillajes, hélices o componentes mecánicos que necesitas en el catálogo.',
    'cart.go_catalog': 'Ir al Catálogo de Productos',
    'cart.dispatch_title': 'Atención y Despacho Directo',
    'cart.dispatch_desc': 'Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp.',
    'cart.products_section': 'Productos Seleccionados',
    'cart.delivery_title': 'DIRECCIÓN PARA EL PEDIDO',
    'cart.delivery_desc': 'Datos del comprador y ciudad de despacho en Bolivia',
    'cart.name_label': 'Nombre Completo *',
    'cart.phone_label': 'WhatsApp / Teléfono *',
    'cart.city_label': 'Ciudad Destino *',
    'cart.address_label': 'Dirección para el Pedido *',
    'cart.notes_label': 'Notas de Protección / Embalaje (Opcional)',
    'cart.qr_title': 'PAGO MEDIANTE QR SIMPLE',
    'cart.qr_expand': 'Ampliar QR',
    'cart.total_to_pay': 'TOTAL A PAGAR:',
    'cart.checkout_btn': 'Finalizar Pedido por WhatsApp',
    'cart.submitting': 'Registrando Orden...',
    'cart.order_success_title': '¡Orden Registrada con Éxito!',
    'cart.order_success_desc': 'Tu orden fue enviada por WhatsApp para confirmación de pago y despacho.',
    'cart.back_to_catalog': 'Volver al Catálogo',
    'cart.qr_modal_title': 'Código QR Simple',
    'cart.qr_modal_close': 'Listo, Cerrar',

    // Language Toggle
    'lang.es': 'Español',
    'lang.en': 'English',
    'lang.toggle_label': 'Cambiar idioma',
  },
  en: {
    // TopBar
    'topbar.announcement': 'Hobby Bolivia: Precision parts & components for scale RC aircraft | Secure shipping across Bolivia',
    'topbar.location': 'La Paz, Bolivia',
    'topbar.policies': 'Policies',
    'topbar.help': 'Help',

    // Header
    'header.home': 'Home',
    'header.catalog': 'Product Catalog',
    'header.categories': 'Categories',
    'header.deals': 'Deals',
    'header.contact': 'Contact',
    'header.my_cart': 'My Cart',
    'header.shop_now': 'Shop Now',
    'header.favorites': 'My Favorites',
    'header.open_menu': 'Open menu',

    // Hero Section
    'hero.badge': 'PRECISION PRODUCTS. SMART INVESTMENT.',
    'hero.title_line1': 'PRECISION PRODUCTS',
    'hero.title_line2': 'SCALE RC AEROMODELING',

    // Banner / Category Showcase
    'banner.badge': 'PLAN · BUILD · FLY',
    'banner.discover': 'Discover. Build. Fly.',
    'banner.title_line1': 'SCALE PRODUCTS',
    'banner.title_line2': 'PRECISION IN FLIGHT',
    'banner.subtitle': 'The widest selection of hardware, pushrods, balanced props, and electronics for radio-controlled aircraft in Bolivia.',
    'banner.cta': 'VIEW FULL CATALOG',
    'banner.fleet_title': 'KEEP YOUR FLEET IN THE AIR',
    'banner.fleet_desc': 'Heavy-duty armored shipping with fast delivery across Bolivia (La Paz, Santa Cruz, Cochabamba, and nationwide).',
    'banner.fleet_btn': 'Explore Catalog',
    'brands.title': 'Official Brands',

    // Catalog Section
    'catalog.title': 'SCALE RC AIRCRAFT PRODUCTS CATALOG',
    'catalog.subtitle': 'Filter by system, material, or scale and build your quote directly.',
    'catalog.search_placeholder': 'Search by product, SKU, brand (Dubro, Great Planes)...',
    'catalog.filter_all': 'All Products',
    'catalog.sort_label': 'Sort by:',
    'catalog.sort_relevance': 'Relevance',
    'catalog.sort_price_asc': 'Price: Low to High',
    'catalog.sort_price_desc': 'Price: High to Low',
    'catalog.sort_name_asc': 'Name A-Z',
    'catalog.filter_stock': 'In stock only',
    'catalog.active_filters': 'Active filters',
    'catalog.reset_filters': 'Reset Filters',
    'catalog.no_results': 'No products found matching your search',
    'catalog.clear_filters': 'Clear Filters',
    'catalog.viewing': 'Showing',
    'catalog.of': 'of',
    'catalog.products': 'products',

    // Product Card
    'card.sku': 'SKU',
    'card.quick_view': 'Quick view product',
    'card.add_to_cart': 'Add to my order',
    'card.added': 'Added to cart!',
    'card.popular': 'Popular',
    'card.new': 'New',
    'card.in_stock': 'In Stock',
    'card.out_of_stock': 'Out of Stock',

    // Trust Ribbon
    'trust.shipping_title': 'Nationwide Shipping',
    'trust.shipping_desc': 'Protected shipments in rigid PVC tubes via express courier',
    'trust.payment_title': 'Instant QR Payments',
    'trust.payment_desc': 'Direct bank transfers in Bolivianos (Bs.) or USD with zero fees',
    'trust.warranty_title': 'Compatibility Guarantee',
    'trust.warranty_desc': 'Pre-sale technical advice & direct replacement if threads do not fit',
    'trust.genuine_title': '100% Genuine Parts',
    'trust.genuine_desc': 'Official imported components from Dubro, Great Planes & APC',

    // Testimonials
    'testimonials.badge': 'PILOTS & BUILDERS IN BOLIVIA',
    'testimonials.title': 'RC COMMUNITY REVIEWS',
    'testimonials.subtitle': 'Modelers who trust our precision hardware and accessories on every flight.',

    // Contact Section
    'contact.badge': 'DIRECT SUPPORT',
    'contact.title': 'CONTACT US',
    'contact.subtitle': 'Have questions about compatibility or need specific parts? We are here to advise you.',
    'contact.whatsapp_title': 'WhatsApp Support',
    'contact.whatsapp_desc': 'Technical advice and orders',
    'contact.email_title': 'Email Us',
    'contact.email_desc': 'Formal quotes and inquiries',
    'contact.form_title': 'Send us a message',
    'contact.form_name': 'Full Name *',
    'contact.form_name_placeholder': 'e.g. Mario Velasco',
    'contact.form_phone': 'Phone / WhatsApp *',
    'contact.form_phone_placeholder': 'e.g. +591 77012345',
    'contact.form_city': 'City *',
    'contact.form_city_placeholder': 'e.g. Santa Cruz',
    'contact.form_message': 'Message or Inquiry *',
    'contact.form_message_placeholder': 'Tell us what product or spare part you need...',
    'contact.form_btn_wa': 'Send via WhatsApp',
    'contact.response_time': 'Fast response during business hours',

    // Footer
    'footer.description': 'Specialists in hardware, hardened pushrods, balanced propellers, and precision electronics for radio-controlled aircraft in Bolivia.',
    'footer.quick_links': 'Quick Links',
    'footer.policies_title': 'Policies & Guarantees',
    'footer.contact_title': 'Contact',
    'footer.rights': 'All rights reserved.',

    // Quick Specs Modal
    'modal.price': 'Price:',
    'modal.scale': 'Scale:',
    'modal.material': 'Material:',
    'modal.specs': 'Specifications:',
    'modal.compatibility': 'Compatibility:',
    'modal.quantity': 'Quantity:',
    'modal.add_to_cart': 'Add to my order',
    'modal.in_stock': 'Stock available in warehouse for immediate pickup or delivery',

    // Cart Drawer
    'cart.title': 'Purchase details',
    'cart.item_selected': 'item selected',
    'cart.items_selected': 'items selected',
    'cart.empty_cart': 'Clear',
    'cart.empty_title': 'Your cart is still empty',
    'cart.empty_desc': 'Choose the hardware, pushrods, propellers, or mechanical parts you need from the catalog.',
    'cart.go_catalog': 'Go to Product Catalog',
    'cart.dispatch_title': 'Direct Attention & Dispatch',
    'cart.dispatch_desc': 'Purchase instructions are coordinated directly via WhatsApp.',
    'cart.products_section': 'Selected Products',
    'cart.delivery_title': 'ORDER DELIVERY ADDRESS',
    'cart.delivery_desc': 'Buyer details and shipping destination in Bolivia',
    'cart.name_label': 'Full Name *',
    'cart.phone_label': 'WhatsApp / Phone *',
    'cart.city_label': 'Destination City *',
    'cart.address_label': 'Delivery Address *',
    'cart.notes_label': 'Packaging & Protection Notes (Optional)',
    'cart.qr_title': 'PAYMENT VIA QR SIMPLE',
    'cart.qr_expand': 'Expand QR',
    'cart.total_to_pay': 'TOTAL TO PAY:',
    'cart.checkout_btn': 'Complete Order via WhatsApp',
    'cart.submitting': 'Processing Order...',
    'cart.order_success_title': 'Order Placed Successfully!',
    'cart.order_success_desc': 'Your order was sent via WhatsApp for payment confirmation and dispatch.',
    'cart.back_to_catalog': 'Return to Catalog',
    'cart.qr_modal_title': 'QR Simple Code',
    'cart.qr_modal_close': 'Done, Close',

    // Language Toggle
    'lang.es': 'Español',
    'lang.en': 'English',
    'lang.toggle_label': 'Switch language',
  }
} as const;

