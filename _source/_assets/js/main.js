import "@hotwired/turbo"

// Are we in an <iframe>?
if (window.top !== window) {
  // 🎶 Never Gonna Give You Up 🎶
  location.replace("https://www.youtube.com/embed/dQw4w9WgXcQ")
}
