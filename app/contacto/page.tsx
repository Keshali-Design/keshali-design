"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Hola! Me llamo ${form.name} (${form.email}).\n\n${form.message}`;
    window.open(
      `https://wa.me/573177301489?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="section max-w-3xl">
      <h1 className="section-title text-3xl mb-2">Contacto</h1>
      <p className="text-muted mb-10">
        ¿Tienes preguntas o quieres hacer un pedido especial? Escríbenos.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass rounded-card p-6 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold">WhatsApp directo</h2>
          <p className="text-muted text-sm leading-relaxed">
            La forma más rápida de contactarnos es por WhatsApp. Respondemos en
            menos de 24 horas.
          </p>
          <a
            href="https://wa.me/573177301489"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex items-center justify-center gap-2 mt-2"
          >
            <MessageCircle size={18} />
            Abrir WhatsApp
          </a>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-card p-6 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold">Enviar mensaje</h2>

          {sent && (
            <p className="text-emerald-400 text-sm">
              ¡Mensaje enviado! Te redirigimos a WhatsApp.
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Mensaje</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors resize-none"
            />
          </div>

          <button type="submit" className="btn-gold mt-1">
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
