const os = require("os");
const fs = require("fs");
const targetDirectory = './highlights';
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./KoboReader.sqlite");
const query = `select
title,
text, annotation, attribution,
startContainerPath, bookmark.dateCreated
from bookmark
left outer join content
on (content.contentID=bookmark.VolumeID and content.ContentType=6)
where
text is not null
order by title;`;
const lineBreak = os.EOL + os.EOL;
const books = [];

if (!fs.existsSync(targetDirectory)){
    fs.mkdirSync(targetDirectory);
}

function writeAnnotationLine(appenderObject, row) {
    appenderObject.write(`> ${row.Text}` + lineBreak);
    if (row.Annotation) {
        appenderObject.write(`_${row.Annotation}_` + lineBreak);
    }
    appenderObject.write(`${row.DateCreated} — ${row.StartContainerPath}` + lineBreak);
}

db.all(query, [], (err, rows) => {
  if (err) {
    throw err;
  }

  let appender = fs.createWriteStream(`./${targetDirectory}/${rows[0].Title}.md`, {
      flags: "a",
  });
  books.push(rows[0].Title);
  appender.write(rows[0].Title + lineBreak);
  appender.write(rows[0].Attribution + lineBreak);


  rows.forEach((row) => {
    console.log(row);
    if (books.includes(row.Title)) {
        // Keep writing into the file
        writeAnnotationLine(appender, row);
    } else {
        // close and write new file
        appender.end();
        appender = fs.createWriteStream(`./${targetDirectory}/${row.Title}.md`, {
            flags: "a",
        });
        books.push(row.Title);
        appender.write(row.Title + lineBreak);
        appender.write(row.Attribution + lineBreak);
        writeAnnotationLine(appender, row);
    }
  });

  appender.end();
});

db.close();
