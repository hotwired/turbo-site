const Cache = require("@11ty/eleventy-cache-assets");

module.exports = async function() {

  let json = await Cache("https://api.github.com/repos/hotwired/turbo/releases", {
    duration: "1d",
    type: "json"
  });

  for (let entry of json) {
    if (entry.prerelease == false) {
      return {
        url: entry.html_url,
        tag_name: entry.tag_name.replace('v', ''),
        created_at: entry.created_at
      };
      break;
    }
  }

};
