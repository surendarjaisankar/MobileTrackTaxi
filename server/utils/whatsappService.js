exports.generateWhatsAppLink = (phone, message) => {
  const cleanPhone = phone.replace(/\D/g, "");

  const encodedMessage = encodeURIComponent(message.trim());

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
};
