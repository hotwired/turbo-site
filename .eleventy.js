const glob = require('fast-glob');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require('markdown-it-anchor');
const markdownItToc = require('markdown-it-toc-done-right');

module.exports = function(eleventyConfig) {

  /* --------------------------------------------------------------------------
  11ty plugins
  -------------------------------------------------------------------------- */
  eleventyConfig.addPlugin(syntaxHighlight);

  /* --------------------------------------------------------------------------
  filters
  -------------------------------------------------------------------------- */
  glob.sync(['_source/_filters/*.js']).forEach(file => {
    let filters = require('./' + file);
    Object.keys(filters).forEach(name => eleventyConfig.addFilter(name, filters[name]));
  });

  /* --------------------------------------------------------------------------
  BrowserSync settings
  -------------------------------------------------------------------------- */
  eleventyConfig.setBrowserSyncConfig({
    ui: false,
    logPrefix: false,
    files: [ // watch the files generated elsewhere
      '_public/assets/*.css',
      '_public/assets/*.js',
      '_public/assets',
      '!_public/assets/**/**.map'
    ],
    server: { // make URLs work without a .html extension
      baseDir: "_public",
      serveStaticOptions: {
          extensions: ["html"]
      }
    },
    snippetOptions: {
      rule: { // put the snippet in the head for Turbo happiness
        match: /<\/head>/i,
        fn: function (snippet, match) {
          return snippet + match;
        }
      }
    },
  });

  /* --------------------------------------------------------------------------
  MarkdownIt settings
  -------------------------------------------------------------------------- */
  const markdownItOptions = {
    html: true, // allow HTML markup
    typographer: true // fancy quotes
  };
  const markdownLib = markdownIt(markdownItOptions);
  markdownLib.use(markdownItAnchor, { // add anchors to headings
    level: '2',
    permalink: 'true',
    permalinkClass: 'anchor',
    permalinkSymbol: '﹟',
    permalinkBefore: 'true'
  });
  markdownLib.use(markdownItToc, { // make a TOC with ${toc}
    level: '2',
    listType: 'ul'
  });

  /* --------------------------------------------------------------------------
  11ty settings
  -------------------------------------------------------------------------- */

  // handbook collection - bake in ordering by file slug
  eleventyConfig.addCollection("handbook", (collectionApi) =>
    collectionApi.getFilteredByTag("handbook").sort((a, b) => {
      if (a.fileSlug < b.fileSlug) return -1;
      else if (a.fileSlug > b.fileSlug) return 1;
      else return 0;
    })
  );

  // reference collection - bake in ordering by 'order' front matter value
  eleventyConfig.addCollection("reference", function(collectionApi) {
    return collectionApi.getFilteredByTag("reference").sort((a, b) =>  {
      return a.data.order - b.data.order;
    });
  });

  eleventyConfig.setLibrary('md', markdownLib);
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPassthroughCopy({ '_source/_assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ '_source/_assets/images': 'assets' });

  return {
    dir: {
      input: '_source',
      output: '_public',
      layouts: '_layouts',
      includes: '_includes'
    },
    templateFormats: ['html', 'md', 'liquid', 'njk'],
    htmlTemplateEngine: 'liquid'
  };
};