const validCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

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

/**
 * Return a random string of 8 characters
 */
export function getRandomString(){
    var string = '';
    for(var i = 0; i < 8; i++){
        string += validCharacters[parseInt(Math.random() * 61)];
    }
    return string;
}