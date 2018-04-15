/////////////////////////////////
/// This function is called once
/// getMDFileContent function
/// has parsed a md file.
///
/// You can set it to execute
/// custom code.
/////////////////////////////////
var onFileParsed = function() {};

/////////////////////////////////
/// Gets a md file stored in the server
/// (using a XMLHttpRequest) and parses it.
///
/// Once the parsing has finished
/// calls to onFileParsed.
///
/// filename param is the file to
/// parse which is stored in the server
///
/// element param is sent to
/// parseMD function.
/////////////////////////////////
function getMDFileContent(filename, element)
{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function()
	{
		if (this.readyState != 4 || this.status != 200)
			return;

		parseMD(this.responseText, element);
		onFileParsed();
	}
	xmlhttp.open("GET", filename);
	xmlhttp.send();
}

/////////////////////////////////
/// Constants used by parseMD.
/// These are used as enums.
/////////////////////////////////
const MDLineType =
{
	Heading:     1,
	Paragraph:  2,
	Blockquote: 3,
	Li:			4,
	Code:		5,
	Empty:      6
}

/////////////////////////////////
/// Parses MD text stored in a
/// string. The generated HTML element
/// are added as children of element
/// param.
///
/// \n indicates the end of a line
/// in the md string
///
/// element param can be a HTML
/// element or an HTML element's id
/////////////////////////////////
function parseMD(md, element)
{
	if (typeof(element) == "string")
		element = document.getElementById(element);

	var rawLines = md.split("\n");
	var prevLineType = MDLineType.Empty;

	for (var i = 0; i < rawLines.length; i++)
	{
		var response = parseLine(rawLines [i], prevLineType, element);
		prevLineType = response.prevLineType;
		element = response.element;
	}
}

/////////////////////////////////
/// Parses a md line stored in a string
/// taking into consideration the previous
/// line's type.
///
/// The result can be a HTML element which
/// will be added as child of element param
/// or more innerHTML text for the same
/// element.
/////////////////////////////////
function parseLine(mdLine, prevLineType, element)
{
	var response = new Object();
	response.prevLineType = prevLineType;
	response.element = element;

	/// Empty line,
	if (! mdLine.length)
	{
		switch (prevLineType)
		{
			case MDLineType.Li: case MDLineType.Blockquote: case MDLineType.Paragraph:
				response.element = element.parentElement;
			break;

			case MDLineType.Code:
				response.element = element.parentElement.parentElement;
			break;
		}

		response.prevLineType = MDLineType.Empty;
		return response;
	}

	/// Heading
	var regExp = /^(#+)[ \t]+((.+(?=[ \t]+#+))|.+)/;
	var regExpResult = regExp.exec(mdLine);
	if (regExpResult)
	{
		var HeadingElement = document.createElement("h" + regExpResult [1].length);
		HeadingElement.innerHTML = parseInlineMD(regExpResult [2], true);
		element.appendChild(HeadingElement);

		response.prevLineType = MDLineType.Empty;
		return response;
	}

	/// UL and OL
	regExp = /^([\+\*-]|\d+\.)[ \t]+(.*)$/;
	regExpResult = regExp.exec(mdLine);
	if (regExpResult)
	{
		var listElement = document.createElement("li");
		listElement.innerHTML = parseInlineMD(regExpResult [2]);

		if (prevLineType != MDLineType.Li)
		{
			var olRegExp = /\d+\./;
			var listTypeElement = document.createElement((olRegExp.test(regExpResult [1])) ? "ol" : "ul");
			element.appendChild(listTypeElement);
			response.element = element = listTypeElement;
		}

		element.appendChild(listElement);
		response.prevLineType = MDLineType.Li;
		return response;
	}

	/// Blockquote
	regExp = /^>(.*)$/;
	regExpResult = regExp.exec(mdLine);
	if (regExpResult)
	{
		if (prevLineType != MDLineType.Blockquote)
		{
			var blockquoteElement = document.createElement("blockquote");
			blockquoteElement.innerHTML = parseInlineMD(regExpResult [1]);
			element.appendChild(blockquoteElement);
		}
		else
		{
			element.innerHTML += " ";
			element.innerHTML += parseInlineMD(regExpResult [1]);
		}

		response.prevLineType = MDLineType.Blockquote;
		response.element = blockquoteElement;
		return response;
	}

	/// Code
	regExp = /^(\t| {4})(.*)$/;
	regExpResult = regExp.exec(mdLine);
	if (regExpResult)
	{
		if (prevLineType != MDLineType.Code)
		{
			var preElement = document.createElement("pre");
			var codeElement = document.createElement("code");
			preElement.appendChild(codeElement);
			element.appendChild(preElement);
			element = response.element = codeElement;
		}

		var innerHTML = regExpResult [2];
		innerHTML = innerHTML.replace(/</g, "&lt;");
		innerHTML = innerHTML.replace(/>/g, "&gt;");
		element.innerHTML += innerHTML + "\n";

		response.prevLineType = MDLineType.Code;
		return response;
	}

	/// Horizontal Rules
	if (mdLine.match(/^(_|-|\*){3,}$/))
	{
		element.appendChild(document.createElement("hr"));

		response.prevLineType = MDLineType.Empty;
		return response;
	}

	/// Paragraph
	switch (prevLineType)
	{
		case MDLineType.Empty:
			var paragraphElement = document.createElement("p");
			paragraphElement.innerHTML = parseInlineMD(mdLine);
			element.appendChild(paragraphElement);

			response.element = paragraphElement;
			response.prevLineType = MDLineType.Paragraph;
			return response;

		case MDLineType.Paragraph:
			element.innerHTML += " ";
			element.innerHTML += parseInlineMD(mdLine);

			return response;

		case MDLineType.Blockquote:
			element.innerHTML += " ";
			element.innerHTML += mdLine;

			return response;
	}
}

/////////////////////////////////
/// Parses inline MD elements
/// like bolds, italics, strike through
/// images, links, inline code and break
/// lines.
///
/// isHeading param tells if bookmark
/// definition must be parsed too.
/////////////////////////////////
function parseInlineMD(inlineMD, isHeading = false)
{
	if (/`(.*?)`/g.test(inlineMD)) /// Inline code
	{
		inlineMD = inlineMD.replace(/`(.*?)`/g, "<code>$1</code>");
		return inlineMD;
	}

	inlineMD = inlineMD.replace(/(__|\*\*)(.*?)(__|\*\*)/g, "<strong>$2</strong>");		/// Bolds
	inlineMD = inlineMD.replace(/(_|\*)(.*?)(_|\*)/g, "<em>$2</em>");					/// Italics
	inlineMD = inlineMD.replace(/--(.*?)--/g, "<del>$1</del>");							/// Strikethrough
	inlineMD = inlineMD.replace(/!\[(.*?)\]\((.*?)\)/g, "<img alt='$1' src='$2' />");	/// Images
	inlineMD = inlineMD.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>");			/// Links
	inlineMD = inlineMD.replace(/  /g, "<br />");										/// Breaklines

	if (isHeading)
		inlineMD = inlineMD.replace(/{#(.+)}/, "<a id='$1'></a>");

	return inlineMD;
}
