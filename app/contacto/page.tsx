"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

const FIELD =
  "block w-full mt-1 border border-subtle bg-[#FDFBF7] px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors";

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
      `https://wa.me/573159635343?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="section max-w-3xl">
      <h1 className="section-title text-3xl mb-2">Contacto</h1>
      <p className="text-muted mb-6">
        ¿Tienes preguntas o quieres hacer un pedido especial? Escríbenos.
      </p>
      <div className="divider mb-10" />

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-surface border border-subtle p-6 flex flex-col gap-4">
          <h2 className="label-sm">WhatsApp directo</h2>
          <p className="text-body text-sm leading-relaxed">
            La forma más rápida de contactarnos es por WhatsApp. Respondemos en
            menos de 24 horas.
          </p>
          <a
            href="https://wa.me/573159635343"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex items-center justify-center gap-2 mt-2"
          >
            <MessageCircle size={18} />
            Abrir WhatsApp
          </a>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-subtle p-6 flex flex-col gap-4">
          <h2 className="label-sm">Enviar mensaje</h2>

          {sent && (
            <p className="text-gold-700 text-sm font-semibold">
              ¡Mensaje enviado! Te redirigimos a WhatsApp.
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="label-sm">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={FIELD}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={FIELD}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-sm">Mensaje</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className={`${FIELD} resize-none`}
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
