/*
Request Headers {
Request Url -> http://localhost:4040/video
Request Method -> Get
Range: bytes=0-          initial range of bytes wanted from video, since its the beginning of the video it wants 0th byte onward
}

Response Header fro  Server {
Status -> 206 (Partial Content)
Accepted Ranges -> bytes (type of data server is returning)
Content-lenght -> 10000001 (chunk size)
Content-Range -> 0 - 10000000/6477347y473 (Range of bytes and total no of bytes in the video)
Content-Type -> video/mp4
}

video element will recognize this as an incomplete video because of the headers and will start playing the video with what its downloaded so far,
as the video continues to play it will request for the next chunk and the next until the entire video is buffered into the player.
*/

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 4040;

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// app.get("/video", async (req, res) => {
//   try {
//     const range = req.headers.range;
//     if (!range) {
//       res.status(400).json({ msg: "require range headers" });
//     }
//     const videoPath = path.join(__dirname, "public", "vimeo.mp4");
//     const videoSize = fs.statSync(videoPath).size;
//     const chunkSize = 10 ** 6; // 1 mb which we will be sending every time
//     const startRange = Number(range.replace(/\D/g,"")) // replace all non digit character with empty string and return the number
//     const endRange = Math.min(startRange + chunkSize, videoSize - 1) // we either take next chunk of 1 mb or leftover chunk whichever is minimum
//     console.log(startRange, endRange, "values");
//     const contentLength = endRange - startRange + 1;
//     const headers = {
//       "Content-Range": `bytes ${startRange}-${endRange}/${videoSize}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": contentLength,
//       "Content-Type": "video/mp4",
//     };
//     res.writeHead(206, headers);
//     const videoReadStream = fs.createReadStream(videoPath, {
//       startRange,
//       endRange,
//     });
//     videoReadStream.pipe(res);
//   } catch (e) {
//     console.log(e);
//   }
// });


app.get("/video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "./public/vimeo.mp4";
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, "")); // replace all non digit character with empty string and return the number
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1); // we either take next chunk of 1 mb or leftover chunk whichever is minimum
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }
  console.log(`Server is listening on ${port}`);
});
