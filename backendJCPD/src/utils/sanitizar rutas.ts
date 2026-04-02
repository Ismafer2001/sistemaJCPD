// Función para limpiar textos para la nube
export function sanitizarRuta(texto:String) {
    return texto
        .normalize("NFD") // Separa las letras de sus tildes/virgulillas
        .replace(/[\u0300-\u036f]/g, "") // Elimina las tildes y la tilde de la Ñ (Ñ se vuelve N)
        .replace(/\s+/g, '-') // Reemplaza todos los espacios por guiones medios
        .toLowerCase(); // Pasa todo a minúsculas para estandarizar
}