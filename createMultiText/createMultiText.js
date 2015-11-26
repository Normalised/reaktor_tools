// TODO : allow passing the strings via pipe or filename
// TODO : allow passing the output filename

var fs = require("fs");

header = fs.readFileSync("Header.bin");
footer = fs.readFileSync("Footer.bin");

text = fs.readFileSync("strings.txt",'utf8');
//console.log("Text ", text.length);

var eolLen = 1;
if(text.indexOf("\r") != -1) {
	eolLen = 2;
	lines = text.split("\r\n");
} else {
	lines = text.split("\n");
}

var bufferSize = text.length;

if(lines[lines.length - 1].length == 0) {
	//console.log('Last line is empty');
	lines.pop();
	bufferSize -= (lines.length) * eolLen;
} else {
	bufferSize -= (lines.length - 1) * eolLen;
}

// UINT 32 : Number of entries
bufferSize += 4;
// String length UINT 32
bufferSize += lines.length * 4;

//console.log('Buffer Size',bufferSize);
textBuffer = new Buffer(bufferSize);
textBuffer.fill(0)

textBuffer.writeUInt16LE(lines.length);
//console.log(textBuffer);

function writeString(buf, str, off) {
	//console.log('Write String',str,off);
	buf.writeUInt16LE(str.length,off);
	buf.write(str,off+4,str.length,'utf8');
}

var offset = 4;
for(var i=0;i<lines.length;i++) {
	writeString(textBuffer,lines[i],offset);
	offset += (lines[i].length + 4);
}

//console.log(textBuffer);

outBuf = Buffer.concat([header,textBuffer,footer]);

var fd = fs.openSync("newTextMacro.mdl",'w');
fs.writeSync(fd, outBuf, 0, outBuf.length);
fs.closeSync(fd);
