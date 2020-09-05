
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
  document.querySelector("#cleaning-signing").value = "sekarola";

  cleaningName.innerText = plannedCleaning;
  cleaningName.classList.add(plannedCleaning);

  // Create the cleaning options
  var select = document.getElementById('cleaningChoice');
  // Loopa över de 2 alternativen
  for (var i = 0; i < 2; i++) {
    var opt = document.createElement('option');
    if (cleaningOptions[i].length > 0) {
      opt.value = cleaningOptions[i];
      opt.dataset.option = `Cleaning${i + 1}`;
      opt.dataset.frequency = cleaningFrequency[i];
      opt.innerHTML = cleaningOptions[i];
      select.appendChild(opt);
    }
  }

  // Open Modal
  $('#exampleModal').modal({
  });

});

function mirrorSelectedCleaningOptionToInputField() {
  var e = document.getElementById("cleaningChoice");
  var optionNumber = e.options[e.selectedIndex].dataset.option;
  var frequency = e.options[e.selectedIndex].dataset.frequency;
  document.querySelector("#cleaningOptionNumber").value = optionNumber;
  document.querySelector("#frequency").value = frequency;
}
