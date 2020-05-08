const os = require("os");
const fs = require("fs");
const targetDirectory = './highlights';
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./KoboReader.sqlite");
// modified from there:
// https://gist.github.com/raivivek/b8966dd3c255b71c8ed53e6a155b3c0e
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

function writeAnnotation(appenderObject, row) {
    const { Text, Annotation, DateCreated, StartContainerPath } = row;

    appenderObject.write(`> ${Text}` + lineBreak);
    if (Annotation) {
        appenderObject.write(`_${Annotation}_` + lineBreak);
    }
    appenderObject.write(`${DateCreated} — ${StartContainerPath}` + lineBreak);
}

function startNewFile(appenderObject, bookList, row) {
    bookList.push(row.Title);
    appenderObject.write(row.Title + lineBreak);
    appenderObject.write(row.Attribution + lineBreak);
}

db.all(query, [], (err, rows) => {
  if (err) {
    throw err;
  }

  let appender = fs.createWriteStream(`./${targetDirectory}/${rows[0].Title}.md`, {
      flags: "a",
  });
  startNewFile(appender, books, rows[0]);

  rows.forEach((row) => {
    if (books.includes(row.Title)) {
        // Keep writing into the current file
        writeAnnotation(appender, row);
    } else {
        // Start and write to a new file
        appender.end();
        appender = fs.createWriteStream(`./${targetDirectory}/${row.Title}.md`, {
            flags: "a",
        });
        startNewFile(appender, books, row);
        writeAnnotation(appender, row);
    }
  });

  appender.end();
});

db.close();
