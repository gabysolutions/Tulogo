

export const EMOJI = {
  wave: String.fromCodePoint(0x1f44b), // 👋
  page: String.fromCodePoint(0x1f4c4), // 📄
  card: String.fromCodePoint(0x1f4b3), // 💳
  bank: String.fromCodePoint(0x1f3e6), // 🏦
  number: String.fromCodePoint(0x1f522), // 🔢
  check: String.fromCodePoint(0x2705), // ✅
  thanks: String.fromCodePoint(0x1f64c), // 🙌
};


export const openWhatsApp = (rawPhone: string | undefined, message: string) => {
  const digits = rawPhone?.replace(/\D/g, "");
  if (!digits) return;

  const phone = digits.length === 10 ? `52${digits}` : digits;
  const text = encodeURIComponent(message);

  window.location.href = `whatsapp://send?phone=${phone}&text=${text}`;

  setTimeout(() => {
    if (document.hasFocus()) {
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }
  }, 1500);
};