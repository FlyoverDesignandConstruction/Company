const form = document.querySelector("#rfiForm");
const statusEl = document.querySelector("#formStatus");
const submitButton = document.querySelector(".submit-button");
const signatureCanvas = document.querySelector("#signatureCanvas");
const clearSignatureButton = document.querySelector("#clearSignature");
const stampInput = document.querySelector("#companyStamp");
const stampPreview = document.querySelector("#stampPreview");

let signatureHasInk = false;
let companyStampData = "";

setupSignaturePad();
setupStampUpload();
setupFormSubmission();

function setupFormSubmission() {
  form.addEventListener("submit", async event => {
    event.preventDefault();
    setStatus("", "");

    const payload = getFormPayload();
    if (!payload.projectName || !payload.clientName) {
      setStatus("Project name and client name are required.", "error");
      return;
    }

    submitButton.disabled = true;

    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "The request could not be submitted.");
      }

      setStatus(`Submitted successfully. Request ID: ${result.id}`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function getFormPayload() {
  const data = new FormData(form);

  return {
    projectName: getText(data, "projectName"),
    projectLocation: getText(data, "projectLocation"),
    projectTypes: getCheckedValues("projectTypes"),
    otherProjectType: getText(data, "otherProjectType"),
    expectedStartDate: getText(data, "expectedStartDate"),
    expectedCompletionDate: getText(data, "expectedCompletionDate"),
    clientName: getText(data, "clientName"),
    companyName: getText(data, "companyName"),
    address: getText(data, "address"),
    phone: getText(data, "phone"),
    email: getText(data, "email"),
    scopes: getCheckedValues("scopes"),
    otherScope: getText(data, "otherScope"),
    requiredInfo: getCheckedValues("requiredInfo"),
    documents: getCheckedValues("documents"),
    budgetRange: getText(data, "budgetRange"),
    specialRequirements: getText(data, "specialRequirements"),
    submissionEmail: getText(data, "submissionEmail"),
    submissionAddress: getText(data, "submissionAddress"),
    submissionDeadline: getText(data, "submissionDeadline"),
    authorizationName: getText(data, "authorizationName"),
    authorizationDate: getText(data, "authorizationDate"),
    signatureData: signatureHasInk ? signatureCanvas.toDataURL("image/png") : "",
    companyStampData
  };
}

function getText(data, key) {
  return String(data.get(key) || "").trim();
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(input => input.value);
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type || ""}`.trim();
}

function setupSignaturePad() {
  if (!signatureCanvas) {
    return;
  }

  const context = signatureCanvas.getContext("2d");
  let drawing = false;

  resizeSignatureCanvas();
  window.addEventListener("resize", resizeSignatureCanvas);

  signatureCanvas.addEventListener("pointerdown", event => {
    drawing = true;
    signatureHasInk = true;
    signatureCanvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  });

  signatureCanvas.addEventListener("pointermove", event => {
    if (!drawing) {
      return;
    }

    const point = getCanvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  });

  signatureCanvas.addEventListener("pointerup", () => {
    drawing = false;
  });

  signatureCanvas.addEventListener("pointerleave", () => {
    drawing = false;
  });

  clearSignatureButton.addEventListener("click", () => {
    context.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    signatureHasInk = false;
  });

  function resizeSignatureCanvas() {
    const rect = signatureCanvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const image = signatureHasInk ? signatureCanvas.toDataURL("image/png") : null;

    signatureCanvas.width = Math.max(1, Math.round(rect.width * ratio));
    signatureCanvas.height = Math.max(1, Math.round(rect.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#10284d";

    if (image) {
      const saved = new Image();
      saved.onload = () => context.drawImage(saved, 0, 0, rect.width, rect.height);
      saved.src = image;
    }
  }

  function getCanvasPoint(event) {
    const rect = signatureCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}

function setupStampUpload() {
  stampPreview.addEventListener("click", () => stampInput.click());
  stampPreview.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      stampInput.click();
    }
  });
  stampPreview.tabIndex = 0;
  stampPreview.setAttribute("role", "button");

  stampInput.addEventListener("change", () => {
    const file = stampInput.files && stampInput.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      companyStampData = String(reader.result || "");
      stampPreview.innerHTML = "";
      const image = document.createElement("img");
      image.alt = "Company stamp preview";
      image.src = companyStampData;
      stampPreview.appendChild(image);
    };
    reader.readAsDataURL(file);
  });
}
