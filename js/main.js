function prettyPrint() {
  let ugly = document.getElementById('InputJson').value;
  let obj = JSON.parse(ugly);
  document.getElementById('InputJson').value = JSON.stringify(obj, undefined, 2);
  document.getElementById('OutputJson').value = "Prettified";
}

function copy() {
  document.getElementById("InputJson").select();
  document.execCommand('copy');
}

const getAllJsonKeys = (jsonObj) => {
  let keys = [];

  try {
    for (let i = 0; i < jsonObj.length; i++) {
      Object.keys(jsonObj[i]).forEach(function (key) {
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
      });
    }
  } catch (e) {
    return keys
  }
  return keys;
}

const parseInputAsJson = (inputJson) => {
  let jsonObj = null;

  try {
    jsonObj = JSON.parse(inputJson);
  } catch (e) {
    document.getElementById('OutputJson').value = e;
    return;
  }
  return jsonObj;
}

function removeTags() {
  let tagToRemove = $('#jsonTags').val();
  let inputJson = document.getElementById('InputJson').value;
  const initialLines = inputJson.split(/\r*\n/).length;

  const inputJsonKeys = getAllJsonKeys(parseInputAsJson(inputJson));

  for (let i = 0; i < tagToRemove.length; i++) {
    if (!inputJsonKeys.includes(tagToRemove[i])) {
      document.getElementById('OutputJson').value = tagToRemove + " was not found in input json";
      return;
    } else {
      let result = inputJson.split('\n').filter(function (line) {
        //small hack to verify only the key equals selected tag to remove
        if (line.includes("\"" + tagToRemove[i] + "\":")) {
          return line.indexOf(tagToRemove[i]) === -1;
        } else {
          return line
        }
      }).join('\n')
      inputJson = result
    }
  }

  //find trailing comma's to avoid JSON error
  let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
  if (inputJson.matchAll(regex)) {
    inputJson = inputJson.replace(regex, '');
  }

  document.getElementById('InputJson').value = inputJson;
  document.getElementById("OutputJson").value = ("Removed " + (initialLines - inputJson.split(/\r*\n/).length).toString() + " line(s)");
  refresh()
}

function getInputLines() {
  let input = document.getElementById('InputJson').value;
  document.getElementById("inputLines").innerText = input.split(/\r*\n/).length.toString();
}

function getInputTags() {
  $('#jsonTags').empty();
  $('#jsonTagsDuplicate').empty();

  const input = document.getElementById('InputJson').value;
  $.each(getAllJsonKeys(parseInputAsJson(input)), function (val, text) {
    $('#jsonTags').append($('<option></option>').val(text).html(text))
    $('#jsonTagsDuplicate').append($('<option></option>').val(text).html(text))
  });
}


function highlightDuplicates() {
  let selectedTag = $('#jsonTagsDuplicate').val();
  let inputJson = document.getElementById('InputJson').value;
  let jsonObj = parseInputAsJson(inputJson)
  let duplicatesList = {};

  Object.keys(jsonObj).forEach(function (key) {
    const hasSelectedTag = Object.keys(jsonObj[key]).indexOf(selectedTag);
    if (hasSelectedTag !== -1) {
      if (duplicatesList[jsonObj[key][selectedTag]] === undefined) {
        duplicatesList = {...duplicatesList, [jsonObj[key][selectedTag]]: 1}
      } else if (duplicatesList[jsonObj[key][selectedTag]] > 0) {
        duplicatesList = {...duplicatesList, [jsonObj[key][selectedTag]]: duplicatesList[jsonObj[key][selectedTag]] + 1}
      }

    }
  });

  let sortable = [];
  for (let count in duplicatesList) {
    sortable.push([count, duplicatesList[count]]);
  }

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  let result = "Tag " + selectedTag + " has duplicate values:"
  for (const [value, count] of sortable) {
    if (count > 1) {
      result = result + "\n" + count + " times: " + value;
    }
  }
  document.getElementById("OutputJson").value = result;
}

function refresh() {
  getInputTags();
  getInputLines();
}

$(document).ready(function () {
  refresh()
});




