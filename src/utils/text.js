
function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
}

module.exports = {
    capitalizeFirstLetter
}