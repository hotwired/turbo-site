/* ----------------------------------------------------------------------------
grabs the navigation prefix from a URL string
---------------------------------------------------------------------------- */
module.exports = {

  navPrefix: (value) => {
    const numberString = value.replace(/\D/g,'');
    const number = parseInt(numberString, 10);
    if (number > 0) {
      return number;
    }
  }

};
