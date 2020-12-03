const path = require("path")

module.exports = {
  entry: {
    main: [
      "./_js/index.js",
      "./_js/tracking.js",
    ]
  },

  output: {
    path: path.resolve(__dirname, "js"),
    filename: "[name].js"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/
        ],
        use: [
          { loader: "babel-loader" }
        ]
      }
    ]
  }
}
