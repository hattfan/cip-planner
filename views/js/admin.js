$('.active').on('click', function (e) {
  // Declaration of variables from event target
  var objektId = e.target.dataset.key;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var cleaningObjects = JSON.parse(xhttp.responseText);
      var activeObject = cleaningObjects.filter(function (objekt) { return objekt['_id'] === objektId; });

      var cleaningOptions = distinctValues(cleaningObjects, 'Cleaning1');
      var typOptions = distinctValues(cleaningObjects, 'Typ');
      var areaOptions = distinctValues(cleaningObjects, 'Area');


      //Sätt värden ifrån det klickade objektet
      document.querySelector("#objektId").value = activeObject[0]['_id'];
      document.querySelector("#Objekt-change").value = activeObject[0]['Objekt'];
      document.querySelector("#Cleaning1Frequency-change").value = activeObject[0]['Cleaning1Frequency'];
      document.querySelector("#Cleaning2Frequency-change").value = activeObject[0]['Cleaning2Frequency'];
      document.querySelector("#MoveBothObjects-change").value = activeObject[0]['MoveBothObjects'];
      document.querySelector("#Active-change").value = activeObject[0]['Active'];
      document.querySelector("#Cleaning1NextDate-change").value = activeObject[0]['Cleaning1NextDate'];
      document.querySelector("#Cleaning2NextDate-change").value = activeObject[0]['Cleaning2NextDate'];
      
      var selects = [document.querySelector("#Cleaning1-change"), document.querySelector("#Cleaning2-change")];
      var selectArea = document.querySelector("#Area-change");
      selectArea.innerHTML = ''; //Empties in case of multiple presses
      var selectTyp = document.querySelector("#Typ-change");
      selectTyp.innerHTML = ''; //Empties in case of multiple presses

      for (var i = 0; i < typOptions.length; i++) {
        var opt = document.createElement('option');
        if (typOptions[i].length > 0) {
          opt.value = typOptions[i];
          opt.innerHTML = typOptions[i];
          selectTyp.appendChild(opt);
        }
      }
      document.querySelector("#Typ-change").value = activeObject[0]['Typ'];

      for (var i = 0; i < areaOptions.length; i++) {
        var opt = document.createElement('option');
        if (areaOptions[i].length > 0) {
          opt.value = areaOptions[i];
          opt.innerHTML = areaOptions[i];
          selectArea.appendChild(opt);
        }
      }
      document.querySelector("#Area-change").value = activeObject[0]['Area'];

      for (let j = 0; j < selects.length; j++) {
        const select = selects[j];
        select.innerHTML = ''; //Empties in case of multiple presses
        var emptyOpt = document.createElement('option');
        select.appendChild(emptyOpt);
        for (var i = 0; i < cleaningOptions.length; i++) {
          var opt = document.createElement('option');
          if (cleaningOptions[i].length > 0) {
            opt.value = cleaningOptions[i];
            opt.innerHTML = cleaningOptions[i];
            select.appendChild(opt);
          }
        }
      }
      document.querySelector("#Cleaning1-change").value = activeObject[0]['Cleaning1'];
      document.querySelector("#Cleaning2-change").value = activeObject[0]['Cleaning2'];

    }
  };
  xhttp.open("GET", 'admin/getObjectData/' + objektId, true);
  xhttp.send();

  // Open Modal
  $('#editModal').modal({

  });
  // setTimeout(function(){   debugger }, 1000);



});


$('#new-btn').on('click', function (e) {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      var cleaningObjects = JSON.parse(xhttp.responseText);
      var cleaningOptions = distinctValues(cleaningObjects, 'Cleaning1');
      var areaOptions = distinctValues(cleaningObjects, 'Area');
      var typOptions = distinctValues(cleaningObjects, 'Typ');
      var selects = [document.querySelector("#Cleaning1-new"), document.querySelector("#Cleaning2-new")];
      var selectArea = document.querySelector("#Area-new");
      selectArea.innerHTML = ''; //Empties in case of multiple presses
      var selectTyp = document.querySelector("#Typ-new");

      for (var i = 0; i < typOptions.length; i++) {
        var opt = document.createElement('option');
        if (typOptions[i].length > 0) {
          opt.value = typOptions[i];
          opt.innerHTML = typOptions[i];
          selectTyp.appendChild(opt);
        }
      }

      for (var i = 0; i < areaOptions.length; i++) {
        var opt = document.createElement('option');
        if (areaOptions[i].length > 0) {
          opt.value = areaOptions[i];
          opt.innerHTML = areaOptions[i];
          selectArea.appendChild(opt);
        }
      }

      for (let j = 0; j < selects.length; j++) {
        const select = selects[j];
        select.innerHTML = ''; //Empties in case of multiple presses
        var emptyOpt = document.createElement('option');
        select.appendChild(emptyOpt);
        for (var i = 0; i < cleaningOptions.length; i++) {
          var opt = document.createElement('option');
          if (cleaningOptions[i].length > 0) {
            opt.value = cleaningOptions[i];
            opt.innerHTML = cleaningOptions[i];
            select.appendChild(opt);
          }
        }
      }

      document.querySelector("#Objekt-new").placeholder = "Objekt";
      document.querySelector("#Cleaning1-new").placeholder = "Rengöring 1";
      document.querySelector("#Cleaning1Frequency-new").placeholder = "Dagar mellan rengöring";
      document.querySelector("#Cleaning2-new").placeholder = "Rengöring 1";
      document.querySelector("#Cleaning2Frequency-new").placeholder = "Dagar mellan rengöring";
      document.querySelector("#Area-new").placeholder = "Area";
      document.querySelector("#Typ-new").placeholder = "Typ";
      document.querySelector("#MoveBothObjects-new").placeholder = "Om rengöring 2 görs, skall även rengöring 1 flyttas?";
      
    }
  };
  xhttp.open("GET", "admin/getDistinctData", true);
  xhttp.send();

  // Open Modal
  $('#newModal').modal({
  });

});

function distinctValues(activeObject, searchValue) {
  var flags = [], output = [], l = activeObject.length, i;
  for (i = 0; i < l; i++) {
    if (flags[activeObject[i][searchValue]]) continue;
    flags[activeObject[i][searchValue]] = true;
    output.push(activeObject[i][searchValue]);
  }
  return output;
}