const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYwiGKiR0KmXlRcHTY6LAv8ZzkFfJApVpqjf-0_f-wC8QjjguuObsnoJnoaeFYKkF2/exec";
const loader = document.getElementById("loader");
const submitBtn = document.getElementById("submitBtn");
const msg = document.getElementById("msg");
const invoiceForm = document.getElementById("invoiceForm");
const cityList = document.getElementById("cityList");

// Show/hide file input based on checkbox
function toggleUpload(cb) {
  document.getElementById(cb.value).classList.toggle("hidden", !cb.checked);
}

// Load cities from Google Script
fetch(SCRIPT_URL + "?action=cities")
  .then(r => r.json())
  .then(data => {
    cityList.innerHTML = data.map(c => `<option value="${c}">`).join("");
  });

// Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Form submission
invoiceForm.onsubmit = async e => {
  e.preventDefault();

  // Show loader & disable button
  loader.style.display = "flex";
  submitBtn.disabled = true;

  try {
    const fd = new FormData();

    // Append text fields
    ["rentStart","rentEnd","invoiceName","mobile","email","city","gstType"]
      .forEach(id => fd.append(id, document.getElementById(id).value));

    // Append files as Base64
    const types = ["RENT","MAINTENANCE","WATER","PARKING","ELECTRICITY"];
    for (const type of types) {
      const input = document.getElementById(type);
      if (input.classList.contains("hidden")) continue;

      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const base64 = await fileToBase64(file);

        fd.append(`${type}_NAME`, file.name);
        fd.append(`${type}_DATA`, base64);
      }
    }

    // POST to Apps Script
    const res = await fetch(SCRIPT_URL, { method: "POST", body: fd });
    const out = await res.json();

    // Success message
    msg.classList.remove("d-none");
    msg.innerText = `Submitted successfully. Ticket ID: ${out.ticketId}`;

    // Reset the form
    invoiceForm.reset();

    // Hide all file inputs after reset
    types.forEach(type => {
      document.getElementById(type).classList.add("hidden");
    });

  } catch (err) {
    alert("Submission failed. Please try again.");
    console.error(err);
  } finally {
    loader.style.display = "none";
    submitBtn.disabled = false;
  }
};