const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwZYfEAlq0_vgVFKu4uqBUo5qEGxe3_OJDXNw9612fOUI9_zrzlwQTvuak-psC7UzmxEQ/exec";

const loader = document.getElementById("loader");
const submitBtn = document.getElementById("submitBtn");
const msg = document.getElementById("msg");
const invoiceForm = document.getElementById("invoiceForm");
const cityList = document.getElementById("cityList");
const invoiceSampleSelect = document.getElementById("invoiceSample");

/* ===============================
   SHOW / HIDE FILE INPUTS
================================ */
function toggleUpload(cb) {
  document
    .getElementById(cb.value)
    .classList.toggle("hidden", !cb.checked);
}

/* ===============================
   LOAD CITIES
================================ */
fetch(SCRIPT_URL + "?action=cities")
  .then(r => r.json())
  .then(data => {
    cityList.innerHTML = data
      .map(c => `<option value="${c}">`)
      .join("");
  })
  .catch(err => console.error("City load failed", err));

/* ===============================
   DOWNLOAD SAMPLE PDF
================================ */
function downloadSample(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ===============================
   AUTO DOWNLOAD ON SELECT
================================ */
invoiceSampleSelect.addEventListener("change", () => {
  const value = invoiceSampleSelect.value;

  if (value === "GST_Invoice") {
    downloadSample("./samples/gst-sample.pdf", "GST-Invoice-Sample.pdf");
  }

  if (value === "NON-GST_Invoice") {
    downloadSample(
      "./samples/non-gst-sample.pdf",
      "Non-GST-Invoice-Sample.pdf"
    );
  }
});

/* ===============================
   FILE → BASE64
================================ */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ===============================
   FORM SUBMISSION
================================ */
invoiceForm.onsubmit = async e => {
  e.preventDefault();

  loader.style.display = "flex";
  submitBtn.disabled = true;
  msg.classList.add("d-none");

  try {
    const fd = new FormData();

    // Text fields
    [
      "rentStart",
      "rentEnd",
      "invoiceName",
      "mobile",
      "email",
      "city",
      "gstType",
      "invoiceSample"
    ].forEach(id => {
      fd.append(id, document.getElementById(id).value);
    });

    // File types
    const types = [
      "RENT",
      "MAINTENANCE",
      "WATER",
      "PARKING",
      "ELECTRICITY"
    ];

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

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: fd
    });

    const out = await res.json();

    /* 🚫 DUPLICATE HANDLING */
    if (out.status === "DUPLICATE") {
      alert(out.message);
      return;
    }

    /* ✅ SUCCESS */
    msg.classList.remove("d-none");
    msg.innerText = `Submitted successfully. Ticket ID: ${out.ticketId}`;

    invoiceForm.reset();
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
