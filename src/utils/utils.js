/**
 * Return the elements day, month and year of the given date
 * @param {string} date Date with format DD-MM-YYYY
 * @returns {Array} [day, month, year]
 */
export function getDateElementsAsNumber(date) {
    let [day, month, year] = date.split('-');
    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);

    return [day, month, year];
}

/**
 * Return the elements hour and minutes of the given hour
 * @param {string} hour Hour in format HH:MM
 * @returns {Array} [hours, minutes]
 */
export function getHourElementsAsNumber(hour) {
    let [hours, minutes] = hour.split(':');
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    return [hours, minutes]
}