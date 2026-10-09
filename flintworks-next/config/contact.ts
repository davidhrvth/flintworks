/**
 * Public contact details for Flintworks, shown on the contact page and in the footer.
 *
 * BOOKING_URL:
 *   The "Book a call" option only appears once this is set to a live booking
 *   page (Cal.com, Calendly, ...). Leave it empty until one exists.
 */
export const CONTACT_EMAIL = 'hello@flintworks.hu'
export const CONTACT_PHONE = '+36 20 270 5192'
export const BOOKING_URL = ''

export const contactLinks = {
  email: `mailto:${CONTACT_EMAIL}`,
  phone: `tel:${CONTACT_PHONE.replace(/\s/g, '')}`,
  whatsapp: `https://wa.me/${CONTACT_PHONE.replace(/\D/g, '')}`,
}
