/* ----------------------------------------------------------------------------
grab the contents of the first element in a Markdown entry
---------------------------------------------------------------------------- */

module.exports = {

  titleFromHeading: (value) => {
    if (!value) return '';
    const lines = value.split('\n');
    if (lines[0].includes("h1")) {
      const heading = lines[0].replace(/(<([^>]+)>)/gi, "");
      return heading;
    }
  }

};
