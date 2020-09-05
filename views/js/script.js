
setTimeout(
  function () {
    document.querySelector(".cleaning-popup-message").style.display = 'none';
    // document.getElementById('div2').style.display='none';
}, 5000);


//Undo cleaning
$('.done').on('click', function (e) {

  var objektNamn = this.parentNode.querySelector('th').innerText;
  document.querySelector("#cleaning-object-undo").innerText = objektNamn;
  var cleaningName = document.querySelector("#registered-cleaning-undo");
  document.querySelector("#objekt-namn-undo").value = objektNamn;
  var cleaningNameParameter;
  e.target.dataset.cleaning?cleaningNameParameter = e.target.dataset.cleaning: cleaningNameParameter = e.target.parentNode.parentNode.dataset.cleaning;
  cleaningName.innerText = document.querySelector("#cleaning-type-undo").value = cleaningNameParameter;
  debugger;
  $('#undoCleaning').modal({

  })
})

$('.active').on('click', function (e) {
  // Declaration of variables from event target
  var objektNamn = this.parentNode.querySelector('th').innerText;
  var plannedCleaning = e.target.innerText.replace(/\s/g, '');
  var objektId = e.target.dataset.key;
  var cleaningOptions = [this.parentNode.querySelector('td').dataset.cleaning1, this.parentNode.querySelector('td').dataset.cleaning2];
  // var cleaningFrequency = [this.parentNode.querySelector('td').dataset.freq1, this.parentNode.querySelector('td').dataset.freq2];
  var cleaningName = document.querySelector("#planned-cleaning");
  var select = document.getElementById('cleaningChoice');
  select.innerHTML = '';
  // document.querySelector("#cleaningOptionNumber").value = `Cleaning1`;
  // document.querySelector("#frequency").value = cleaningFrequency[0];
  // document.querySelector("#frequency").value = frequency;

  // Declaration of getters
  cleaningName.className = '';
  document.querySelector('input[name="objektId"]').value = objektId;
  document.querySelector("#cleaning-object").innerText = objektNamn;
  document.querySelector("#cleaning-object").dataset.key = objektId;
  document.querySelector("#cleaning-signing").value = "se";

  cleaningName.innerText = plannedCleaning;
  cleaningName.classList.add(plannedCleaning);

  // Create the cleaning options
  var select = document.getElementById('cleaningChoice');
  // Loopa över de 2 alternativen

  for (var i = 0; i < 2; i++) {
    var opt = document.createElement('option');
    if (cleaningOptions[i].length > 0) {
      opt.value = cleaningOptions[i];
      opt.dataset.option = "Cleaning" + (i + 1);
      opt.innerHTML = cleaningOptions[i];
      select.appendChild(opt);
    }
  }
  $("#cleaningChoice").val(document.querySelector("#planned-cleaning").innerText)
    // Open Modal
  $('#exampleModal').modal({
  });

});

$('.email-ola').on('click', function (e) {
 
  document.querySelector("#mail-sent").addEventListener("click", function(){
    document.querySelector("#mail-btn").style.display = "";
  })

  $('#mailToOla').modal({
  });

});

function mirrorSelectedCleaningOptionToInputField() {
  var e = document.getElementById("cleaningChoice");
  var optionNumber = e.options[e.selectedIndex].dataset.option;
  var frequency = e.options[e.selectedIndex].dataset.frequency;
  document.querySelector("#cleaningOptionNumber").value = optionNumber;
  document.querySelector("#frequency").value = frequency;
}
