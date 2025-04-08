/**
 * Utilidades para manejar y formatear fechas
 */
class DateUtils {
    /**
     * Calcula la diferencia en días entre dos fechas
     * @param {Date|string} date1 - Primera fecha
     * @param {Date|string} date2 - Segunda fecha
     * @returns {number} - Diferencia en días
     */
    static getDaysDifference(date1, date2) {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);
        
        // Convierte a UTC para evitar problemas con horario de verano
        const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
        
        // Calcula la diferencia y convierte de milisegundos a días
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        return Math.floor((utc2 - utc1) / MS_PER_DAY);
    }

    /**
     * Formatea una fecha a string con formato DD/MM/YYYY
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    static formatDate(date) {
        const d = date instanceof Date ? date : new Date(date);
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    /**
     * Añade días a una fecha
     * @param {Date|string} date - Fecha base
     * @param {number} days - Número de días a añadir
     * @returns {Date} - Nueva fecha
     */
    static addDays(date, days) {
        const d = date instanceof Date ? new Date(date) : new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    /**
     * Verifica si una fecha es anterior a otra
     * @param {Date|string} date1 - Primera fecha
     * @param {Date|string} date2 - Segunda fecha
     * @returns {boolean} - True si date1 es anterior a date2
     */
    static isBefore(date1, date2) {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);
        
        return d1 < d2;
    }
}

module.exports = DateUtils;