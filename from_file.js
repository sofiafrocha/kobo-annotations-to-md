var os = require("os");
var fs = require("fs");
var parser = require("xml2json");
var appender = fs.createWriteStream("highlights.md", {
  flags: "a",
});

fs.readFile("./highlights.annot", function (err, data) {
  var json = parser.toJson(data);
  const { annotationSet } = JSON.parse(json);

  const relevantData = {
    title: annotationSet.publication["dc:title"],
    creator: annotationSet.publication["dc:creator"],
    annotations: annotationSet.annotation.map((item) => {
      let basicItem = {
        highlight: item.target.fragment.text,
        date: item["dc:date"],
        place: item.target.fragment.start,
      };
      if (item.content && item.content.text) {
        basicItem.note = item.content.text;
      }
      return basicItem;
    }),
  };
  const lineBreak = os.EOL + os.EOL;

  appender.write(relevantData.title + lineBreak);
  appender.write(relevantData.creator + lineBreak);

  relevantData.annotations.forEach(annotation => {
    appender.write(`> ${annotation.highlight}` + lineBreak);
    if (annotation.note) {
        appender.write(`_${annotation.note}_` + lineBreak);
    }
    appender.write(`${annotation.place} — ${annotation.date}` + lineBreak);
  });

  appender.end();
});
