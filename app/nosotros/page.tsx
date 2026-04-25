export const metadata = { title: "Nosotros — Keshali Design" };

export default function NosotrosPage() {
  return (
    <div className="section max-w-4xl">
      <h1 className="section-title text-3xl mb-2">Nosotros</h1>
      <p className="text-muted mb-12 text-lg">
        Conoce la historia y los valores detrás de Keshali Design.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          {
            title: "Misión",
            text: "Ofrecer productos personalizados de alta calidad que expresen la esencia única de cada cliente, combinando creatividad y tecnología de sublimación.",
          },
          {
            title: "Visión",
            text: "Ser la marca líder en personalización de productos en Colombia, reconocida a nivel nacional por nuestra creatividad, calidad y compromiso.",
          },
          {
            title: "Valores",
            text: "Creatividad, calidad, puntualidad y compromiso absoluto con cada pedido. Cada producto es único y especial para nosotros.",
          },
        ].map((item) => (
          <div key={item.title} className="glass rounded-card p-6">
            <h3 className="text-gold font-semibold text-lg mb-3">
              {item.title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-card p-8">
        <h2 className="text-[#e8e8e8] font-bold text-xl mb-4">
          ¿Por qué elegir Keshali Design?
        </h2>
        <ul className="space-y-3 text-muted text-sm leading-relaxed">
          {[
            "Más de 15 categorías de productos personalizables",
            "Tecnología de sublimación de alta calidad para colores vibrantes y duraderos",
            "Atención personalizada para cada pedido",
            "Envíos a todo Colombia",
            "Diseños exclusivos o con tu propio arte",
            "Precios accesibles sin sacrificar calidad",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
