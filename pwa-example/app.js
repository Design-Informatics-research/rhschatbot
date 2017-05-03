// register service worker

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(reg) {
    
    if(reg.installing) {
      console.log('Service worker installing');
    } else if(reg.waiting) {
      console.log('Service worker installed');
    } else if(reg.active) {
      console.log('Service worker active');
    } else if (reg.ready) {
      console.log('Service worker ready');
    }

  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

// function for loading each image via XHR

function imgLoad(imgJSON) {
  // return a promise for an image loading
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', imgJSON.url);
    request.responseType = 'blob';

    request.onload = function() {
      if (request.status == 200) {
        var arrayResponse = [];
        arrayResponse[0] = request.response;
        arrayResponse[1] = imgJSON;
        resolve(arrayResponse);
      } else {
        reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };

    request.onerror = function() {
      reject(Error('There was a network error.'));
    };

    // Send the request
    request.send();
  });
}

var section = document.querySelector('section');

var handleImageResponse = function(arrayResponse){
  var myImage = document.createElement('img');
  var myFigure = document.createElement('figure');
  var myCaption = document.createElement('caption');
  var imageURL = window.URL.createObjectURL(arrayResponse[0]);

  myImage.src = imageURL;
  myImage.setAttribute('alt', arrayResponse[1].alt);
  myCaption.innerHTML = '<strong>' + arrayResponse[1].text + '</strong>';

  section.appendChild(myFigure);
  myFigure.appendChild(myImage);
  myFigure.appendChild(myCaption);
} 

var handleTextRepsonse = function(response){
  console.log(response);
  var para = document.createElement('p');
  para.innerHTML = '<strong>' + response.text + '</strong>';
  section.appendChild(para);
} 

window.onload = function() {
  // load each set of responses with text, image, and alt text
  for(var i = 0; i<=Chat.responses.length-1; i++) {

    if (Chat.responses[i].url != undefined)
      imgLoad(Chat.responses[i]).then(handleImageResponse, function(Error) { console.log(Error); });
    else {
      handleTextRepsonse(Chat.responses[i]);
    }
  }
};

