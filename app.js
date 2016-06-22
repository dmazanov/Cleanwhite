// require the module as normal
var bs = require("browser-sync").create();

// Start a Browsersync proxy (for php происываем свой адрес)
bs.init({
    proxy: "http://www.bbc.co.uk"
});

// Listen to change events on HTML and reload
bs.watch("*.html").on("change", bs.reload);

// Provide a callback to capture ALL events to CSS
// files - then filter for 'change' and reload all
// css files on the page.
bs.watch("css/*.css", function (event, file) {
    if (event === "change") {
        bs.reload("*.css");
    }
});
