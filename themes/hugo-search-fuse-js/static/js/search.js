// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
// How many characters to include on either side of match keyword
const summaryInclude=60;

// Options for fuse.js
let fuseOptions = {
  shouldSort: true, // 是否按分数对结果列表排序
  includeMatches: true, //  是否应将分数包含在结果集中。0分表示完全匹配，1分表示完全不匹配。
  tokenize: true,
  matchAllTokens: true,
  threshold: 0.2, // 匹配算法阈值。阈值为0.0需要完全匹配（字母和位置），阈值为1.0将匹配任何内容。
  location: 0, // 确定文本中预期找到的模式的大致位置。
  /**
   * 确定匹配与模糊位置（由位置指定）的距离。一个精确的字母匹配，即距离模糊位置很远的字符将被视为完全不匹配。
   *  距离为0要求匹配位于指定的准确位置，距离为100则要求完全匹配位于使用阈值0.2找到的位置的20个字符以内。
   */
  distance: 100,
  maxPatternLength: 64, // 模式的最大长度
  minMatchCharLength: 2, // 模式的最小字符长度
  keys: [
    {name:"title",weight:0.8},
    {name:"tags",weight:0.5},
    {name:"categories",weight:0.5},
    {name:"contents",weight:0.4}
  ]
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  let results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

let searchQuery = getUrlParameter('q');

if(searchQuery){
  document.getElementById("search-query").value = searchQuery;
  executeSearch(searchQuery);
} else {
  document.getElementById('search-results').innerHTML = "<p class=\"no-results\">Please enter a word or phrase above</p>";
}

function executeSearch(searchQuery) {
  // Look for "index.json" in the same directory where this script is called.
  fetch("index.json").
  then(function (response) {
    return response.json()
  }).
  then(function (data) {
    let fuse = new Fuse(data, fuseOptions);
    let result = fuse.search(searchQuery);
    if (result.length > 0) {
      populateResults(result);
    } else {
      document.getElementById('search-results').innerHTML = "<p class=\"no-results\">No matches found</p>";
    }
  });
}

function populateResults(result){
  result.forEach( function (value, key) {
    let contents= value.item.contents;
    let snippet = "";
    let snippetHighlights=[];
    snippetHighlights.push(searchQuery);
    if(snippet.length<1){
      snippet += contents.substring(0,summaryInclude*2);
    }
    snippet += "…";

    // Lifted from https://stackoverflow.com/posts/3700369/revisions
    var elem = document.createElement('textarea');
    elem.innerHTML = snippet;
    var decoded = elem.value;

    // Pull template from hugo template definition
    let frag = document.getElementById('search-result-template').content.cloneNode(true);
    // Replace values
    frag.querySelector(".search_summary").setAttribute("id", "summary-" + key);
    frag.querySelector(".search_link").setAttribute("href", value.item.permalink);
    frag.querySelector(".search_title").textContent = value.item.title;
    frag.querySelector(".search_snippet").textContent = decoded;
    let tags = value.item.tags;
    if (tags) {
      frag.querySelector(".search_tags").textContent = tags;
    } else {
      frag.querySelector(".search_iftags").remove();
    }
    let categories = value.item.categories;
    if (categories) {
      frag.querySelector(".search_categories").textContent = categories;
    } else {
      frag.querySelector(".search_ifcategories").remove();
    }
    snippetHighlights.forEach( function (snipvalue, snipkey) {
      let markjs = new Mark(frag);
      markjs.mark(snipvalue);
    });
    document.getElementById("search-results").appendChild(frag);
  });
}
// @license-end
