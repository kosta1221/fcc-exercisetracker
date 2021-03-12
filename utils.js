// A function for padding numbers to 2 digits.
function twoDigits(number) {
	if (0 <= number && number < 10) {
		return "0" + number.toString();
	}
	return number.toString();
}

/* A function for converting a date object to FCC's desired format */
function toFccDateFormat(dateObject) {
	return (
		dateObject.toString().split(" ")[0] +
		" " +
		dateObject.toString().split(" ")[1] +
		" " +
		dateObject.toString().split(" ")[2] +
		" " +
		dateObject.toString().split(" ")[3]
	);
}

module.exports = { twoDigits, toFccDateFormat };
