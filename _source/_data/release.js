const Cache = require("@11ty/eleventy-cache-assets");

module.exports = async function() {

  let json = await Cache("https://api.github.com/repos/hotwired/turbo/releases/latest", {
    duration: "1d",
    type: "json"
  });

  return {
    url: json.html_url,
    tag_name: json.tag_name.replace('v', ''),
    created_at: json.created_at
  };

};
